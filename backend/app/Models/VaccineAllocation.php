<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VaccineAllocation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farmer_id',
        'farm_id',
        'animal_id',
        'vaccine_id',
        'vaccine_batch_id',
        'quantity',
        'allocated_by',
        'status',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    // 🔹 Relationships
    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    public function vaccine()
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function batch()
    {
        return $this->belongsTo(VaccineBatch::class, 'vaccine_batch_id');
    }

    public function animal()
    {
        return $this->belongsTo(Animal::class);
    }

    public function allocatedBy()
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }

}
