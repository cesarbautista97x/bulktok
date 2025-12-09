// Script para verificar el estado de Stripe vs Base de Datos
// Ejecuta esto en la consola del navegador en /account

async function verificarStripeSync() {
    console.log('🔍 Verificando sincronización Stripe ↔ Base de Datos');
    console.log('================================================\n');

    // 1. Obtener sesión actual
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error('❌ No hay sesión activa');
        return;
    }

    const userEmail = session.user.email;
    console.log('✅ Usuario:', userEmail);

    // 2. Verificar perfil en base de datos
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error('❌ Error obteniendo perfil:', error);
        return;
    }

    console.log('\n📊 Estado en Base de Datos:');
    console.log('   Tier:', profile.subscription_tier);
    console.log('   Stripe Customer ID:', profile.stripe_customer_id || 'NO CONFIGURADO');
    console.log('   Stripe Subscription ID:', profile.stripe_subscription_id || 'NO CONFIGURADO');

    // 3. Verificar en Stripe
    console.log('\n🔍 Verificando en Stripe...');

    try {
        const response = await fetch('/api/stripe/subscription-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail })
        });

        const stripeData = await response.json();

        console.log('\n💳 Estado en Stripe:');
        console.log('   Tiene suscripción:', stripeData.hasSubscription ? 'SÍ ✅' : 'NO ❌');

        if (stripeData.hasSubscription) {
            console.log('   Plan:', stripeData.tier);
            console.log('   Estado:', stripeData.status);
            console.log('   Customer ID:', stripeData.customerId);
            console.log('   Subscription ID:', stripeData.subscriptionId);
        }

        // 4. Comparar
        console.log('\n🔄 Comparación:');
        if (stripeData.hasSubscription && profile.subscription_tier === 'free') {
            console.error('❌ PROBLEMA: Tienes suscripción en Stripe pero eres FREE en la base de datos');
            console.log('\n💡 SOLUCIÓN:');
            console.log('   El webhook de Stripe no actualizó la base de datos.');
            console.log('   Opciones:');
            console.log('   1. Esperar 1-2 minutos y recargar la página');
            console.log('   2. Verificar logs de Vercel para ver si el webhook falló');
            console.log('   3. Actualizar manualmente la base de datos');
        } else if (stripeData.hasSubscription && profile.subscription_tier !== 'free') {
            console.log('✅ TODO CORRECTO: Base de datos sincronizada con Stripe');
        } else {
            console.log('⚠️  No tienes suscripción activa en Stripe');
        }

    } catch (error) {
        console.error('❌ Error consultando Stripe:', error);
    }
}

verificarStripeSync();
