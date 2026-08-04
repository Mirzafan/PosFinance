<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::orderBy('id', 'asc')->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:categories,nama_kategori',
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori ini sudah ada.',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $cat = Category::create([
                'nama_kategori' => trim($validated['nama_kategori']),
            ]);

            AuditLog::record(
                'CREATE',
                'Kategori',
                "Menambahkan kategori transaksi baru: '{$cat->nama_kategori}'",
                $request->user()
            );
        });

        return redirect()->back()->with('success', 'Kategori transaksi berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $oldName = $category->nama_kategori;

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:categories,nama_kategori,' . $id,
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori ini sudah ada.',
        ]);

        DB::transaction(function () use ($category, $oldName, $validated, $request) {
            $category->update([
                'nama_kategori' => trim($validated['nama_kategori']),
            ]);

            AuditLog::record(
                'UPDATE',
                'Kategori',
                "Memperbarui nama kategori transaksi dari '{$oldName}' menjadi '{$category->nama_kategori}'",
                $request->user()
            );
        });

        return redirect()->back()->with('success', 'Kategori transaksi berhasil diperbarui.');
    }

    public function destroy(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $name = $category->nama_kategori;

        DB::transaction(function () use ($category, $name, $request) {
            // Hapus seluruh transaksi terkait kategori ini terlebih dahulu
            $category->transactions()->delete();
            // Hapus kategori transaksi
            $category->delete();

            AuditLog::record(
                'DELETE',
                'Kategori',
                "Menghapus kategori transaksi: '{$name}' beserta seluruh transaksi terkait",
                $request->user()
            );
        });

        return redirect()->back()->with('success', 'Kategori transaksi "' . $name . '" berhasil dihapus.');
    }
}
