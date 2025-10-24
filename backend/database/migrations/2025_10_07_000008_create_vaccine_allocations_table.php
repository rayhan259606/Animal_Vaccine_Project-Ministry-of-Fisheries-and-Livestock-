<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccine_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            $table->foreignId('farm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vaccine_id')->constrained()->onDelete('cascade');
            $table->foreignId('vaccine_batch_id')->nullable()->constrained('vaccine_batches')->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->foreignId('allocated_by')->constrained('users')->onDelete('cascade');
            $table->string('status')->default('allocated'); // allocated, issued, administered, cancelled
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccine_allocations');
    }
};
