<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Maatwebsite\Excel\Facades\Excel;
use App\Imports\EventImport;
use App\Models\Event;
use App\Models\Holiday;

Event::truncate();
Holiday::truncate();

Excel::import(new EventImport(1), 'C:/Users/gsuyo/OneDrive/Desktop/calendar-app/test_events.xlsx');

foreach(Holiday::all() as $h) {
    echo "Holiday: {$h->title} -> bs_date: {$h->bs_date}\n";
}

foreach(Event::all() as $e) {
    echo "Event: {$e->title} \n";
}
