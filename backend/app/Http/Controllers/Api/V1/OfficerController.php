<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Farm;

class OfficerController extends Controller
{
   public function index(Request $request)
{
    // Officer + Deleted (withTrashed)
    $query = User::withTrashed()->where('role', 'officer');

    // Optional search filter
    if ($request->has('search') && $request->search) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // Paginate (default 20 per page)
    $officers = $query->latest()->paginate(20);

    return response()->json($officers);
}


    // Admin creates officer
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'officer',
        ]);

        return response()->json($user, 201);
    }

    public function destroy(User $officer)
    {
        if ($officer->role !== 'officer') {
            return response()->json(['message' => 'Not an officer',"data"=>$officer], 422);
        }
        $officer_data= $officer;
        $officer->delete();
        return response()->json(['message' => 'Officer deleted',"data"=> $officer_data]);
    }

    // Assign officer to farm
    public function assignFarm(Request $request, Farm $farm)
    {
        $request->validate([
            'officer_id' => 'required|exists:users,id',
        ]);
        $officer = User::findOrFail($request->officer_id);
        if ($officer->role !== 'officer') {
            return response()->json(['message' => 'User is not an officer'], 422);
        }
        $farm->officers()->syncWithoutDetaching([$officer->id]);
        return response()->json(['message' => 'Assigned',"data"=>$farm]);
    }

    public function removeFromFarm(Request $request, Farm $farm)
    {
        $request->validate([
            'officer_id' => 'required|exists:users,id',
        ]);
        $farm->officers()->detach($request->officer_id);
        return response()->json(['message' => 'Removed']);
    }


    public function update(Request $request, User $officer)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
        'designation' => 'nullable|string|max:100',
    ]);

    $officer->update($validated);

    return response()->json([
        'message' => 'Officer updated successfully!',
        'officer' => $officer
    ]);
}
public function updateProfile(Request $request)
{
    $user = $request->user();

    if ($user->role !== 'officer') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
        'nid' => 'nullable|string|max:100',
        'division' => 'nullable|string|max:100',
        'district' => 'nullable|string|max:100',
        'upazila' => 'nullable|string|max:100',
        'union' => 'nullable|string|max:100',
        'address_line' => 'nullable|string|max:255',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    // ✅ Image upload
  
if ($request->hasFile('image')) {
    $imageName = time() . '.' . $request->image->extension();
    $request->image->move(public_path('uploads/officers'), $imageName);
    $validated['image'] = $imageName; // add this line
}

$user->update($validated);

    return response()->json([
        'message' => '✅ Officer profile updated successfully!',
        'user' => $user
    ]);
}

}
