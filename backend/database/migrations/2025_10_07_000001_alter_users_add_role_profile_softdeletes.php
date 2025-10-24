<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['farmer','officer','admin'])->default('farmer')->index();
            }
            if (!Schema::hasColumn('users', 'phone')) $table->string('phone')->nullable();
            if (!Schema::hasColumn('users', 'nid')) $table->string('nid', 50)->nullable();
            if (!Schema::hasColumn('users', 'address_line')) $table->string('address_line')->nullable();
            if (!Schema::hasColumn('users', 'division')) $table->string('division')->nullable();
            if (!Schema::hasColumn('users', 'district')) $table->string('district')->nullable();
            if (!Schema::hasColumn('users', 'upazila')) $table->string('upazila')->nullable();
            if (!Schema::hasColumn('users', 'union')) $table->string('union')->nullable();
            if (!Schema::hasColumn('users', 'village')) $table->string('village')->nullable();
            if (!Schema::hasColumn('users', 'deleted_at')) $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Down মেথডে conditional drop নিরাপদ
            if (Schema::hasColumn('users','role')) $table->dropColumn('role');
            foreach (['phone','nid','address_line','division','district','upazila','union','village','deleted_at'] as $col) {
                if (Schema::hasColumn('users',$col)) $table->dropColumn($col);
            }
        });
    }
};
