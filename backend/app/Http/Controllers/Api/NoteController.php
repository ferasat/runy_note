<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\HttpException;

class NoteController extends Controller
{
    private const SUPPORTED_TYPES = ['text', 'credential', 'todo'];

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Note::query()
            ->with('tags')
            ->ownedBy($user)
            ->latest();

        if ($type = $request->string('type')->trim()->value()) {
            $query->where('type', $type);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('content->text', 'like', "%{$search}%")
                    ->orWhere('content->task', 'like', "%{$search}%");
            });
        }

        $tagFilters = $this->normalizeTagFilter($request->input('tags'));
        if (! empty($tagFilters)) {
            foreach ($tagFilters as $tagName) {
                $query->whereHas('tags', fn (Builder $builder) => $builder->where('name', $tagName));
            }
        }

        $notes = $query->get();

        return NoteResource::collection($notes)->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(self::SUPPORTED_TYPES)],
            'content' => ['required', 'array'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $content = $this->validatedContent($data['type'], $data['content']);
        $content['type'] = $data['type'];

        $note = $request->user()->notes()->create([
            'title' => $data['title'],
            'type' => $data['type'],
            'content' => $content,
        ]);

        $this->syncTags($note, $request->user()->id, $data['tags'] ?? []);

        return (new NoteResource($note->load('tags')))->response()->setStatusCode(201);
    }

    public function show(Request $request, Note $note): JsonResponse
    {
        return (new NoteResource($note->load('tags')))->response();
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', Rule::in(self::SUPPORTED_TYPES)],
            'content' => ['sometimes', 'array'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $type = $data['type'] ?? $note->type;

        if (array_key_exists('content', $data)) {
            $content = $this->validatedContent($type, $data['content'], $note);
            $content['type'] = $type;
            $note->content = $content;
        }

        if (isset($data['title'])) {
            $note->title = $data['title'];
        }

        if (isset($data['type'])) {
            $note->type = $data['type'];
        }

        $note->save();

        if (isset($data['type']) && ! array_key_exists('content', $data)) {
            $content = $note->content;
            $content['type'] = $note->type;
            $note->content = $content;
            $note->save();
        }

        if (array_key_exists('tags', $data)) {
            $this->syncTags($note, $request->user()->id, $data['tags']);
        }

        return (new NoteResource($note->load('tags')))->response();
    }

    public function destroy(Note $note): JsonResponse
    {
        $note->delete();

        return response()->json(['status' => 'deleted']);
    }

    private function validatedContent(string $type, array $content, ?Note $note = null): array
    {
        return match ($type) {
            'text' => validator($content, [
                'text' => ['required', 'string'],
            ])->validate(),
            'credential' => $this->validateCredentialContent($content, $note),
            'todo' => validator($content, [
                'task' => ['required', 'string'],
                'done' => ['sometimes', 'boolean'],
            ])->validate(),
            default => throw new HttpException(422, 'Unsupported note type provided.'),
        };
    }

    private function validateCredentialContent(array $content, ?Note $note = null): array
    {
        $validated = validator($content, [
            'site' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:512'],
            'note' => ['nullable', 'string'],
        ])->validate();

        if ($note && (! array_key_exists('password', $validated) || $validated['password'] === null || $validated['password'] === '')) {
            $currentContent = $note->content;
            if (isset($currentContent['password'])) {
                $validated['password'] = $currentContent['password'];
            }
        }

        return $validated;
    }

    private function syncTags(Note $note, int $userId, array $tagNames): void
    {
        $tagNames = array_values(array_unique(array_filter(array_map('trim', $tagNames))));

        if (empty($tagNames)) {
            $note->tags()->detach();
            return;
        }

        $tagIds = [];
        foreach ($tagNames as $tagName) {
            $tag = Tag::firstOrCreate([
                'user_id' => $userId,
                'name' => $tagName,
            ]);
            $tagIds[] = $tag->id;
        }

        $note->tags()->sync($tagIds);
    }

    private function normalizeTagFilter(mixed $raw): array
    {
        if ($raw === null) {
            return [];
        }

        if (is_string($raw)) {
            $raw = explode(',', $raw);
        }

        if (! is_array($raw)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map('trim', $raw))));
    }
}
