<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Models\Holiday;
use App\Models\Announcement;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Stats
        $totalEventsMonth = Event::whereBetween('start_time', [$startOfMonth, $endOfMonth])->count();
        $totalUsers = User::count();
        $upcomingHolidays = Holiday::where('date', '>=', $now->toDateString())
            ->where('date', '<=', $now->copy()->addDays(30)->toDateString())
            ->count();

        // Recent Activity (last 10 items mixed)
        $events = Event::with('user')->latest()->take(10)->get()->map(function($item) {
            return [
                'type' => 'event',
                'title' => "New event: {$item->title}",
                'user' => $item->user->name ?? 'System',
                'created_at' => $item->created_at,
                'icon' => 'calendar'
            ];
        });

        $users = User::latest()->take(10)->get()->map(function($item) {
            return [
                'type' => 'user',
                'title' => "New user registered: {$item->name}",
                'user' => $item->name,
                'created_at' => $item->created_at,
                'icon' => 'user'
            ];
        });

        $announcements = Announcement::latest()->take(10)->get()->map(function($item) {
            return [
                'type' => 'announcement',
                'title' => "Announcement: {$item->title}",
                'user' => 'Admin',
                'created_at' => $item->created_at,
                'icon' => 'megaphone'
            ];
        });

        $activity = collect([])
            ->concat($events)
            ->concat($users)
            ->concat($announcements)
            ->sortByDesc('created_at')
            ->take(10)
            ->map(function($item) {
                return [
                    'type' => $item['type'],
                    'title' => $item['title'],
                    'user' => $item['user'],
                    'time' => $item['created_at']->diffForHumans(),
                    'icon' => $item['icon']
                ];
            })
            ->values();

        return response()->json([
            'stats' => [
                [
                    'label' => 'Total Events (Month)',
                    'value' => $totalEventsMonth,
                    'trend' => 'This month',
                    'trendUp' => true,
                    'icon' => 'calendar'
                ],
                [
                    'label' => 'Active Users',
                    'value' => $totalUsers,
                    'trend' => 'Total registered',
                    'trendUp' => null,
                    'icon' => 'users'
                ],
                [
                    'label' => 'Upcoming Holidays',
                    'value' => $upcomingHolidays,
                    'trend' => 'Next 30 days',
                    'trendUp' => null,
                    'icon' => 'holiday'
                ],
                [
                    'label' => 'System Status',
                    'value' => 'Online',
                    'trend' => 'Stable',
                    'trendUp' => true,
                    'icon' => 'activity'
                ]
            ],
            'recent_activity' => $activity
        ]);
    }
}
