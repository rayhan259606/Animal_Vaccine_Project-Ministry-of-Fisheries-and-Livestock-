<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VaccineBatch;

class VaccineBatchController extends Controller
{
    // ✅ All batches list (with deleted)
    public function index(Request $request)
    {
        $query = VaccineBatch::withTrashed()->with('vaccine')->latest();

        if ($request->has('vaccine_id')) {
            $query->where('vaccine_id', $request->vaccine_id);
        }

        $batches = $query->get();
        return response()->json($batches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vaccine_id' => 'required|exists:vaccines,id',
            'batch_no' => 'nullable|string|max:100',
            'expiry_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'cost_per_unit' => 'nullable|integer|min:0',
        ]);

        $validated['added_by'] = auth()->id();

        $batch = VaccineBatch::create($validated);
        return response()->json(['message' => 'Batch added successfully', 'batch' => $batch]);
    }

    public function update(Request $request, VaccineBatch $batch)
    {
        $validated = $request->validate([
            'expiry_date' => 'nullable|date',
            'quantity' => 'nullable|integer|min:1',
            'cost_per_unit' => 'nullable|integer|min:0',
        ]);

        $batch->update($validated);
        return response()->json(['message' => 'Batch updated successfully', 'batch' => $batch]);
    }

    public function destroy(VaccineBatch $batch)
    {
        $batch->delete();
        return response()->json(['message' => 'Batch deleted successfully']);
    }

    public function restore($id)
    {
        $batch = VaccineBatch::withTrashed()->findOrFail($id);
        $batch->restore();
        return response()->json(['message' => 'Batch restored successfully', 'batch' => $batch]);
    }
}
