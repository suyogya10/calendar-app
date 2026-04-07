<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Holiday;
use App\Imports\HolidayImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Http;

class HolidayController extends Controller
{
    public function index()
    {
        return Holiday::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'description' => 'nullable|string'
        ]);

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
            'title' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'description' => 'nullable|string'
        ]);

        $holiday->update($validated);
        return response()->json($holiday);
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return response()->json(null, 204);
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new HolidayImport, $request->file('file'));

        return response()->json(['message' => 'Holidays imported from excel successfully.']);
    }

    public function fetchExternalAPI()
    {
        // Example external API integration for Nepali holidays
        
        /* 
        $response = Http::get('https://example-nepal-holidays-api.com/api/v1/holidays');
        if ($response->successful()) {
            $holidays = $response->json();
            foreach ($holidays as $item) {
                Holiday::updateOrCreate(
                    ['date' => \Carbon\Carbon::parse($item['date'])->format('Y-m-d')],
                    ['title' => $item['title'], 'description' => $item['description'] ?? null]
                );
            }
            return response()->json(['message' => 'Synced with external API!']);
        } 
        */

        return response()->json(['message' => 'Placeholder: Please uncomment and replace with actual API URL in HolidayController.'], 200);
    }

    public function exportExcel()
    {
        return Excel::download(new \App\Exports\HolidayExport, 'holidays.xlsx');
    }
}
