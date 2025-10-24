<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FarmerStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // সবসময় true রাখো যাতে authorization block না করে
        return true;
    }

    public function rules(): array
    {
        return [
            // 🔹 User Table Fields
            'user.name' => 'required|string|max:255',
            'user.email' => 'required|email|unique:users,email',
            'user.password' => 'required|string|min:8',
            'user.phone' => 'nullable|string|max:20|unique:users,phone',
            'user.nid' => 'nullable|string|max:50|unique:users,nid',

            // 🔹 Address Fields
            'user.address_line' => 'nullable|string|max:255',
            'user.division' => 'nullable|string|max:100',
            'user.district' => 'nullable|string|max:100',
            'user.upazila' => 'nullable|string|max:100',
            'user.union' => 'nullable|string|max:100',
            'user.village' => 'nullable|string|max:100',

            // 🔹 Image field (optional)
            'user.image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',

            // 🔹 Farmer Table Fields
            'registration_no' => 'required|string|max:50|unique:farmers,registration_no',
            'household_size' => 'nullable|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'user.name.required' => 'Full name is required.',
            'user.email.required' => 'Email is required.',
            'user.email.unique' => 'This email is already registered.',
            'user.password.required' => 'Password is required.',
            'user.image.image' => 'The uploaded file must be an image.',
            'user.image.mimes' => 'Only JPG, PNG, and GIF formats are allowed.',
            'user.image.max' => 'Image size must be less than 2MB.',
        ];
    }
}
