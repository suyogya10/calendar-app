<?php

namespace App\Exports;

use App\Models\Event;
use Maatwebsite\Excel\Concerns\FromCollection;

class EventExport implements FromCollection
{
    protected $query;
    public function __construct($query) { $this->query = $query; }
    
    public function collection()
    {
        return $this->query->get();
    }
}
