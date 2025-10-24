<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VaccineBatch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vaccine_id',
        'batch_no',
        'expiry_date',
        'quantity',
        'cost_per_unit',
        'added_by',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($batch) {
            if (empty($batch->batch_no)) {
                $today = now()->format('Ymd');
                $count = self::whereDate('created_at', now()->toDateString())->count() + 1;
                $batch->batch_no = 'BATCH-' . $today . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    public function vaccine()
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function movements()
    {
        return $this->hasMany(VaccineStockMovement::class);
    }
}
