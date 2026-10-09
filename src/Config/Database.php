<?php

declare(strict_types=1);

namespace Nudo\Config;

use PDO;

/**
 * Conexión única a PostgreSQL mediante PDO (pdo_pgsql).
 * Requiere: ERRMODE_EXCEPTION y EMULATE_PREPARES en false (plan.md §3).
 */
final class Database
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $host = Env::require('DB_HOST');
        $port = Env::get('DB_PORT', '5432');
        $name = Env::require('DB_NAME');
        $user = Env::require('DB_USER');
        $password = Env::get('DB_PASSWORD', '');

        // host puede ser un nombre, una IP o una ruta de socket Unix
        $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', $host, $port, $name);

        self::$pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);

        return self::$pdo;
    }

    /** Solo para pruebas: forzar una conexión nueva. */
    public static function reset(): void
    {
        self::$pdo = null;
    }
}
