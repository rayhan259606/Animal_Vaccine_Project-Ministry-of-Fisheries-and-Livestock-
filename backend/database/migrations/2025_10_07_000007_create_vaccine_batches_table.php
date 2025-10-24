<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccine_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vaccine_id')->constrained()->onDelete('cascade');
            $table->string('batch_no');
            $table->date('expiry_date');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('cost_per_unit')->nullable();
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['vaccine_id','batch_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccine_batches');
    }
};
