<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vaccination extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'animal_id',
        'vaccine_id',
        'dose',
        'date_administered',
        'administered_by',
        'allocation_id',
        'cost',
    ];

    public function vaccine()
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function animal()
    {
        return $this->belongsTo(Animal::class);
    }

    public function officer()
    {
        return $this->belongsTo(User::class, 'administered_by');
    }
}
