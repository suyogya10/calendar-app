<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Retrieve all settings as a key-value map.
     */
    public function index()
    {
        return response()->json(Setting::pluck('value', 'key'));
    }

    /**
     * Update or create settings.
     */
    public function store(Request $request)
    {
        $settings = $request->all();
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Settings updated', 'settings' => Setting::pluck('value', 'key')]);
    }
}
