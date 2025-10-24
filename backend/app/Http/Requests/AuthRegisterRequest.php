<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AuthRegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
       return [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|confirmed|min:6',
        'phone' => 'nullable|string|max:20|unique:users,phone',
        'nid' => 'nullable|string|max:50|unique:users,nid',
        'address_line' => 'nullable|string|max:255',
        'division' => 'nullable|string|max:100',
        'district' => 'nullable|string|max:100',
        'upazila' => 'nullable|string|max:100',
        'union' => 'nullable|string|max:100',
        'village' => 'nullable|string|max:100',
    ];
    }
}
