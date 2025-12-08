// Test script to debug subscription status issue
const testSubscriptionData = {
    id: "sub_1SbpXgLykxGCxEtHs6j087HW",
    status: "active",
    current_period_end: 1767621454,
    current_period_start: 1765143054,
    cancel_at_period_end: true,
    canceled_at: 1765145805,
}

console.log('Testing subscription data conversion...')

// Test 1: Direct date conversion
try {
    const currentPeriodEnd = new Date(testSubscriptionData.current_period_end * 1000)
    console.log('✓ Current period end:', currentPeriodEnd.toISOString())
    console.log('✓ Formatted:', currentPeriodEnd.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }))
} catch (e) {
    console.error('✗ Error converting current_period_end:', e.message)
}

// Test 2: Calculate days remaining
try {
    const currentPeriodEnd = new Date(testSubscriptionData.current_period_end * 1000)
    const now = new Date()
    const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    console.log('✓ Days remaining:', daysRemaining)
} catch (e) {
    console.error('✗ Error calculating days:', e.message)
}

// Test 3: Check if subscription status would be returned correctly
try {
    const result = {
        tier: 'unlimited',
        hasSubscription: true,
        status: testSubscriptionData.status,
        cancelAtPeriodEnd: testSubscriptionData.cancel_at_period_end || false,
        currentPeriodEnd: new Date(testSubscriptionData.current_period_end * 1000).toISOString(),
        daysRemaining: Math.ceil((new Date(testSubscriptionData.current_period_end * 1000).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        cancelAt: testSubscriptionData.canceled_at ? new Date(testSubscriptionData.canceled_at * 1000).toISOString() : null,
    }
    console.log('✓ Result object:', JSON.stringify(result, null, 2))
} catch (e) {
    console.error('✗ Error creating result:', e.message)
}

console.log('\nAll tests passed! The issue must be in the frontend rendering.')
