<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Farmer;
use App\Models\Farm;
use App\Models\Animal;
use App\Models\Vaccine;
use App\Models\VaccineBatch;
use App\Models\VaccineAllocation;
use App\Models\Vaccination;
use App\Models\Budget;
use App\Models\Disbursement;

class LivestockDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure Admin exists (call AdminUserSeeder)
        $this->call(AdminUserSeeder::class);

        // Officers
        $officers = [];
        foreach ([1,2,3] as $i) {
            $officers[$i] = User::firstOrCreate(
                ['email' => "officer{$i}@example.com"],
                [
                    'name' => "Officer {$i}",
                    'password' => Hash::make('password'),
                    'role' => 'officer',
                    'phone' => "0170000000{$i}",
                ]
            );
        }

        // Farmers + Users
        $farmers = [];
        for ($i=1; $i<=5; $i++) {
            $user = User::firstOrCreate(
                ['email' => "farmer{$i}@example.com"],
                [
                    'name' => "Farmer {$i}",
                    'password' => Hash::make('password'),
                    'role' => 'farmer',
                    'phone' => "0180000000{$i}",
                ]
            );
            $farmers[$i] = Farmer::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'registration_no' => "F-1000{$i}",
                    'household_size' => rand(3,8),
                    'status' => 'active',
                    'is_approved' => true,
                ]
            );
        }

        // Farms
        $farms = [];
        $divisions = ['Dhaka','Chattogram','Rajshahi','Khulna','Barishal','Sylhet','Rangpur','Mymensingh'];
        foreach ($farmers as $i => $farmer) {
            $farms[$i] = Farm::create([
                'farmer_id' => $farmer->id,
                'name' => "Farm {$i}",
                'registration_no' => sprintf('FARM-%04d', $i),
                'division' => $divisions[array_rand($divisions)],
                'district' => 'Demo',
                'upazila' => 'DemoUpazila',
                'status' => 'active',
            ]);
            // Assign an officer
            $officer = $officers[($i % 3) + 1];
            $farms[$i]->officers()->syncWithoutDetaching([$officer->id]);
        }

        // Animals
        $speciesArr = ['cattle','goat','sheep'];
        $animals = [];
        foreach ($farms as $i => $farm) {
            for ($j=1; $j<=3; $j++) {
                $animals[] = Animal::create([
                    'farm_id' => $farm->id,
                    'tag' => "TAG-{$i}-{$j}-".Str::upper(Str::random(4)),
                    'species' => $speciesArr[array_rand($speciesArr)],
                    'sex' => (rand(0,1) ? 'male' : 'female'),
                    'status' => 'active',
                ]);
            }
        }

        // Vaccines
        $vFMD = Vaccine::firstOrCreate(['name' => 'FMD'], ['unit' => 'dose', 'cost_per_unit' => 50]);
        $vPPR = Vaccine::firstOrCreate(['name' => 'PPR'], ['unit' => 'dose', 'cost_per_unit' => 40]);
        $vANT = Vaccine::firstOrCreate(['name' => 'Anthrax'], ['unit' => 'dose', 'cost_per_unit' => 30]);

        // Batches
        $b1 = VaccineBatch::create([
            'vaccine_id' => $vFMD->id, 'batch_no' => 'FMD-2025-01',
            'expiry_date' => Carbon::now()->addYear()->toDateString(), 'quantity' => 1500,
            'cost_per_unit' => 50
        ]);
        $b2 = VaccineBatch::create([
            'vaccine_id' => $vPPR->id, 'batch_no' => 'PPR-2025-01',
            'expiry_date' => Carbon::now()->addMonths(18)->toDateString(), 'quantity' => 1200,
            'cost_per_unit' => 40
        ]);

        // Allocations (with stock reservation & movement handled by controller in runtime,
        // but here we directly adjust quantities to mimic real-world)
        $allocations = [];
        foreach ($farmers as $i => $farmer) {
            $farm = $farms[$i];
            $qty = 50;
            // Reduce stock manually (seeder context)
            $b1->update(['quantity' => max(0, $b1->quantity - $qty)]);
            $allocations[] = VaccineAllocation::create([
                'farmer_id' => $farmer->id,
                'farm_id' => $farm->id,
                'vaccine_id' => $vFMD->id,
                'vaccine_batch_id' => $b1->id,
                'quantity' => $qty,
                'allocated_by' => $officers[1]->id,
                'status' => 'allocated',
            ]);
        }

        // Vaccinations (some animals)
        $adminOrOfficer = $officers[1];
        foreach (array_slice($animals, 0, 6) as $idx => $animal) {
            Vaccination::create([
                'animal_id' => $animal->id,
                'vaccine_id' => $vFMD->id,
                'dose' => 2,
                'date_administered' => Carbon::now()->subDays(rand(1,10)),
                'administered_by' => $adminOrOfficer->id,
                'allocation_id' => $allocations[$idx % count($allocations)]->id,
                'cost' => 100,
            ]);
        }

        // Budget & Disbursements
        $budget = Budget::firstOrCreate(['fiscal_year' => '2025-26'], [
            'total_amount' => 5000000,
            'created_by' => $officers[1]->id
        ]);
        foreach ($farmers as $i => $farmer) {
            Disbursement::create([
                'budget_id' => $budget->id,
                'farmer_id' => $farmer->id,
                'farm_id' => $farms[$i]->id,
                'amount' => 2000 + ($i * 500),
                'purpose' => 'Vaccination Support',
                'paid_on' => Carbon::now()->subDays(5)->toDateString(),
                'status' => 'paid',
                'reference_no' => 'REF-'.str_pad((string)$i, 4, '0', STR_PAD_LEFT),
                'disbursed_by' => $officers[2]->id,
            ]);
        }
    }
}
