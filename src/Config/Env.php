<?php

declare(strict_types=1);

namespace Nudo\Config;

/**
 * Lector mínimo de archivos .env (sin dependencias externas).
 * Las variables ya definidas en el entorno del proceso tienen prioridad.
 */
final class Env
{
    /** @var array<string, string> */
    private static array $values = [];

    private static bool $loaded = false;

    public static function load(string $path): void
    {
        if (self::$loaded) {
            return;
        }

        if (!is_file($path)) {
            throw new \RuntimeException('No se encontró el archivo de configuración .env');
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if ($lines === false) {
            throw new \RuntimeException('No se pudo leer el archivo .env');
        }

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $pos = strpos($line, '=');

            if ($pos === false) {
                continue;
            }

            $key = trim(substr($line, 0, $pos));
            $value = trim(substr($line, $pos + 1));

            // Quitar comillas envolventes
            if ($value !== '' && $value[0] === '"' && str_ends_with($value, '"')) {
                $value = substr($value, 1, -1);
            } elseif ($value !== '' && $value[0] === "'" && str_ends_with($value, "'")) {
                $value = substr($value, 1, -1);
            }

            if ($key !== '' && getenv($key) === false) {
                self::$values[$key] = $value;
            }
        }

        self::$loaded = true;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $process = getenv($key);

        if ($process !== false) {
            return $process;
        }

        return self::$values[$key] ?? $default;
    }

    /** Devuelve el valor o lanza excepción si falta (para claves obligatorias). */
    public static function require(string $key): string
    {
        $value = self::get($key);

        if ($value === null || $value === '') {
            throw new \RuntimeException("Falta la variable de entorno requerida: {$key}");
        }

        return $value;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = self::get($key);

        if ($value === null) {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
