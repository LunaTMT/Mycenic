<?php

namespace App\Services;

use OpenAI;

class OpenAIModerationService
{
    protected $client;

    public function __construct()
    {
        $this->client = OpenAI::client(env('OPENAI_API_KEY'));
    }

    public function moderateText(string $text): array
    {
        $response = $this->client->moderations()->create([
            'model' => 'omni-moderation-latest',
            'input' => $text,
        ]);

        return $response->results[0]->toArray();
    }
}
