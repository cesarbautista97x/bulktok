import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = createRouteHandlerClient({ cookies })

        // Reset usage for users whose billing cycle has passed (30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        const { data, error } = await supabase
            .from('profiles')
            .update({
                videos_generated_this_month: 0,
                billing_cycle_start: new Date().toISOString(),
            })
            .lte('billing_cycle_start', thirtyDaysAgo)
            .select()

        if (error) {
            console.error('Cron reset error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log(`Reset usage for ${data?.length || 0} users`)

        return NextResponse.json({
            success: true,
            usersReset: data?.length || 0,
            message: `Successfully reset usage for ${data?.length || 0} users`,
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json(
            { error: 'Failed to reset usage' },
            { status: 500 }
        )
    }
}
