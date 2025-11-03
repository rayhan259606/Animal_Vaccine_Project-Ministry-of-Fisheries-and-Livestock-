<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\VaccineAllocation;
use App\Models\VaccineBatch;
use App\Models\VaccineStockMovement;
use App\Models\Farmer;

class VaccineAllocationController extends Controller
{
    /**
     * ✅ All users can view their allocations.
     * - Farmer: Only their own requests
     * - Officer/Admin: All allocations
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $q = VaccineAllocation::with(['farmer.user', 'farm', 'vaccine', 'batch', 'animal', 'allocatedBy'])
    ->latest();


        if ($user->role === 'farmer') {
            $q->whereHas('farm.farmer', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
        }

        return response()->json($q->get());
    }

    /**
     * ✅ Store allocation / request
     * - Farmer: Creates a pending request (no batch or allocated_by)
     * - Officer/Admin: Performs actual allocation (batch deducted)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'vaccine_id' => 'required|exists:vaccines,id',
            'farm_id' => 'required|exists:farms,id',
            'animal_id' => 'nullable|exists:animals,id',
            'quantity' => 'required|integer|min:1',
            'vaccine_batch_id' => 'nullable|exists:vaccine_batches,id',
        ]);

        // 🔹 CASE 1: Farmer making a request
        if ($user->role === 'farmer') {
            $farmer = Farmer::where('user_id', $user->id)->firstOrFail();
            $validated['farmer_id'] = $farmer->id;
            $validated['status'] = 'pending';
            $validated['allocated_by'] = null; // ✅ avoid constraint error

            $allocation = VaccineAllocation::create($validated);

            return response()->json([
                'message' => '✅ Vaccine request submitted successfully!',
                'data' => $allocation,
            ], 201);
        }

        // 🔹 CASE 2: Officer / Admin allocating directly
        $validated['allocated_by'] = $user->id;
        $validated['status'] = 'allocated';

        $allocation = DB::transaction(function () use ($validated, $user) {
            if (!empty($validated['vaccine_batch_id'])) {
                $batch = VaccineBatch::lockForUpdate()->findOrFail($validated['vaccine_batch_id']);

                if ($batch->quantity < $validated['quantity']) {
                    abort(response()->json(['message' => '❌ Insufficient stock'], 422));
                }

                // Deduct batch quantity
                $batch->decrement('quantity', $validated['quantity']);

                // Record movement
                VaccineStockMovement::create([
                    'vaccine_id' => $batch->vaccine_id,
                    'vaccine_batch_id' => $batch->id,
                    'type' => 'out',
                    'quantity' => $validated['quantity'],
                    'reason' => 'allocation',
                    'performed_by' => $user->id,
                ]);
            }

            return VaccineAllocation::create($validated);
        });

        return response()->json([
            'message' => '✅ Vaccine allocated successfully!',
            'data' => $allocation,
        ], 201);
    }

    /**
     * ✅ Update Status (Officer/Admin only)
     */
 public function updateStatus(Request $request, VaccineAllocation $allocation)
{
    $request->validate([
        'status' => 'required|in:pending,allocated,issued,administered,cancelled'
    ]);

    $user = $request->user();

    // 🔹 If approving, set allocated_by to current officer/admin
    if ($request->status === 'allocated') {
        $allocation->update([
            'status' => $request->status,
            'allocated_by' => $user->id, // ✅ Save who approved
        ]);
    } else {
        // 🔹 If cancelling or other status, keep status only
        $allocation->update([
            'status' => $request->status,
        ]);
    }

    // 🔹 Return with relation (so frontend sees updated user info)
    $allocation->load('allocatedBy', 'farmer.user', 'farm', 'vaccine', 'animal', 'batch');

    return response()->json([
        'message' => '✅ Status updated successfully!',
        'data' => $allocation,
    ]);
}


    /**
     * ✅ Delete allocation
     */
    public function destroy(VaccineAllocation $allocation)
    {
        $allocation->delete();

        return response()->json([
            'message' => '🗑️ Allocation deleted successfully.'
        ]);
    }
    public function pendingCount()
{
    $count = \App\Models\VaccineAllocation::where('status', 'pending')->count();

    return response()->json(['count' => $count]);
}

}
