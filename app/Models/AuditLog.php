<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'action',
        'module',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper static method to record an audit log entry.
    public static function record(
        string $action,
        string $module,
        string $description,
        ?User $user = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        $currentUser = $user ?? Auth::user();

        return static::create([
            'user_id' => $currentUser ? $currentUser->id : null,
            'user_name' => $currentUser ? $currentUser->name : 'System',
            'user_role' => $currentUser ? $currentUser->role : 'system',
            'action' => strtoupper($action),
            'module' => $module,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
