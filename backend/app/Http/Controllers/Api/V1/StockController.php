<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\VaccineBatchStoreRequest;
use Illuminate\Http\Request;
use App\Models\Vaccine;
use App\Models\VaccineBatch;
use App\Models\VaccineStockMovement;

class StockController extends Controller
{
    public function batches(Vaccine $vaccine)
    {
        return response()->json(
            $vaccine->batches()->latest()->paginate(20)
        );
    }

    public function storeBatch(VaccineBatchStoreRequest $request)
    {
        $data = $request->validated();
        $data['added_by'] = $request->user()->id;
        $batch = VaccineBatch::create($data);

        VaccineStockMovement::create([
            'vaccine_id' => $batch->vaccine_id,
            'vaccine_batch_id' => $batch->id,
            'type' => 'in',
            'quantity' => $batch->quantity,
            'reason' => 'initial',
            'performed_by' => $request->user()->id,
        ]);

        return response()->json($batch, 201);
    }

    public function updateBatch(Request $request, VaccineBatch $batch)
    {
        $request->validate([
            'expiry_date' => 'nullable|date',
            'quantity' => 'nullable|integer|min:0',
            'cost_per_unit' => 'nullable|integer|min:0',
        ]);

        // If quantity changes, log movement (adjust)
        if ($request->has('quantity')) {
            $diff = (int)$request->quantity - (int)$batch->quantity;
            if ($diff != 0) {
                VaccineStockMovement::create([
                    'vaccine_id' => $batch->vaccine_id,
                    'vaccine_batch_id' => $batch->id,
                    'type' => 'adjust',
                    'quantity' => $diff,
                    'reason' => 'manual_adjust',
                    'performed_by' => $request->user()->id,
                ]);
            }
        }
        $batch->update($request->all());
        return response()->json($batch);
    }

    public function destroyBatch(VaccineBatch $batch)
    {
        $batch->delete();
        return response()->json(['msg' => 'Batch deleted',"data"=> $batch]);
    }

    public function movements(Vaccine $vaccine)
    {
        return response()->json(
            VaccineStockMovement::where('vaccine_id', $vaccine->id)->latest()->paginate(20)
        );
    }
}
