'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { getRandomFaceEmoji } from '@/lib/emoji'
import { supabase } from '@/lib/supabase-client'

// Mark as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic'

// Only initialize Stripe if key is configured
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey && stripeKey !== 'your_stripe_publishable_key_here'
    ? loadStripe(stripeKey)
    : null

function AccountPageContent() {
    const { user, signOut, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [emoji, setEmoji] = useState('')
    const [isCreatingProfile, setIsCreatingProfile] = useState(false)
    const [localProfile, setLocalProfile] = useState<any>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
    const [isCanceling, setIsCanceling] = useState(false)

    // Load profile directly from database
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) {
                setProfileLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    console.error('Error loading profile:', error)
                } else {
                    console.log('Profile loaded:', data)
                    setLocalProfile(data)
                }
            } catch (error) {
                console.error('Error in loadProfile:', error)
            } finally {
                setProfileLoading(false)
            }
        }

        loadProfile()
    }, [user])

    // Load subscription status
    useEffect(() => {
        const loadSubscriptionStatus = async () => {
            if (!user || !localProfile) return

            try {
                const response = await fetch('/api/stripe/subscription-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        email: user.email
                    }),
                })

                if (response.ok) {
                    const data = await response.json()
                    console.log('Subscription status loaded:', data)
                    setSubscriptionStatus(data)
                } else {
                    const error = await response.json()
                    console.error('Failed to load subscription status:', error)
                }
            } catch (error) {
                console.error('Error loading subscription status:', error)
            }
        }

        loadSubscriptionStatus()
    }, [user, localProfile])

    // Use local profile instead of AuthProvider profile
    const profile = localProfile
    const loading = authLoading || profileLoading

    // Generate random emoji on mount
    useEffect(() => {
        setEmoji(getRandomFaceEmoji())
    }, [])

    useEffect(() => {
        // Handle Stripe redirect
        const success = searchParams.get('success')
        const canceled = searchParams.get('canceled')

        if (success) {
            toast.success('Subscription activated!')
            // Reload profile and subscription status
            if (user) {
                // Reload profile
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                        if (data) {
                            setLocalProfile(data)
                            // Also reload subscription status
                            fetch('/api/stripe/subscription-status', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user.id }),
                            })
                                .then(res => res.json())
                                .then(statusData => {
                                    setSubscriptionStatus(statusData)
                                })
                        }
                    })
            }
            // Clean URL
            router.replace('/account')
        } else if (canceled) {
            toast.info('Checkout canceled')
            router.replace('/account')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Only run once on mount

    const handleUpgrade = async (tier?: string) => {
        try {
            if (!user) {
                toast.error('Please log in first')
                return
            }

            toast.info('Redirecting to checkout...')

            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tier: tier || 'pro',
                    userId: user.id
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create checkout session')
            }

            const { url } = await response.json()

            if (url) {
                window.location.href = url
            }
        } catch (error: any) {
            console.error('Upgrade error:', error)
            toast.error(error.message || 'Failed to start checkout')
        }
    }

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
            return
        }

        setIsCanceling(true)
        try {
            const response = await fetch('/api/stripe/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    email: user?.email
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to cancel subscription')
            }

            const data = await response.json()
            toast.success(data.message)

            // Reload subscription status
            const statusResponse = await fetch('/api/stripe/subscription-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    email: user?.email
                }),
            })

            if (statusResponse.ok) {
                const statusData = await statusResponse.json()
                setSubscriptionStatus(statusData)
            }
        } catch (error: any) {
            console.error('Cancel error:', error)
            toast.error(error.message || 'Failed to cancel subscription')
        } finally {
            setIsCanceling(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            // Clear any local state
            window.localStorage.clear()
            // Redirect to login
            window.location.href = '/login'
        } catch (error) {
            console.error('Sign out error:', error)
            // Force redirect anyway
            window.location.href = '/login'
        }
    }

    const handleCreateProfile = async () => {
        setIsCreatingProfile(true)
        console.log('Creating displayProfile...')

        try {
            const response = await fetch('/api/profile/create', {
                method: 'POST',
                credentials: 'include', // Include cookies
            })

            console.log('Response status:', response.status)
            const data = await response.json()
            console.log('Response data:', data)

            if (response.ok) {
                toast.success('Profile created successfully!')
                // Force a hard reload to fetch the profile
                setTimeout(() => window.location.reload(), 500)
            } else {
                toast.error(data.error || 'Failed to create profile')
            }
        } catch (error) {
            console.error('Create profile error:', error)
            toast.error('Failed to create profile')
        } finally {
            setIsCreatingProfile(false)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading your account...</p>
                </div>
            </div>
        )
    }

    // If no user after loading, redirect to login
    if (!user) {
        router.push('/login')
        return null
    }

    // Use profile if available, otherwise create a default one from user
    const displayProfile = profile || {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_tier: 'free' as const,
        videos_generated_this_month: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    // Calculate limits based on tier
    const getLimit = (tier: string) => {
        if (tier === 'unlimited') return 999999
        if (tier === 'pro') return 300
        return 5
    }

    const getPrice = (tier: string) => {
        if (tier === 'unlimited') return '$29.97'
        if (tier === 'pro') return '$19.97'
        return '$0'
    }

    const getTierBadge = (tier: string) => {
        if (tier === 'unlimited') return { emoji: '🚀', label: 'Unlimited', color: 'bg-purple-100 text-purple-700' }
        if (tier === 'pro') return { emoji: '⭐', label: 'Pro', color: 'bg-primary-100 text-primary-700' }
        return { emoji: '🆓', label: 'Free', color: 'bg-neutral-100 text-neutral-700' }
    }

    const limit = getLimit(displayProfile.subscription_tier)
    const usageCount = displayProfile.videos_generated_this_month || 0
    const usagePercentage = displayProfile.subscription_tier === 'unlimited' ? 0 : (usageCount / limit) * 100
    const tierBadge = getTierBadge(displayProfile.subscription_tier)

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Profile */}
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center gap-4">
                        {/* Emoji Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-4xl">
                            {emoji}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-neutral-900">
                                {displayProfile.full_name || user.email?.split('@')[0] || 'User'}
                            </h1>
                            <p className="text-neutral-600">{displayProfile.email}</p>
                            <div className="mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tierBadge.color}`}>
                                    {tierBadge.emoji} {tierBadge.label} Account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Card */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                        Subscription
                    </h2>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-neutral-600">Current Plan</p>
                            <p className="text-2xl font-bold text-neutral-900 capitalize mt-1">
                                {displayProfile.subscription_tier}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-neutral-600">Monthly Price</p>
                            <p className="text-2xl font-bold text-primary-600 mt-1">
                                {getPrice(displayProfile.subscription_tier)}
                            </p>
                        </div>
                    </div>

                    {/* Subscription Status - Show for paid tiers */}
                    {subscriptionStatus?.hasSubscription && (
                        <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-sm font-medium text-neutral-700">Next Billing Date</p>
                                    <p className="text-lg font-semibold text-neutral-900">
                                        {subscriptionStatus.currentPeriodEnd ?
                                            new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            }) : 'Loading...'
                                        }
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-neutral-700">Days Remaining</p>
                                    <p className="text-lg font-semibold text-primary-600">
                                        {subscriptionStatus.daysRemaining ?? 'Loading...'} {subscriptionStatus.daysRemaining ? 'days' : ''}
                                    </p>
                                </div>
                            </div>

                            {subscriptionStatus.cancelAtPeriodEnd && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Your subscription will be canceled on {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}.
                                        You'll retain access until then.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {displayProfile.subscription_tier === 'free' && (
                        <div className="space-y-4">
                            {/* Pro Tier */}
                            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">⭐ Pro Plan</h3>
                                    <span className="text-2xl font-bold">$19.97/mo</span>
                                </div>
                                <p className="text-primary-100 mb-4">
                                    Generate up to 300 videos per month. Perfect for consistent creators.
                                </p>
                                <button
                                    onClick={() => handleUpgrade('pro')}
                                    className="bg-white text-primary-600 font-medium px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors w-full"
                                >
                                    Upgrade to Pro
                                </button>
                            </div>

                            {/* Unlimited Tier */}
                            <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">🚀 Unlimited Plan</h3>
                                    <span className="text-2xl font-bold">$29.97/mo</span>
                                </div>
                                <p className="text-purple-100 mb-4">
                                    Unlimited video generation. No limits, no worries.
                                </p>
                                <button
                                    onClick={() => handleUpgrade('unlimited')}
                                    className="bg-white text-purple-600 font-medium px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors w-full"
                                >
                                    Upgrade to Unlimited
                                </button>
                            </div>
                        </div>
                    )}

                    {displayProfile.subscription_tier === 'pro' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-green-800 font-medium">⭐ Pro subscription active</p>
                                </div>
                            </div>
                            {/* Unlimited Tier */}
                            <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">🚀 Unlimited Plan</h3>
                                    <span className="text-2xl font-bold">$29.97/mo</span>
                                </div>
                                <p className="text-purple-100 mb-4">
                                    Unlimited video generation. No limits, no worries.
                                </p>
                                <button
                                    onClick={() => handleUpgrade('unlimited')}
                                    className="bg-white text-purple-600 font-medium px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors w-full"
                                >
                                    Upgrade to Unlimited
                                </button>
                            </div>
                            {!subscriptionStatus?.cancelAtPeriodEnd && (
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={isCanceling}
                                    className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                                >
                                    {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                                </button>
                            )}
                        </div>
                    )}

                    {displayProfile.subscription_tier === 'unlimited' && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-purple-800 font-medium">You're on the Unlimited plan!</span>
                                </div>
                                <p className="text-sm text-purple-700 mt-2">
                                    Enjoy unlimited video generation with no restrictions.
                                </p>
                            </div>
                            {!subscriptionStatus?.cancelAtPeriodEnd && (
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={isCanceling}
                                    className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                                >
                                    {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                        Account Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Member Since
                            </label>
                            <input
                                type="text"
                                value={new Date(displayProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                disabled
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                            />
                        </div>
                        <div className="pt-4 border-t border-neutral-200">
                            <button
                                onClick={handleSignOut}
                                className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AccountPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
            <AccountPageContent />
        </Suspense>
    )
}
