<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Announcement::with('user')
            ->where(function($q) {
                $q->where('expires_at', '>', now())
                  ->orWhereNull('expires_at');
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,urgent,system',
            'expires_at' => 'nullable|date'
        ]);

        $announcement = $request->user()->announcements()->create($validated);
        
        // Notify all users via email
        \App\Models\User::all()->each(function($user) use ($announcement) {
            // Email notification
            try {
                $user->notify(new \App\Notifications\GeneralNotification(
                    'Update: ' . $announcement->title,
                    $announcement->content
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Email failed for user {$user->id}: " . $e->getMessage());
            }
        });

        return response()->json($announcement, 201);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:info,urgent,system',
            'expires_at' => 'nullable|date'
        ]);

        $announcement->update($validated);
        return response()->json($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return response()->json(null, 204);
    }
}
