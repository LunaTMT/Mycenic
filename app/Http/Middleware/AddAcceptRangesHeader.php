<?php

namespace App\Http\Middleware;

use Closure;

class AddAcceptRangesHeader
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        // Add the Accept-Ranges header for video content
        $response->headers->set('Accept-Ranges', 'bytes');
        return $response;
    }
}
