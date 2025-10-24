<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccines', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('manufacturer')->nullable();
            $table->string('unit')->default('dose');
            $table->decimal('dose_ml', 8, 2)->nullable();
            $table->unsignedInteger('cost_per_unit')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccines');
    }
};
