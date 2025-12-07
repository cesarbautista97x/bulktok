import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        // Update user in auth.users to confirm email
        const { data: users, error: getUserError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (getUserError || !users) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Use Supabase Admin API to update auth.users
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            users.id,
            { email_confirm: true }
        )

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Email confirmed successfully',
            user: data.user
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
