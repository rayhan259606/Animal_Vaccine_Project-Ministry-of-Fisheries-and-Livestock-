<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccine_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vaccine_id')->constrained()->onDelete('cascade');
            $table->foreignId('vaccine_batch_id')->constrained('vaccine_batches')->onDelete('cascade');
            $table->string('type'); // in, out, adjust
            $table->integer('quantity');
            $table->string('reason')->nullable();
            $table->foreignId('related_allocation_id')->nullable()->constrained('vaccine_allocations')->nullOnDelete();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccine_stock_movements');
    }
};
