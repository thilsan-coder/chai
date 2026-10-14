<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SystemController extends Controller
{
    /**
     * Report backend health, Sri Lanka business session, and database connectivity.
     */
    public function status(): JsonResponse
    {
        $dbConnected = false;
        try {
            DB::connection()->getPdo();
            $dbConnected = true;
        } catch (\Exception $e) {
            $dbConnected = false;
        }

        // Sri Lanka Asia/Colombo business hours calculation
        $now = now()->setTimezone('Asia/Colombo');
        $currentTime = $now->format('H:i');
        // Business hours: 16:00 (4:00 PM) to 01:00 (1:00 AM next day)
        $isLiveSession = ($currentTime >= '16:00' || $currentTime <= '01:00');

        return response()->json([
            'success' => true,
            'name' => 'Oonjal Chai API',
            'version' => '1.0.0',
            'timezone' => 'Asia/Colombo',
            'server_time' => $now->format('Y-m-d H:i:s T'),
            'business_hours' => [
                'opens' => '16:00',
                'closes' => '01:00',
                'is_live' => $isLiveSession,
            ],
            'database' => [
                'connected' => $dbConnected,
                'name' => config('database.connections.mysql.database'),
            ],
        ]);
    }
}
