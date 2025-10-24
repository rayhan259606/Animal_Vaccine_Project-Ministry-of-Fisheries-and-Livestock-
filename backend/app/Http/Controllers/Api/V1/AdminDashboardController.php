<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Farmer;
use App\Models\User;
use App\Models\Farm;
use App\Models\Animal;
use App\Models\Vaccine;
use App\Models\VaccineAllocation;
use App\Models\Vaccination;
use App\Models\Budget;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        $data = [
            'total_farmers' => Farmer::count(),
            'total_officers' => User::where('role', 'officer')->count(),
            'total_farms' => Farm::count(),
            'total_animals' => Animal::count(),
            'total_vaccines' => Vaccine::count(),
            'total_allocations' => VaccineAllocation::count(),
            'total_vaccinations' => Vaccination::count(),
            'budgets' => Budget::withTrashed()->get()->map(function ($b) {
                $disbursed = $b->disbursements()->sum('amount');
                return [
                    'id' => $b->id,
                    'name' => $b->name,
                    'fiscal_year' => $b->fiscal_year,
                    'total_amount' => $b->total_amount,
                    'disbursed_amount' => $disbursed,
                    'remaining_amount' => $b->total_amount - $disbursed,
                ];
            }),
            'recent_activities' => [
                'New vaccine batch added successfully',
                'Officer Rahim allocated 50 doses to Demo Farm',
                'Farmer Karim submitted a vaccination request',
            ],
        ];

        return response()->json($data);


    }
}
