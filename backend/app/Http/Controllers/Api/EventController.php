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
        if ($user && $user->is_admin) {
            return Event::with('user')->orderBy('start_time')->get();
        }
        return $user ? $user->events()->orderBy('start_time')->get() : [];
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'is_public' => 'sometimes|boolean',
            'is_all_day' => 'sometimes|boolean'
        ]);

        if (!$request->user()->is_admin) {
            $validated['is_public'] = false;
        }

        $this->normalizeDates($validated);

        if ($this->hasConflict($request->user()->id, $validated['start_time'], $validated['end_time'])) {
            return response()->json(['message' => 'Conflict: You already have an event scheduled during this time period.'], 409);
        }

        $event = $request->user()->events()->create($validated);
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
            'is_all_day' => 'sometimes|boolean'
        ]);

        if (!$request->user()->is_admin && isset($validated['is_public'])) {
            $validated['is_public'] = false;
        }

        // If partial update, merge with existing dates to check conflict
        $tempData = array_merge($event->toArray(), $validated);
        $this->normalizeDates($tempData);

        if ($this->hasConflict($event->user_id, $tempData['start_time'], $tempData['end_time'], $event->id)) {
            return response()->json(['message' => 'Conflict: You already have an event scheduled during this time period.'], 409);
        }

        // Only normalize the ones provided in request for the actual update
        $this->normalizeDates($validated);
        
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

    private function hasConflict($userId, $start, $end, $ignoreEventId = null)
    {
        $query = Event::where('user_id', $userId)
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start);

        if ($ignoreEventId) {
            $query->where('id', '!=', $ignoreEventId);
        }

        return $query->exists();
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
