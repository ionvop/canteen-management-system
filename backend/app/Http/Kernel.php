<?php

namespace App\Http;

class Kernel
{
    protected $routeMiddleware = [
        // ...
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ];
}