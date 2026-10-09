<?php

declare(strict_types=1);

namespace Nudo\Repositories;

use Nudo\Config\Database;

/**
 * Acceso a datos de contact_messages.
 */
final class ContactRepository
{
    /**
     * Inserta una consulta y devuelve el id generado.
     * Se usa INSERT ... RETURNING id (plan.md §3; no lastInsertId).
     *
     * @param array{
     *     name: string,
     *     email: ?string,
     *     phone: ?string,
     *     subject: string,
     *     message: string,
     *     product_id: ?int,
     *     ip_hash: ?string
     * } $data
     */
    public function insert(array $data): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO contact_messages (name, email, phone, subject, message, product_id, ip_hash)
                  VALUES (:name, :email, :phone, :subject, :message, :product_id, :ip_hash)
             RETURNING id'
        );

        $stmt->execute([
            ':name'       => $data['name'],
            ':email'      => $data['email'],
            ':phone'      => $data['phone'],
            ':subject'    => $data['subject'],
            ':message'    => $data['message'],
            ':product_id' => $data['product_id'],
            ':ip_hash'    => $data['ip_hash'],
        ]);

        return (int) $stmt->fetchColumn();
    }

    /**
     * Cuántas consultas envió esta huella de IP en los últimos N minutos.
     * Se usa para la limitación de frecuencia (T-011 / RNF-04).
     */
    public function countRecentByIpHash(string $ipHash, int $minutes): int
    {
        $stmt = Database::pdo()->prepare(
            'SELECT COUNT(*)
               FROM contact_messages
              WHERE ip_hash = :ip_hash
                AND created_at > now() - (:minutes || \' minutes\')::interval'
        );
        $stmt->execute([
            ':ip_hash'  => $ipHash,
            ':minutes'  => (string) $minutes,
        ]);

        return (int) $stmt->fetchColumn();
    }
}
