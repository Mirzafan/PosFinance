<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'notifications' => function () use ($request) {
                $user = $request->user();
                if (!$user) return [];

                $list = [];

                if ($user->role === 'admin') {
                    // Pending approval transactions
                    $pendingList = \App\Models\Transaction::with('user', 'category')
                        ->where('status', 'pending')
                        ->latest()
                        ->take(10)
                        ->get();

                    foreach ($pendingList as $trx) {
                        $staffName = $trx->user ? $trx->user->name : 'Staff Keuangan';
                        $nominalFmt = 'Rp ' . number_format((float)$trx->nominal, 0, ',', '.');
                        $list[] = [
                            'id' => 'pending_' . $trx->id,
                            'trx_id' => $trx->id,
                            'type' => 'pending_approval',
                            'title' => 'Persetujuan Transaksi Baru',
                            'message' => "Transaksi {$trx->nomor_transaksi} oleh {$staffName} senilai {$nominalFmt} memerlukan persetujuan Anda.",
                            'time' => $trx->created_at ? $trx->created_at->diffForHumans() : 'Baru saja',
                            'link' => '/dashboard/transactions?status=pending',
                            'category' => 'warning',
                        ];
                    }
                }

                if ($user->role === 'staff') {
                    // Staff's approved or rejected transactions
                    $myTrxList = \App\Models\Transaction::with('category')
                        ->where('user_id', $user->id)
                        ->whereIn('status', ['approved', 'rejected'])
                        ->latest('updated_at')
                        ->take(10)
                        ->get();

                    foreach ($myTrxList as $trx) {
                        $isApproved = $trx->status === 'approved';
                        $nominalFmt = 'Rp ' . number_format((float)$trx->nominal, 0, ',', '.');
                        $list[] = [
                            'id' => 'status_' . $trx->id . '_' . $trx->status,
                            'trx_id' => $trx->id,
                            'type' => $trx->status,
                            'title' => $isApproved ? 'Pengajuan Disetujui' : 'Pengajuan Ditolak',
                            'message' => $isApproved
                                ? "Pengajuan transaksi {$trx->nomor_transaksi} senilai {$nominalFmt} telah DISETUJUI."
                                : "Pengajuan transaksi {$trx->nomor_transaksi} senilai {$nominalFmt} DITOLAK.",
                            'time' => $trx->updated_at ? $trx->updated_at->diffForHumans() : 'Baru saja',
                            'link' => '/dashboard/transactions',
                            'category' => $isApproved ? 'success' : 'danger',
                        ];
                    }
                }

                // If fewer than 5 notifications, include recent transactions for general awareness
                if (count($list) < 5) {
                    $recentList = \App\Models\Transaction::with('user')
                        ->latest()
                        ->take(5 - count($list))
                        ->get();

                    foreach ($recentList as $trx) {
                        if (collect($list)->pluck('trx_id')->contains($trx->id)) continue;
                        $nominalFmt = 'Rp ' . number_format((float)$trx->nominal, 0, ',', '.');
                        $userName = $trx->user ? $trx->user->name : 'Sistem';
                        $list[] = [
                            'id' => 'recent_' . $trx->id,
                            'trx_id' => $trx->id,
                            'type' => 'info',
                            'title' => 'Transaksi Dicatat',
                            'message' => "Transaksi {$trx->nomor_transaksi} ({$nominalFmt}) dicatat oleh {$userName}.",
                            'time' => $trx->created_at ? $trx->created_at->diffForHumans() : 'Baru saja',
                            'link' => '/dashboard/transactions',
                            'category' => 'info',
                        ];
                    }
                }

                return $list;
            },
        ];
    }
}
