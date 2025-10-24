<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VaccinationStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'animal_id' => 'required|exists:animals,id',
            'vaccine_id' => 'required|exists:vaccines,id',
            'dose' => 'required|numeric|min:0',
            'date_administered' => 'required|date',
            'allocation_id' => 'nullable|exists:vaccine_allocations,id',
            'cost' => 'nullable|integer|min:0',
        ];
    }
}
