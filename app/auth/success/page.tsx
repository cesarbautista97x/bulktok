'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function AuthSuccessPage() {
    const router = useRouter()

    useEffect(() => {
        const handleSession = async () => {
            // Get the temporary session from cookie
            const cookies = document.cookie.split(';')
            const tempSessionCookie = cookies.find(c => c.trim().startsWith('temp_session='))

            if (tempSessionCookie) {
                try {
                    const sessionData = JSON.parse(decodeURIComponent(tempSessionCookie.split('=')[1]))

                    // Set the session in Supabase client
                    await supabase.auth.setSession({
                        access_token: sessionData.access_token,
                        refresh_token: sessionData.refresh_token,
                    })

                    // Delete the temporary cookie
                    document.cookie = 'temp_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

                    // Redirect to account
                    router.push('/account')
                } catch (error) {
                    console.error('Error setting session:', error)
                    router.push('/login?error=session_failed')
                }
            } else {
                router.push('/login?error=no_session')
            }
        }

        handleSession()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Completing sign in...</p>
            </div>
        </div>
    )
}
