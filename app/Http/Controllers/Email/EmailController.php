<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;  // Use Log facade
use Illuminate\Http\Request;

class EmailController extends Controller
{
    public function sendOrderEmail()
    {
        $data = [
            'customer' => [
                'name' => 'Jane Doe',
            ],
            'order' => [
                'item' => 'Blue Widget',
                'total' => 39.99,
            ],
        ];

        // Log the data being processed
        Log::info('Starting email processing for customer: ' . $data['customer']['name']);

        // 1. Save data to JSON
        $jsonPath = storage_path('app/email-data.json');
        Log::info('Saving email data to: ' . $jsonPath);
        file_put_contents($jsonPath, json_encode($data));

        // 2. Run Maizzle build
        Log::info('Running Maizzle build with command: npx maizzle build maizzle/emails/order-confirmation.html --json {$jsonPath} --config=maizzle.config.js');
        Log::info('Current working directory: ' . getcwd());

       $result = Process::path(base_path('maizzle'))
            ->run("npx maizzle build emails/order-confirmation.html --json {$jsonPath} --config=config.js");


        if ($result->failed()) {
            // Log Maizzle build failure
            Log::error('Maizzle build failed: ' . $result->errorOutput());
            return response()->json(['error' => 'Email build failed'], 500);
        }

        // Log Maizzle build success
        Log::info('Maizzle build completed successfully.');

        // 3. Load the built email
        $htmlPath = base_path('maizzle/build_local/transactional.html');
       //THIS WORKS with transactional

        // 4. Send the email using Laravel
        Log::info('Sending email to: taylorthreader@gmail.com');
        try {
            Mail::html(file_get_contents($htmlPath), function ($message) {
                $message->to('taylorthreader@gmail.com')->subject('Welcome!');
            });

            Log::info('Email sent successfully.');

        } catch (\Exception $e) {
            Log::error('Error sending email: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to send email'], 500);
        }


        return response()->json(['message' => 'Email sent successfully']);
    }
}



