<?php

declare(strict_types=1);

namespace Nudo\Support;

/**
 * Respuestas JSON con códigos HTTP (contrato de spec.md §8).
 */
final class JsonResponse
{
    public static function send(mixed $data, int $status = 200): never
    {
        self::emit($data, $status);
    }

    public static function error(string $message, int $status, array $extra = []): never
    {
        self::emit(array_merge(['message' => $message], $extra), $status);
    }

    private static function emit(mixed $data, int $status): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        exit;
    }
}
