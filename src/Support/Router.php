<?php

declare(strict_types=1);

namespace Nudo\Support;

/**
 * Enrutador mínimo para la API (sin frameworks).
 * Soporta parámetros de ruta: /products/{id}
 */
final class Router
{
    /** @var array<string, array<int, array{pattern: string, regex: string, handler: array{0: class-string, 1: string} }>> */
    private array $routes = [];

    public function get(string $pattern, array $handler): void
    {
        $this->add('GET', $pattern, $handler);
    }

    public function post(string $pattern, array $handler): void
    {
        $this->add('POST', $pattern, $handler);
    }

    public function add(string $method, string $pattern, array $handler): void
    {
        $regex = '#^' . preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';

        $this->routes[$method][] = [
            'pattern' => $pattern,
            'regex'   => $regex,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        $path = rtrim($path, '/') ?: '/';

        foreach ($this->routes[$method] ?? [] as $route) {
            if (preg_match($route['regex'], $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                [$class, $action] = $route['handler'];

                (new $class())->{$action}(...array_values($params));
                return;
            }
        }

        // La ruta existe con otro método → 405
        foreach ($this->routes as $otherMethod => $routes) {
            foreach ($routes as $route) {
                if (preg_match($route['regex'], $path)) {
                    JsonResponse::error('Método no permitido.', 405);
                }
            }
        }

        JsonResponse::error('Recurso no encontrado.', 404);
    }
}
