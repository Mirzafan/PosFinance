<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\AuditLog;
use App\Models\User;

$firstAdmin = User::where('role', 'admin')->first() ?? User::first();

$updatedCount = 0;
AuditLog::all()->each(function ($log) use ($firstAdmin, &$updatedCount) {
    if ($log->user_id && $log->user) {
        $log->update([
            'user_name' => $log->user->name,
            'user_role' => $log->user->role,
        ]);
        $updatedCount++;
    } elseif ($firstAdmin) {
        $log->update([
            'user_id' => $firstAdmin->id,
            'user_name' => $firstAdmin->name,
            'user_role' => $firstAdmin->role,
        ]);
        $updatedCount++;
    }
});

echo "Successfully updated {$updatedCount} audit log records!\n";
