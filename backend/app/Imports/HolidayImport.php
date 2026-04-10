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

        $type = strtoupper(trim($row['type'] ?? 'FULL'));
        if (!in_array($type, ['FULL', 'HALF'])) {
            $type = 'FULL';
        }

        // We use date to avoid duplicates
        return Holiday::updateOrCreate(
            ['date' => \Carbon\Carbon::parse($row['date'])->format('Y-m-d')],
            [
                'title' => $row['title'],
                'type'  => $type,
                'description' => $row['description'] ?? null
            ]
        );
    }
}
