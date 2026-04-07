<?php

namespace App\Imports;

use App\Models\Holiday;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class HolidayImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (!isset($row['date']) || !isset($row['title'])) {
            return null; // Skip invalid rows
        }

        // We use date to avoid duplicates (assuming one holiday per date, or adjust as needed)
        return Holiday::updateOrCreate(
            ['date' => \Carbon\Carbon::parse($row['date'])->format('Y-m-d')],
            [
                'title' => $row['title'],
                'description' => $row['description'] ?? null
            ]
        );
    }
}
