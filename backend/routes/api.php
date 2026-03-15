<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| This file is ready to paste into routes/api.php.
| It assumes:
| - Laravel Sanctum is used for API authentication (auth:sanctum).
| - RoleMiddleware is registered as 'role' in app/Http/Kernel.php.
| - Controllers and models exist as discussed.
*/

/**
 * Public routes
 * - Login
 * - Public menu & category browsing
 */

// Auth (login)
Route::post('/login', [AuthController::class, 'login']);

// Public menu endpoints (browsing)
Route::get('/menu', [MenuController::class, 'index']);           // list menu items (paginated)
Route::get('/menu/{menuItem}', [MenuController::class, 'show']); // single menu item

// Public categories (read-only)
Route::get('/categories', [CategoryController::class, 'index']);    // list categories
Route::get('/categories/{category}', [CategoryController::class, 'show']); // category + items


/**
 * Protected routes (auth:sanctum required)
 */
Route::middleware('auth:sanctum')->group(function () {

    // Authenticated user info & logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    /**
     * Customer / Cashier / Admin
     * - Place orders
     * - View orders
     */
    Route::middleware('role:customer,cashier,admin')->group(function () {
        // Orders
        Route::get('/orders', [OrderController::class, 'index']);        // list orders (customer: own; cashier/admin: all)
        Route::get('/orders/{order}', [OrderController::class, 'show']); // order details
        Route::post('/orders', [OrderController::class, 'store']);       // create new order
    });

    /**
     * Cashier / Admin
     * - Update order status
     * - Basic inventory updates (stock, availability)
     */
    Route::middleware('role:cashier,admin')->group(function () {
        // Order status flow: Pending → Preparing → Ready → Completed / Cancelled
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

        // Inventory / availability
        Route::patch('/menu/{menuItem}/stock', [InventoryController::class, 'updateStock']);           // adjust stock
        Route::post('/menu/{menuItem}/toggle-availability', [MenuController::class, 'toggleAvailability']); // in/out of stock
    });

    /**
     * Admin only
     * - Full CRUD on menu items & categories
     * - Reports
     * - (Optional) user management
     */
    Route::middleware('role:admin')->group(function () {

        // Menu CRUD (index/show are public; everything else here)
        Route::apiResource('menu', MenuController::class)->except(['index', 'show']);

        // Category CRUD (index/show are public; everything else here)
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

        // Reports
        Route::get('/reports/sales-summary', [ReportController::class, 'salesSummary']);   // daily/weekly/monthly
        Route::get('/reports/best-sellers', [ReportController::class, 'bestSellers']);     // by qty & revenue
        Route::get('/reports/order-volume', [ReportController::class, 'orderVolume']);     // volume trend
        Route::get('/reports/category-sales', [ReportController::class, 'categorySales']); // per category

        // Example placeholder for user management:
        // Route::get('/users', [UserController::class, 'index']);
        // Route::post('/users', [UserController::class, 'store']);
        // Route::patch('/users/{user}', [UserController::class, 'update']);
        // Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});