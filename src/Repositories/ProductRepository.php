<?php

declare(strict_types=1);

namespace Nudo\Repositories;

use Nudo\Config\Database;

/**
 * Acceso a datos de products. Solo se exponen productos activos.
 */
final class ProductRepository
{
    private const COLUMNS = 'id, name, slug, category, short_description, price, currency, image_url, sort_order';

    /**
     * @return list<array<string, mixed>>
     */
    public function all(?string $category = null): array
    {
        $sql = 'SELECT ' . self::COLUMNS . '
                  FROM products
                 WHERE is_active = TRUE';

        $params = [];

        if ($category !== null && $category !== '') {
            $sql .= ' AND category = :category';
            $params[':category'] = $category;
        }

        $sql .= ' ORDER BY sort_order ASC, name ASC';

        $stmt = Database::pdo()->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll() ?: [];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findActive(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT ' . self::COLUMNS . '
               FROM products
              WHERE id = :id AND is_active = TRUE'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }

    /**
     * Categorías existentes entre productos activos (para los filtros).
     *
     * @return list<string>
     */
    public function categories(): array
    {
        $stmt = Database::pdo()->query(
            'SELECT DISTINCT category
               FROM products
              WHERE is_active = TRUE
              ORDER BY category'
        );

        return array_column($stmt->fetchAll() ?: [], 'category');
    }

    /**
     * Normaliza la representación de un producto para el JSON de la API.
     * PDO devuelve NUMERIC como cadena → convertir precio a número.
     *
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public static function toApi(array $row): array
    {
        return [
            'id'                => (int) $row['id'],
            'name'              => (string) $row['name'],
            'category'          => (string) $row['category'],
            'price'             => (float) $row['price'],
            'currency'          => (string) $row['currency'],
            'image_url'         => $row['image_url'] !== null ? (string) $row['image_url'] : null,
            'short_description' => $row['short_description'] !== null ? (string) $row['short_description'] : null,
        ];
    }
}
