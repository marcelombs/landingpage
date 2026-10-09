<?php

declare(strict_types=1);

/**
 * Definición de rutas de la API (spec.md §8).
 * Devuelve un callable que recibe y configura una instancia de Router.
 */

use Nudo\Controllers\ConfigController;
use Nudo\Controllers\ContactController;
use Nudo\Controllers\ProductController;
use Nudo\Support\Router;

return static function (Router $router): void {
    // Catálogo
    $router->get('/products', [ProductController::class, 'index']);
    $router->get('/products/{id}', [ProductController::class, 'show']);

    // Contacto
    $router->post('/contact', [ContactController::class, 'store']);

    // Configuración pública (WhatsApp, redes)
    $router->get('/config', [ConfigController::class, 'show']);
};
