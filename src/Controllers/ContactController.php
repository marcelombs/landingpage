<?php

declare(strict_types=1);

namespace Nudo\Controllers;

use Nudo\Repositories\ContactRepository;
use Nudo\Services\ContactService;
use Nudo\Support\JsonResponse;
use Nudo\Validators\ContactValidator;

/**
 * POST /api/contact (RF-05, RF-09, T-011)
 */
final class ContactController
{
    private const RATE_LIMIT_MAX = 3;      // envíos...
    private const RATE_LIMIT_MINUTES = 10; // ...por IP en esta ventana

    public function __construct(
        private readonly ContactValidator $validator = new ContactValidator(),
        private readonly ContactService $service = new ContactService(),
        private readonly ContactRepository $contacts = new ContactRepository(),
    ) {
    }

    public function store(): void
    {
        $input = self::jsonBody();

        if ($input === null) {
            JsonResponse::error('Cuerpo JSON inválido.', 400);
        }

        // --- T-011: honeypot. Campo oculto que solo un bot completaría.
        // Se responde 201 sin persistir para no delatar el filtro. ---
        if (self::honeypotTriggered($input)) {
            JsonResponse::send([
                'message' => 'Tu consulta fue registrada correctamente.',
                'data'    => ['id' => 0],
            ], 201);
        }

        // --- Validación de servidor (CA-07) ---
        $result = $this->validator->validate($input);

        if ($result['errors'] !== []) {
            JsonResponse::error('La solicitud contiene datos inválidos.', 422, [
                'errors' => $result['errors'],
            ]);
        }

        // --- T-011: limitación de frecuencia por huella de IP ---
        $ipHash = self::ipHash();
        $recent = $this->contacts->countRecentByIpHash($ipHash, self::RATE_LIMIT_MINUTES);

        if ($recent >= self::RATE_LIMIT_MAX) {
            JsonResponse::error(
                'Demasiadas consultas en poco tiempo. Intenta nuevamente más tarde.',
                429
            );
        }

        // --- Persistencia (CA-06, CA-09) ---
        try {
            $id = $this->service->create($result['data'], $ipHash);
        } catch (\DomainException $e) {
            if ($e->getMessage() === 'product_id') {
                JsonResponse::error('La solicitud contiene datos inválidos.', 422, [
                    'errors' => ['product_id' => 'El producto indicado no existe o no está disponible.'],
                ]);
            }

            throw $e;
        }

        JsonResponse::send([
            'message' => 'Tu consulta fue registrada correctamente.',
            'data'    => ['id' => $id],
        ], 201);
    }

    /**
     * @param array<string, mixed> $input
     */
    private static function honeypotTriggered(array $input): bool
    {
        $value = $input['website'] ?? $input['WEB_SITE'] ?? '';

        return is_string($value) && trim($value) !== '';
    }

    private static function ipHash(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        // Hash irreversible; nunca se almacena la IP en claro (spec.md §9).
        return hash('sha256', (string) $ip);
    }

    /**
     * Lee el cuerpo JSON de la solicitud.
     *
     * @return array<string, mixed>|null null si no es JSON válido
     */
    private static function jsonBody(): ?array
    {
        $raw = file_get_contents('php://input');

        if ($raw === false || trim($raw) === '') {
            return null;
        }

        try {
            $decoded = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }

        return is_array($decoded) ? $decoded : null;
    }
}
