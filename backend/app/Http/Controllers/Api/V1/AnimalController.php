<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnimalStoreRequest;
use Illuminate\Http\Request;
use App\Models\Animal;

class AnimalController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $q = Animal::with('farm.farmer.user')->latest();

        // 🔹 Farmer -> নিজের animals
        if ($user->role === 'farmer') {
            $q->whereHas('farm.farmer', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
        }

        // 🔹 Officer -> Assigned farms এর animal
        elseif ($user->role === 'officer') {
            $q->whereHas('farm.officers', function ($query) use ($user) {
                $query->where('officer_id', $user->id);
            });
        }

        // Admin -> সব animal
        if ($farmId = $request->query('farm_id')) {
            $q->where('farm_id', $farmId);
        }

        return response()->json($q->paginate(20));
    }

    public function store(AnimalStoreRequest $request)
    {
        $animal = Animal::create($request->validated());
        return response()->json($animal, 201);
    }

    public function show(Animal $animal)
    {
        $animal->load('farm.farmer.user', 'vaccinations');
        return response()->json($animal);
    }

    public function update(Request $request, Animal $animal)
    {
        $request->validate([
            'species' => 'nullable|string|max:50',
            'breed' => 'nullable|string|max:100',
            'sex' => 'nullable|in:male,female,unknown',
             'dob' => 'nullable|string|max:250',
            'status' => 'nullable|string|max:50',
        ]);
        $animal->update($request->all());
        return response()->json($animal);
    }

    public function destroy(Animal $animal)
    {
        $animal->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
