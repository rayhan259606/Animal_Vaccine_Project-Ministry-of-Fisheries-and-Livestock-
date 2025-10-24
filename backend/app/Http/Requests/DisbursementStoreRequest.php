<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DisbursementStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'budget_id' => 'required|exists:budgets,id',
            'farmer_id' => 'required|exists:farmers,id',
            'farm_id' => 'nullable|exists:farms,id',
            'amount' => 'required|integer|min:1',
            'purpose' => 'nullable|string|max:255',
            'paid_on' => 'required|date',
            'reference_no' => 'nullable|string|max:100',
        ];
    }
}
