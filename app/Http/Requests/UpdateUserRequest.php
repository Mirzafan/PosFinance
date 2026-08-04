<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    // Determine if the user is authorized to make this request.
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    // Get the validation rules that apply to the request.
    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $userId,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:admin,staff',
        ];
    }

    // Get custom messages for validator errors.
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.lowercase' => 'Alamat email tidak boleh mengandung huruf kapital.',
            'email.unique' => 'Alamat email ini sudah digunakan oleh akun lain.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'role.required' => 'Role hak akses wajib dipilih.',
        ];
    }
}
