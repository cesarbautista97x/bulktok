#!/bin/bash

# Script para cambiar contraseña de usuario en Supabase
# Solo para desarrollo/testing

echo "🔐 BulkTok - Password Reset Tool"
echo "================================"
echo ""

EMAIL="cesarbautista@hotmail.es"
NEW_PASSWORD="BulkTok2024!"

echo "Usuario: $EMAIL"
echo "Nueva contraseña: $NEW_PASSWORD"
echo ""

echo "Para cambiar la contraseña, ejecuta este SQL en Supabase:"
echo ""
echo "-----------------------------------------------------"
echo "-- Opción 1: Enviar email de reset (Recomendado)"
echo "-----------------------------------------------------"
echo ""
echo "1. Ve a Supabase Dashboard"
echo "2. Authentication → Users"
echo "3. Busca: $EMAIL"
echo "4. Click '...' → 'Send Password Reset Email'"
echo ""
echo "-----------------------------------------------------"
echo "-- Opción 2: Cambiar directamente (Solo desarrollo)"
echo "-----------------------------------------------------"
echo ""
echo "⚠️  ADVERTENCIA: Esto solo funciona si tienes acceso al Service Role Key"
echo ""
echo "Ejecuta este código en tu terminal:"
echo ""

cat << 'EOF'
# Instalar supabase CLI si no lo tienes
# npm install -g supabase

# Luego ejecuta:
npx supabase functions invoke admin-reset-password \
  --body '{"email":"cesarbautista@hotmail.es","newPassword":"BulkTok2024!"}' \
  --env-file .env.local
EOF

echo ""
echo "-----------------------------------------------------"
echo "-- Opción 3: Usar el endpoint que creé"
echo "-----------------------------------------------------"
echo ""
echo "1. Asegúrate que el servidor esté corriendo:"
echo "   npm run dev"
echo ""
echo "2. En otra terminal, ejecuta:"
echo ""
echo "curl -X POST http://localhost:3000/api/admin/reset-password \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"cesarbautista@hotmail.es\",\"newPassword\":\"BulkTok2024!\"}'"
echo ""
echo "-----------------------------------------------------"
echo "-- Opción 4: Crear nueva cuenta (Más fácil)"
echo "-----------------------------------------------------"
echo ""
echo "1. Ve a /login"
echo "2. Click 'Sign Up'"
echo "3. Email: test@bulktok.com"
echo "4. Password: BulkTok2024!"
echo ""
echo "================================"
echo ""
echo "📝 Credenciales sugeridas:"
echo "   Email: cesarbautista@hotmail.es"
echo "   Password: BulkTok2024!"
echo ""
