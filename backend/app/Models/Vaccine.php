<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vaccine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'manufacturer',
        'unit',
        'dose_ml',
        'cost_per_unit',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function batches()
    {
        return $this->hasMany(VaccineBatch::class);
    }

    // ✅ Auto calculate total stock when loaded
    protected $appends = ['total_stock', 'expired_batches', 'expiring_soon'];

    public function getTotalStockAttribute()
    {
        return $this->batches()->sum('quantity');
    }

    public function getExpiredBatchesAttribute()
    {
        return $this->batches()->where('expiry_date', '<', now())->count();
    }

    public function getExpiringSoonAttribute()
    {
        return $this->batches()
            ->whereBetween('expiry_date', [now(), now()->addDays(30)])
            ->count();
    }
}
