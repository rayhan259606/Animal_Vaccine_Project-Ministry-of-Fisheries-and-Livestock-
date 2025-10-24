<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Disbursement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'budget_id',
        'farmer_id',
        'farm_id',
        'amount',
        'purpose',
        'paid_on',
        'disbursed_by',
        'status',
        'reference_no',
    ];

    protected $casts = [
        'paid_on' => 'date',
    ];

    // 🔹 বাজেটের সাথে সম্পর্ক (withTrashed ব্যবহার)
    public function budget()
    {
        return $this->belongsTo(Budget::class, 'budget_id')->withTrashed();
    }

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    // ✅ যিনি disburse করেছেন (Officer/Admin)
    public function disbursedByUser()
    {
        return $this->belongsTo(User::class, 'disbursed_by');
    }

}
