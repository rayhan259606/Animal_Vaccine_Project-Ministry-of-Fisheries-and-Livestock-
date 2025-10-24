<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vaccination;
use App\Models\Animal;

class VaccinationController extends Controller
{
    /**
     * Show all vaccination records (filtered by role)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Vaccination::with(['vaccine', 'animal', 'officer'])
            ->latest();

        // ✅ Farmer: শুধু নিজের প্রাণীর vaccination দেখবে
        if ($user->role === 'farmer') {
            $query->whereHas('animal.farm.farmer', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // ✅ Officer: শুধু তার administered করা vaccination দেখবে
        if ($user->role === 'officer') {
            $query->where('administered_by', $user->id);
        }

        // ✅ Admin সব দেখতে পারবে
        $records = $query->get();

        return response()->json([
            'message' => 'Vaccination records fetched successfully!',
            'data' => $records,
        ]);
    }

    /**
     * Show single vaccination
     */
    public function show(Vaccination $vaccination)
    {
        $vaccination->load(['vaccine', 'animal', 'officer']);
        return response()->json($vaccination);
    }

    /**
     * Store new vaccination (Officer/Admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'vaccine_id' => 'required|exists:vaccines,id',
            'dose' => 'required|numeric|min:0.1',
            'date_administered' => 'required|date',
            'allocation_id' => 'nullable|exists:vaccine_allocations,id',
            'cost' => 'nullable|integer',
        ]);

        $validated['administered_by'] = $request->user()->id;

        $vaccination = Vaccination::create($validated);

        return response()->json([
            'message' => 'Vaccination record created successfully!',
            'data' => $vaccination->load(['vaccine', 'animal', 'officer']),
        ], 201);
    }

    /**
     * Update vaccination record
     */
    public function update(Request $request, Vaccination $vaccination)
    {
        $validated = $request->validate([
            'dose' => 'nullable|numeric|min:0.1',
            'date_administered' => 'nullable|date',
            'cost' => 'nullable|integer',
        ]);

        $vaccination->update($validated);

        return response()->json([
            'message' => 'Vaccination updated successfully!',
            'data' => $vaccination->load(['vaccine', 'animal', 'officer']),
        ]);
    }

    /**
     * Delete vaccination record
     */
    public function destroy(Vaccination $vaccination)
    {
        $vaccination->delete();
        return response()->json(['message' => 'Vaccination deleted successfully.']);
    }
}
