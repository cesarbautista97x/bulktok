#!/bin/bash

# Script para testear límites de tier sin generar videos reales
# Modifica temporalmente el contador de videos en Supabase

echo "🧪 BulkTok Tier Limits Testing Tool"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "Este script te permite simular diferentes escenarios de uso"
echo "sin tener que generar 300 videos reales."
echo ""

# Get user email
echo -e "${BLUE}Ingresa el email del usuario a testear:${NC}"
read USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo -e "${RED}Error: Email es requerido${NC}"
    exit 1
fi

echo ""
echo "Selecciona el escenario a testear:"
echo ""
echo "1) Usuario cerca del límite FREE (4/5 videos)"
echo "2) Usuario en el límite FREE (5/5 videos)"
echo "3) Usuario cerca del límite PRO (298/300 videos)"
echo "4) Usuario en el límite PRO (300/300 videos)"
echo "5) Usuario UNLIMITED con muchos videos (1000 videos)"
echo "6) Resetear contador a 0"
echo "7) Ver estado actual del usuario"
echo ""
read -p "Opción (1-7): " OPTION

case $OPTION in
    1)
        NEW_COUNT=4
        SCENARIO="Usuario FREE cerca del límite (4/5)"
        ;;
    2)
        NEW_COUNT=5
        SCENARIO="Usuario FREE en el límite (5/5)"
        ;;
    3)
        NEW_COUNT=298
        SCENARIO="Usuario PRO cerca del límite (298/300)"
        ;;
    4)
        NEW_COUNT=300
        SCENARIO="Usuario PRO en el límite (300/300)"
        ;;
    5)
        NEW_COUNT=1000
        SCENARIO="Usuario UNLIMITED con muchos videos"
        ;;
    6)
        NEW_COUNT=0
        SCENARIO="Reset contador a 0"
        ;;
    7)
        echo ""
        echo "Consultando estado actual..."
        echo ""
        echo "Ejecuta este query en Supabase SQL Editor:"
        echo ""
        echo -e "${YELLOW}SELECT email, subscription_tier, videos_generated_this_month FROM profiles WHERE email = '$USER_EMAIL';${NC}"
        echo ""
        exit 0
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Escenario seleccionado: $SCENARIO${NC}"
echo ""
echo "Para aplicar este cambio, ejecuta el siguiente SQL en Supabase:"
echo ""
echo -e "${GREEN}-- Actualizar contador de videos${NC}"
echo -e "${YELLOW}UPDATE profiles${NC}"
echo -e "${YELLOW}SET videos_generated_this_month = $NEW_COUNT${NC}"
echo -e "${YELLOW}WHERE email = '$USER_EMAIL';${NC}"
echo ""
echo -e "${GREEN}-- Verificar cambio${NC}"
echo -e "${YELLOW}SELECT email, subscription_tier, videos_generated_this_month FROM profiles WHERE email = '$USER_EMAIL';${NC}"
echo ""

echo "Pasos para testear:"
echo ""
echo "1. Ve a Supabase Dashboard → SQL Editor"
echo "2. Copia y pega el SQL de arriba"
echo "3. Ejecuta el query"
echo "4. Ve a tu app: https://bulktok-fivtx04ku-cesarbautista97xs-projects.vercel.app"
echo "5. Recarga la página (Cmd+R)"
echo "6. Ve a /generate"
echo "7. Observa el límite de upload:"
echo ""

case $OPTION in
    1)
        echo "   - Debería permitir subir máximo 1 imagen (5 - 4 = 1)"
        echo "   - Mensaje: 'Free plan: You can upload up to 1 more images'"
        ;;
    2)
        echo "   - Debería permitir subir 0 imágenes"
        echo "   - Mensaje: 'Free plan: You can upload up to 0 more images'"
        echo "   - Si intentas subir 1, debería rechazar"
        ;;
    3)
        echo "   - Debería permitir subir máximo 2 imágenes (300 - 298 = 2)"
        echo "   - Mensaje: 'Pro plan: You can upload up to 2 more images'"
        ;;
    4)
        echo "   - Debería permitir subir 0 imágenes"
        echo "   - Mensaje: 'Pro plan: You can upload up to 0 more images'"
        echo "   - Si intentas subir 1, debería rechazar"
        ;;
    5)
        echo "   - Debería permitir subir 999 imágenes (sin límite práctico)"
        echo "   - No debería mostrar mensaje de límite"
        ;;
    6)
        echo "   - Contador reseteado a 0"
        echo "   - FREE: puede subir 5 imágenes"
        echo "   - PRO: puede subir 300 imágenes"
        echo "   - UNLIMITED: puede subir 999 imágenes"
        ;;
esac

echo ""
echo -e "${BLUE}8. Intenta subir imágenes y verifica que el límite funciona${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANTE: Después de testear, resetea el contador a 0${NC}"
echo ""
