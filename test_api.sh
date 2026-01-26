#!/bin/bash

# Script di test per il refactoring API
# Testa i nuovi endpoint API

echo "================================================"
echo "TEST REFACTORING API"
echo "================================================"
echo ""

BASE_URL="http://localhost"
PROJECT_PATH="/progetto_TecWeb"

echo "🧪 Test 1: GET /api/me.php (senza autenticazione)"
echo "   Dovrebbe ritornare: authenticated: false"
curl -s -X GET "${BASE_URL}${PROJECT_PATH}/api/me.php" | jq
echo ""

echo "🧪 Test 2: GET /api/prodotti.php (pubblico)"
echo "   Dovrebbe ritornare lista prodotti"
curl -s -X GET "${BASE_URL}${PROJECT_PATH}/api/prodotti.php" | jq
echo ""

echo "🧪 Test 3: GET /api/prodotti.php?id=1 (dettaglio)"
echo "   Dovrebbe ritornare dettaglio prodotto"
curl -s -X GET "${BASE_URL}${PROJECT_PATH}/api/prodotti.php?id=1" | jq
echo ""

echo "🧪 Test 4: GET /api/admin/utenti.php (senza auth)"
echo "   Dovrebbe ritornare: 401 Non autenticato"
curl -s -X GET "${BASE_URL}${PROJECT_PATH}/api/admin/utenti.php" | jq
echo ""

echo "🧪 Test 5: GET /api/admin/prodotti.php (senza auth)"
echo "   Dovrebbe ritornare: 401 Non autenticato"
curl -s -X GET "${BASE_URL}${PROJECT_PATH}/api/admin/prodotti.php" | jq
echo ""

echo "================================================"
echo "NOTA: Per testare gli endpoint autenticati,"
echo "devi prima fare login e passare i cookie della sessione"
echo "================================================"
echo ""

echo "Esempio login + test endpoint autenticato:"
echo ""
echo "# 1. Login"
echo "curl -c cookies.txt -X POST ${BASE_URL}${PROJECT_PATH}/login.php \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"admin@example.com\",\"password\":\"password\"}'"
echo ""
echo "# 2. Test endpoint autenticato"
echo "curl -b cookies.txt -X GET ${BASE_URL}${PROJECT_PATH}/api/me.php | jq"
echo ""
echo "# 3. Test endpoint admin"
echo "curl -b cookies.txt -X GET ${BASE_URL}${PROJECT_PATH}/api/admin/utenti.php | jq"
echo ""
