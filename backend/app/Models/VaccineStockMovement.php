<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VaccineStockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'vaccine_id', 'vaccine_batch_id', 'type', 'quantity', 'reason',
        'related_allocation_id', 'performed_by'
    ];

    public function batch()
    {
        return $this->belongsTo(VaccineBatch::class, 'vaccine_batch_id');
    }

    public function vaccine()
    {
        return $this->belongsTo(Vaccine::class);
    }
}
