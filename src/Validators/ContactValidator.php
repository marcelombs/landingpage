<?php

declare(strict_types=1);

namespace Nudo\Validators;

/**
 * Validación de la solicitud de contacto (RF-05).
 * El servidor valida SIEMPRE; la validación del navegador es solo cosmética.
 */
final class ContactValidator
{
    public const NAME_MIN = 2;
    public const NAME_MAX = 120;
    public const SUBJECT_MIN = 3;
    public const SUBJECT_MAX = 200;
    public const MESSAGE_MIN = 10;
    public const MESSAGE_MAX = 2000;

    /**
     * Normaliza y valida los datos crudos del cuerpo JSON.
     *
     * @param array<string, mixed> $input
     * @return array{data: array<string, mixed>, errors: array<string, string>}
     */
    public function validate(array $input): array
    {
        // --- Normalización: cadenas vacías → null (spec.md §9) ---
        $name    = self::str($input['name'] ?? null);
        $email   = self::str($input['email'] ?? null);
        $phone   = self::str($input['phone'] ?? null);
        $subject = self::str($input['subject'] ?? null);
        $message = self::str($input['message'] ?? null);

        // product_id: puede llegar como número JSON o como cadena
        $rawProductId = $input['product_id'] ?? null;

        if (is_int($rawProductId)) {
            $productId = $rawProductId >= 1 ? $rawProductId : false;
        } elseif (is_string($rawProductId) && trim($rawProductId) !== '') {
            $productId = filter_var(trim($rawProductId), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        } else {
            $productId = null;
        }

        $errors = [];

        // --- name ---
        if ($name === null) {
            $errors['name'] = 'El nombre es obligatorio.';
        } elseif (mb_strlen($name) < self::NAME_MIN) {
            $errors['name'] = 'El nombre debe tener al menos ' . self::NAME_MIN . ' caracteres.';
        } elseif (mb_strlen($name) > self::NAME_MAX) {
            $errors['name'] = 'El nombre no puede superar ' . self::NAME_MAX . ' caracteres.';
        }

        // --- subject ---
        if ($subject === null) {
            $errors['subject'] = 'El motivo de consulta es obligatorio.';
        } elseif (mb_strlen($subject) < self::SUBJECT_MIN) {
            $errors['subject'] = 'El motivo debe tener al menos ' . self::SUBJECT_MIN . ' caracteres.';
        } elseif (mb_strlen($subject) > self::SUBJECT_MAX) {
            $errors['subject'] = 'El motivo no puede superar ' . self::SUBJECT_MAX . ' caracteres.';
        }

        // --- message ---
        if ($message === null) {
            $errors['message'] = 'El mensaje es obligatorio.';
        } elseif (mb_strlen($message) < self::MESSAGE_MIN) {
            $errors['message'] = 'El mensaje debe tener al menos ' . self::MESSAGE_MIN . ' caracteres.';
        } elseif (mb_strlen($message) > self::MESSAGE_MAX) {
            $errors['message'] = 'El mensaje no puede superar ' . self::MESSAGE_MAX . ' caracteres.';
        }

        // --- email / phone: al menos uno válido (spec.md §9) ---
        if ($email !== null && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'El correo electrónico no tiene un formato válido.';
        } elseif ($email !== null && mb_strlen($email) > 255) {
            $errors['email'] = 'El correo no puede superar 255 caracteres.';
        }

        if ($phone !== null && !preg_match('/^\+?[0-9\s\-().]{5,20}$/', $phone)) {
            $errors['phone'] = 'El teléfono solo puede contener dígitos, espacios y los símbolos + - ( ).';
        }

        if ($email === null && $phone === null) {
            $errors['contact'] = 'Indica al menos un medio de contacto: correo electrónico o teléfono.';
        }

        // --- product_id (si viene, debe ser entero positivo; la existencia se valida en el servicio) ---
        if ($productId === false) {
            $productId = null;
            $errors['product_id'] = 'El identificador de producto no es válido.';
        }

        return [
            'data' => [
                'name'       => $name,
                'email'      => $email,
                'phone'      => $phone,
                'subject'    => $subject,
                'message'    => $message,
                'product_id' => $productId,
            ],
            'errors' => $errors,
        ];
    }

    private static function str(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
