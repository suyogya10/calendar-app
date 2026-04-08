<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('holidays', function (Blueprint $table) {
            // 'FULL' = all-day red holiday, 'HALF' = half-day green holiday
            $table->enum('type', ['FULL', 'HALF'])->default('FULL')->after('date');
        });
    }

    public function down(): void
    {
        Schema::table('holidays', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
