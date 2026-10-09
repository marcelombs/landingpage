<?php

declare(strict_types=1);

/**
 * Autoload PSR-4 mínimo para el namespace Nudo\ → src/ (sin Composer).
 */

spl_autoload_register(static function (string $class): void {
    $prefix = 'Nudo\\';

    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $file = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';

    if (is_file($file)) {
        require $file;
    }
});
