<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    // Determine if the user is authorized to make this request.
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role !== 'staff';
    }

    // Get the validation rules that apply to the request.
    public function rules(): array
    {
        return [
            'tanggal' => 'nullable|date',
            'jenis_transaksi' => 'nullable|in:pemasukan,pengeluaran',
            'kategori_id' => 'required|exists:categories,id',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'bukti_transaksi' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ];
    }

    // Get custom messages for validator errors.
    public function messages(): array
    {
        return [
            'kategori_id.required' => 'Kategori wajib dipilih.',
            'kategori_id.exists' => 'Kategori yang dipilih tidak valid.',
            'nominal.required' => 'Nominal transaksi wajib diisi.',
            'nominal.min' => 'Nominal transaksi tidak boleh kurang dari 0.',
            'bukti_transaksi.mimes' => 'Bukti transaksi harus berupa foto (JPG, PNG, WEBP) atau dokumen PDF.',
            'bukti_transaksi.max' => 'Ukuran file bukti transaksi maksimal 10 MB.',
        ];
    }
}
