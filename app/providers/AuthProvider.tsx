'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'

interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    subscription_tier: 'free' | 'pro' | 'unlimited'
    videos_generated_this_month: number
    billing_cycle_start: string
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<any>
    signUpWithEmail: (email: string, password: string) => Promise<any>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId: string) => {
        console.log('fetchProfile called for userId:', userId)

        try {
            console.log('Executing query...')
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)

            console.log('Profile fetch result:', { data, error })

            if (error) {
                console.error('Error fetching profile:', error)
                setProfile(null)
                setLoading(false)
                return
            }

            // data is an array, get first item
            const profileData = data && data.length > 0 ? data[0] : null

            if (profileData) {
                console.log('Profile loaded successfully:', profileData)
                setProfile(profileData)
            } else {
                console.log('Profile not found')
                setProfile(null)
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error)
            setProfile(null)
        } finally {
            console.log('Setting loading to false')
            setLoading(false)
        }
    }

    const refreshProfile = async () => {
        if (user) {
            console.log('Refreshing profile for user:', user.id)
            // Force a fresh fetch by adding timestamp to bypass any caching
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error refreshing profile:', error)
                return
            }

            if (data) {
                console.log('Profile refreshed:', data)
                setProfile(data)
            }
        }
    }

    useEffect(() => {
        const initAuth = async () => {
            console.log('AuthProvider: Initializing...')
            const { data: { session }, error } = await supabase.auth.getSession()
            console.log('Initial session check:', { session: session?.user?.email, error })

            if (session?.user) {
                setUser(session.user)
                // Profile will be loaded by individual pages to avoid infinite loop
                setLoading(false)
            } else {
                console.log('No user found')
                setLoading(false)
            }
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email)
            if (session?.user) {
                setUser(session.user)
                // Profile will be loaded by individual pages
                setLoading(false)
            } else {
                setUser(null)
                setProfile(null)
                setLoading(false)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    skipBrowserRedirect: false,
                },
            })
            if (error) {
                console.error('Error signing in with Google:', error)
            }
            console.log('OAuth initiated:', data)
        } catch (error) {
            console.error('OAuth error:', error)
        }
    }

    const signInWithEmail = async (email: string, password: string) => {
        console.log('SignIn attempt:', email)
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        console.log('SignIn result:', { data, error })
        if (!error && data.user) {
            setUser(data.user)
        }
        return { data, error }
    }

    const signUpWithEmail = async (email: string, password: string) => {
        console.log('SignUp attempt:', email)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        console.log('SignUp result:', { data, error })
        if (!error && data.user) {
            console.log('User created:', data.user.id)
            setUser(data.user)
        } else if (error) {
            console.error('SignUp error:', error)
        }
        return { data, error }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}
