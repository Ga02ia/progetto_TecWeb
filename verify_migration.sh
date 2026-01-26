#!/bin/bash

# Script di verifica post-migrazione frontend
# Controlla che tutti i file siano aggiornati correttamente

echo "================================================"
echo "🔍 VERIFICA POST-MIGRAZIONE FRONTEND"
echo "================================================"
echo ""

PROJECT_DIR="/Applications/XAMPP/xamppfiles/htdocs/progetto_TecWeb"
cd "$PROJECT_DIR"

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

echo "1️⃣  Verifica vecchi endpoint rimasti..."
echo "   Cercando riferimenti a vecchi endpoint nei file JS..."

OLD_ENDPOINTS=(
    "check_session.php"
    "update_profile.php"
    "admin_utenti.php"
    "admin_prodotti.php"
    "get_prodotti.php"
)

for endpoint in "${OLD_ENDPOINTS[@]}"; do
    COUNT=$(grep -r "$endpoint" *.js js/*.js components/*.js 2>/dev/null | grep -v "\.md" | wc -l | tr -d ' ')
    if [ "$COUNT" -gt 0 ]; then
        echo -e "   ${RED}✗${NC} Trovati $COUNT riferimenti a $endpoint"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "   ${GREEN}✓${NC} Nessun riferimento a $endpoint"
    fi
done

echo ""
echo "2️⃣  Verifica nuovi endpoint API..."
echo "   Controllando che i nuovi file esistano..."

NEW_ENDPOINTS=(
    "api/me.php"
    "api/prodotti.php"
    "api/admin/utenti.php"
    "api/admin/prodotti.php"
)

for endpoint in "${NEW_ENDPOINTS[@]}"; do
    if [ -f "$endpoint" ]; then
        echo -e "   ${GREEN}✓${NC} $endpoint esiste"
    else
        echo -e "   ${RED}✗${NC} $endpoint NON TROVATO"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "3️⃣  Verifica sintassi PHP..."
PHP_BIN="/Applications/XAMPP/xamppfiles/bin/php"

if [ -x "$PHP_BIN" ]; then
    for endpoint in "${NEW_ENDPOINTS[@]}"; do
        if $PHP_BIN -l "$endpoint" > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓${NC} $endpoint - sintassi OK"
        else
            echo -e "   ${RED}✗${NC} $endpoint - ERRORE SINTASSI"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "   ${YELLOW}⚠${NC}  PHP non trovato, skip verifica sintassi"
fi

echo ""
echo "4️⃣  Verifica file legacy (retrocompatibilità)..."

LEGACY_FILES=(
    "check_session.php"
    "update_profile.php"
    "admin_utenti.php"
    "admin_prodotti.php"
    "get_prodotti.php"
)

for file in "${LEGACY_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "@deprecated" "$file" 2>/dev/null; then
            echo -e "   ${GREEN}✓${NC} $file (deprecato, rimanda a nuovo endpoint)"
        else
            echo -e "   ${YELLOW}⚠${NC}  $file esiste ma non è marcato come deprecato"
        fi
    else
        echo -e "   ${RED}✗${NC} $file non trovato (retrocompatibilità rotta)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "5️⃣  Verifica documentazione..."

DOCS=(
    "REFACTORING.md"
    "MIGRATION_GUIDE.md"
    "README_API.md"
    "FRONTEND_MIGRATION.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "   ${GREEN}✓${NC} $doc"
    else
        echo -e "   ${YELLOW}⚠${NC}  $doc non trovato"
    fi
done

echo ""
echo "================================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ VERIFICA COMPLETATA CON SUCCESSO!${NC}"
    echo ""
    echo "Tutto è pronto. Puoi testare l'applicazione:"
    echo "  1. Avvia XAMPP"
    echo "  2. Apri http://localhost/progetto_TecWeb/"
    echo "  3. Testa login, prodotti, admin, ecc."
else
    echo -e "${RED}❌ VERIFICA FALLITA - $ERRORS errori trovati${NC}"
    echo ""
    echo "Controlla gli errori sopra e correggi prima di procedere."
fi
echo "================================================"
