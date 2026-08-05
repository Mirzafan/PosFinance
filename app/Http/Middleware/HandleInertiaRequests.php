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

                foreach ($recentList as $trx) {
                    $nominalFmt = 'Rp ' . number_format((float)$trx->nominal, 0, ',', '.');
                    $userName = $trx->user ? $trx->user->name : 'Sistem';
                    $list[] = [
                        'id' => 'trx_' . $trx->id,
                        'trx_id' => $trx->id,
                        'type' => 'info',
                        'title' => 'Transaksi Dicatat',
                        'message' => "Catatan transaksi {$trx->nomor_transaksi} senilai {$nominalFmt} telah sukses ditambahkan oleh {$userName}.",
                        'time' => $trx->created_at ? $trx->created_at->diffForHumans() : 'Baru saja',
                        'link' => '/dashboard/transactions',
                        'category' => 'success',
                    ];
                }

                return $list;
            },
        ];
    }
}
