<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'fiscal_year',
        'total_amount',
        'notes',
        'created_by',
    ];

    public function disbursements()
    {
        return $this->hasMany(Disbursement::class);
    }

}
