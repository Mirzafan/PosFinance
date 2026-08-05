<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
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

    public function store(StoreCategoryRequest $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Admin yang dapat mengelola kategori transaksi.');
        }

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:categories,nama_kategori',
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori ini sudah ada.',
        ]);

        $cat = Category::create([
            'nama_kategori' => trim($validated['nama_kategori']),
        ]);

        AuditLog::record(
            'CREATE',
            'Kategori',
            "Menambahkan kategori transaksi baru: '{$cat->nama_kategori}'",
            $request->user()
        );

        return redirect()->back()->with('success', 'Kategori transaksi berhasil ditambahkan.');
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Admin yang dapat mengelola kategori transaksi.');
        }

        $category = Category::findOrFail($id);
        $oldName = $category->nama_kategori;
        $oldValues = $category->only(['nama_kategori']);

        $validated = $request->validated();

        DB::transaction(function () use ($category, $oldName, $oldValues, $validated, $request) {
            $category->update([
                'nama_kategori' => trim($validated['nama_kategori']),
            ]);

            AuditLog::record(
                'UPDATE',
                'Kategori',
                "Memperbarui nama kategori transaksi dari '{$oldName}' menjadi '{$category->nama_kategori}'",
                $request->user(),
                $oldValues,
                $category->only(['nama_kategori'])
            );
        });

        return redirect()->back()->with('success', 'Kategori transaksi berhasil diperbarui.');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Admin yang dapat mengelola kategori transaksi.');
        }

        $category = Category::findOrFail($id);
        $name = $category->nama_kategori;
        $oldValues = $category->only(['nama_kategori']);

        DB::transaction(function () use ($category, $name, $oldValues, $request) {
            // Hapus seluruh transaksi terkait kategori ini terlebih dahulu
            $category->transactions()->delete();
            // Hapus kategori transaksi
            $category->delete();

            AuditLog::record(
                'DELETE',
                'Kategori',
                "Menghapus kategori transaksi: '{$name}' beserta seluruh transaksi terkait",
                $request->user(),
                $oldValues,
                null
            );
        });

        return redirect()->back()->with('success', 'Kategori transaksi "' . $name . '" berhasil dihapus.');
    }
}
