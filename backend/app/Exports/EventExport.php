<?php

namespace App\Exports;

use App\Models\Event;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EventExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function collection()
    {
        return $this->query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Title',
            'Description',
            'Start Time (AD)',
            'End Time (AD)',
            'BS Start Date',
            'All Day',
            'Public',
            'Created At',
        ];
    }

    public function map($event): array
    {
        return [
            $event->id,
            $event->title,
            $event->description ?? '',
            $event->start_time,
            $event->end_time ?? '',
            $event->bs_start_time ?? '',
            $event->is_all_day ? 'Yes' : 'No',
            $event->is_public ? 'Yes' : 'No',
            $event->created_at,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
