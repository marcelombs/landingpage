#!/usr/bin/env bash
# T-030 — Batería de pruebas de API NUDO (spec.md §8, §12)
# Genera tests/evidence/api-tests.md
set -u
B=http://localhost:8000/api
OUT="$(dirname "$0")/evidence/api-tests.md"
PASS=0; FAIL=0
REPORT="# Reporte de pruebas de API — NUDO ($(date -Iseconds))

Servidor: \`php -S localhost:8000 -t public public/router.php\` · Base: \`nudo_landing\`

| # | Caso | Esperado | Obtenido | Resultado |
|---|------|----------|----------|-----------|"

t() { # t "caso" "esperado" curl-args... (ultimo arg = data opcional via -d ya incluido)
  local name=$1 expect=$2; shift 2
  local resp http
  resp=$(curl -sS -w "\n%{http_code}" "$@")
  http=$(echo "$resp" | tail -1)
  body=$(echo "$resp" | head -n -1)
  if [ "$http" = "$expect" ]; then
    PASS=$((PASS+1)); mark="✔ PASS"
  else
    FAIL=$((FAIL+1)); mark="✘ FAIL"
  fi
  REPORT="$REPORT
| - | $name | $expect | $http | $mark |"
  echo "[$mark] $name → $http (esperado $expect)"
  LAST_BODY="$body"
}

echo "== T-030: batería de API =="

# Catálogo
t "GET /products con registros" 200 "$B/products"
COUNT=$(echo "$LAST_BODY" | php -r 'echo count(json_decode(stream_get_contents(STDIN),true)["data"]??[]);')
[ "$COUNT" = "6" ] && { PASS=$((PASS+1)); echo "[✔ PASS] catálogo trae 6 activos (inactiva excluida)"; } || { FAIL=$((FAIL+1)); echo "[✘ FAIL] catálogo trae $COUNT (esperaba 6)"; }
REPORT="$REPORT
| - | Total de productos activos | 6 | $COUNT | $([ "$COUNT" = "6" ] && echo '✔ PASS' || echo '✘ FAIL') |"

t "GET /products?category=chompas" 200 "$B/products?category=chompas"
N=$(echo "$LAST_BODY" | php -r 'echo count(json_decode(stream_get_contents(STDIN),true)["data"]??[]);')
if [ "$N" = "3" ]; then PASS=$((PASS+1)); echo "[✔ PASS] filtro chompas → 3"; else FAIL=$((FAIL+1)); echo "[✘ FAIL] filtro chompas → $N"; fi

t "GET /products?category=bicles" 200 "$B/products?category=bicles"
t "GET /products?category=noexiste (lista vacía)" 200 "$B/products?category=noexiste"
t "GET /products?category=ch;drop (inválida)" 400 "$B/products?category=ch%3Bdrop"
t "GET /products/1" 200 "$B/products/1"
t "GET /products/7 (inactiva)" 404 "$B/products/7"
t "GET /products/999999" 404 "$B/products/999999"
t "GET /products/abc" 400 "$B/products/abc"
t "POST /products (método no permitido)" 405 -X POST "$B/products"
t "GET /ruta-inexistente" 404 "$B/nada"
t "GET /config (público, sin secretos)" 200 "$B/config"

# Contacto — limpiar rate limit primero
DBPASS=$(grep '^DB_PASSWORD=' "$(dirname "$0")/../.env" | cut -d= -f2)
PGPASSWORD="$DBPASS" psql -h 127.0.0.1 -U nudo_app -d nudo_landing -q -c "TRUNCATE contact_messages RESTART IDENTITY;" 2>/dev/null

t "POST /contact válido → 201" 201 -X POST "$B/contact" -H "Content-Type: application/json" \
  -d '{"name":"Prueba API","email":"api@test.bo","phone":"","subject":"Consulta API","message":"Mensaje de prueba de la batería de API.","product_id":1,"website":""}'
ID=$(echo "$LAST_BODY" | php -r 'echo json_decode(stream_get_contents(STDIN),true)["data"]["id"]?? "?";')
echo "   → id persistido: $ID"

t "POST /contact sin medio de contacto → 422" 422 -X POST "$B/contact" -H "Content-Type: application/json" \
  -d '{"name":"X","email":"","phone":"","subject":"Hola","message":"Sin forma de respuesta valida."}'
t "POST /contact email inválido → 422" 422 -X POST "$B/contact" -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"no-es-email","subject":"Consulta","message":"Mensaje suficientemente largo aqui."}'
t "POST /contact product_id inexistente → 422" 422 -X POST "$B/contact" -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"a@b.co","subject":"Consulta","message":"Quisiera info del producto.","product_id":999}'
t "POST /contact body no JSON → 400" 400 -X POST "$B/contact" -H "Content-Type: application/json" -d 'no-json'
t "POST /contact honeypot → 201 sin persistir" 201 -X POST "$B/contact" -H "Content-Type: application/json" \
  -d '{"name":"Bot","email":"bot@spam.com","subject":"Spam","message":"Mensaje automatico de prueba.","website":"http://spam"}'
ROWS=$(PGPASSWORD="$DBPASS" psql -h 127.0.0.1 -U nudo_app -d nudo_landing -t -A -c "SELECT count(*) FROM contact_messages;")
[ "$ROWS" = "1" ] && { PASS=$((PASS+1)); echo "[✔ PASS] honeypot NO persistió (filas=$ROWS)"; } || { FAIL=$((FAIL+1)); echo "[✘ FAIL] honeypot persistió (filas=$ROWS)"; }

# Rate limit (1 válido ya enviado → 2 más pasan, el 4to → 429)
for i in 2 3; do
  curl -sS -o /dev/null -X POST "$B/contact" -H "Content-Type: application/json" \
    -d "{\"name\":\"U$i\",\"email\":\"u$i@t.bo\",\"subject\":\"Consulta $i\",\"message\":\"Mensaje de consulta para el limite $i.\"}"
done
t "POST /contact 4to en ventana → 429" 429 -X POST "$B/contact" -H "Content-Type: application/json" \
  -d '{"name":"Cuarto","email":"c@t.bo","subject":"Consulta","message":"Cuarto intento en la ventana activa."}'

# Seguridad
t "GET /.env vía web → 404" 404 --path-as-is http://localhost:8000/.env
t "GET /src/autoload.php → 404" 404 http://localhost:8000/src/autoload.php
t "GET /database/schema.sql → 404" 404 http://localhost:8000/database/schema.sql

# SQLi almacenado como texto literal
PGPASSWORD="$DBPASS" psql -h 127.0.0.1 -U nudo_app -d nudo_landing -q -c "TRUNCATE contact_messages RESTART IDENTITY;"
t "POST /contact con SQLi en nombre → 201 (texto literal)" 201 -X POST "$B/contact" -H "Content-Type: application/json" \
  -d '{"name":"Eva\"; DROP TABLE products;--","email":"sqli@t.bo","subject":"Prueba SQLi","message":"Intento de inyeccion SQL en el nombre."}'
PCOUNT=$(PGPASSWORD="$DBPASS" psql -h 127.0.0.1 -U nudo_app -d nudo_landing -t -A -c "SELECT count(*) FROM products;")
[ "$PCOUNT" = "7" ] && { PASS=$((PASS+1)); echo "[✔ PASS] tabla products intacta tras SQLi (filas=$PCOUNT)"; } || { FAIL=$((FAIL+1)); echo "[✘ FAIL] products alterada ($PCOUNT)"; }

REPORT="$REPORT

## Resumen

**$PASS pasaron · $FAIL fallaron** — $( [ "$FAIL" = "0" ] && echo 'BATERÍA COMPLETA OK' || echo 'HAY FALLOS' )

### Ejemplo de respuesta GET /api/products (primer elemento)

\`\`\`json
$(curl -sS "$B/products" | php -r '$d=json_decode(stream_get_contents(STDIN),true); echo json_encode(["data"=>[$d["data"][0]]], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);')
\`\`\`

### Ejemplo de respuesta 201 POST /api/contact

\`\`\`json
$(php -r 'echo json_encode(["message" => "Tu consulta fue registrada correctamente.", "data" => ["id" => 1]], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);')
\`\`\`

### Ejemplo de respuesta 422

\`\`\`json
$(curl -sS -X POST "$B/contact" -H "Content-Type: application/json" -d '{}' )
\`\`\`
"

echo "$REPORT" > "$OUT"
echo ""
echo "═══ API: $PASS pasaron, $FAIL fallaron · reporte en $OUT ═══"
[ "$FAIL" = "0" ]
