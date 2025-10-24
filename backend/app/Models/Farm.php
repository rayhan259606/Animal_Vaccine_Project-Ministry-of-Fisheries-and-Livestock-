<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Farm extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farmer_id',
        'registration_no',
        'name',
        'address_line',
        'division',
        'district',
        'upazila',
        'union',
        'village',
        'latitude',
        'longitude',
        'status',
    ];

    protected static function booted()
    {
        static::creating(function ($farm) {
            if (empty($farm->registration_no)) {
                $today = now()->format('Ymd');
                $count = self::whereDate('created_at', now()->toDateString())->count() + 1;
                $farm->registration_no = 'FARM-' . $today . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function animals()
    {
        return $this->hasMany(Animal::class);
    }

    public function officers()
    {
        return $this->belongsToMany(User::class, 'farm_officer')->withTimestamps();
    }

    // 🧩 Vaccination relation (via animals)
    public function vaccinations()
    {
        return $this->hasManyThrough(Vaccination::class, Animal::class);
    }
}
