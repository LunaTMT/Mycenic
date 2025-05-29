<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->json('cart')->nullable();

            $table->decimal('total', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('delivery_price', 10, 2)->default(0);
            $table->decimal('weight', 8, 2)->default(0); 
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('shipping_cost', 8, 2)->default(0);

            $table->string('payment_status')->default('Pending');
            $table->string('customer_name')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('shipping_status')->default('UNKNOWN');
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->json('tracking_history')->nullable();
            
            $table->text('label_url')->nullable();
             $table->string('shipment_id')->nullable();

            $table->boolean('legal_agreement')->nullable()->default(false);
            $table->boolean('is_completed')->nullable()->default(false);
            $table->boolean('returnable')->default(true);



            $table->timestamp('return_finished_at')->nullable();
            $table->string('return_shipping_option')->nullable();
            $table->text('return_shipping_label_url')->nullable();
            $table->string('return_tracking_number')->nullable();
            $table->string('return_tracking_url')->nullable();
            $table->json('return_tracking_history')->nullable();
            $table->string('return_status')->default('UNKNOWN');


            $table->json('return_items')->nullable();


        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
