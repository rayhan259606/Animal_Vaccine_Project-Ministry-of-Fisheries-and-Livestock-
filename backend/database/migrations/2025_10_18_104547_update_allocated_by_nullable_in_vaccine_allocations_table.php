<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vaccine_allocations', function (Blueprint $table) {
            // allocated_by nullable করা হচ্ছে
            $table->foreignId('allocated_by')
                  ->nullable()
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vaccine_allocations', function (Blueprint $table) {
            // rollback করলে আবার required করা হবে
            $table->foreignId('allocated_by')
                  ->nullable(false)
                  ->change();
        });
    }
};
