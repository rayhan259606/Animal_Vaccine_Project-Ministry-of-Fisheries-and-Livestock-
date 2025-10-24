<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnimalStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'farm_id' => 'required|exists:farms,id',
            'tag' => 'required|string|max:100|unique:animals,tag',
            'species' => 'required|string|max:50', // cattle, goat, etc.
            'breed' => 'nullable|string|max:100',
            'sex' => 'required|in:male,female,unknown',
            'dob' => 'nullable|string|max:250',
            'status' => 'nullable|string|max:50',
        ];
    }
}
