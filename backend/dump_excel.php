<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Maatwebsite\Excel\Facades\Excel;

$data = Excel::toCollection(new \stdClass, 'C:/Users/gsuyo/OneDrive/Desktop/calendar-app/test_events.xlsx');
$firstRow = isset($data[0]) ? $data[0][0] : [];
echo "KEYS:\n";
foreach ($firstRow as $k => $v) {
    echo "'$k' => '$v'\n";
}
