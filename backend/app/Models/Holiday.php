<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = ['title', 'date', 'type', 'description'];
    
    protected $appends = ['bs_date', 'bs_date_nepali'];

    protected function casts(): array
    {
        return [
            'date' => 'string', // keep as-is to avoid UTC conversion
        ];
    }
    
    public function getBsDateAttribute()
    {
        return $this->date ? toBS(\Carbon\Carbon::parse($this->date)) : null;
    }
    
    public function getBsDateNepaliAttribute()
    {
        return $this->date ? toFormattedNepaliBSDate(\Carbon\Carbon::parse($this->date)) : null;
    }
}
