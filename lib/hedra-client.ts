// Hedra API Client for Node.js
// Based on official Hedra API endpoints from main.py

export interface HedraAssetResponse {
    id: string
}

export interface HedraGenerationResponse {
    id: string
    status: string
}

export interface HedraVideoStatus {
    status: 'pending' | 'processing' | 'complete' | 'failed'
    files?: Array<{ url: string; name: string }>
    error?: string
}

export class HedraClient {
    private apiKey: string
    private baseUrl: string = 'https://api.hedra.com/web-app/public'

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    /**
     * Create an asset (image or audio)
     */
    private async createAsset(name: string, type: 'image' | 'audio'): Promise<string> {
        const response = await fetch(`${this.baseUrl}/assets`, {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, type }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to create ${type} asset: ${error}`)
        }

        const data = await response.json() as HedraAssetResponse
        return data.id
    }

    /**
     * Upload file to asset
     */
    private async uploadAsset(assetId: string, buffer: Buffer, filename: string): Promise<void> {
        const formData = new FormData()
        const blob = new Blob([new Uint8Array(buffer)])
        formData.append('file', blob, filename)

        const response = await fetch(`${this.baseUrl}/assets/${assetId}/upload`, {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey,
            },
            body: formData,
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to upload asset: ${error}`)
        }
    }

    /**
     * Upload an image to Hedra
     */
    async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
        const assetId = await this.createAsset(filename, 'image')
        await this.uploadAsset(assetId, imageBuffer, filename)
        return assetId
    }

    /**
     * Upload audio to Hedra
     */
    async uploadAudio(audioBuffer: Buffer, filename: string): Promise<string> {
        const assetId = await this.createAsset(filename, 'audio')
        await this.uploadAsset(assetId, audioBuffer, filename)
        return assetId
    }

    /**
     * Generate a video
     */
    async generateVideo(params: {
        imageId: string
        audioId: string
        aspectRatio: string
        resolution: string
        textPrompt?: string
        aiModelId?: string
    }): Promise<string> {
        const body = {
            type: 'video',
            ai_model_id: params.aiModelId || 'd1dd37a3-e39a-4854-a298-6510289f9cf2',
            start_keyframe_id: params.imageId,
            audio_id: params.audioId,
            generated_video_inputs: {
                text_prompt: params.textPrompt || '',
                resolution: params.resolution,
                aspect_ratio: params.aspectRatio,
            },
        }

        const response = await fetch(`${this.baseUrl}/generations`, {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to generate video: ${error}`)
        }

        const data = await response.json() as HedraGenerationResponse
        return data.id
    }

    /**
     * Check video generation status
     */
    async getVideoStatus(generationId: string): Promise<HedraVideoStatus> {
        const response = await fetch(`${this.baseUrl}/generations/${generationId}/status`, {
            method: 'GET',
            headers: {
                'X-API-Key': this.apiKey,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to get video status: ${error}`)
        }

        const data = await response.json()

        return {
            status: data.status,
            files: data.files,
            error: data.error,
        }
    }

    /**
     * Generate multiple videos from images and audio
     */
    async generateBulkVideos(params: {
        images: Array<{ buffer: Buffer; filename: string }>
        audio: { buffer: Buffer; filename: string }
        aspectRatio: string
        resolution: string
        prompt?: string
    }): Promise<Array<{ jobId: string; imageFilename: string }>> {
        const results: Array<{ jobId: string; imageFilename: string }> = []

        // Upload audio once (shared across all videos)
        console.log('Uploading audio...')
        const audioId = await this.uploadAudio(params.audio.buffer, params.audio.filename)
        console.log('Audio uploaded:', audioId)

        // Process each image
        for (const image of params.images) {
            try {
                console.log(`Processing image: ${image.filename}`)

                // Upload image
                const imageId = await this.uploadImage(image.buffer, image.filename)
                console.log(`Image uploaded: ${imageId}`)

                // Generate video
                const jobId = await this.generateVideo({
                    imageId,
                    audioId,
                    aspectRatio: params.aspectRatio,
                    resolution: params.resolution,
                    textPrompt: params.prompt,
                })
                console.log(`Video generation started: ${jobId}`)

                results.push({
                    jobId,
                    imageFilename: image.filename,
                })
            } catch (error) {
                console.error(`Failed to process ${image.filename}:`, error)
                // Continue with other images even if one fails
            }
        }

        return results
    }
}

/**
 * Create a Hedra client instance
 */
export function createHedraClient(apiKey: string): HedraClient {
    return new HedraClient(apiKey)
}
