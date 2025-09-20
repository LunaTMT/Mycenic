<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVotesTable extends Migration
{
    public function up()
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();

            // Nullable user_id for logged-in users or null for guests
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

            // Nullable guest token for guests without user accounts
            $table->string('guest_token')->nullable();

            // Polymorphic relation fields
            $table->morphs('votable'); // creates votable_id (unsignedBigInteger) + votable_type (string)

            // Vote value: either 'like' or 'dislike'
            $table->enum('vote', ['like', 'dislike']);

            $table->timestamps();

            // Unique constraints:
            // one vote per user per votable item
            $table->unique(['user_id', 'votable_type', 'votable_id']);

            // one vote per guest token per votable item
            $table->unique(['guest_token', 'votable_type', 'votable_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('votes');
    }
}
