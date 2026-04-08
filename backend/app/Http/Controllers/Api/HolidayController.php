<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Holiday;
use App\Imports\HolidayImport;
use App\Exports\HolidayExport;
use Maatwebsite\Excel\Facades\Excel;

class HolidayController extends Controller
{
    public function index()
    {
        return Holiday::orderBy('date')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'date'        => 'required|date',
            'type'        => 'sometimes|in:FULL,HALF',
            'description' => 'nullable|string',
        ]);

        $validated['type'] = $validated['type'] ?? 'FULL';
        $validated['date'] = \Carbon\Carbon::parse($validated['date'])->format('Y-m-d');

        $holiday = Holiday::create($validated);
        return response()->json($holiday, 201);
    }

    public function show(Holiday $holiday)
    {
        return $holiday;
    }

    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'date'        => 'sometimes|required|date',
            'type'        => 'sometimes|in:FULL,HALF',
            'description' => 'nullable|string',
        ]);

        if (isset($validated['date'])) {
            $validated['date'] = \Carbon\Carbon::parse($validated['date'])->format('Y-m-d');
        }

        $holiday->update($validated);
        return response()->json($holiday);
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return response()->json(null, 204);
    }

    public function exportExcel()
    {
        return Excel::download(new HolidayExport, 'holidays.xlsx');
    }

    public function importExcel(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        Excel::import(new HolidayImport, $request->file('file'));
        return response()->json(['message' => 'Holidays imported successfully.']);
    }
}
