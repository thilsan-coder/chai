<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SystemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Oonjal Chai Management System API Routes
|--------------------------------------------------------------------------
*/

// Public routes & Health
Route::get('/system/status', [SystemController::class, 'status']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Menu & Category Public Reading (POS & Display)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::post('/products/{product}/toggle-availability', [ProductController::class, 'toggleAvailability']);

// Authenticated staff routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Menu Management (Owner, Manager, Cashier permitted for fast stock toggling)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Future Part Routes:
    // Part 4: Orders & POS (MOD-02)
    // Part 5: Tokens & Kitchen Dispatch (MOD-03)
    // Part 6: Payments & Bank Verification (MOD-10)
    // Part 7: Combos & Promotions (MOD-06)
    // Part 8: Inventory & Purchasing (MOD-07, MOD-08)
    // Part 9: Expenses (MOD-09)
    // Part 10: Reports (MOD-11)
    // Part 11: Settings & Staff (MOD-12, MOD-13)
});
