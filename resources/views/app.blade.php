<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @vite('resources/css/app.css')
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Meta Tags -->
        <meta name="description" content="Your description here">
        <meta name="author" content="Your Name or Company">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <!-- External Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

        <!-- Trustpilot Script -->
        <script>
            (function(w,d,s,r,n){
                w.TrustpilotObject=n;
                w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
                var a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;
                var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(a,f)
            })(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
            tp('register', 'sxv5StylVDv7vqle');
        </script>
    </head>

    <body class="font-sans antialiased">
        @inertia

        <!-- Trustpilot Widget Example -->
        <div class="trustpilot-widget"
             data-locale="en-US"
             data-template-id="YOUR_TEMPLATE_ID"
             data-businessunit-id="YOUR_BUSINESS_UNIT_ID"
             data-style-height="240px"
             data-style-width="100%">
        </div>
    </body>
</html>
