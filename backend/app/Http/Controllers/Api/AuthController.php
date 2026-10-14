<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate staff by email + password or station PIN code.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'nullable|string|email',
            'password' => 'nullable|string',
            'pin_code' => 'nullable|string',
        ]);

        $user = null;

        // 1. PIN code login for quick POS cashier/counter terminal access
        if ($request->filled('pin_code')) {
            $user = User::where('pin_code', $request->pin_code)->first();

            if (! $user) {
                throw ValidationException::withMessages([
                    'pin_code' => ['Invalid PIN code provided.'],
                ]);
            }
        }
        // 2. Email + password login
        elseif ($request->filled('email') && $request->filled('password')) {
            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials do not match our records.'],
                ]);
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Please provide either email & password or POS PIN code.',
            ], 422);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your staff account is currently deactivated. Please contact the owner.',
            ], 403);
        }

        // Revoke previous tokens if needed or issue clean session token
        $token = $user->createToken('oonjal-pos-token', [$user->role])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    /**
     * Get authenticated staff details.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    /**
     * Log out staff and revoke token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }
}
