<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\AuditLog;
use Illuminate\Http\Request;
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

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Admin yang dapat mengelola kategori transaksi.');
        }

        $category = Category::findOrFail($id);
        $oldName = $category->nama_kategori;

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:categories,nama_kategori,' . $id,
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori ini sudah ada.',
        ]);

        $category->update([
            'nama_kategori' => trim($validated['nama_kategori']),
        ]);

        AuditLog::record(
            'UPDATE',
            'Kategori',
            "Memperbarui nama kategori transaksi dari '{$oldName}' menjadi '{$category->nama_kategori}'",
            $request->user()
        );

        return redirect()->back()->with('success', 'Kategori transaksi berhasil diperbarui.');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Akses ditolak. Hanya Admin yang dapat mengelola kategori transaksi.');
        }

        $category = Category::findOrFail($id);

        if ($category->transactions()->exists()) {
            return redirect()->back()->with('error', 'Kategori "' . $category->nama_kategori . '" tidak dapat dihapus karena masih digunakan oleh transaksi.');
        }

        $name = $category->nama_kategori;
        $category->delete();

        AuditLog::record(
            'DELETE',
            'Kategori',
            "Menghapus kategori transaksi: '{$name}'",
            $request->user()
        );

        return redirect()->back()->with('success', 'Kategori transaksi berhasil dihapus.');
    }
}
