import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, newPassword } = await request.json()

        if (!email || !newPassword) {
            return NextResponse.json({ error: 'Email and new password required' }, { status: 400 })
        }

        // Get user by email
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Update password using admin API
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            profile.id,
            { password: newPassword }
        )

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
            user: data.user
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
