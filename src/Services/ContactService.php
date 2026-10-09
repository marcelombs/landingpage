<?php

declare(strict_types=1);

namespace Nudo\Services;

use Nudo\Repositories\ContactRepository;
use Nudo\Repositories\ProductRepository;

/**
 * Reglas de negocio del formulario de contacto (spec.md §10).
 */
final class ContactService
{
    public function __construct(
        private readonly ContactRepository $contacts = new ContactRepository(),
        private readonly ProductRepository $products = new ProductRepository(),
    ) {
    }

    /**
     * Persiste una consulta ya validada. Devuelve el id generado.
     *
     * @param array{
     *     name: string,
     *     email: ?string,
     *     phone: ?string,
     *     subject: string,
     *     message: string,
     *     product_id: ?int
     * } $data
     *
     * @throws \DomainException si el producto referenciado no existe o está inactivo
     */
    public function create(array $data, ?string $ipHash): int
    {
        // CA-09 / RF-04: el producto referenciado debe existir y estar activo.
        // El cliente no envía precio ni nombre: el servidor es la única fuente.
        if ($data['product_id'] !== null && $this->products->findActive($data['product_id']) === null) {
            throw new \DomainException('product_id');
        }

        return $this->contacts->insert([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'],
            'subject'    => $data['subject'],
            'message'    => $data['message'],
            'product_id' => $data['product_id'],
            'ip_hash'    => $ipHash,
        ]);
    }
}
