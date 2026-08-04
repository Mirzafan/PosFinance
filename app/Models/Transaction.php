<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'nomor_transaksi',
        'tanggal',
        'jenis_transaksi',
        'kategori_id',
        'cabang_id',
        'user_id',
        'nominal',
        'keterangan',
        'status',
        'bukti_transaksi'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'nominal' => 'decimal:2',
    ];

    protected $appends = [
        'bukti_transaksi_url',
    ];

    public function getBuktiTransaksiUrlAttribute(): ?string
    {
        if (!$this->bukti_transaksi) {
            return null;
        }
        return \Illuminate\Support\Facades\Storage::url($this->bukti_transaksi);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'cabang_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
