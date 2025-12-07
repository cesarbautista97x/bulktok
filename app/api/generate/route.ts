import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'
import { supabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'
import { logStore } from '@/lib/log-store'
import { registerProcess } from '@/lib/cleanup'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/bulktok-uploads'
const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || 'python3'
const MAIN_PY_PATH = process.env.MAIN_PY_PATH || '/Users/cesar/Automate/hedra-bulk/main.py'
const BULK_PY_PATH = process.env.BULK_PY_PATH || '/Users/cesar/Automate/hedra-bulk/bulk.py'

export async function POST(request: NextRequest) {
    try {
        logStore.addLog('info', '=== Iniciando generación de videos ===')

        // Get user from Authorization header or session
        const authHeader = request.headers.get('authorization')
        let user = null

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)
            if (!error && authUser) {
                user = authUser
            }
        }

        // If no bearer token, try to get from cookie-based session
        if (!user) {
            // For now, we'll skip auth check in development
            // In production, this should be enforced
            logStore.addLog('error', '⚠️ NO USER AUTHENTICATED - Cannot track usage or enforce limits!')
        } else {
            logStore.addLog('success', `✅ User authenticated: ${user.email} (ID: ${user.id})`)
        }

        // Get user profile and check usage limits (skip if no user)
        let profile = null
        if (user) {
            const { data: profileData, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError || !profileData) {
                logStore.addLog('error', 'No se encontró perfil de usuario')
                return NextResponse.json(
                    { error: 'User profile not found' },
                    { status: 404 }
                )
            }
            profile = profileData
        }



        // Get API key from request header or environment
        const apiKey = request.headers.get('x-hedra-api-key') || process.env.HEDRA_API_KEY

        if (!apiKey) {
            logStore.addLog('error', 'No se encontró API key de Hedra. Ve a Settings para configurarla.')
            return NextResponse.json(
                { error: 'Hedra API key not configured. Please add it in Settings.' },
                { status: 400 }
            )
        }

        logStore.addLog('success', `API key encontrada: ${apiKey.substring(0, 10)}...`)

        // Parse multipart form data
        logStore.addLog('info', 'Parseando datos del formulario...')
        const formData = await request.formData()
        const images = formData.getAll('images') as File[]
        const audio = formData.get('audio') as File
        const prompt = formData.get('prompt') as string
        const aspectRatio = formData.get('aspectRatio') as string
        const resolution = formData.get('resolution') as string

        logStore.addLog('info', `Recibido: ${images.length} imágenes, audio: ${audio?.name}, prompt: ${prompt}`)

        if (!images.length || !audio || !prompt) {
            logStore.addLog('error', 'Faltan campos requeridos')
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check usage limits based on subscription tier (skip if no profile)
        if (profile) {
            const TIER_LIMITS = {
                free: 5,
                pro: 300,
                unlimited: 999999
            } as const

            const userTier = profile.subscription_tier as keyof typeof TIER_LIMITS
            const userLimit = TIER_LIMITS[userTier] || 5
            const currentUsage = profile.videos_generated_this_month || 0
            const videosToGenerate = images.length

            logStore.addLog('info', `Tier: ${userTier}, Uso: ${currentUsage}/${userLimit} videos`)

            // Check if user would exceed limit
            if (currentUsage + videosToGenerate > userLimit) {
                const remaining = Math.max(0, userLimit - currentUsage)
                logStore.addLog('error', `Límite alcanzado para tier ${userTier}: ${currentUsage}/${userLimit}`)

                return NextResponse.json({
                    error: `You've reached your monthly limit of ${userLimit} videos. Upgrade to generate more.`,
                    limit_reached: true,
                    current_tier: userTier,
                    current_usage: currentUsage,
                    limit: userLimit,
                    remaining: remaining
                }, { status: 403 })
            }

            logStore.addLog('success', `Límite OK. Generando ${videosToGenerate} videos. Nuevo total: ${currentUsage + videosToGenerate}/${userLimit}`)

            // Increment usage counter IMMEDIATELY (before generation starts)
            if (user) {
                logStore.addLog('info', 'Actualizando contador de uso...')
                const { error: updateError } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        videos_generated_this_month: currentUsage + videosToGenerate
                    })
                    .eq('id', user.id)

                if (updateError) {
                    logStore.addLog('error', `Error actualizando contador: ${updateError.message}`)
                } else {
                    logStore.addLog('success', `Contador actualizado: ${currentUsage + videosToGenerate}/${userLimit}`)
                }
            }
        } else {
            logStore.addLog('info', 'Sin perfil de usuario - saltando verificación de límites')
        }

        // Create batch directory
        const batchId = randomUUID()
        const batchDir = join(UPLOAD_DIR, batchId)
        const imagesDir = join(batchDir, 'images')

        logStore.addLog('info', `Creando directorios: ${batchDir}`)
        await mkdir(imagesDir, { recursive: true })

        // Save images
        logStore.addLog('info', 'Guardando imágenes...')
        const imagePaths: string[] = []
        for (const image of images) {
            const buffer = Buffer.from(await image.arrayBuffer())
            const imagePath = join(imagesDir, image.name)
            await writeFile(imagePath, buffer)
            imagePaths.push(imagePath)
            logStore.addLog('success', `Imagen guardada: ${image.name}`)
        }

        // Save audio
        logStore.addLog('info', 'Guardando audio...')
        const audioBuffer = Buffer.from(await audio.arrayBuffer())
        const audioPath = join(batchDir, audio.name)
        await writeFile(audioPath, audioBuffer)
        logStore.addLog('success', `Audio guardado: ${audio.name}`)

        // Try to create video records in database (optional - skip if Supabase not configured)
        const videoRecords = []
        const { useSupabase } = await import('@/lib/supabase')

        if (useSupabase) {
            logStore.addLog('info', 'Creando registros en base de datos...')
            for (let i = 0; i < images.length; i++) {
                try {
                    const { data, error } = await supabaseAdmin
                        .from('videos')
                        .insert({
                            user_id: user?.id || null,
                            status: 'queued',
                            aspect_ratio: aspectRatio,
                            resolution: resolution,
                            prompt: prompt,
                            image_name: images[i].name,
                            audio_name: audio.name,
                        })
                        .select()
                        .single()

                    if (error) {
                        console.error('Database error:', error)
                        continue
                    }

                    videoRecords.push(data)
                } catch (dbError) {
                    console.error('Database insert failed:', dbError)
                }
            }

            // Increment usage counter
            if (user && profile) {
                const currentUsage = profile.videos_generated_this_month || 0
                const videosToGenerate = images.length
                const TIER_LIMITS = { free: 5, pro: 300, unlimited: 999999 } as const
                const userTier = profile.subscription_tier as keyof typeof TIER_LIMITS
                const userLimit = TIER_LIMITS[userTier] || 5

                logStore.addLog('info', 'Actualizando contador de uso...')
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        videos_generated_this_month: currentUsage + videosToGenerate
                    })
                    .eq('id', user.id)

                logStore.addLog('success', `Contador actualizado: ${currentUsage + videosToGenerate}/${userLimit}`)
            }
        } else {
            logStore.addLog('info', 'Saltando base de datos (Supabase no configurado)')
            // Create mock records
            for (let i = 0; i < images.length; i++) {
                videoRecords.push({
                    id: randomUUID(),
                    user_id: user?.id || null,
                    status: 'queued',
                    image_name: images[i].name,
                })
            }
        }

        // Set Hedra API key as environment variable for Python script
        process.env.HEDRA_API_KEY = apiKey

        // Spawn Python bulk process in background
        logStore.addLog('info', 'Iniciando proceso Python...')
        const pythonArgs = [
            BULK_PY_PATH,
            '--root', batchDir,
            '--audio_file', audioPath,
            '--text_prompt', prompt,
            '--aspect_ratio', aspectRatio,
            '--resolution', resolution,
            '--main_path', MAIN_PY_PATH,
        ]

        logStore.addLog('info', `Comando Python: ${PYTHON_EXECUTABLE} ${pythonArgs.join(' ')}`)

        const pythonProcess = spawn(PYTHON_EXECUTABLE, pythonArgs, {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, HEDRA_API_KEY: apiKey }
        })

        // Log Python output for debugging
        pythonProcess.stdout?.on('data', (data) => {
            const output = data.toString()
            console.log('Python stdout:', output)
            logStore.addLog('info', `Python: ${output}`)
        })

        pythonProcess.stderr?.on('data', (data) => {
            const output = data.toString()
            console.error('Python stderr:', output)
            logStore.addLog('error', `Python error: ${output}`)
        })

        pythonProcess.on('error', (error) => {
            console.error('Python process error:', error)
            logStore.addLog('error', `Error al ejecutar Python: ${error.message}`)
        })

        pythonProcess.unref()

        // Register process for cleanup tracking
        registerProcess(batchId, pythonProcess)

        // Log the batch for monitoring
        logStore.addLog('success', `✓ Batch ${batchId} iniciado con ${images.length} imágenes`)

        return NextResponse.json({
            success: true,
            batchId,
            videoCount: images.length,
            videoIds: videoRecords.map(v => v.id),
            message: `Started generating ${images.length} videos. This will take 2-5 minutes per video.`
        })
    } catch (error) {
        console.error('=== Generate API Error ===')
        console.error('Error details:', error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        logStore.addLog('error', `Error fatal: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return NextResponse.json(
            {
                error: 'Failed to generate videos',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Note: Background polling removed to prevent memory leaks
// Status updates are now handled by the client polling the videos API endpoint
