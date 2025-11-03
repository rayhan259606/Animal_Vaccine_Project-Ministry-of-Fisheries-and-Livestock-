<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\FarmerStoreRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Farmer;

class FarmerController extends Controller
{
    // 🔹 List farmers (Admin, Officer, Farmer)
    public function index(Request $request)
    {
        $user = auth()->user();

        // ✅ with() এ farms যোগ করা হয়েছে যাতে farm count আসে
        $q = Farmer::with(['user', 'farms'])->latest();

        if ($user->role === 'farmer') {
            // 👩‍🌾 Farmer → নিজের data দেখবে
            $q->where('user_id', $user->id);
        } 
        elseif ($user->role === 'officer') {
            // 👨‍🔬 Officer → Assigned farm-এর farmers দেখবে
            $q->whereHas('farms.officers', function ($query) use ($user) {
                // ✅ officer_id এর জায়গায় সঠিক pivot কলাম farm_officer.user_id
                $query->where('farm_officer.user_id', $user->id);
            });
        }

        // ✅ Optional: প্রতিটি farmer এর সাথে farm count যোগ করা হচ্ছে
        $farmers = $q->paginate(20);
        $farmers->getCollection()->transform(function ($farmer) {
            $farmer->farm_count = $farmer->farms->count();
            return $farmer;
        });

        return response()->json($farmers);
    }

    // 🔹 Create farmer (Admin/Officer)
    public function store(FarmerStoreRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['user']['name'],
            'email' => $data['user']['email'],
            'password' => Hash::make($data['user']['password']),
            'phone' => $data['user']['phone'] ?? null,
            'nid' => $data['user']['nid'] ?? null,
            'role' => 'farmer',
        ]);

        $farmer = Farmer::create([
            'user_id' => $user->id,
            'registration_no' => $data['registration_no'],
            'household_size' => $data['household_size'] ?? null,
            'status' => 'pending',
            'is_approved' => false,
        ]);

        return response()->json(['user' => $user, 'farmer' => $farmer], 201);
    }

    // 🔹 Show single farmer
    public function show(Farmer $farmer)
    {
        $farmer->load('user', 'farms');
        return response()->json($farmer);
    }

    // 🔹 Update farmer approval/status (Admin/Officer)
    public function update(Request $request, Farmer $farmer)
    {
        $request->validate([
            'status' => 'nullable|in:pending,active,suspended',
            'is_approved' => 'nullable|boolean',
        ]);

        $farmer->update($request->only(['status', 'is_approved']));
        return response()->json($farmer);
    }

    // 🔹 Delete farmer (Admin)
    public function destroy($id)
    {
        $farm = Farmer::find($id);

        if (!$farm) {
            return response()->json(['message' => 'Farmer not found'], 404);
        }

        $farm->user()->delete();
        $farm->delete();

        return response()->json(['message' => 'Deleted successfully', 'data' => $farm]);
    }

    // ✅ Farmer নিজে নিজের Profile Update করতে পারবে
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'nid' => 'nullable|string|max:50',
            'address_line' => 'nullable|string|max:255',
            'division' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'upazila' => 'nullable|string|max:100',
            'union' => 'nullable|string|max:100',
            'village' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

      if ($request->hasFile('image')) {
    $imageName = time() . '.' . $request->image->extension();
    $request->image->move(public_path('uploads/farmers'), $imageName);
    $user->image = $imageName;
}

        $user->fill($request->only([
            'name',
            'phone',
            'nid',
            'address_line',
            'division',
            'district',
            'upazila',
            'union',
            'village',
        ]));

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    // 🔹 Pending Farmers List
    public function pending()
    {
        $farmers = Farmer::with('user')
            ->where('is_approved', false)
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return response()->json($farmers);
    }

    // 🔹 Pending Farmer Count (for Sidebar)
    public function pendingCount()
    {
        $count = Farmer::where('is_approved', false)
            ->where('status', 'pending')
            ->count();

        return response()->json(['count' => $count]);
    }

    // 🔹 Approve a Farmer
    public function approve($id)
    {
        $farmer = Farmer::findOrFail($id);
        $farmer->update([
            'is_approved' => true,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Farmer approved successfully!',
            'farmer' => $farmer,
        ]);
    }
}
