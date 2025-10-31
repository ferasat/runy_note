<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function (): void {
    Route::post('/auth/eitaa-login', [AuthController::class, 'eitaaLogin']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);

    Route::middleware([\Illuminate\Auth\Middleware\Authenticate::class . ':sanctum'])->group(function (): void {
        Route::get('/notes', [NoteController::class, 'index']);
        Route::post('/notes', [NoteController::class, 'store']);
        Route::get('/notes/{note}', [NoteController::class, 'show'])->can('view', 'note');
        Route::put('/notes/{note}', [NoteController::class, 'update'])->can('update', 'note');
        Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->can('delete', 'note');

        Route::get('/tags', [TagController::class, 'index']);
        Route::post('/tags', [TagController::class, 'store']);
    });
});
