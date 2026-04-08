<?php

namespace App\Imports;

use App\Models\Event;
use App\Models\Holiday;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class EventImport implements ToModel, WithHeadingRow
{
    protected int $userId;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    public function model(array $row): ?\Illuminate\Database\Eloquent\Model
    {
        // Debug stringification of row to help if it fails again
        $nepaliDateKey = isset($row['nepali_date_ddmmyyyy']) ? 'nepali_date_ddmmyyyy' : 'nepali_date';

        // ── USER FORMAT ─────────────────────────────────────────────────
        if (!empty($row[$nepaliDateKey]) || !empty($row['event_title'])) {
            return $this->handleUserFormat($row, $nepaliDateKey);
        }

        // ── STANDARD / EXPORT FORMAT ────────────────────────────────────
        if (!empty($row['title'])) {
            return $this->handleStandardFormat($row);
        }

        return null;
    }

    private function handleUserFormat(array $row, string $dateKey): ?\Illuminate\Database\Eloquent\Model
    {
        $title     = trim($row['event_title'] ?? '');
        $bsDateRaw = $row[$dateKey] ?? '';
        $typeRaw   = strtolower(trim($row['event_type'] ?? 'event'));
        $timeRaw   = strtolower(trim($row['event_time'] ?? ''));

        if (!$title || !$bsDateRaw) return null;

        // If Excel Auto-Converted the date to a Serial Number:
        if (is_numeric($bsDateRaw)) {
            // Because the user's Excel is likely in US locale (mm/dd/yyyy),
            // when they type "12/5/2083" (dd/mm/yyyy), Excel parses it as December 5, 2083.
            // The Day and Month get completely swapped!
            // By formatting as 'Y-d-m' (Year-Day-Month), we swap them back to the original text intention.
            $bsDateRaw = Date::excelToDateTimeObject($bsDateRaw)->format('Y-d-m');
        } else {
            $bsDateRaw = trim((string) $bsDateRaw);
        }

        $adDate = $this->bsToAd($bsDateRaw);
        if (!$adDate) return null;

        // Handle type normalization (e.g., "full holiday" -> "holiday_full")
        $typeRaw = str_replace(' ', '_', $typeRaw);
        if ($typeRaw === 'full_holiday') $typeRaw = 'holiday_full';
        if ($typeRaw === 'half_holiday') $typeRaw = 'holiday_half';

        if (in_array($typeRaw, ['holiday_full', 'holiday_half'])) {
            $type = ($typeRaw === 'holiday_half') ? 'HALF' : 'FULL';
            return Holiday::updateOrCreate(
                ['date' => $adDate],
                ['title' => $title, 'type' => $type, 'description' => null]
            );
        }

        // Regular event
        if ($timeRaw === 'all-day' || $timeRaw === 'all day' || empty($timeRaw)) {
            $isAllDay = true;
            $timeRaw = '';
        } else {
            $isAllDay = false;
        }

        [$startDt, $endDt] = $this->parseTimeRange($timeRaw, $adDate);

        return new Event([
            'user_id'     => $this->userId,
            'title'       => $title,
            'description' => null,
            'start_time'  => $startDt,
            'end_time'    => $endDt,
            'is_all_day'  => $isAllDay,
            'is_public'   => true,
        ]);
    }

    private function handleStandardFormat(array $row): ?Event
    {
        $startRaw = $row['start_time_ad'] ?? ($row['start_time'] ?? null);
        if (!$startRaw) return null;

        $start = Carbon::parse($startRaw)->format('Y-m-d H:i:s');
        $end   = !empty($row['end_time_ad'])
            ? Carbon::parse($row['end_time_ad'])->format('Y-m-d H:i:s')
            : (!empty($row['end_time']) ? Carbon::parse($row['end_time'])->format('Y-m-d H:i:s') : Carbon::parse($start)->addHour()->format('Y-m-d H:i:s'));

        return new Event([
            'user_id'     => $this->userId,
            'title'       => $row['title'],
            'description' => $row['description'] ?? null,
            'start_time'  => $start,
            'end_time'    => $end,
            'is_all_day'  => !empty($row['all_day']) && strtolower($row['all_day']) === 'yes',
            'is_public'   => empty($row['public']) || strtolower($row['public']) === 'yes',
        ]);
    }

    private function bsToAd(string $bsDate): ?string
    {
        if (preg_match('#^(\d{1,2})/(\d{1,2})/(\d{4})$#', $bsDate, $m)) {
            [, $d, $mon, $y] = $m;
            $bsFormatted = sprintf('%04d-%02d-%02d', $y, $mon, $d);
        } elseif (preg_match('#^\d{4}-\d{2}-\d{2}$#', $bsDate)) {
            $bsFormatted = $bsDate;
        } else {
            return null;
        }

        try {
            $result = toAD($bsFormatted);
            return Carbon::parse((string) $result)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function parseTimeRange(string $timeRaw, string $adDate): array
    {
        if (empty($timeRaw)) {
            return ["$adDate 00:00:00", "$adDate 23:59:00"];
        }

        if (str_contains($timeRaw, '-')) {
            [$s, $e] = array_map('trim', explode('-', $timeRaw, 2));
            return [
                "$adDate " . Carbon::parse($s)->format('H:i:s'),
                "$adDate " . Carbon::parse($e)->format('H:i:s'),
            ];
        }

        $start = Carbon::parse($timeRaw);
        return [
            "$adDate " . $start->format('H:i:s'),
            "$adDate " . $start->addHour()->format('H:i:s'),
        ];
    }
}
