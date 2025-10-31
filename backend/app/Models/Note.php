<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Crypt;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'type',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    protected function content(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => is_array($value) ? $value : json_decode($value ?? '[]', true) ?? [],
            set: function ($value) {
                $content = is_array($value) ? $value : json_decode((string) $value, true) ?? [];

                $resolvedType = $content['type'] ?? $this->type;

                if ($resolvedType === 'credential' && array_key_exists('password', $content)) {
                    $password = $content['password'];

                    if ($password === null || $password === '') {
                        unset($content['password']);
                    } else {
                        try {
                            Crypt::decryptString($password);
                            $content['password'] = $password;
                        } catch (\Throwable $exception) {
                            $content['password'] = Crypt::encryptString($password);
                        }
                    }
                }

                $content['type'] = $resolvedType ?? 'text';

                return $content;
            }
        );
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->getKey());
    }

    public function decryptedCredentialContent(): array
    {
        $content = $this->content ?? [];

        if (($content['type'] ?? $this->type) === 'credential' && ! empty($content['password'])) {
            try {
                $content['password'] = Crypt::decryptString($content['password']);
            } catch (\Throwable $exception) {
                $content['password'] = null;
            }
            $content['password_available'] = $content['password'] !== null;
        }

        return $content;
    }

    public function maskedCredentialContent(): array
    {
        $content = $this->content ?? [];

        if (($content['type'] ?? $this->type) === 'credential') {
            $content['password_available'] = array_key_exists('password', $content);

            if (! empty($content['password'])) {
                $content['password'] = '••••••••';
            }
        }

        return $content;
    }
}
