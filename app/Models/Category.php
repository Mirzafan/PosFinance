<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['nama_kategori'];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'kategori_id');
    }
}
