<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TestImport implements ToModel, WithHeadingRow {
    public function model(array $row) {
        echo json_encode($row) . "\n";
        return null;
    }
}

Excel::import(new TestImport(), 'C:/Users/gsuyo/OneDrive/Desktop/calendar-app/test_events.xlsx');
