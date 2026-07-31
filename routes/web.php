<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard (which redirects to login if unauthenticated)
Route::redirect('/', '/dashboard');

Route::middleware(['auth'])->group(function () {
    // Dashboard page
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // CRUD Resources
    
    Route::resource('dashboard/categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'categories.index',
        'store' => 'categories.store',
        'update' => 'categories.update',
        'destroy' => 'categories.destroy',
    ]);
    
    Route::resource('dashboard/transactions', TransactionController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'transactions.index',
        'store' => 'transactions.store',
        'update' => 'transactions.update',
        'destroy' => 'transactions.destroy',
    ]);
    Route::post('/dashboard/transactions/{id}/approve', [TransactionController::class, 'approve'])->name('transactions.approve');
    Route::post('/dashboard/transactions/{id}/reject', [TransactionController::class, 'reject'])->name('transactions.reject');
    Route::post('/dashboard/transactions/bulk-approve', [TransactionController::class, 'bulkApprove'])->name('transactions.bulk-approve');
    Route::post('/dashboard/transactions/bulk-reject', [TransactionController::class, 'bulkReject'])->name('transactions.bulk-reject');
    Route::post('/dashboard/transactions/bulk-delete', [TransactionController::class, 'bulkDelete'])->name('transactions.bulk-delete');
    
    Route::resource('dashboard/users', UserController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'users.index',
        'store' => 'users.store',
        'update' => 'users.update',
        'destroy' => 'users.destroy',
    ]);

    // Audit Logs (Admin & Supervisor only)
    Route::get('/dashboard/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // Financial Reports
    Route::get('/dashboard/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/excel', [ReportController::class, 'exportExcel'])->name('reports.excel');
    Route::get('/reports/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('/reports/flowchart-pdf', [ReportController::class, 'exportFlowchartPdf'])->name('reports.flowchart-pdf');

    // Profile Controller
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
