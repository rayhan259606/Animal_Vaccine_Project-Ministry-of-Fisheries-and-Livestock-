<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * ✅ All Users List (Admin Only)
     */
    public function index()
    {
        return response()->json(User::withTrashed()->latest()->get());
    }

    /**
     * ✅ Delete User
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => '🗑️ User deleted successfully']);
    }

    /**
     * ✅ Restore Deleted User
     */
public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['message' => '✅ User restored successfully']);
    }

    
}
