# Configuración de Supabase para BulkTok

## ✅ Credenciales Configuradas

### Supabase
- **URL**: https://atbtrkdnxkaoldtlfety.supabase.co
- **Anon Key**: Configurada ✓
- **Service Role Key**: Configurada ✓

### Google OAuth
- **Client ID**: 592767590956-us61es84bnm4tk9nde4q0dt4f5aj3gn6.apps.googleusercontent.com
- **Client Secret**: Configurado ✓

---

## Pasos Completados

1. ✅ Archivo `.env.local` creado con credenciales de Supabase
2. ⏳ Pendiente: Ejecutar schema SQL en Supabase
3. ⏳ Pendiente: Configurar Google OAuth en Supabase Dashboard

---

## Próximos Pasos Manuales

### 1. Ejecutar Schema SQL en Supabase

1. Ve a https://supabase.com/dashboard/project/atbtrkdnxkaoldtlfety
2. Click en **SQL Editor** (icono de base de datos en sidebar)
3. Click en **New Query**
4. Copia y pega el contenido de `supabase/schema.sql`
5. Click en **Run** o presiona `Cmd + Enter`
6. Deberías ver: "Success. No rows returned"

### 2. Configurar Google OAuth en Supabase

1. En Supabase Dashboard, ve a **Authentication** → **Providers**
2. Busca **Google** y haz click para expandir
3. Activa el toggle **Enable Sign in with Google**
4. Pega las credenciales:
   - **Client ID (for OAuth)**: `592767590956-us61es84bnm4tk9nde4q0dt4f5aj3gn6.apps.googleusercontent.com`
   - **Client Secret (for OAuth)**: `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`
5. Click **Save**

### 3. Configurar Redirect URLs en Google Cloud Console

1. Ve a https://console.cloud.google.com/apis/credentials
2. Click en tu OAuth 2.0 Client ID
3. En **Authorized redirect URIs**, agrega:
   ```
   https://atbtrkdnxkaoldtlfety.supabase.co/auth/v1/callback
   ```
4. En **Authorized JavaScript origins**, agrega:
   ```
   http://localhost:3000
   https://atbtrkdnxkaoldtlfety.supabase.co
   ```
5. Click **Save**

### 4. Reiniciar Servidor de Desarrollo

```bash
# Detener el servidor actual (Ctrl + C)
# Luego reiniciar:
npm run dev
```

---

## Verificación

Una vez completados los pasos:

1. Ve a http://localhost:3000/login
2. Click en "Continue with Google"
3. Deberías poder iniciar sesión
4. Serás redirigido a `/generate`
5. Verifica en Supabase Dashboard → **Authentication** → **Users** que tu usuario aparece
6. Verifica en **Table Editor** → **profiles** que tu perfil se creó automáticamente

---

## Troubleshooting

### Error: "Invalid login credentials"
- Verifica que Google OAuth esté habilitado en Supabase
- Asegúrate que las redirect URIs coincidan exactamente

### Error: "Profile not found"
- Verifica que el schema SQL se ejecutó correctamente
- Revisa que el trigger `on_auth_user_created` existe

### Servidor no reinicia
- Detén el servidor con Ctrl + C
- Ejecuta `npm run dev` nuevamente

---

## Estado Actual

- ✅ Variables de entorno configuradas
- ⏳ Schema SQL pendiente de ejecutar
- ⏳ Google OAuth pendiente de configurar en Supabase
- ⏳ Redirect URIs pendientes de configurar en Google

**Tiempo estimado para completar**: 5-10 minutos
