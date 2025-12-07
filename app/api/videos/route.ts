import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        // Get user from Authorization header or skip auth for development
        const authHeader = request.headers.get('authorization')
        let userId = null

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
            if (!error && user) {
                userId = user.id
            }
        }

        // For development, allow fetching all videos if no user
        if (!userId) {
            // Return empty array for now - in production this should require auth
            return NextResponse.json({ videos: [] })
        }

        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || 'last24h'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let query = supabaseAdmin
            .from('videos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        // Apply date filters
        const now = new Date()

        if (timeRange === 'last24h') {
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            query = query.gte('created_at', yesterday.toISOString())
        } else if (timeRange === 'today') {
            const todayStart = new Date(now.setHours(0, 0, 0, 0))
            query = query.gte('created_at', todayStart.toISOString())
        } else if (timeRange === 'custom' && startDate && endDate) {
            query = query
                .gte('created_at', new Date(startDate).toISOString())
                .lte('created_at', new Date(endDate + 'T23:59:59').toISOString())
        }

        const { data, error } = await query

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch videos' },
                { status: 500 }
            )
        }

        return NextResponse.json({ videos: data || [] })
    } catch (error) {
        console.error('Videos API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        )
    }
}
