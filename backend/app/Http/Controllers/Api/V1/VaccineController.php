<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\VaccineStoreRequest;
use Illuminate\Http\Request;
use App\Models\Vaccine;

class VaccineController extends Controller
{
    /**
     * List vaccines (with search + deleted filter)
     */
    public function index(Request $request)
    {
        $query = Vaccine::with('batches')->latest();

        if ($request->boolean('show_deleted')) {
            $query->onlyTrashed();
        }

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%$search%")
                  ->orWhere('manufacturer', 'like', "%$search%");
        }

        $vaccines = $query->paginate(15);

        return response()->json($vaccines);
    }

    /**
     * Store new vaccine
     */
    public function store(VaccineStoreRequest $request)
    {
        $vaccine = Vaccine::create($request->validated());
        return response()->json([
            'message' => 'Vaccine created successfully',
            'vaccine' => $vaccine,
        ], 201);
    }

    /**
     * Show vaccine details + batches
     */
    public function show(Vaccine $vaccine)
    {
        $vaccine->load(['batches' => function ($q) {
            $q->orderBy('expiry_date');
        }]);

        // Calculate total stock & expiry info
        $totalStock = $vaccine->batches->sum('quantity');
        $expired = $vaccine->batches->where('expiry_date', '<', now())->count();
        $expiringSoon = $vaccine->batches
            ->whereBetween('expiry_date', [now(), now()->addDays(30)])
            ->count();

        return response()->json([
            'vaccine' => $vaccine,
            'total_stock' => $totalStock,
            'expired_batches' => $expired,
            'expiring_soon' => $expiringSoon,
            'batches' => $vaccine->batches,
        ]);
    }

    /**
     * Update vaccine info
     */
    public function update(Request $request, Vaccine $vaccine)
    {
        $request->validate([
            'name' => 'nullable|string|max:255|unique:vaccines,name,' . $vaccine->id,
            'manufacturer' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:50',
            'dose_ml' => 'nullable|numeric|min:0',
            'cost_per_unit' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $vaccine->update($request->all());

        return response()->json([
            'message' => 'Vaccine updated successfully',
            'vaccine' => $vaccine,
        ]);
    }

    /**
     * Soft delete vaccine
     */
    public function destroy(Vaccine $vaccine)
    {
        $vaccine->delete();
        return response()->json(['message' => 'Vaccine deleted successfully']);
    }

    /**
     * ♻ Restore deleted vaccine
     */
    public function restore($id)
    {
        $vaccine = Vaccine::withTrashed()->findOrFail($id);
        $vaccine->restore();

        return response()->json([
            'message' => 'Vaccine restored successfully!',
            'vaccine' => $vaccine,
        ]);
    }
}
