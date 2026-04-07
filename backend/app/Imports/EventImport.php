<?php

namespace App\Imports;

use App\Models\Event;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EventImport implements ToModel, WithHeadingRow
{
    protected $userId;
    public function __construct($userId) { $this->userId = $userId; }

    public function model(array $row)
    {
        if (!isset($row['start_time']) || !isset($row['title'])) { return null; }

        return new Event([
            'user_id' => $this->userId,
            'title' => $row['title'],
            'description' => $row['description'] ?? null,
            'start_time' => \Carbon\Carbon::parse($row['start_time'])->format('Y-m-d H:i:s'),
            'end_time' => isset($row['end_time']) ? \Carbon\Carbon::parse($row['end_time'])->format('Y-m-d H:i:s') : \Carbon\Carbon::parse($row['start_time'])->addHour()->format('Y-m-d H:i:s'),
            'is_all_day' => isset($row['is_all_day']) ? filter_var($row['is_all_day'], FILTER_VALIDATE_BOOLEAN) : false,
            'is_public' => isset($row['is_public']) ? filter_var($row['is_public'], FILTER_VALIDATE_BOOLEAN) : false,
        ]);
    }
}
