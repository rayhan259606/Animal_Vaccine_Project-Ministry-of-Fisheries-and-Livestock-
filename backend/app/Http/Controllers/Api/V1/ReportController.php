<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Farmer;
use App\Models\User;
use App\Models\Vaccination;
use App\Models\Disbursement;
use App\Models\VaccineBatch;

class ReportController extends Controller
{
    public function summary()
{
    try {
        $data = [
            'total_budget' => (int) \App\Models\Budget::sum('total_amount'),
            'total_procurement' => (int) \App\Models\VaccineBatch::sum(\DB::raw('quantity * cost_per_unit')),
            'total_disbursement' => (int) \App\Models\Disbursement::sum('amount'),
        ];

        $data['remaining'] = $data['total_budget'] - ($data['total_procurement'] + $data['total_disbursement']);

        return response()->json($data, 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error generating budget summary',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function allsummary()
    {
        return response()->json([
            'farmers' => Farmer::count(),
            'officers' => User::where('role', 'officer')->count(),
            'vaccinations' => Vaccination::count(),
            'disbursements_total' => Disbursement::sum('amount'),
            'stock_total_doses' => VaccineBatch::sum('quantity'),
        ]);
    }



public function financials(Request $request)
{
    $fiscalYear = $request->query('fiscal_year'); // যেমন: 2025-26
    $q = Disbursement::query();

    // Default null value set to avoid undefined variable
    $startDate = null;
    $endDate = null;

    if ($fiscalYear) {
        // "2025-26" কে split করা
        [$startYear, $endYear] = explode('-', $fiscalYear);

        // ধরলাম fiscal year শুরু হয় July 1 → শেষ হয় June 30
        $startDate = $startYear . '-07-01';
        $endDate   = $endYear . '-06-30';

        $q->whereBetween('paid_on', [$startDate, $endDate]);
    }

    return response()->json([
        'total_amount' => (int) $q->sum('amount'),
        'total_count'  => (int) $q->count(),

        'by_status' => Disbursement::selectRaw('status, COUNT(*) as count, SUM(amount) as total')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('paid_on', [$startDate, $endDate]);
            })
            ->groupBy('status')
            ->get(),

        'by_month' => Disbursement::selectRaw('MONTH(paid_on) as month, SUM(amount) as total, COUNT(*) as count')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('paid_on', [$startDate, $endDate]);
            })
            ->groupBy('month')
            ->orderBy('month')
            ->get(),
    ]);
}

}
