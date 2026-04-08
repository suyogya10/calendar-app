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
            // Store as string — keeps the value exactly as saved in Asia/Kathmandu
            // so the API returns "2026-04-12 09:00:00" not the UTC-shifted ISO value
            'start_time' => 'string',
            'end_time' => 'string',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getBsStartTimeAttribute()
    {
        return $this->start_time ? toBS(\Carbon\Carbon::parse($this->start_time)) : null;
    }
    
    public function getBsStartTimeNepaliAttribute()
    {
        return $this->start_time ? toFormattedNepaliBSDate(\Carbon\Carbon::parse($this->start_time)) : null;
    }

    public function getBsEndTimeAttribute()
    {
        return $this->end_time ? toBS(\Carbon\Carbon::parse($this->end_time)) : null;
    }

    public function getBsEndTimeNepaliAttribute()
    {
        return $this->end_time ? toFormattedNepaliBSDate(\Carbon\Carbon::parse($this->end_time)) : null;
    }
}
