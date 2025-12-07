'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '../providers/AuthProvider'
import ImageUpload from '../components/ImageUpload'
import AudioUpload from '../components/AudioUpload'
import ProgressBar from '../components/ProgressBar'

export default function GeneratePage() {
    const router = useRouter()
    const { user } = useAuth()
    const [profile, setProfile] = useState<any>(null)
    const [images, setImages] = useState<File[]>([])
    const [audio, setAudio] = useState<File | null>(null)
    const [prompt, setPrompt] = useState('')
    const [aspectRatio, setAspectRatio] = useState('9:16')
    const [resolution, setResolution] = useState('540p')
    const [isGenerating, setIsGenerating] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    // Load profile data
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!error && data) {
                setProfile(data)
            }
        }

        loadProfile()
    }, [user])

    const handleGenerate = async () => {
        // Validation
        if (images.length === 0) {
            toast.error('Please upload at least one image')
            return
        }
        if (!audio) {
            toast.error('Please upload an audio file')
            return
        }
        if (!prompt.trim()) {
            toast.error('Please enter a text prompt')
            return
        }

        setIsGenerating(true)
        setUploadProgress(0)

        try {
            const formData = new FormData()

            // Add images
            images.forEach((image, index) => {
                formData.append('images', image)
            })

            // Add audio
            formData.append('audio', audio)

            // Add metadata
            formData.append('prompt', prompt)
            formData.append('aspectRatio', aspectRatio)
            formData.append('resolution', resolution)

            // Get session token for authentication
            const { data: { session } } = await supabase.auth.getSession()
            const headers: HeadersInit = {}
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return prev
                    }
                    return prev + 10
                })
            }, 200)

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    ...headers,
                    'x-hedra-api-key': localStorage.getItem('hedra_api_key') || '',
                },
                body: formData,
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            const data = await response.json()

            if (!response.ok) {
                // Handle tier limit error with upgrade prompt
                if (data.limit_reached) {
                    toast.error(
                        data.error,
                        {
                            duration: 7000,
                            action: {
                                label: 'Upgrade Now',
                                onClick: () => router.push('/account')
                            }
                        }
                    )
                } else {
                    // Regular error handling
                    const errorMessage = data.error || data.details || 'Failed to generate videos'
                    toast.error(errorMessage)
                }
                setIsGenerating(false)
                setUploadProgress(0)
                return
            }

            toast.success(
                `${images.length} videos are being generated — this usually takes 2–5 minutes per video.`,
                { duration: 5000 }
            )

            // Reset form
            setTimeout(() => {
                setImages([])
                setAudio(null)
                setPrompt('')
                setIsGenerating(false)
                setUploadProgress(0)
            }, 1000)
        } catch (error) {
            console.error('Generation error:', error)
            toast.error('Failed to start video generation. Please try again.')
            setIsGenerating(false)
            setUploadProgress(0)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Generate Videos
                    </h1>
                    <p className="text-neutral-600">
                        Upload your images and audio. Generate videos automatically.
                    </p>
                    {/* Debug info - remove later */}
                    {!profile && user && (
                        <p className="text-xs text-red-600 mt-2">
                            Debug: User logged in but profile not loaded. User ID: {user.id}
                        </p>
                    )}
                    {!user && (
                        <p className="text-xs text-red-600 mt-2">
                            Debug: No user logged in
                        </p>
                    )}
                </div>

                {/* Usage Counter */}
                {profile && (
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-primary-900 mb-1">
                                    Monthly Usage
                                </h3>
                                <p className="text-2xl font-bold text-primary-600">
                                    {profile.videos_generated_this_month || 0} / {
                                        profile.subscription_tier === 'pro' ? 300 :
                                            profile.subscription_tier === 'unlimited' ? '∞' :
                                                5
                                    }
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-primary-700 mb-1">
                                    {profile.subscription_tier === 'free' ? '🆓 Free Plan' :
                                        profile.subscription_tier === 'pro' ? '💎 Pro Plan' :
                                            '♾️ Unlimited Plan'}
                                </p>
                                <p className="text-xs text-primary-600">
                                    {profile.subscription_tier === 'free' &&
                                        `${Math.max(0, 5 - (profile.videos_generated_this_month || 0))} videos remaining`
                                    }
                                    {profile.subscription_tier === 'pro' &&
                                        `${Math.max(0, 300 - (profile.videos_generated_this_month || 0))} videos remaining`
                                    }
                                    {profile.subscription_tier === 'unlimited' &&
                                        'Unlimited videos'
                                    }
                                </p>
                            </div>
                        </div>
                        {profile.subscription_tier === 'free' && (profile.videos_generated_this_month || 0) >= 4 && (
                            <div className="mt-4 pt-4 border-t border-primary-200">
                                <p className="text-sm text-primary-800 mb-2">
                                    ⚠️ You're running low on videos. Upgrade for more!
                                </p>
                                <button
                                    onClick={() => router.push('/account')}
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 underline"
                                >
                                    View Plans →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Form */}
                <div className="space-y-6">
                    {/* Images Upload */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                            1. Upload Images
                        </h2>
                        <ImageUpload images={images} onImagesChange={setImages} />
                    </div>

                    {/* Audio Upload */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                            2. Upload Audio Track
                        </h2>
                        <AudioUpload audio={audio} onAudioChange={setAudio} />
                    </div>

                    {/* Configuration */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                            3. Configure Settings
                        </h2>
                        <div className="space-y-4">
                            {/* Text Prompt */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Text Prompt
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the video style, mood, or instructions..."
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>

                            {/* Aspect Ratio & Resolution */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Aspect Ratio
                                    </label>
                                    <select
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="9:16">9:16 (Vertical)</option>
                                        <option value="16:9">16:9 (Horizontal)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Resolution
                                    </label>
                                    <select
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="540p">540p (Fast)</option>
                                        <option value="720p">720p (Standard)</option>
                                        <option value="1080p">1080p (High Quality)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {isGenerating && uploadProgress > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 animate-slide-up">
                            <ProgressBar
                                progress={uploadProgress}
                                label="Uploading files..."
                                color="primary"
                            />
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`btn-primary px-8 py-4 text-lg ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isGenerating ? (
                                <span className="flex items-center space-x-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>Generating...</span>
                                </span>
                            ) : (
                                <span className="flex items-center space-x-2">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>Generate Videos</span>
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                            <svg
                                className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="text-sm text-primary-900">
                                <p className="font-medium mb-1">How it works:</p>
                                <ul className="space-y-1 text-primary-800">
                                    <li>• Each image will be paired with your audio track</li>
                                    <li>• Videos typically take 2-5 minutes to generate</li>
                                    <li>• You'll be able to download them from the Downloads page</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
