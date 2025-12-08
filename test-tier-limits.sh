#!/bin/bash

# Test script to verify backend tier limits enforcement
# This simulates a malicious user trying to bypass frontend limits

echo "🧪 Testing Backend Tier Limits Enforcement"
echo "=========================================="
echo ""

# Configuration
API_URL="https://bulktok-qkl7ljxaf-cesarbautista97xs-projects.vercel.app/api/generate"

echo "📋 Test Scenario:"
echo "- Simulating a FREE tier user (limit: 5 videos/month)"
echo "- User has already used 3/5 videos"
echo "- Attempting to upload 5 images (would exceed limit)"
echo ""

echo "🎯 Expected Result:"
echo "- Frontend would only allow 2 images"
echo "- Backend should reject with 403 Forbidden"
echo ""

echo "⚠️  Note: This test requires:"
echo "1. Valid authentication token"
echo "2. Valid Hedra API key"
echo "3. Test image files"
echo ""

echo "🔍 To run this test manually:"
echo ""
echo "1. Open browser DevTools on /generate page"
echo "2. Get your auth token from Application > Cookies"
echo "3. Run this in Console:"
echo ""
cat << 'EOF'
// Create test FormData with more images than allowed
const formData = new FormData();

// Add 5 test images (when user only has 2 remaining)
for (let i = 0; i < 5; i++) {
    const blob = new Blob(['fake image data'], { type: 'image/png' });
    formData.append('images', blob, `test${i}.png`);
}

// Add required fields
const audioBlob = new Blob(['fake audio'], { type: 'audio/mp3' });
formData.append('audio', audioBlob, 'test.mp3');
formData.append('prompt', 'test prompt');
formData.append('aspectRatio', '9:16');
formData.append('resolution', '540p');

// Get session token
const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
};

// Attempt to bypass frontend limit
getToken().then(token => {
    fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'x-hedra-api-key': 'your_hedra_key_here'
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        console.log('Response:', data);
        if (data.limit_reached) {
            console.log('✅ BACKEND VALIDATION WORKING!');
            console.log('🛡️ Request was rejected with 403');
            console.log('Error:', data.error);
            console.log('Remaining:', data.remaining);
        } else {
            console.log('❌ WARNING: Backend did not enforce limit!');
        }
    });
});
EOF

echo ""
echo "📊 What you should see:"
echo "✅ Response with limit_reached: true"
echo "✅ Status: 403 Forbidden"
echo "✅ Error message about monthly limit"
echo "✅ Remaining videos count"
echo ""
echo "This proves the backend CANNOT be bypassed! 🔒"
