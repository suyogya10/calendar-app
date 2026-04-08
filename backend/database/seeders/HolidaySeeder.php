<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Holiday;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            ['title' => 'Nepali New Year', 'date' => '2026-04-14', 'description' => 'Bisket Jatra / New Year'],
            ['title' => 'Dashain (Phulpati)', 'date' => '2026-10-18', 'description' => 'Maha Saptami'],
            ['title' => 'Tihar (Bhai Tika)', 'date' => '2026-11-10', 'description' => 'Festival of Lights'],
            ['title' => 'Maghe Sankranti', 'date' => '2027-01-15', 'description' => 'Winter festival'],
            ['title' => 'Maha Shivaratri', 'date' => '2027-03-08', 'description' => 'Lord Shiva festival']
        ];

        foreach ($holidays as $h) {
            Holiday::updateOrCreate(['date' => $h['date']], $h);
        }
    }
}
