<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use JsonException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthController extends Controller
{
    public function eitaaLogin(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'hash' => ['required', 'string'],
            'user' => ['required', 'string'],
        ]);

        $verifyToken = config('services.eitaa.app_token');
        if (empty($verifyToken)) {
            throw new HttpException(500, 'Eitaa app token is not configured.');
        }

        $verifyEndpoint = config('services.eitaa.verify_endpoint');

        try {
            $verificationResponse = Http::timeout(5)
                ->retry(1, 100)
                ->post($verifyEndpoint, [
                    'token' => $verifyToken,
                    'hash' => $payload['hash'],
                    'ip' => $request->ip(),
                ]);
        } catch (\Throwable $exception) {
            throw new HttpException(503, 'Unable to reach Eitaa verification service. Please try again shortly.');
        }

        if ($verificationResponse->status() === 429) {
            throw new HttpException(429, 'Too many login attempts. Please wait a few seconds and try again.');
        }

        if (! $verificationResponse->ok() || ! $verificationResponse->json('ok')) {
            throw new HttpException(403, 'Invalid or expired Eitaa login data.');
        }

        try {
            $userData = json_decode($payload['user'], true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new HttpException(422, 'Invalid user payload received from Eitaa.');
        }

        if (empty($userData['id'])) {
            throw new HttpException(422, 'Eitaa user identifier is missing.');
        }

        $userAttributes = [
            'name' => trim(($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? '')) ?: 'Eitaa User',
            'username' => $userData['username'] ?? (string) $userData['id'],
            'email' => $userData['email'] ?? null,
            'password' => null,
        ];

        $user = User::updateOrCreate(
            ['eitaa_id' => (string) $userData['id']],
            $userAttributes
        );

        $token = $user->createToken('eitaa-miniapp')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'username' => ['nullable', 'string', 'max:255', 'unique:users,username'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'username' => $data['username'] ?? null,
            'password' => Hash::make($data['password']),
        ]);

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required_without:username', 'nullable', 'email'],
            'username' => ['required_without:email', 'nullable', 'string'],
            'password' => ['required', 'string'],
        ]);

        $userQuery = User::query();
        if (! empty($data['email'])) {
            $userQuery->where('email', $data['email']);
        } elseif (! empty($data['username'])) {
            $userQuery->where('username', $data['username']);
        }

        $user = $userQuery->first();

        if (! $user || ! $user->password || ! Hash::check($data['password'], $user->password)) {
            throw new HttpException(422, 'The provided credentials are incorrect.');
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }
}
