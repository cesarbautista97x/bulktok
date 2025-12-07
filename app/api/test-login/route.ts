import { supabase } from '@/lib/supabase-client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // Try to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                code: error.status
            }, { status: error.status || 400 })
        }

        return NextResponse.json({
            success: true,
            user: data.user,
            session: data.session
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
