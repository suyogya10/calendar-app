<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function index(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update the user's profile (email, phone, avatar).
     * Name and employee_id are NOT allowed.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email'        => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:30',
            'avatar'       => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240', // 10MB max (we'll compress)
        ]);

        // Handle avatar upload with compression
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar_url) {
                $oldPath = str_replace('/storage/', '', $user->avatar_url);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('avatar');
            $compressedPath = $this->compressAndSaveImage($file);
            $validated['avatar_url'] = '/storage/' . $compressedPath;
        }

        unset($validated['avatar']); // Remove file from validated — not a DB column

        $user->update($validated);

        return response()->json($user->fresh());
    }

    /**
     * Delete the user's profile picture.
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar_url) {
            $oldPath = str_replace('/storage/', '', $user->avatar_url);
            Storage::disk('public')->delete($oldPath);
            $user->update(['avatar_url' => null]);
        }

        return response()->json($user->fresh());
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    /**
     * Compress and save an uploaded image.
     * Converts to JPEG and resizes to max 400x400 with 70% quality.
     */
    private function compressAndSaveImage($file): string
    {
        $image = imagecreatefromstring(file_get_contents($file->getRealPath()));

        if (!$image) {
            // Fallback: store as-is if GD can't parse
            $path = $file->store('profile_pictures', 'public');
            return $path;
        }

        $origWidth  = imagesx($image);
        $origHeight = imagesy($image);
        $maxSize    = 400;

        // Calculate new dimensions maintaining aspect ratio
        if ($origWidth > $origHeight) {
            $newWidth  = min($origWidth, $maxSize);
            $newHeight = intval($origHeight * ($newWidth / $origWidth));
        } else {
            $newHeight = min($origHeight, $maxSize);
            $newWidth  = intval($origWidth * ($newHeight / $origHeight));
        }

        $resized = imagecreatetruecolor($newWidth, $newHeight);

        // Handle transparency for PNG
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
        imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);

        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        // Save as compressed JPEG
        $filename = 'profile_pictures/' . uniqid('avatar_', true) . '.jpg';
        $fullPath = storage_path('app/public/' . $filename);

        // Ensure directory exists
        if (!is_dir(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        // Fill background white (for transparent PNGs)
        $bg = imagecreatetruecolor($newWidth, $newHeight);
        $white = imagecolorallocate($bg, 255, 255, 255);
        imagefill($bg, 0, 0, $white);
        imagecopy($bg, $resized, 0, 0, 0, 0, $newWidth, $newHeight);

        imagejpeg($bg, $fullPath, 70); // 70% quality
        imagedestroy($image);
        imagedestroy($resized);
        imagedestroy($bg);

        return $filename;
    }
}
