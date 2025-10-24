<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\FarmStoreRequest;
use Illuminate\Http\Request;
use App\Models\Farm;
use App\Models\Farmer;
use App\Models\Vaccination;

class FarmController extends Controller
{
    /**
     * List farms (based on role, with deleted toggle)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $showDeleted = filter_var($request->query('show_deleted', false), FILTER_VALIDATE_BOOLEAN);
        $search = $request->query('search', '');

        $query = $showDeleted
            ? Farm::onlyTrashed()->with('farmer.user')
            : Farm::with('farmer.user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('division', 'like', "%{$search}%");
            });
        }

        if ($user->role === 'farmer') {
            $query->whereHas('farmer', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role === 'officer') {
            $query->whereHas('officers', function ($q) use ($user) {
                $q->where('officer_id', $user->id);
            });
        }

        $farms = $query->latest()->paginate(20);

        return response()->json([
            'data' => $farms->items(),
            'current_page' => $farms->currentPage(),
            'last_page' => $farms->lastPage(),
            'total' => $farms->total(),
            'show_deleted' => $showDeleted,
        ]);
    }

    /**
     * Create new farm
     */
    public function store(FarmStoreRequest $request)
    {
        $data = $request->validated();

        if ($request->user()->role === 'farmer') {
            $farmer = Farmer::where('user_id', $request->user()->id)->firstOrFail();
            $data['farmer_id'] = $farmer->id;
        }

        $farm = Farm::create($data);

        return response()->json([
            'message' => 'Farm created successfully',
            'farm' => $farm,
        ], 201);
    }

    /**
     * Show single farm details + vaccination summary
     */
    public function show(Farm $farm)
    {
        $farm->load('farmer.user', 'animals', 'officers');

        $summary = $this->getVaccinationSummary($farm->id);

        return response()->json([
            'farm' => $farm,
            'vaccination_summary' => $summary,
        ]);
    }

    /**
     * Update farm info
     */
    public function update(Request $request, Farm $farm)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',
            'address_line' => 'nullable|string|max:255',
            'division' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'upazila' => 'nullable|string|max:100',
            'union' => 'nullable|string|max:100',
            'village' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $farm->update($request->only([
            'name', 'status', 'address_line', 'division', 'district',
            'upazila', 'union', 'village', 'latitude', 'longitude'
        ]));

        return response()->json([
            'message' => 'Farm updated successfully',
            'farm' => $farm,
        ]);
    }

    /**
     * Soft delete farm
     */
    public function destroy(Farm $farm)
    {
        $farm->delete();
        return response()->json(['message' => 'Farm deleted successfully']);
    }

    /**
     * Restore soft deleted farm
     */
    public function restore($id)
    {
        $farm = Farm::withTrashed()->findOrFail($id);
        $farm->restore();

        return response()->json([
            'message' => 'Farm restored successfully!',
            'farm' => $farm,
        ]);
    }

    /**
     * 🧠 Vaccination summary for a farm
     */
    public function vaccinationSummary($id)
    {
        $summary = $this->getVaccinationSummary($id);
        return response()->json($summary);
    }

    /**
     * Helper: Generate vaccination summary
     */
    private function getVaccinationSummary($farmId)
    {
        $farm = Farm::with('animals')->findOrFail($farmId);

        $totalAnimals = $farm->animals->count();
        $vaccinated = Vaccination::whereHas('animal', function ($q) use ($farmId) {
            $q->where('farm_id', $farmId);
        })->count();

        $lastVaccination = Vaccination::whereHas('animal', function ($q) use ($farmId) {
            $q->where('farm_id', $farmId);
        })->orderByDesc('date_administered')->first();

        return [
            'total_animals' => $totalAnimals,
            'vaccinated' => $vaccinated,
            'pending' => max($totalAnimals - $vaccinated, 0),
            'last_vaccination_date' => $lastVaccination ? $lastVaccination->date_administered : null,
        ];
    }
}
