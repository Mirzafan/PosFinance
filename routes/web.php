<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\TargetController;
use App\Http\Controllers\DailyClosingController;
use App\Http\Controllers\ServiceLeaderboardController;
use App\Http\Controllers\HelpSupportController;

// Redirect root to dashboard (which redirects to login if unauthenticated)
Route::redirect('/', '/dashboard');

Route::middleware(['auth'])->group(function () {
    // Dashboard page
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Transactions Resources (Accessible to all authenticated users)
    Route::resource('dashboard/transactions', TransactionController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'transactions.index',
        'store' => 'transactions.store',
        'update' => 'transactions.update',
        'destroy' => 'transactions.destroy',
    ]);

    // Admin Only Routes
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/dashboard/transactions/{id}/approve', [TransactionController::class, 'approve'])->name('transactions.approve');
        Route::post('/dashboard/transactions/{id}/reject', [TransactionController::class, 'reject'])->name('transactions.reject');
        Route::post('/dashboard/transactions/bulk-approve', [TransactionController::class, 'bulkApprove'])->name('transactions.bulk-approve');
        Route::post('/dashboard/transactions/bulk-reject', [TransactionController::class, 'bulkReject'])->name('transactions.bulk-reject');
        Route::post('/dashboard/transactions/bulk-delete', [TransactionController::class, 'bulkDelete'])->name('transactions.bulk-delete');
        Route::post('/dashboard/transactions/daily-closing', [TransactionController::class, 'dailyClosing'])->name('transactions.daily-closing');

        Route::post('/dashboard/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/dashboard/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/dashboard/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::post('/dashboard/daily-closings/emergency-open', [DailyClosingController::class, 'emergencyOpen'])->name('daily-closings.emergency-open');
        Route::post('/dashboard/daily-closings/clear-logs', [DailyClosingController::class, 'clearLogs'])->name('daily-closings.clear-logs');

        Route::resource('dashboard/users', UserController::class)->only(['index', 'store', 'update', 'destroy'])->names([
            'index' => 'users.index',
            'store' => 'users.store',
            'update' => 'users.update',
            'destroy' => 'users.destroy',
        ]);

        // Audit Logs
        Route::get('/dashboard/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

        // Target Store (Admin only)
        Route::post('/dashboard/targets', [TargetController::class, 'store'])->name('targets.store');
    });

    Route::get('/dashboard/categories', [CategoryController::class, 'index'])->name('categories.index');

    // Revenue Targets (Accessible to all authenticated users)
    Route::get('/dashboard/targets', [TargetController::class, 'index'])->name('targets.index');

    // Daily Closings History (Accessible to all authenticated users)
    Route::get('/dashboard/daily-closings', [DailyClosingController::class, 'index'])->name('daily-closings.index');
    Route::post('/dashboard/daily-closings', [DailyClosingController::class, 'store'])->name('daily-closings.store');
    Route::get('/dashboard/daily-closings/{id}/pdf', [DailyClosingController::class, 'exportPdf'])->name('daily-closings.pdf');
    Route::delete('/dashboard/daily-closings/{id}', [DailyClosingController::class, 'destroy'])->name('daily-closings.destroy');

    // Service Leaderboard (Accessible to all authenticated users)
    Route::get('/dashboard/leaderboard', [ServiceLeaderboardController::class, 'index'])->name('leaderboard.index');

    // Financial Reports
    Route::get('/dashboard/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/excel', [ReportController::class, 'exportExcel'])->name('reports.excel');
    Route::get('/reports/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('/reports/flowchart-pdf', [ReportController::class, 'exportFlowchartPdf'])->name('reports.flowchart-pdf');

    // Help & Support Center
    Route::get('/dashboard/help-support', [HelpSupportController::class, 'index'])->name('help-support.index');
    Route::post('/dashboard/help-support/messages', [HelpSupportController::class, 'store'])->name('help-support.store');

    // Profile Controller
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
