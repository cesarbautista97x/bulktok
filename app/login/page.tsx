'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase-client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(true)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signInWithEmail, signUpWithEmail, user } = useAuth()
    const router = useRouter()

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/account')
        }
    }, [user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                })
                if (error) {
                    toast.error(error.message)
                } else {
                    toast.success('Password reset email sent! Check your inbox.')
                    setIsForgotPassword(false)
                }
            } else if (isSignUp) {
                const { error } = await signUpWithEmail(email, password)
                if (error) {
                    toast.error(error.message)
                } else {
                    toast.success('Account created successfully!')
                    router.push('/account')
                }
            } else {
                const { error } = await signInWithEmail(email, password)
                if (error) {
                    toast.error(error.message)
                } else {
                    router.push('/account')
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-2">BulkTok</h1>
                    <p className="text-neutral-600">
                        {isForgotPassword ? 'Reset your password' : (isSignUp ? 'Create your account' : 'Sign in to your account')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="you@example.com"
                        />
                    </div>

                    {!isForgotPassword && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3"
                    >
                        {loading ? 'Loading...' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In'))}
                    </button>
                </form>



                <div className="mt-6 space-y-2 text-center">
                    {!isForgotPassword && (
                        <>
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="block w-full text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </button>
                            {!isSignUp && (
                                <button
                                    onClick={() => setIsForgotPassword(true)}
                                    className="block w-full text-neutral-600 hover:text-neutral-700 text-sm"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </>
                    )}
                    {isForgotPassword && (
                        <button
                            onClick={() => setIsForgotPassword(false)}
                            className="block w-full text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                            Back to sign in
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
