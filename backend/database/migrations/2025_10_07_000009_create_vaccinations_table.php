<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->onDelete('cascade');
            $table->foreignId('vaccine_id')->constrained()->onDelete('cascade');
            $table->decimal('dose', 8, 2);
            $table->dateTime('date_administered');
            $table->foreignId('administered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('allocation_id')->nullable()->constrained('vaccine_allocations')->nullOnDelete();
            $table->unsignedInteger('cost')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccinations');
    }
};
