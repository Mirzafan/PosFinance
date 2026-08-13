<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevenueTarget extends Model
{
    protected $table = 'revenue_targets';

    protected $fillable = [
        'kategori_id',
        'bulan',
        'tahun',
        'target_nominal',
        'keterangan',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }
}
