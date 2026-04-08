<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Event;
use App\Imports\EventImport;
use App\Exports\EventExport;
use Maatwebsite\Excel\Facades\Excel;

class EventController extends Controller
{
    public function publicCalendar()
    {
        $events = Event::with('user')->where('is_public', true)->orderBy('start_time')->get();
        $holidays = \App\Models\Holiday::orderBy('date')->get();

        return response()->json([
            'events' => $events,
            'holidays' => $holidays
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['events' => [], 'holidays' => \App\Models\Holiday::all()]);

        if ($user->is_admin) {
            return response()->json([
                'events' => Event::with('user')->orderBy('start_time')->get(),
                'holidays' => \App\Models\Holiday::all()
            ]);
        }

        // For Staff: My events + Public events + Department events
        $events = Event::with('user')
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('is_public', true)
                  ->orWhere('department', $user->department);
            })
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'events' => $events,
            'holidays' => \App\Models\Holiday::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'is_public' => 'sometimes|boolean',
            'department' => 'nullable|string|max:255',
            'is_all_day' => 'sometimes|boolean'
        ]);

        if (!$request->user()->is_admin) {
            $validated['is_public'] = false;
        }

        $this->normalizeDates($validated);

        // Block only if an all-day event already exists on this date,
        // or if this new event is all-day and any event already exists on that date.
        $conflict = $this->hasAllDayConflict(
            $request->user()->id,
            $validated['start_time'],
            $validated['is_all_day'] ?? false
        );
        if ($conflict) {
            return response()->json(['message' => $conflict], 409);
        }

        $event = $request->user()->events()->create($validated);

        // Notify department if shared
        if ($event->department) {
            \App\Models\User::where('department', $event->department)
                ->where('id', '!=', $request->user()->id)
                ->get()
                ->each(function($u) use ($event) {
                    $u->notifications()->create([
                        'title' => 'New Shared Event',
                        'message' => "A new event '{$event->title}' has been shared with your department.",
                        'type' => 'event',
                        'link' => '/'
                    ]);
                    
                    try {
                        $u->notify(new \App\Notifications\GeneralNotification(
                            'Shared Event: ' . $event->title,
                            "A new event has been added to your departmental calendar: '{$event->title}'."
                        ));
                    } catch (\Exception $e) {}
                });
        }

        return response()->json($event, 201);
    }

    public function show(Event $event)
    {
        return $event;
    }

    public function update(Request $request, Event $event)
    {
        // Simple authorization check
        if ($event->user_id !== $request->user()->id && !$request->user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'is_public' => 'sometimes|boolean',
            'department' => 'nullable|string|max:255',
            'is_all_day' => 'sometimes|boolean'
        ]);

        if (!$request->user()->is_admin && isset($validated['is_public'])) {
            $validated['is_public'] = false;
        }

        // Only normalize the ones provided in request for the actual update
        $this->normalizeDates($validated);

        // Check all-day conflict (excluding the event being updated)
        if (isset($validated['start_time']) || isset($validated['is_all_day'])) {
            $mergedStart = $validated['start_time'] ?? $event->start_time;
            $isAllDay = $validated['is_all_day'] ?? $event->is_all_day;
            $conflict = $this->hasAllDayConflict($event->user_id, $mergedStart, $isAllDay, $event->id);
            if ($conflict) {
                return response()->json(['message' => $conflict], 409);
            }
        }

        $event->update($validated);
        return response()->json($event);
    }

    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id && !$request->user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        $event->delete();
        return response()->json(null, 204);
    }

    private function normalizeDates(array &$data)
    {
        if (isset($data['start_time'])) {
            $data['start_time'] = \Carbon\Carbon::parse($data['start_time'])->format('Y-m-d H:i:s');
        }
        // If start_time exists but no end_time provided, default to +1 hr
        if (isset($data['start_time']) && empty($data['end_time'])) {
            $data['end_time'] = \Carbon\Carbon::parse($data['start_time'])->addHour()->format('Y-m-d H:i:s');
        } elseif (isset($data['end_time'])) {
            $data['end_time'] = \Carbon\Carbon::parse($data['end_time'])->format('Y-m-d H:i:s');
        }
    }

    /**
     * Block if:
     * - The new event is all-day AND any event already exists on that date.
     * - OR an all-day event already exists on that date (regardless of the new event's type).
     * Multiple timed events on the same day/time are always allowed.
     */
    private function hasAllDayConflict($userId, $startTime, $isAllDay, $ignoreEventId = null): ?string
    {
        $date = \Carbon\Carbon::parse($startTime)->toDateString(); // YYYY-MM-DD

        $query = Event::where('user_id', $userId)
            ->whereDate('start_time', $date);

        if ($ignoreEventId) {
            $query->where('id', '!=', $ignoreEventId);
        }

        // If there's already an all-day event on this date, no other events allowed
        if ($query->clone()->where('is_all_day', true)->exists()) {
            return 'An all-day event already exists on this date. Remove it before adding other events.';
        }

        // If new event is all-day but other events already exist on this date, block it
        if ($isAllDay && $query->exists()) {
            return 'Other events already exist on this date. Remove them before adding an all-day event.';
        }

        return null;
    }

    public function exportExcel(Request $request)
    {
        $query = $request->user()->is_admin ? Event::query() : $request->user()->events();
        return Excel::download(new EventExport($query), 'events.xlsx');
    }

    public function importExcel(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        Excel::import(new EventImport($request->user()->id), $request->file('file'));
        return response()->json(['message' => 'Events imported from excel successfully.']);
    }
}
