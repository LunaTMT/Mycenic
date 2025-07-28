<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewsTable extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('content')->nullable();
            $table->decimal('rating', 2, 1)->default(0);
            $table->integer('likes')->default(0);
            $table->integer('dislikes')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('reviews')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}
