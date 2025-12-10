import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Temporary endpoint to clear test customer IDs
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Clear test customer and subscription IDs
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                stripe_customer_id: null,
                stripe_subscription_id: null
            })
            .eq('id', userId)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Test customer ID cleared successfully',
            profile: data[0]
        })

    } catch (error) {
        console.error('Clear customer error:', error)
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 })
    }
}
