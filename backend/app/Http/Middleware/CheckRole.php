<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request and check staff role.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Owner always has super-admin rights
        if ($user->role === 'owner') {
            return $next($request);
        }

        if (! in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Insufficient role permissions for this operation.',
            ], 403);
        }

        return $next($request);
    }
}
