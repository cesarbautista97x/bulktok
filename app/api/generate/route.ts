import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHedraClient } from '@/lib/hedra-client'

export const maxDuration = 60 // Maximum execution time for Vercel Pro
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        console.log('=== Starting video generation ===')

        // Get user from Authorization header
        const authHeader = request.headers.get('authorization')
        let user = null

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)
            if (!error && authUser) {
                user = authUser
            }
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        console.log(`User authenticated: ${user.email}`)

        // Get user profile and check usage limits
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            )
        }

        // Check Hedra API key
        const apiKey = request.headers.get('x-hedra-api-key') || profile.hedra_api_key

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Hedra API key not configured. Please add it in your account settings.' },
                { status: 400 }
            )
        }

        // Check tier limits
        const limits = {
            free: 5,
            pro: 300,
            unlimited: 999999
        }

        const userLimit = limits[profile.subscription_tier as keyof typeof limits] || 5
        const currentUsage = profile.videos_generated_this_month || 0

        console.log(`Tier: ${profile.subscription_tier}, Usage: ${currentUsage}/${userLimit}`)

        // Parse form data
        const formData = await request.formData()
        const images = formData.getAll('images') as File[]
        const audio = formData.get('audio') as File
        const prompt = formData.get('prompt') as string
        const aspectRatio = formData.get('aspectRatio') as string || '16:9'
        const resolution = formData.get('resolution') as string || '720p'

        if (!images || images.length === 0) {
            return NextResponse.json(
                { error: 'No images provided' },
                { status: 400 }
            )
        }

        if (!audio) {
            return NextResponse.json(
                { error: 'No audio provided' },
                { status: 400 }
            )
        }

        const videosToGenerate = images.length
        const remaining = userLimit - currentUsage

        console.log(`Attempting to generate ${videosToGenerate} videos, ${remaining} remaining`)

        // Check if user has enough quota
        if (videosToGenerate > remaining) {
            return NextResponse.json({
                error: `You've reached your monthly limit of ${userLimit} videos. Upgrade to generate more.`,
                limit_reached: true,
                current_tier: profile.subscription_tier,
                current_usage: currentUsage,
                limit: userLimit,
                remaining: remaining
            }, { status: 403 })
        }

        // Convert files to buffers
        const imageBuffers = await Promise.all(
            images.map(async (img) => ({
                buffer: Buffer.from(await img.arrayBuffer()),
                filename: img.name
            }))
        )

        const audioBuffer = {
            buffer: Buffer.from(await audio.arrayBuffer()),
            filename: audio.name
        }

        console.log(`Processing ${imageBuffers.length} images with audio ${audioBuffer.filename}`)

        // Create Hedra client and generate videos
        const hedraClient = createHedraClient(apiKey)

        const jobs = await hedraClient.generateBulkVideos({
            images: imageBuffers,
            audio: audioBuffer,
            aspectRatio,
            prompt
        })

        console.log(`Generated ${jobs.length} video jobs`)

        // Update usage counter
        const newUsage = currentUsage + jobs.length

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                videos_generated_this_month: newUsage
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Error updating usage counter:', updateError)
        } else {
            console.log(`Updated usage: ${newUsage}/${userLimit}`)
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: `${jobs.length} videos queued for generation`,
            jobs: jobs.map(job => ({
                id: job.jobId,
                status: 'pending',
                imageFilename: job.imageFilename
            })),
            usage: {
                current: newUsage,
                limit: userLimit,
                remaining: userLimit - newUsage
            }
        })

    } catch (error) {
        console.error('=== Generate API Error ===')
        console.error('Error details:', error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

        return NextResponse.json(
            {
                error: 'Failed to generate videos',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
