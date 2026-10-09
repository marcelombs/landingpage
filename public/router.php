<?php

declare(strict_types=1);

/**
 * Router para el servidor integrado de PHP:
 *   php -S localhost:8000 -t public public/router.php
 *
 * - Archivos estáticos reales → se sirven tal cual (return false).
 * - /api/* → front controller public/api.php.
 * - El resto → 404 JSON (la landing estática llega en la Fase 2).
 */

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// --- T-029: cabeceras de seguridad globales (RNF-04) ---
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'");

// Archivo estático existente bajo public/ → dejar que PHP lo sirva
if ($path !== '/' && is_file(__DIR__ . $path)) {
    return false;
}

if (str_starts_with($path, '/api')) {
    require __DIR__ . '/api.php';
    return true;
}

// Raíz: servir index.html cuando exista (Fase 2)
if ($path === '/' && is_file(__DIR__ . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/index.html');
    return true;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['message' => 'Recurso no encontrado.'], JSON_UNESCAPED_UNICODE);
return true;
