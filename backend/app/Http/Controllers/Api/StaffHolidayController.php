<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffHoliday;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StaffHolidayController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date', Carbon::now()->toDateString());
        
        $holidays = StaffHoliday::with('user:id,name,department')
            ->where('date', $date)
            ->get();
            
        return response()->json($holidays);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'user_id' => 'sometimes|exists:users,id'
        ]);

        // Default to self, but allow admin to override
        $targetUserId = $request->user()->id;
        if ($request->user()->is_admin && $request->has('user_id')) {
            $targetUserId = $request->user_id;
        }

        // Prevent duplicates for the same day/user
        $holiday = StaffHoliday::updateOrCreate(
            [
                'user_id' => $targetUserId,
                'date' => $request->date,
            ],
            [
                'date' => $request->date,
            ]
        );

        return response()->json([
            'message' => 'Leave notification saved successfully',
            'holiday' => $holiday->load('user:id,name')
        ]);
    }

    public function destroy(Request $request, StaffHoliday $staffHoliday)
    {
        if ($staffHoliday->user_id !== $request->user()->id && !$request->user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        $staffHoliday->delete();
        return response()->json(null, 204);
    }
}
