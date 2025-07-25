<?php

namespace App\Services;

use OpenAI;
use Illuminate\Support\Facades\Log;

class OpenAIModerationService
{
    protected $client;

    public function __construct()
    {
        $apiKey = env('OPENAI_API_KEY');
        Log::info('OpenAI API key preview', ['key_last4' => substr($apiKey, -4)]);
        $this->client = OpenAI::client($apiKey);
    }

    public function moderateText(string $text): array
    {
        $maxRetries = 3;
        $attempt = 0;

        Log::info('Starting moderation request', ['input_preview' => substr($text, 0, 50)]);

        do {
            try {
                $response = $this->client->moderations()->create([
                    'model' => 'omni-moderation-latest',
                    'input' => $text,
                ]);
                
                Log::info('Moderation request successful', [
                    'flagged' => $response->results[0]->flagged ?? null,
                    'categories' => $response->results[0]->categories ?? null,
                    'category_scores' => $response->results[0]->category_scores ?? null,
                ]);

                return $response->results[0]->toArray();
            } catch (\Exception $e) {
                $attempt++;
                $message = $e->getMessage();

                // Check for rate limiting by message content (fallback)
                if (stripos($message, 'Too Many Requests') !== false) {
                    Log::error('Moderation service rate limit hit', [
                        'attempt' => $attempt,
                        'max_retries' => $maxRetries,
                        'message' => $message,
                        'exception_class' => get_class($e),
                    ]);

                    if ($attempt >= $maxRetries) {
                        Log::error('Max retries reached for moderation request, throwing exception');
                        throw $e;
                    }

                    // Try to get Retry-After header if available
                    $retryAfter = null;
                    if (method_exists($e, 'getHeaders')) {
                        $headers = $e->getHeaders();
                        $retryAfter = $headers['Retry-After'] ?? null;
                    }

                    $sleepSeconds = $retryAfter ? (int)$retryAfter : pow(2, $attempt);
                    Log::info("Sleeping for {$sleepSeconds} seconds before retrying moderation request");
                    sleep($sleepSeconds);
                } else {
                    // Not a rate limit error, rethrow immediately
                    Log::error('Moderation service unexpected error', [
                        'message' => $message,
                        'trace' => $e->getTraceAsString(),
                        'exception_class' => get_class($e),
                    ]);
                    throw $e;
                }
            }
        } while ($attempt < $maxRetries);

        Log::warning('Moderation request failed after retries, returning fallback');
        return ['flagged' => false, 'categories' => [], 'category_scores' => []];
    }

}
