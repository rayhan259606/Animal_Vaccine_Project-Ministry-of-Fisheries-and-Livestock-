<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VaccineBatchStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'vaccine_id' => 'required|exists:vaccines,id',
            'batch_no' => 'required|string|max:100',
            'expiry_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'cost_per_unit' => 'nullable|integer|min:0',
        ];
    }
}
