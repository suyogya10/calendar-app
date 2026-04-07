<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'is_public', 'start_time', 'end_time', 'is_all_day'];

    protected $appends = ['bs_start_time', 'bs_end_time', 'bs_start_time_nepali', 'bs_end_time_nepali'];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'is_all_day' => 'boolean',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getBsStartTimeAttribute()
    {
        return $this->start_time ? toBS(\Carbon\Carbon::parse($this->start_time)) . ' ' . \Carbon\Carbon::parse($this->start_time)->format('H:i:s') : null;
    }
    
    public function getBsStartTimeNepaliAttribute()
    {
        return $this->start_time ? toFormattedNepaliBSDate(\Carbon\Carbon::parse($this->start_time)) . ' ' . \Carbon\Carbon::parse($this->start_time)->format('H:i:s') : null;
    }

    public function getBsEndTimeAttribute()
    {
        return $this->end_time ? toBS(\Carbon\Carbon::parse($this->end_time)) . ' ' . \Carbon\Carbon::parse($this->end_time)->format('H:i:s') : null;
    }

    public function getBsEndTimeNepaliAttribute()
    {
        return $this->end_time ? toFormattedNepaliBSDate(\Carbon\Carbon::parse($this->end_time)) . ' ' . \Carbon\Carbon::parse($this->end_time)->format('H:i:s') : null;
    }
}
