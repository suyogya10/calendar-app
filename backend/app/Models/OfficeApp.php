<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeApp extends Model
{
    protected $fillable = ['title', 'url', 'icon_url', 'sort_order'];
}
