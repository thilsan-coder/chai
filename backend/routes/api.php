<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\KdsController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ComboController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\BankVerificationController;
use App\Http\Controllers\Api\UserController;
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

// Combos & Bundle Promotions (Part 11)
Route::get('/combos', [ComboController::class, 'index']);
Route::get('/combos/{id}', [ComboController::class, 'show']);
Route::post('/combos', [ComboController::class, 'store']);
Route::put('/combos/{id}', [ComboController::class, 'update']);
Route::post('/combos/{id}/toggle-status', [ComboController::class, 'toggleStatus']);
Route::delete('/combos/{id}', [ComboController::class, 'destroy']);

// Order management (Available for POS billing and KDS)
Route::get('/orders/daily-summary', [OrderController::class, 'dailySummary']);
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

// Kitchen Display System (KDS) routes
Route::get('/kds/orders', [KdsController::class, 'orders']);
Route::patch('/kds/orders/{id}/status', [KdsController::class, 'updateStatus']);
Route::get('/kds/stats', [KdsController::class, 'stats']);

// Table & Dine-in Floor Management (Part 6)
Route::get('/tables', [TableController::class, 'index']);
Route::post('/tables', [TableController::class, 'store']);
Route::put('/tables/{id}', [TableController::class, 'update']);
Route::post('/tables/{id}/transfer', [TableController::class, 'transfer']);
Route::post('/tables/{id}/release', [TableController::class, 'release']);

// Inventory & Raw Stock Management (Part 7)
Route::get('/inventory', [InventoryController::class, 'index']);
Route::post('/inventory', [InventoryController::class, 'store']);
Route::put('/inventory/{id}', [InventoryController::class, 'update']);
Route::post('/inventory/{id}/stock-in', [InventoryController::class, 'stockIn']);
Route::post('/inventory/{id}/adjust', [InventoryController::class, 'stockAdjust']);
Route::get('/inventory/alerts/low-stock', [InventoryController::class, 'lowStockAlerts']);
Route::get('/inventory/recipes/{productId}', [InventoryController::class, 'recipes']);

// Suppliers & Vendors (Part 7)
Route::get('/suppliers', [SupplierController::class, 'index']);
Route::post('/suppliers', [SupplierController::class, 'store']);
Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

// Customers & Loyalty System (Part 8)
Route::get('/customers/lookup', [CustomerController::class, 'lookup']);
Route::get('/customers', [CustomerController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'store']);
Route::get('/customers/{id}', [CustomerController::class, 'show']);
Route::put('/customers/{id}', [CustomerController::class, 'update']);
Route::post('/customers/{id}/points', [CustomerController::class, 'adjustPoints']);

// Daily Expenses & Petty Cash (Part 9)
Route::get('/expenses', [ExpenseController::class, 'index']);
Route::post('/expenses', [ExpenseController::class, 'store']);
Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

// Financial Reports & P&L Analytics (Part 10)
Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
Route::get('/reports/daily-sessions', [ReportController::class, 'dailySessions']);

// Bank Transfer Verification (Part 12 - MOD-10)
Route::get('/bank-transfers', [BankVerificationController::class, 'index']);
Route::post('/bank-transfers/{id}/verify', [BankVerificationController::class, 'verify']);
Route::post('/bank-transfers/{id}/reject', [BankVerificationController::class, 'reject']);
Route::patch('/bank-transfers/{id}/reference', [BankVerificationController::class, 'updateReference']);

// Staff & Role-Based Access (Part 12 - MOD-12)
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::post('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);

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
