<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    // Determine if the user is authorized to make this request.
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    // Get the validation rules that apply to the request.
    public function rules(): array
    {
        return [
            'tanggal' => 'nullable|date',
            'jenis_transaksi' => 'nullable|in:pemasukan,pengeluaran',
            'kategori_id' => 'required|exists:categories,id',
            'nominal' => 'nullable|numeric|min:0',
            'nominal_ongkir' => 'required|numeric|min:0',
            'nominal_asuransi' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
        ];
    }

    // Get custom messages for validator errors.
    public function messages(): array
    {
        return [
            'kategori_id.required' => 'Kategori wajib dipilih.',
            'kategori_id.exists' => 'Kategori yang dipilih tidak valid.',
            'nominal_ongkir.required' => 'Nominal pendapatan (ongkir) wajib diisi.',
            'nominal_ongkir.min' => 'Nominal pendapatan (ongkir) tidak boleh kurang dari 0.',
        ];
    }
}
