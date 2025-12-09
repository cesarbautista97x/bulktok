// Diagnostic script to check video generation issues
// Run this in browser console on /generate page

async function diagnoseVideoGeneration() {
    console.log('🔍 BulkTok Video Generation Diagnostic');
    console.log('=====================================\n');

    // 1. Check authentication
    console.log('1️⃣ Checking Authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
        console.error('❌ Session Error:', sessionError);
        return;
    }

    if (!session) {
        console.error('❌ No active session. Please log in.');
        return;
    }

    console.log('✅ User authenticated:', session.user.email);
    console.log('   User ID:', session.user.id);
    console.log('   Token:', session.access_token.substring(0, 20) + '...\n');

    // 2. Check profile
    console.log('2️⃣ Checking User Profile...');
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            console.error('❌ Profile Error:', profileError);
            return;
        }

        if (!profile) {
            console.error('❌ No profile found. Create profile first.');
            return;
        }

        console.log('✅ Profile found:');
        console.log('   Email:', profile.email);
        console.log('   Tier:', profile.subscription_tier);
        console.log('   Videos this month:', profile.videos_generated_this_month);
        console.log('   Hedra API Key:', profile.hedra_api_key ? 'Set ✅' : 'NOT SET ❌\n');

        if (!profile.hedra_api_key) {
            console.error('❌ CRITICAL: Hedra API key not configured!');
            console.log('   Go to /account and set your Hedra API key\n');
            return;
        }

        // 3. Check tier limits
        console.log('3️⃣ Checking Tier Limits...');
        const limits = {
            free: 5,
            pro: 300,
            unlimited: 999999
        };

        const userLimit = limits[profile.subscription_tier] || 5;
        const currentUsage = profile.videos_generated_this_month || 0;
        const remaining = userLimit - currentUsage;

        console.log(`   Limit: ${currentUsage}/${userLimit}`);
        console.log(`   Remaining: ${remaining}\n`);

        if (remaining <= 0) {
            console.error('❌ LIMIT REACHED: No videos remaining this month');
            console.log('   Upgrade your plan to generate more videos\n');
            return;
        }

        // 4. Test API endpoint
        console.log('4️⃣ Testing API Endpoint...');
        console.log('   Creating test request...\n');

        const formData = new FormData();

        // Create test image
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, 0, 100, 100);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        formData.append('images', blob, 'test.png');

        // Create test audio
        const audioBlob = new Blob(['test'], { type: 'audio/mp3' });
        formData.append('audio', audioBlob, 'test.mp3');

        formData.append('prompt', 'Test video generation');
        formData.append('aspectRatio', '16:9');
        formData.append('resolution', '720p');

        console.log('   Sending request to /api/generate...');

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'x-hedra-api-key': profile.hedra_api_key
            },
            body: formData
        });

        console.log('   Response status:', response.status);

        const result = await response.json();
        console.log('   Response:', result);

        if (!response.ok) {
            console.error('❌ API Error:', result.error || 'Unknown error');
            if (result.limit_reached) {
                console.log('   Limit reached. Remaining:', result.remaining);
            }
            return;
        }

        console.log('✅ API endpoint working!');
        console.log('   Batch ID:', result.batchId);
        console.log('   Videos queued:', result.videoCount);

        // 5. Summary
        console.log('\n📊 DIAGNOSTIC SUMMARY');
        console.log('===================');
        console.log('✅ Authentication: OK');
        console.log('✅ Profile: OK');
        console.log('✅ Hedra API Key:', profile.hedra_api_key ? 'Set' : 'NOT SET');
        console.log('✅ Tier Limits:', `${remaining} videos remaining`);
        console.log('✅ API Endpoint: Working');
        console.log('\n🎉 Everything looks good! Try generating videos now.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        console.log('\nPlease share this error with support.');
    }
}

// Run diagnostic
diagnoseVideoGeneration();
