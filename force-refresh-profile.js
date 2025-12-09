// Quick fix script to force refresh profile on account page
// Run this in browser console on /account page

async function forceRefreshProfile() {
    console.log('🔄 Forcing profile refresh...');

    // Clear all caches
    localStorage.clear();
    sessionStorage.clear();

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error('❌ No session found');
        return;
    }

    console.log('✅ Session found:', session.user.email);

    // Force reload profile from database
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error('❌ Error loading profile:', error);
        return;
    }

    console.log('✅ Profile loaded from database:');
    console.log('   Tier:', profile.subscription_tier);
    console.log('   Customer ID:', profile.stripe_customer_id);
    console.log('   Subscription ID:', profile.stripe_subscription_id);

    // Hard reload page
    console.log('\n🔄 Reloading page...');
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
}

forceRefreshProfile();
