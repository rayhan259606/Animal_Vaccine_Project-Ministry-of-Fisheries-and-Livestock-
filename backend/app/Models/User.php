<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory, SoftDeletes;

   protected $fillable = [
    'name',
    'email',
    'password',
    'phone',
    'nid',
    'address_line',
    'division',
    'district',
    'upazila',
    'union',
    'village',
    'image',
    'role',
];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function farmerProfile()
    {
        return $this->hasOne(Farmer::class);
    }

    public function officerFarms()
    {
        return $this->belongsToMany(Farm::class, 'farm_officer')->withTimestamps();
    }
}
