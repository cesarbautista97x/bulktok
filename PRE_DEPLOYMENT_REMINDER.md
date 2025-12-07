# 🚨 RECORDATORIO PRE-DEPLOYMENT

## ⚠️ CRÍTICO: Implementar límites funcionales

**ANTES DE HACER EL DEPLOYMENT**, debes implementar la limitación de 5 videos para cuentas gratuitas.

### Estado Actual
- ❌ **Solo visual**: El UI muestra "5 videos/month" pero NO está enforced
- ❌ **Backend no verifica**: Cualquier usuario puede generar videos ilimitados
- ❌ **Contador no incrementa**: No se actualiza `videos_generated_this_month` en la DB

### Lo que hay que hacer

#### 1. Modificar `/api/generate/route.ts`

Agregar verificación ANTES de generar videos:

```typescript
// AGREGAR ESTO al inicio del POST handler, después de obtener el user

// Get user profile to check limits
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('subscription_tier, videos_generated_this_month')
  .eq('id', user.id)
  .single()

if (profileError || !profile) {
  return NextResponse.json(
    { error: 'Could not load user profile' },
    { status: 500 }
  )
}

// Check tier limits
const limits = {
  free: 5,
  pro: 300,
  unlimited: 999999
}

const limit = limits[profile.subscription_tier as keyof typeof limits] || 5
const currentCount = profile.videos_generated_this_month || 0

if (currentCount >= limit) {
  return NextResponse.json(
    { 
      error: `You've reached your monthly limit of ${limit} videos. Upgrade to generate more.`,
      limit_reached: true,
      current_tier: profile.subscription_tier
    },
    { status: 403 }
  )
}
```

#### 2. Incrementar contador después de generar

```typescript
// AGREGAR ESTO después de crear cada video en la DB

await supabase
  .from('profiles')
  .update({ 
    videos_generated_this_month: currentCount + images.length 
  })
  .eq('id', user.id)
```

#### 3. Verificar en el frontend

En `app/generate/page.tsx`, manejar el error 403:

```typescript
if (!response.ok) {
  const errorData = await response.json()
  
  if (errorData.limit_reached) {
    toast.error(
      errorData.error,
      {
        duration: 5000,
        action: {
          label: 'Upgrade',
          onClick: () => router.push('/account')
        }
      }
    )
  } else {
    toast.error(errorData.error || 'Failed to generate videos')
  }
  return
}
```

### Archivos a modificar

1. [`app/api/generate/route.ts`](file:///Users/cesar/Automate/hedra-bulk/bulktok/app/api/generate/route.ts) - Agregar verificación de límites
2. [`app/generate/page.tsx`](file:///Users/cesar/Automate/hedra-bulk/bulktok/app/generate/page.tsx) - Manejar error de límite

### Testing

Antes de deployar:

1. Crea una cuenta free
2. Genera 5 videos
3. Intenta generar el 6to video
4. Debería mostrar error: "You've reached your monthly limit of 5 videos"
5. Verifica que el contador en `/account` muestre 5/5

---

## Otros recordatorios

- [ ] Configurar Stripe antes de lanzar (o deshabilitar botones de upgrade)
- [ ] Verificar que las variables de entorno estén en Vercel
- [ ] Actualizar Supabase redirect URLs con el dominio de Vercel
- [ ] Probar flujo completo en producción

---

**NO DEPLOYAR SIN IMPLEMENTAR LOS LÍMITES** ⚠️
