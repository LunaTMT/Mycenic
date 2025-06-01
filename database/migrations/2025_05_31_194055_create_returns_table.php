<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->string('status')->default('PENDING'); // general return status

            $table->json('items')->nullable();
            $table->boolean('approved')->default(false);

            // Shipping related fields
            $table->string('shipping_option')->nullable();
            $table->string('shipping_status')->nullable()->default('PRE-TRANSIT');
            $table->text('shipping_label_url')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->json('tracking_history')->nullable();

            // Payment related field
            $table->string('payment_status')->nullable()->default('PRE-RETURN');

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
