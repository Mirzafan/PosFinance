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

                $recentList = \App\Models\Transaction::with('user', 'category')
                    ->latest()
                    ->take(5)
                    ->get();

                foreach ($recentList as $trx) {
                    $ongkirVal = (float) ($trx->nominal_ongkir > 0 ? $trx->nominal_ongkir : $trx->nominal);
                    $nominalFmt = 'Rp ' . number_format($ongkirVal, 0, ',', '.');
                    $userName = $trx->user ? $trx->user->name : 'Sistem';
                    $catName = ($trx->category && $trx->category->nama_kategori) ? $trx->category->nama_kategori : 'Layanan';
                    $list[] = [
                        'id' => 'trx_' . $trx->id,
                        'trx_id' => $trx->id,
                        'type' => 'info',
                        'title' => 'Transaksi Dicatat',
                        'message' => "Transaksi {$trx->nomor_transaksi} ({$catName}) {$nominalFmt} ditambahkan oleh {$userName}.",
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
