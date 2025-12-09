// Diagnóstico rápido - Ejecuta esto en la consola del navegador en /generate

async function diagnosticarAPIKey() {
    console.log('🔍 Diagnóstico de API Key');
    console.log('========================\n');

    // 1. Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error('❌ No hay sesión activa');
        return;
    }
    console.log('✅ Sesión activa:', session.user.email);

    // 2. Verificar perfil en la página
    console.log('\n📋 Verificando perfil cargado en la página...');
    // El perfil debería estar disponible en el componente

    // 3. Consultar perfil directamente
    console.log('\n📋 Consultando perfil desde Supabase...');
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error('❌ Error al obtener perfil:', error);
        return;
    }

    console.log('✅ Perfil encontrado:');
    console.log('   Email:', profile.email);
    console.log('   Tier:', profile.subscription_tier);
    console.log('   Videos this month:', profile.videos_generated_this_month);
    console.log('   Hedra API Key:', profile.hedra_api_key ? '✅ Configurada' : '❌ NO CONFIGURADA');

    if (!profile.hedra_api_key) {
        console.error('\n❌ PROBLEMA ENCONTRADO:');
        console.error('   Tu Hedra API key NO está guardada en la base de datos');
        console.error('\n💡 SOLUCIÓN:');
        console.error('   1. Ve a /account');
        console.error('   2. Busca la sección "API Configuration"');
        console.error('   3. Ingresa tu Hedra API key');
        console.error('   4. Click "Save API Key"');
        console.error('   5. Vuelve a /generate e intenta de nuevo');
        return;
    }

    console.log('\n✅ Todo configurado correctamente!');
    console.log('   API Key:', profile.hedra_api_key.substring(0, 15) + '...');
}

diagnosticarAPIKey();
