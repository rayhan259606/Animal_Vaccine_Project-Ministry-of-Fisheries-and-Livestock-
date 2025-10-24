<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AllocationStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'farmer_id' => 'required|exists:farmers,id',
            'farm_id' => 'nullable|exists:farms,id',
            'vaccine_id' => 'required|exists:vaccines,id',
            'vaccine_batch_id' => 'nullable|exists:vaccine_batches,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ];
    }
}
