<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VaccineStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:vaccines,name',
            'manufacturer' => 'nullable|string|max:255',
            'unit' => 'required|string|max:50',
            'dose_ml' => 'nullable|numeric|min:0',
            'cost_per_unit' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
