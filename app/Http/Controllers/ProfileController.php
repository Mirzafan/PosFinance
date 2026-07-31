<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Transaction;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's financial profile page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Calculate User Financial Statistics
        $userQuery = Transaction::where('user_id', $user->id);

        $totalInput = (clone $userQuery)->count();
        $totalPemasukan = (float) (clone $userQuery)->where('jenis_transaksi', 'pemasukan')->sum('nominal');
        $totalPengeluaran = (float) (clone $userQuery)->where('jenis_transaksi', 'pengeluaran')->sum('nominal');

        $approvedCount = (clone $userQuery)->where('status', 'approved')->count();
        $pendingCount = (clone $userQuery)->where('status', 'pending')->count();
        $rejectedCount = (clone $userQuery)->where('status', 'rejected')->count();

        // Personal Transaction History (10 recent)
        $personalTransactions = (clone $userQuery)
            ->with('category')
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'financialStats' => [
                'total_input' => $totalInput,
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'approved_count' => $approvedCount,
                'pending_count' => $pendingCount,
                'rejected_count' => $rejectedCount,
            ],
            'personalTransactions' => $personalTransactions,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')
            ->with('status', 'profile-updated')
            ->with('success', 'Profil Anda berhasil diperbarui!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
