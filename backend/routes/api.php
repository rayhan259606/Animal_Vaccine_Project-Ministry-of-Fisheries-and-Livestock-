<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FarmerController;
use App\Http\Controllers\Api\V1\OfficerController;
use App\Http\Controllers\Api\V1\FarmController;
use App\Http\Controllers\Api\V1\AnimalController;
use App\Http\Controllers\Api\V1\VaccineController;
use App\Http\Controllers\Api\V1\StockController;
use App\Http\Controllers\Api\V1\VaccineAllocationController;
use App\Http\Controllers\Api\V1\VaccinationController;
use App\Http\Controllers\Api\V1\BudgetController;
use App\Http\Controllers\Api\V1\DisbursementController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\UserController;

Route::prefix('v1')->group(function () {

    // 🔐 Authentication
    Route::post('/auth/register-farmer', [AuthController::class, 'registerFarmer']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::delete('/auth/me', [AuthController::class, 'deleteMe']); // farmer self delete

        // 🧑‍💼 Admin Only
        Route::middleware(['role:admin'])->group(function () {
            Route::post('/officers', [OfficerController::class, 'store']);
            Route::put('/officers/{officer}', [OfficerController::class, 'update']); // ✅ ADD THIS LINE
            Route::delete('/officers/{officer}', [OfficerController::class, 'destroy']);
            Route::post('/budgets', [BudgetController::class, 'store']);
            Route::put('/budgets/{budget}', [BudgetController::class, 'update']);
            Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy']);
            Route::put('/admin/profile/update', [AuthController::class, 'updateAdminProfile']);
            Route::get('/admin/dashboardstats', [AdminDashboardController::class, 'stats']);
            Route::get('/users', [UserController::class, 'index']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);
            Route::put('/users/{id}/restore', [UserController::class, 'restore']);

            // 🌾 Farmer Approval Routes
// 🌾 Farmer Approval Routes
Route::get('/farmers/pending', [FarmerController::class, 'pending']);
Route::get('/farmers/pending/count', [FarmerController::class, 'pendingCount']);
Route::put('/farmers/{id}/approve', [FarmerController::class, 'approve']);
        });

        // 👩‍💼 Admin + Officer
        Route::middleware(['role:admin,officer'])->group(function () {
            Route::get('/officers', [OfficerController::class, 'index']);
            Route::post('/farms/{farm}/assign-officer', [OfficerController::class, 'assignFarm']);
            Route::post('/farms/{farm}/remove-officer', [OfficerController::class, 'removeFromFarm']);

            Route::get('/farmers', [FarmerController::class, 'index']);
            Route::post('/farmers', [FarmerController::class, 'store']);
            Route::get('/farmers/{farmer}', [FarmerController::class, 'show']);
            Route::put('/farmers/{farmer}', [FarmerController::class, 'update']);
            Route::delete('/farmers/{farmer}', [FarmerController::class, 'destroy']);

            Route::put('/farms/{id}/restore', [FarmController::class, 'restore']);
            Route::get('/farms/{id}/vaccination-summary', [FarmController::class, 'vaccinationSummary']);

            //vacinessss

            Route::get('/vaccines', [VaccineController::class, 'index']);
            Route::post('/vaccines', [VaccineController::class, 'store']);
            Route::get('/vaccines/{vaccine}', [VaccineController::class, 'show']);
            Route::put('/vaccines/{vaccine}', [VaccineController::class, 'update']);
            Route::delete('/vaccines/{vaccine}', [VaccineController::class, 'destroy']);
            Route::put('/vaccines/{id}/restore', [VaccineController::class, 'restore']);


            Route::post('/vaccines', [VaccineController::class, 'store']);
            Route::put('/vaccines/{vaccine}', [VaccineController::class, 'update']);
            Route::delete('/vaccines/{vaccine}', [VaccineController::class, 'destroy']);

            Route::post('/stock/batches', [StockController::class, 'storeBatch']);
            Route::put('/stock/batches/{batch}', [StockController::class, 'updateBatch']);
            Route::delete('/stock/batches/{batch}', [StockController::class, 'destroyBatch']);

            // ✅ Officers/Admin can update allocation status
            Route::put('/allocations/{allocation}/status', [VaccineAllocationController::class, 'updateStatus']);

            Route::post('/disbursements', [DisbursementController::class, 'store']);
            Route::put('/disbursements/{disbursement}', [DisbursementController::class, 'update']);
            Route::delete('/disbursements/{disbursement}', [DisbursementController::class, 'destroy']);
        });

        // 👨‍🌾 Farmer profile update
        Route::put('/farmer/profile/update', [FarmerController::class, 'updateProfile']);

        // 🌾 Common Routes (Farmer + Officer + Admin)
        Route::get('/farms', [FarmController::class, 'index']);
        Route::post('/farms', [FarmController::class, 'store']);
        Route::get('/farms/{farm}', [FarmController::class, 'show']);
        Route::put('/farms/{farm}', [FarmController::class, 'update']);
        Route::delete('/farms/{farm}', [FarmController::class, 'destroy']);

        Route::get('/animals', [AnimalController::class, 'index']);
        Route::post('/animals', [AnimalController::class, 'store']);
        Route::get('/animals/{animal}', [AnimalController::class, 'show']);
        Route::put('/animals/{animal}', [AnimalController::class, 'update']);
        Route::delete('/animals/{animal}', [AnimalController::class, 'destroy']);

        Route::get('/vaccines', [VaccineController::class, 'index']);
        Route::get('/vaccines/{vaccine}', [VaccineController::class, 'show']);
        Route::get('/vaccines/{vaccine}/batches', [StockController::class, 'batches']);
        Route::get('/vaccines/{vaccine}/movements', [StockController::class, 'movements']);

        // ✅ FIXED: accessible to farmers also (request vaccine)
        Route::get('/allocations', [VaccineAllocationController::class, 'index']);
        Route::post('/allocations', [VaccineAllocationController::class, 'store']);
        Route::delete('/allocations/{allocation}', [VaccineAllocationController::class, 'destroy']);

        Route::get('/vaccinations', [VaccinationController::class, 'index']);
        Route::post('/vaccinations', [VaccinationController::class, 'store']);
        Route::get('/vaccinations/{vaccination}', [VaccinationController::class, 'show']);
        Route::put('/vaccinations/{vaccination}', [VaccinationController::class, 'update']);
        Route::delete('/vaccinations/{vaccination}', [VaccinationController::class, 'destroy']);

        Route::get('/budgets', [BudgetController::class, 'index']);
        Route::get('/disbursements', [DisbursementController::class, 'index']);

        Route::get('/reports/summary', [ReportController::class, 'summary']);
        Route::get('/reports/financials', [ReportController::class, 'financials']);
    });
});
