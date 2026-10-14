<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SystemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Oonjal Chai Management System API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/system/status', [SystemController::class, 'status']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Authenticated staff routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Route placeholders for future parts:
    // Part 3: Menu & Categories (MOD-04, MOD-05)
    // Part 4: Orders & POS (MOD-02)
    // Part 5: Tokens & Kitchen Dispatch (MOD-03)
    // Part 6: Payments & Bank Verification (MOD-10)
    // Part 7: Combos & Promotions (MOD-06)
    // Part 8: Inventory & Purchasing (MOD-07, MOD-08)
    // Part 9: Expenses (MOD-09)
    // Part 10: Reports (MOD-11)
    // Part 11: Settings & Staff (MOD-12, MOD-13)
});
