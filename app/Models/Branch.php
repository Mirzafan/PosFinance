<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = ['nama_cabang'];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'cabang_id');
    }
}
