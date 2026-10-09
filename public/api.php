<?php

declare(strict_types=1);

/**
 * Front controller de la API: todas las rutas /api/* llegan aquí.
 * No exponer errores internos al cliente (RNF-04); el detalle se registra
 * en logs/error.log.
 */

require dirname(__DIR__) . '/src/autoload.php';

use Nudo\Config\Env;
use Nudo\Support\JsonResponse;
use Nudo\Support\Logger;
use Nudo\Support\Router;

try {
    Env::load(dirname(__DIR__) . '/.env');
} catch (Throwable $e) {
    Logger::error('bootstrap:env', $e);
    JsonResponse::error('Error interno del servidor.', 500);
}

try {
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH) ?: '/';

    // Quitar el prefijo /api
    $path = substr($path, strlen('/api')) ?: '/';

    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

    $router = new Router();
    $registerRoutes = require dirname(__DIR__) . '/routes/api.php';
    $registerRoutes($router);

    $router->dispatch($method, $path);
} catch (Throwable $e) {
    Logger::error('api:dispatch', $e);
    JsonResponse::error('Error interno del servidor.', 500);
}
