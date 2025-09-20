<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                    ->nullable() // allow guests
                    ->constrained()
                    ->onDelete('cascade');


            $table->json('cart')->nullable();
            $table->json('returnable_cart')->nullable();

            $table->decimal('total', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('weight', 8, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('shipping_cost', 8, 2)->default(0);

            $table->string('payment_status')->default('PENDING');

            $table->json('shipping_details')->nullable();

            $table->string('shipping_status')->default('PRE-TRANSIT');
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->json('tracking_history')->nullable();

            $table->text('label_url')->nullable();
            $table->string('shipment_id')->nullable();

            $table->boolean('legal_agreement')->default(false);
            $table->boolean('is_completed')->default(false);
            $table->boolean('returnable')->default(true);

            $table->string('return_status')->default('UNKNOWN');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};
