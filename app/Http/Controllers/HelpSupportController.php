<?php

namespace App\Http\Controllers;

use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HelpSupportController extends Controller
{
    /**
     * Display the Help & Support page with database messages.
     */
    public function index()
    {
        $messages = SupportMessage::with('user:id,name,role')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                $roleLabel = $msg->user->role === 'admin' ? 'Admin Keuangan' : 'Staff Keuangan';
                return [
                    'id' => $msg->id,
                    'user_id' => $msg->user_id,
                    'senderRole' => $msg->user->role,
                    'senderName' => "{$roleLabel} ({$msg->user->name})",
                    'text' => $msg->message,
                    'time' => $msg->created_at->setTimezone('Asia/Jakarta')->format('H:i'),
                    'created_at' => $msg->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('HelpSupport/Index', [
            'dbMessages' => $messages,
        ]);
    }

    /**
     * Store a new support message in database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        SupportMessage::create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
        ]);

        return back();
    }
}
