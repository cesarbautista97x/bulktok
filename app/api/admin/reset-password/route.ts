import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin endpoint to reset user password (DEVELOPMENT ONLY)
// Remove this file before going to production!

export async function POST(request: Request) {
    try {
        const { email, newPassword } = await request.json()

        if (!email || !newPassword) {
            return NextResponse.json(
                { error: 'Email and newPassword are required' },
                { status: 400 }
            )
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Get user by email
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) {
            return NextResponse.json(
                { error: 'Failed to list users', details: listError.message },
                { status: 500 }
            )
        }

        const user = users.users.find(u => u.email === email)

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Update user password
        const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        )

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to update password', details: updateError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
            email: email,
            newPassword: newPassword
        })

    } catch (error) {
        console.error('Admin reset password error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
