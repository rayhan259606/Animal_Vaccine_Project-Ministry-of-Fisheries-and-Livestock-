<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Budget;

class BudgetController extends Controller
{
    public function index()
    {
        return response()->json(Budget::latest()->paginate(20));
    }

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
        return response()->json($budget, 201);
    }

    public function update(Request $request, $id)
    {
        $budget = Budget::find($id);
    if (!$budget) {
        return response()->json([
            'message' => 'Budget not found'
        ], 404);
    }
        $request->validate([
            'total_amount' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);
        $budget->update($request->only(['total_amount','notes']));
        return response()->json($budget);

    }

    public function destroy(Budget $budget)
    {
        $budget->delete();
        return response()->json(['message' => 'Deleted',"data"=>$budget]);
    }
}
