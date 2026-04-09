<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OfficeApp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OfficeAppController extends Controller
{
    public function index()
    {
        return response()->json(OfficeApp::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'url' => 'required|url',
            'icon' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['title', 'url', 'sort_order']);
        
        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('office_apps', 'public');
            $data['icon_url'] = Storage::url($path);
        }

        $app = OfficeApp::create($data);
        return response()->json($app);
    }

    public function show(OfficeApp $officeApp)
    {
        return response()->json($officeApp);
    }

    public function update(Request $request, $id)
    {
        // Using $id and findOrFail because PUT/PATCH often has trouble with multipart/form-data in Laravel
        $officeApp = OfficeApp::findOrFail($id);

        $request->validate([
            'title' => 'string',
            'url' => 'url',
            'icon' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['title', 'url', 'sort_order']);

        if ($request->hasFile('icon')) {
            if ($officeApp->icon_url) {
                $oldPath = str_replace('/storage/', '', $officeApp->icon_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('icon')->store('office_apps', 'public');
            $data['icon_url'] = Storage::url($path);
        }

        $officeApp->update($data);
        return response()->json($officeApp);
    }

    public function destroy(OfficeApp $officeApp)
    {
        if ($officeApp->icon_url) {
            $oldPath = str_replace('/storage/', '', $officeApp->icon_url);
            Storage::disk('public')->delete($oldPath);
        }
        $officeApp->delete();
        return response()->json(['message' => 'App deleted']);
    }
}
