<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewVotesTable extends Migration
{
    public function up()
    {
        Schema::create('review_votes', function (Blueprint $table) {
            $table->id();

            // Nullable user_id for logged-in users or null for guests
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

            // Nullable guest token for guests without user accounts
            $table->string('guest_token')->nullable();

            // Review the vote is associated with
            $table->foreignId('review_id')->constrained()->onDelete('cascade');

            // Vote value: either 'like' or 'dislike'
            $table->enum('vote', ['like', 'dislike']);

            $table->timestamps();

            // Only one vote per user per review
            $table->unique(['user_id', 'review_id']);

            // Only one vote per guest token per review
            $table->unique(['guest_token', 'review_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('review_votes');
    }
}
