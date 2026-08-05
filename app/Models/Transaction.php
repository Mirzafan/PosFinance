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
        'nominal_ongkir',
        'nominal_asuransi',
        'keterangan',
        'status',
        'closed_at',
        'bukti_transaksi'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'nominal' => 'decimal:2',
        'nominal_ongkir' => 'decimal:2',
        'nominal_asuransi' => 'decimal:2',
        'closed_at' => 'datetime',
    ];

    protected $appends = [
        'bukti_transaksi_url',
        'net_revenue',
    ];

    public function getBuktiTransaksiUrlAttribute(): ?string
    {
        if (!$this->bukti_transaksi) {
            return null;
        }
        return \Illuminate\Support\Facades\Storage::url($this->bukti_transaksi);
    }

    public function getNetRevenueAttribute(): float
    {
        $ongkir = (float) ($this->nominal_ongkir > 0 ? $this->nominal_ongkir : $this->nominal);
        $asuransi = (float) ($this->nominal_asuransi ?? 0);
        return $ongkir - $asuransi;
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
