<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Animal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farm_id', 'tag', 'species', 'breed', 'sex', 'dob', 'status'
    ];

    protected $casts = [];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    public function vaccinations()
    {
        return $this->hasMany(Vaccination::class);
    }
}
