#!/bin/bash

# Script para diagnosticar por qué no se generan videos
# Revisa múltiples puntos de fallo

echo "🔍 Diagnóstico de Generación de Videos"
echo "======================================"
echo ""

echo "📋 Checklist de Verificación:"
echo ""

echo "1️⃣ Verificar que el usuario tiene Hedra API key configurada"
echo "   → Ve a /account"
echo "   → Verifica que 'Hedra API Key' esté guardada"
echo "   → Si no está, añádela desde https://www.hedra.com"
echo ""

echo "2️⃣ Verificar logs de Vercel"
echo "   → Ve a https://vercel.com/cesarbautista97xs-projects/bulktok"
echo "   → Click en 'Logs' o 'Functions'"
echo "   → Busca errores recientes"
echo "   → Comparte cualquier error que veas"
echo ""

echo "3️⃣ Verificar en la consola del navegador"
echo "   → Abre DevTools (F12)"
echo "   → Pestaña 'Console'"
echo "   → Intenta generar un video"
echo "   → ¿Ves algún error?"
echo ""

echo "4️⃣ Verificar en Network tab"
echo "   → DevTools → Network"
echo "   → Intenta generar un video"
echo "   → Busca el request a '/api/generate'"
echo "   → Click en él"
echo "   → ¿Qué status code tiene? (200, 400, 500?)"
echo "   → ¿Qué dice la respuesta?"
echo ""

echo "5️⃣ Posibles causas comunes:"
echo ""
echo "   ❌ Hedra API key no configurada"
echo "      → Solución: Ir a /account y guardar API key"
echo ""
echo "   ❌ Límite de tier alcanzado"
echo "      → Solución: Verificar contador en /generate"
echo ""
echo "   ❌ Python no ejecuta en Vercel"
echo "      → Solución: Vercel no soporta Python directamente"
echo "      → Necesitas usar Vercel Functions o API externa"
echo ""
echo "   ❌ Archivos muy grandes"
echo "      → Solución: Vercel tiene límite de 4.5MB por request"
echo ""
echo "   ❌ Timeout de Vercel"
echo "      → Solución: Vercel Functions timeout a 10s (hobby) o 60s (pro)"
echo ""

echo "6️⃣ Test rápido:"
echo ""
echo "   Ejecuta esto en la consola del navegador (F12):"
echo ""
cat << 'EOF'
// Test de generación
const testGeneration = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        console.error('❌ No estás autenticado');
        return;
    }
    
    console.log('✅ Autenticado como:', session.user.email);
    
    // Obtener API key
    const response = await fetch(`/api/settings?userId=${session.user.id}`);
    const settings = await response.json();
    
    console.log('Hedra API Key:', settings.hedra_api_key ? 'Configurada ✅' : 'NO configurada ❌');
    
    if (!settings.hedra_api_key) {
        console.error('❌ Configura tu Hedra API key en /account');
        return;
    }
    
    console.log('✅ Todo listo para generar');
};

testGeneration();
EOF
echo ""

echo "================================"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   Vercel NO ejecuta Python directamente en producción"
echo "   El código actual usa Python local, pero en Vercel necesitas:"
echo ""
echo "   Opción 1: Llamar directamente a Hedra API desde Next.js"
echo "   Opción 2: Usar Vercel Functions con Node.js"
echo "   Opción 3: Usar servicio externo para Python"
echo ""
echo "¿Quieres que revise el código de generación?"
echo ""
