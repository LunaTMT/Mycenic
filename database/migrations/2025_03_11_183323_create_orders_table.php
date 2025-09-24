<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();

            // Shipping & tracking
            $table->string('shipping_status')->default('PRE-TRANSIT');
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->json('tracking_history')->nullable();

            $table->text('orderNote')->nullable();
            $table->text('label_url')->nullable();
            $table->string('shipment_id')->nullable();

            // Order lifecycle & legal
            $table->boolean('legal_agreement')->default(false);
            $table->boolean('is_completed')->default(false);
            $table->boolean('returnable')->default(true);
            $table->string('return_status')->default('UNKNOWN');
            $table->string('payment_status')->default('PENDING');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
