<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::orderBy('name', 'asc')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $newUser = User::create([
                'name' => $validated['name'],
                'email' => strtolower($validated['email']),
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            AuditLog::record(
                'CREATE',
                'User',
                "Menambahkan akun pengguna baru: {$newUser->name} ({$newUser->email}) [Role: " . strtoupper($newUser->role) . "]",
                $request->user(),
                null,
                $newUser->only(['name', 'email', 'role'])
            );
        });

        return redirect()->back()->with('success', 'Pengguna ' . $validated['name'] . ' berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validated();

        $data = [
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $oldValues = $user->only(['name', 'email', 'role']);

        DB::transaction(function () use ($user, $data, $oldValues, $request) {
            $user->update($data);

            AuditLog::record(
                'UPDATE',
                'User',
                "Memperbarui data akun pengguna {$user->name} ({$user->email}) [Role: " . strtoupper($user->role) . "]",
                $request->user(),
                $oldValues,
                $user->only(['name', 'email', 'role'])
            );
        });

        return redirect()->back()->with('success', 'Data pengguna ' . $user->name . ' berhasil diperbarui.');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->id == $id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user = User::findOrFail($id);
        $name = $user->name;
        $email = $user->email;
        $oldValues = $user->only(['name', 'email', 'role']);

        DB::transaction(function () use ($user, $name, $email, $oldValues, $request) {
            $user->delete();

            AuditLog::record(
                'DELETE',
                'User',
                "Menghapus akun pengguna {$name} ({$email})",
                $request->user(),
                $oldValues,
                null
            );
        });

        return redirect()->back()->with('success', 'Pengguna ' . $name . ' berhasil dihapus.');
    }
}
