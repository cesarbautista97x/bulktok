// Hedra API Client for Node.js
// Direct API calls without Python dependency

export interface HedraUploadResponse {
    url: string
}

export interface HedraGenerationResponse {
    jobId: string
}

export interface HedraVideoStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    videoUrl?: string
    error?: string
}

export class HedraClient {
    private apiKey: string
    private baseUrl: string = 'https://api.hedra.com'

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    /**
     * Upload an image to Hedra
     */
    async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
        const formData = new FormData()
        const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' })
        formData.append('file', blob, filename)

        const response = await fetch(`${this.baseUrl}/v1/portrait`, {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey,
            },
            body: formData,
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to upload image: ${error}`)
        }

        const data = await response.json() as HedraUploadResponse
        return data.url
    }

    /**
     * Upload audio to Hedra
     */
    async uploadAudio(audioBuffer: Buffer, filename: string): Promise<string> {
        const formData = new FormData()
        const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mpeg' })
        formData.append('file', blob, filename)

        const response = await fetch(`${this.baseUrl}/v1/audio`, {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey,
            },
            body: formData,
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to upload audio: ${error}`)
        }

        const data = await response.json() as HedraUploadResponse
        return data.url
    }

    /**
     * Generate a video
     */
    async generateVideo(params: {
        imageUrl: string
        audioUrl: string
        aspectRatio: string
        text?: string
    }): Promise<string> {
        const body = {
            audioSource: params.audioUrl,
            avatarImage: params.imageUrl,
            aspectRatio: params.aspectRatio,
            ...(params.text && { text: params.text }),
        }

        const response = await fetch(`${this.baseUrl}/v1/characters`, {
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
        return data.jobId
    }

    /**
     * Check video generation status
     */
    async getVideoStatus(jobId: string): Promise<HedraVideoStatus> {
        const response = await fetch(`${this.baseUrl}/v1/characters/${jobId}`, {
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
            videoUrl: data.videoUrl,
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
        prompt?: string
    }): Promise<Array<{ jobId: string; imageFilename: string }>> {
        const results: Array<{ jobId: string; imageFilename: string }> = []

        // Upload audio once (shared across all videos)
        const audioUrl = await this.uploadAudio(params.audio.buffer, params.audio.filename)

        // Process each image
        for (const image of params.images) {
            try {
                // Upload image
                const imageUrl = await this.uploadImage(image.buffer, image.filename)

                // Generate video
                const jobId = await this.generateVideo({
                    imageUrl,
                    audioUrl,
                    aspectRatio: params.aspectRatio,
                    text: params.prompt,
                })

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
