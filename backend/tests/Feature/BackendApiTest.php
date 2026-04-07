<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Holiday;

class BackendApiTest extends TestCase
{
    use RefreshDatabase; 

    public function test_auth_registration_and_login()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Alice',
            'email' => 'alice@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'is_admin' => true,
        ]);
        if ($response->status() !== 201) {
            dd($response->json());
        }
        $response->assertStatus(201)->assertJsonStructure(['data', 'access_token']);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'alice@test.com',
            'password' => 'password',
        ]);
        $loginResponse->assertStatus(200)->assertJsonStructure(['access_token']);
    }

    public function test_public_calendar_endpoint()
    {
        Holiday::create(['title' => 'Test Holiday', 'date' => '2026-05-10']);
        
        $admin = User::factory()->create(['is_admin' => true]);
        $admin->events()->create([
            'title' => 'Public Event', 'start_time' => '2026-06-01 10:00:00', 'end_time' => '2026-06-01 11:00:00', 'is_public' => true
        ]);
        
        $response = $this->getJson('/api/public-calendar');
        $response->assertStatus(200)
                 ->assertJsonPath('events.0.title', 'Public Event')
                 ->assertJsonStructure(['events' => [['bs_start_time', 'bs_start_time_nepali']], 'holidays' => [['bs_date']]])
                 ->assertJsonPath('holidays.0.title', 'Test Holiday');
    }

    public function test_event_conflict_prevention()
    {
        $user = User::factory()->create();

        // Create first event
        $this->actingAs($user)->postJson('/api/events', [
            'title' => 'Meeting Part 1',
            'start_time' => '2026-04-10 10:00:00',
            'end_time' => '2026-04-10 11:00:00',
        ])->assertStatus(201);

        // Attempt overlapping event
        $this->actingAs($user)->postJson('/api/events', [
            'title' => 'Meeting Part 2',
            'start_time' => '2026-04-10 10:30:00',
            'end_time' => '2026-04-10 11:30:00',
        ])->assertStatus(409); // Conflict expected
    }

    public function test_event_is_public_override_for_normal_users()
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->postJson('/api/events', [
            'title' => 'Private Event',
            'start_time' => '2026-04-12 10:00:00',
            'end_time' => '2026-04-12 11:00:00',
            'is_public' => true
        ]);
        
        $response->assertStatus(201);
        $this->assertFalse($response->json('is_public'), 'Normal users should not be able to create public events');
    }

    public function test_admin_middleware_on_holidays()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $normie = User::factory()->create(['is_admin' => false]);

        $this->actingAs($normie)->postJson('/api/holidays', [
            'title' => 'H1', 'date' => '2026-10-10'
        ])->assertStatus(403); // Normal user blocked

        $this->actingAs($admin)->postJson('/api/holidays', [
            'title' => 'H2', 'date' => '2026-10-10'
        ])->assertStatus(201); // Admin allowed
    }

    public function test_all_day_event_and_exports()
    {
        $user = User::factory()->create();

        // Test creating an all-day event
        $response = $this->actingAs($user)->postJson('/api/events', [
            'title' => 'All Day Festival',
            'start_time' => '2026-05-15 00:00:00',
            'is_all_day' => true
        ]);
        
        $response->assertStatus(201);
        $this->assertTrue($response->json('is_all_day'));

        // Test Export endpoints using Excel::fake()
        \Maatwebsite\Excel\Facades\Excel::fake();
        
        $this->actingAs($user)->getJson('/api/events/export-excel')
             ->assertStatus(200);
        \Maatwebsite\Excel\Facades\Excel::assertDownloaded('events.xlsx', function (\App\Exports\EventExport $export) {
            return true;
        });

        // Admin exports holidays
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->getJson('/api/holidays/export-excel')
             ->assertStatus(200);
        \Maatwebsite\Excel\Facades\Excel::assertDownloaded('holidays.xlsx', function (\App\Exports\HolidayExport $export) {
            return true;
        });
    }
}
