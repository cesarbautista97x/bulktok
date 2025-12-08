'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

export default function PricingPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleSelectPlan = async (tier: 'pro' | 'unlimited') => {
        if (!user) {
            toast.error('Please log in first')
            router.push('/login')
            return
        }

        setIsLoading(tier)
        toast.info('Redirecting to checkout...')

        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tier,
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
            toast.error(error.message || 'Failed to start checkout')
            setIsLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-neutral-900 mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                        Choose the plan that fits your needs. Upgrade or downgrade at any time.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Pro Plan */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 p-8 hover:border-primary-300 transition-all duration-300">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Pro Plan</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-neutral-900">$9.97</span>
                                <span className="text-neutral-600">/month</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-neutral-600 mb-6">
                                Perfect for creators getting started with automated video generation.
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700">
                                        <strong>100 videos per month</strong> - Generate up to 100 high-quality videos
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700">
                                        <strong>Bulk upload</strong> - Upload multiple audios and images at once
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700">
                                        <strong>Automated generation</strong> - Set it and forget it
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700">
                                        <strong>Easy downloads</strong> - Download all your videos with one click
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700">
                                        <strong>Priority support</strong> - Get help when you need it
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => handleSelectPlan('pro')}
                            disabled={isLoading === 'pro'}
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading === 'pro' ? 'Processing...' : 'Get Started with Pro'}
                        </button>
                    </div>

                    {/* Unlimited Plan */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-2xl border-2 border-purple-400 p-8 relative overflow-hidden transform hover:scale-105 transition-all duration-300">
                        {/* Popular Badge */}
                        <div className="absolute top-0 right-0 bg-yellow-400 text-purple-900 font-bold px-4 py-1 rounded-bl-xl">
                            MOST POPULAR
                        </div>

                        <div className="mb-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">Unlimited Plan</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold">$29.97</span>
                                <span className="text-purple-100">/month</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-purple-100 mb-6">
                                For serious creators who need unlimited video generation power.
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">
                                        <strong>UNLIMITED videos</strong> - Generate as many videos as you want
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">
                                        <strong>No restrictions</strong> - No limits, no worries
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">
                                        <strong>Bulk upload</strong> - Upload hundreds of files at once
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">
                                        <strong>Automated generation</strong> - Fully automated workflow
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">
                                        <strong>Priority support</strong> - Get VIP support
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">
                                        <strong>Early access</strong> - Get new features first
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => handleSelectPlan('unlimited')}
                            disabled={isLoading === 'unlimited'}
                            className="w-full bg-white text-purple-600 font-bold py-4 px-6 rounded-xl hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading === 'unlimited' ? 'Processing...' : 'Get Unlimited Access'}
                        </button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                Can I cancel anytime?
                            </h3>
                            <p className="text-neutral-600">
                                Yes! You can cancel your subscription at any time. You'll retain access until the end of your billing period.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                What happens if I exceed my Pro plan limit?
                            </h3>
                            <p className="text-neutral-600">
                                If you reach 100 videos on the Pro plan, you can upgrade to Unlimited at any time or wait until next month when your limit resets.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                Do I need a Hedra API key?
                            </h3>
                            <p className="text-neutral-600">
                                Yes, you'll need your own Hedra API key to generate videos. You can get one for free at hedra.com. We'll guide you through the setup process.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                Can I switch plans?
                            </h3>
                            <p className="text-neutral-600">
                                Absolutely! You can upgrade or downgrade your plan at any time from your Account page.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center">
                    <p className="text-neutral-600 mb-4">
                        Already have an account?
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="text-primary-600 hover:text-primary-700 font-semibold underline"
                    >
                        Sign in to your account
                    </button>
                </div>
            </div>
        </div>
    )
}
