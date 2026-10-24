<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * List all staff members and terminal credentials.
     */
    public function index(): JsonResponse
    {
        $users = User::latest('id')->get(['id', 'name', 'email', 'role', 'phone', 'pin_code', 'is_active', 'created_at']);

        $summary = [
            'total_staff' => $users->count(),
            'active_staff' => $users->where('is_active', true)->count(),
            'cashier_count' => $users->where('role', 'cashier')->count(),
            'kitchen_count' => $users->where('role', 'kitchen')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $users,
            'summary' => $summary,
        ]);
    }

    /**
     * Register a new staff member with 4-digit PIN.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email',
            'role' => 'required|in:owner,manager,cashier,kitchen,stock_manager',
            'phone' => 'nullable|string|max:30',
            'pin_code' => 'required|string|min:4|max:6|unique:users,pin_code',
            'password' => 'nullable|string|min:6',
        ]);

        $password = !empty($validated['password']) ? Hash::make($validated['password']) : Hash::make('password123');

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'pin_code' => $validated['pin_code'],
            'password' => $password,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Staff member {$user->name} added successfully.",
            'data' => $user,
        ], 201);
    }

    /**
     * Update staff member details or reset PIN.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => "sometimes|email|max:100|unique:users,email,{$id}",
            'role' => 'sometimes|in:owner,manager,cashier,kitchen,stock_manager',
            'phone' => 'nullable|string|max:30',
            'pin_code' => "sometimes|string|min:4|max:6|unique:users,pin_code,{$id}",
            'password' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Staff details for {$user->name} updated successfully.",
            'data' => $user,
        ]);
    }

    /**
     * Toggle staff active status.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deactivating the last owner
        if ($user->role === 'owner' && $user->is_active && User::where('role', 'owner')->where('is_active', true)->count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot deactivate the primary cafe owner account.',
            ], 422);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Staff member {$user->name} is now " . ($user->is_active ? 'Active' : 'Deactivated'),
            'data' => $user,
        ]);
    }
}
