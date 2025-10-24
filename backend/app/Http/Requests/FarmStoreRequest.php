<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FarmStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'farmer_id' => 'nullable|exists:farmers,id',
            'name' => 'required|string|max:255',
            'registration_no' => 'nullable|string|max:50|unique:farms,registration_no',
            'division' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'upazila' => 'nullable|string|max:100',
            'union' => 'nullable|string|max:100',
            'village' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ];
    }
}
