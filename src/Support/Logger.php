<?php

declare(strict_types=1);

namespace Nudo\Support;

/**
 * Registro de errores técnicos en disco.
 * Los detalles NUNCA se devuelven al cliente (RNF-04).
 */
final class Logger
{
    public static function error(string $context, \Throwable $e): void
    {
        $dir = dirname(__DIR__, 2) . '/logs';

        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        $line = sprintf(
            "[%s] %s | %s: %s @ %s:%d\n%s\n\n",
            date('c'),
            $context,
            $e::class,
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        );

        @file_put_contents($dir . '/error.log', $line, FILE_APPEND | LOCK_EX);
    }
}
