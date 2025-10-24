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
            ->when($fiscalYear, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('paid_on', [$startDate, $endDate]);
            })
            ->groupBy('status')
            ->get(),

        'by_month' => Disbursement::selectRaw('MONTH(paid_on) as month, SUM(amount) as total, COUNT(*) as count')
            ->when($fiscalYear, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('paid_on', [$startDate, $endDate]);
            })
            ->groupBy('month')
            ->orderBy('month')
            ->get(),
    ]);
}


}
