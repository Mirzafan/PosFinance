<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        // Require admin role to access Audit Logs
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang memiliki akses ke Audit Log.');
        }

        $query = AuditLog::with('user');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        // Filter by Module
        if ($request->filled('module')) {
            $query->where('module', $request->input('module'));
        }

        // Filter by Action
        if ($request->filled('action')) {
            $query->where('action', strtoupper($request->input('action')));
        }

        // Filter by Date Range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $logs = $query->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistical summary counts
        $totalLogs = AuditLog::count();
        $transaksiLogsCount = AuditLog::where('module', 'Transaksi')->count();
        $userLogsCount = AuditLog::where('module', 'User')->count();

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'stats' => [
                'total_logs' => $totalLogs,
                'transaksi_count' => $transaksiLogsCount,
                'user_count' => $userLogsCount,
            ],
            'filters' => $request->only(['search', 'module', 'action', 'start_date', 'end_date']),
        ]);
    }
}
