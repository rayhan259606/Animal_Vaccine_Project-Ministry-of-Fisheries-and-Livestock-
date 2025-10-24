<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\DisbursementStoreRequest;
use Illuminate\Http\Request;
use App\Models\Disbursement;

class DisbursementController extends Controller
{
    /**
     * ✅ List disbursements for farmer / officer / admin
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // include budget (withTrashed to avoid null)
        $q = Disbursement::with(['budget', 'farmer.user', 'farm', 'disbursedByUser'])
            ->latest();

        // 🔹 Farmer -> নিজের disbursement
        if ($user->role === 'farmer') {
            $q->whereHas('farmer', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
        }

        // 🔹 Officer -> Assigned farms only
        elseif ($user->role === 'officer') {
            $q->whereHas('farm.officers', function ($query) use ($user) {
                $query->where('officer_id', $user->id);
            });
        }

        // 🔹 Optional: filter by fiscal year
        if ($year = $request->query('fiscal_year')) {
            $q->whereHas('budget', fn($qq) => $qq->where('fiscal_year', $year));
        }

        return response()->json($q->paginate(20));
    }

    /**
     * ✅ Store new disbursement
     */
    public function store(DisbursementStoreRequest $request)
    {
        $data = $request->validated();
        $data['disbursed_by'] = $request->user()->id;
        $data['status'] = 'paid';

        $disbursement = Disbursement::create($data);
        return response()->json(
            $disbursement->load(['budget', 'farm', 'disbursedByUser']),
            201
        );
    }

    /**
     * ✅ Update existing disbursement
     */
    public function update(Request $request, Disbursement $disbursement)
    {
        $request->validate([
            'amount' => 'nullable|integer|min:0',
            'purpose' => 'nullable|string|max:255',
            'paid_on' => 'nullable|date',
            'status' => 'nullable|in:paid,approved,cancelled',
            'reference_no' => 'nullable|string|max:100',
        ]);

        $disbursement->update($request->all());

        return response()->json(
            $disbursement->load(['budget', 'farm', 'disbursedByUser'])
        );
    }

    /**
     * ✅ Delete disbursement
     */
    public function destroy(Disbursement $disbursement)
    {
        $disbursement->delete();
        return response()->json(['message' => '🗑️ Deleted successfully']);
    }
}
