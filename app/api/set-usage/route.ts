import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Manually set usage counter for testing
 * Usage: POST /api/set-usage with { email, count }
 */
export async function POST(request: NextRequest) {
    try {
        const { email, count } = await request.json()

        if (!email || count === undefined) {
            return NextResponse.json(
                { error: 'Email and count are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ videos_generated_this_month: count })
            .ilike('email', `%${email}%`)
            .select()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            updated: data
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
