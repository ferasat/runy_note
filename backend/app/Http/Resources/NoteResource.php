<?php

namespace App\Http\Resources;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Note */
class NoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $shouldReveal = filter_var($request->query('reveal'), FILTER_VALIDATE_BOOL);
        $content = $shouldReveal
            ? $this->resource->decryptedCredentialContent()
            : $this->resource->maskedCredentialContent();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'content' => $content,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
