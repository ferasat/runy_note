<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = $request->user()->tags()->orderBy('name')->get();

        return TagResource::collection($tags)->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $tag = Tag::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'name' => $data['name'],
            ],
            [
                'color' => $data['color'] ?? null,
            ]
        );

        if (! empty($data['color'])) {
            $tag->color = $data['color'];
            $tag->save();
        }

        return (new TagResource($tag))->response()->setStatusCode(201);
    }
}
