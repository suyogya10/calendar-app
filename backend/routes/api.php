<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\OfficeAppController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\StaffHolidayController;

Route::get('/staff-holidays', [StaffHolidayController::class, 'index']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Completely unauthenticated public endpoint for schools/office display
Route::get('/public-calendar', [EventController::class, 'publicCalendar']);
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/office-apps', [OfficeAppController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/staff-holidays', [StaffHolidayController::class, 'store']);

    // Admin Only Routes
    Route::middleware([\App\Http\Middleware\IsAdmin::class])->group(function () {
        Route::get('admin/dashboard', [AdminController::class, 'dashboard']);
        Route::post('holidays/import-excel', [HolidayController::class, 'importExcel']);
        Route::get('holidays/export-excel', [HolidayController::class, 'exportExcel']);
        Route::post('holidays/fetch-api', [HolidayController::class, 'fetchExternalAPI']);
        Route::post('holidays', [HolidayController::class, 'store']);
        Route::put('holidays/{holiday}', [HolidayController::class, 'update']);
        Route::delete('holidays/{holiday}', [HolidayController::class, 'destroy']);
        Route::post('settings', [SettingController::class, 'store']);
        
        // User Management
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/departments', [UserController::class, 'getDepartments']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
        Route::post('users/import-excel', [UserController::class, 'importExcel']);
        
        // Announcements Admin CRUD
        Route::post('announcements', [AnnouncementController::class, 'store']);
        Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
        
        // Office Apps Admin CRUD
        Route::apiResource('office-apps', OfficeAppController::class)->except(['index']);
    });

    Route::get('events/export-excel', [EventController::class, 'exportExcel']);
    Route::post('events/import-excel', [EventController::class, 'importExcel']);
    Route::apiResource('events', EventController::class);
    
    // Read-only holidays for normal users
    Route::get('holidays', [HolidayController::class, 'index']);
    Route::get('holidays/{holiday}', [HolidayController::class, 'show']);
});
