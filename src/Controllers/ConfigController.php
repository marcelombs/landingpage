<?php

declare(strict_types=1);

namespace Nudo\Controllers;

use Nudo\Config\Env;
use Nudo\Support\JsonResponse;

/**
 * GET /api/config (RF-06, RF-08)
 * Devuelve la configuración PÚBLICA al frontend: destino de WhatsApp,
 * redes sociales y contacto. Los valores sensibles jamás se exponen.
 */
final class ConfigController
{
    public function show(): void
    {
        $whatsappNumber = Env::get('WHATSAPP_NUMBER', '');
        $whatsappEnabled = Env::bool('WHATSAPP_ENABLED', false)
            && $whatsappNumber !== '';

        $social = array_filter([
            'instagram' => Env::get('INSTAGRAM_URL', ''),
            'facebook'  => Env::get('FACEBOOK_URL', ''),
            'tiktok'    => Env::get('TIKTOK_URL', ''),
        ], static fn (string $v): bool => $v !== '');

        JsonResponse::send([
            'data' => [
                'whatsapp' => [
                    // Si está deshabilitado, el frontend NO debe mostrar
                    // un destino engañoso (RF-06).
                    'enabled'          => $whatsappEnabled,
                    'phone'            => $whatsappEnabled ? $whatsappNumber : null,
                    'default_message'  => Env::get('WHATSAPP_MESSAGE_DEFAULT', ''),
                ],
                'social' => $social,
                'contact_email' => Env::get('CONTACT_EMAIL', '') ?: null,
            ],
        ]);
    }
}
