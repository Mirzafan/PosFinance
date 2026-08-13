<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyClosing extends Model
{
    protected $table = 'daily_closings';

    protected $fillable = [
        'tanggal',
        'total_pemasukan',
        'total_pengeluaran',
        'saldo_akhir',
        'total_transaksi',
        'user_id',
        'status_lock',
        'catatan',
        'closed_at',
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
        'status_lock' => 'boolean',
        'closed_at' => 'datetime',
        'total_pemasukan' => 'float',
        'total_pengeluaran' => 'float',
        'saldo_akhir' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
