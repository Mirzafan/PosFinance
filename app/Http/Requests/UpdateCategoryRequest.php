<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    // Determine if the user is authorized to make this request.
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    // Get the validation rules that apply to the request.
    public function rules(): array
    {
        $categoryId = $this->route('category');

        return [
            'nama_kategori' => 'required|string|max:255|unique:categories,nama_kategori,' . $categoryId,
        ];
    }

    // Get custom messages for validator errors.
    public function messages(): array
    {
        return [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori ini sudah ada.',
        ];
    }
}
