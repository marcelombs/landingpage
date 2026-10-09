<?php

declare(strict_types=1);

namespace Nudo\Controllers;

use Nudo\Repositories\ProductRepository;
use Nudo\Support\JsonResponse;

/**
 * GET /api/products  y  GET /api/products/{id}  (RF-02, RF-03, RF-04)
 */
final class ProductController
{
    public function __construct(
        private readonly ProductRepository $products = new ProductRepository(),
    ) {
    }

    /** GET /api/products[?category=chompas] */
    public function index(): void
    {
        $category = $_GET['category'] ?? null;

        if (is_string($category)) {
            $category = mb_strtolower(trim($category));

            // Normalizar: solo letras, números, guion y guion bajo
            if (!preg_match('/^[a-z0-9_-]{1,40}$/', $category)) {
                JsonResponse::error('Categoría inválida.', 400);
            }
        } else {
            $category = null;
        }

        $rows = $this->products->all($category);

        JsonResponse::send([
            'data' => array_map(ProductRepository::toApi(...), $rows),
        ]);
    }

    /** GET /api/products/{id} */
    public function show(string $id): void
    {
        if (!ctype_digit($id) || (int) $id < 1) {
            JsonResponse::error('Identificador de producto inválido.', 400);
        }

        $product = $this->products->findActive((int) $id);

        if ($product === null) {
            JsonResponse::error('Producto no encontrado o no disponible.', 404);
        }

        JsonResponse::send([
            'data' => ProductRepository::toApi($product),
        ]);
    }
}
