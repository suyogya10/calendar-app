<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\HolidayController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Completely unauthenticated public endpoint for schools/office display
Route::get('/public-calendar', [EventController::class, 'publicCalendar']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Only Routes
    Route::middleware([\App\Http\Middleware\IsAdmin::class])->group(function () {
        Route::post('holidays/import-excel', [HolidayController::class, 'importExcel']);
        Route::get('holidays/export-excel', [HolidayController::class, 'exportExcel']);
        Route::post('holidays/fetch-api', [HolidayController::class, 'fetchExternalAPI']);
        Route::post('holidays', [HolidayController::class, 'store']);
        Route::put('holidays/{holiday}', [HolidayController::class, 'update']);
        Route::delete('holidays/{holiday}', [HolidayController::class, 'destroy']);
    });

    Route::get('events/export-excel', [EventController::class, 'exportExcel']);
    Route::post('events/import-excel', [EventController::class, 'importExcel']);
    Route::apiResource('events', EventController::class);
    
    // Read-only holidays for normal users
    Route::get('holidays', [HolidayController::class, 'index']);
    Route::get('holidays/{holiday}', [HolidayController::class, 'show']);
});
