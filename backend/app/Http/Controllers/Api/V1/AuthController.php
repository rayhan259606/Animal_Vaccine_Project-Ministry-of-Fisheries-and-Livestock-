<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Farmer;
use App\Http\Requests\AuthRegisterRequest;

class AuthController extends Controller
{
    /**
     * 🧩 Register Farmer (User role)
     */
    public function registerFarmer(AuthRegisterRequest $request)
    {
        $data = $request->validated();

        $role = 'farmer';
        $uploadPath = match ($role) {
            'admin'   => public_path('uploads/admins'),
            'officer' => public_path('uploads/officers'),
            default   => public_path('uploads/users'),
        };

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();

            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }

            $file->move($uploadPath, $filename);
            $data['image'] = $filename;
        }

        $user = User::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
            'phone'         => $data['phone'] ?? null,
            'nid'           => $data['nid'] ?? null,
            'address_line'  => $data['address_line'] ?? null,
            'division'      => $data['division'] ?? null,
            'district'      => $data['district'] ?? null,
            'upazila'       => $data['upazila'] ?? null,
            'union'         => $data['union'] ?? null,
            'village'       => $data['village'] ?? null,
            'image'         => $data['image'] ?? null,
            'role'          => $role,
        ]);

        $farmer = Farmer::create([
            'user_id'         => $user->id,
            'registration_no' => 'F-' . now()->format('Ymd') . '-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
            'status'          => 'pending',
            'is_approved'     => false,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => $user,
            'farmer'  => $farmer,
        ], 201);
    }

    /**
     * 🔐 Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $user,
            'role'    => $user->role,
        ]);
    }

    /**
     * 👤 Get current user
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('farmerProfile');
        return response()->json($user);
    }

    /**
     * 🚪 Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    /**
     * ❌ Delete own account (only farmer)
     */
    public function deleteMe(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'farmer') {
            return response()->json(['message' => 'Only farmers can self-delete'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Account deleted (soft)']);
    }

    /**
     * 🧑‍💼 ✅ Update Admin Profile
     */
    /**
 * 🧑‍💼 ✅ Update Admin Profile (with image upload to uploads/admins)
 */
public function updateAdminProfile(Request $request)
{
    $user = auth()->user();

    // ✅ শুধুমাত্র Admin এর জন্য
    if ($user->role !== 'admin') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $validated = $request->validate([
        'name'         => 'sometimes|string|max:255',
        'phone'        => 'nullable|string|max:20',
        'nid'          => 'nullable|string|max:50',
        'division'     => 'nullable|string|max:100',
        'district'     => 'nullable|string|max:100',
        'upazila'      => 'nullable|string|max:100',
        'union'        => 'nullable|string|max:100',
        'address_line' => 'nullable|string|max:255',
        'image'        => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    try {
        // ✅ Update normal fields
        $user->fill($validated);

        // ✅ Upload path for admins
        $uploadPath = public_path('uploads/admins');
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }

        // ✅ Handle new image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();

            // পুরনো ইমেজ থাকলে ডিলিট করো
            if ($user->image && file_exists($uploadPath . '/' . $user->image)) {
                unlink($uploadPath . '/' . $user->image);
            }

            // নতুন ইমেজ move করো
            $file->move($uploadPath, $filename);
            $user->image = $filename;
        }

        $user->save();

        return response()->json([
            'message' => '✅ Admin profile updated successfully',
            'user'    => $user,
            'image_path' => url('uploads/admins/' . $user->image),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => '❌ Something went wrong!',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

}
