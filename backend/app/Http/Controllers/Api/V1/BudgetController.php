<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Budget;
use App\Models\Disbursement;
use App\Models\VaccineBatch;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    // ✅ Budget list + summary
    public function index(Request $request)
    {
        $query = Budget::withTrashed()->latest();

        if ($search = $request->get('search')) {
            $query->where('fiscal_year', 'like', "%$search%");
        }

        $budgets = $query->paginate(10);

        $summary = [
            'total_budget' => Budget::sum('total_amount'),
            'total_procurement' => VaccineBatch::sum(DB::raw('quantity * cost_per_unit')),
            'total_disbursement' => Disbursement::sum('amount'),
        ];

        $summary['remaining'] =
            $summary['total_budget'] -
            ($summary['total_procurement'] + $summary['total_disbursement']);

        return response()->json([
            'data' => $budgets,
            'summary' => $summary,
        ]);
    }

    // ✅ Create new budget
    public function store(Request $request)
    {
        $request->validate([
            'fiscal_year' => 'required|string|max:20',
            'total_amount' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $budget = Budget::create([
            'fiscal_year' => $request->fiscal_year,
            'total_amount' => $request->total_amount,
            'notes' => $request->notes,
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Budget created', 'budget' => $budget], 201);
    }

    // ✅ Update existing
    public function update(Request $request, Budget $budget)
    {
        $request->validate([
            'fiscal_year' => 'nullable|string|max:20',
            'total_amount' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $budget->update($request->only(['fiscal_year', 'total_amount', 'notes']));
        return response()->json(['message' => 'Budget updated', 'budget' => $budget]);
    }

    // ✅ Soft delete
    public function destroy(Budget $budget)
    {
        $budget->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // ✅ Restore deleted budget
    public function restore($id)
    {
        $budget = Budget::withTrashed()->findOrFail($id);
        $budget->restore();
        return response()->json(['message' => 'Restored successfully', 'budget' => $budget]);
    }

    // ✅ Procurement details (which vaccine purchased + total cost)
    public function procurementDetails()
    {
        $data = VaccineBatch::with('vaccine:id,name,manufacturer')
            ->select('vaccine_id', DB::raw('SUM(quantity * cost_per_unit) as total_cost'))
            ->groupBy('vaccine_id')
            ->get()
            ->map(function ($item) {
                return [
                    'vaccine_id' => $item->vaccine_id,
                    'vaccine_name' => optional($item->vaccine)->name ?? 'N/A',
                    'manufacturer' => optional($item->vaccine)->manufacturer ?? 'N/A',
                    'total_cost' => $item->total_cost ?? 0,
                ];
            });

        return response()->json($data);
    }

    // ✅ Disbursement details (farm, farmer, location)
    public function disbursementDetails()
    {
        try {
            $data = DB::table('disbursements')
                ->leftJoin('farms', 'disbursements.farm_id', '=', 'farms.id')
                ->leftJoin('farmers', 'disbursements.farmer_id', '=', 'farmers.id')
                ->leftJoin('users', 'farmers.user_id', '=', 'users.id')
                ->select(
                    'disbursements.farm_id',
                    'farms.name as farm_name',
                    'farms.location as location',
                    'farmers.name as farmer_name',
                    'users.email as farmer_email',
                    DB::raw('SUM(disbursements.amount) as total_disbursed')
                )
                ->groupBy(
                    'disbursements.farm_id',
                    'farms.name',
                    'farms.location',
                    'farmers.name',
                    'users.email'
                )
                ->get();

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching disbursement details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ✅ Budget utilization summary
    public function summary()
    {
        $data = [
            'total_budget' => Budget::sum('total_amount'),
            'total_procurement' => VaccineBatch::sum(DB::raw('quantity * cost_per_unit')),
            'total_disbursement' => Disbursement::sum('amount'),
        ];

        $data['remaining'] =
            $data['total_budget'] -
            ($data['total_procurement'] + $data['total_disbursement']);

        return response()->json($data);
    }
}
