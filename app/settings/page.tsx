'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase-client'

export default function SettingsPage() {
    const [hedraApiKey, setHedraApiKey] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Load API key from database
        const loadApiKey = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setIsLoading(false)
                    return
                }

                const response = await fetch(`/api/settings?userId=${user.id}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.hedraApiKey) {
                        setHedraApiKey(data.hedraApiKey)
                    }
                }
            } catch (error) {
                console.error('Error loading API key:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadApiKey()
    }, [])

    const handleSave = async () => {
        const trimmedKey = hedraApiKey.trim()

        if (!trimmedKey) {
            toast.error('Please enter your Hedra API key')
            return
        }

        setIsSaving(true)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('You must be logged in to save settings')
                setIsSaving(false)
                return
            }

            // Save to database
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hedraApiKey: trimmedKey, userId: user.id }),
            })

            if (response.ok) {
                toast.success('API key saved successfully!')
            } else {
                toast.error('Failed to save API key')
            }
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save API key')
        } finally {
            setIsSaving(false)
        }
    }

    const handleTest = async () => {
        const trimmedKey = hedraApiKey.trim()

        if (!trimmedKey) {
            toast.error('Please enter your Hedra API key first')
            return
        }

        toast.info('Testing API key...')

        try {
            const response = await fetch('/api/test-hedra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: trimmedKey }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('✅ API key is valid!')
            } else {
                toast.error(`❌ ${data.error || 'API key test failed'}`)
            }
        } catch (error) {
            console.error('Test error:', error)
            toast.error('Failed to test API key - check your internet connection')
        }
    }

    const maskApiKey = (key: string) => {
        if (!key || key.length < 8) return key
        return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 py-8 flex items-center justify-center">
                <div className="text-neutral-600">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
                    <p className="text-neutral-600">Configure your API keys and preferences</p>
                </div>

                {/* API Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                        Hedra API Configuration
                    </h2>

                    <div className="space-y-4">
                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium mb-1">Get your Hedra API key:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                                        <li>Sign up at <a href="https://hedra.com" target="_blank" rel="noopener noreferrer" className="underline">hedra.com</a></li>
                                        <li>Go to your dashboard</li>
                                        <li>Copy your API key</li>
                                        <li>Paste it below and click "Save"</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* API Key Input */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Hedra API Key
                            </label>
                            <input
                                type="password"
                                value={hedraApiKey}
                                onChange={(e) => setHedraApiKey(e.target.value)}
                                placeholder="Enter your Hedra API key"
                                className="input-field font-mono text-sm"
                            />
                            {hedraApiKey && (
                                <p className="text-xs text-neutral-500 mt-2">
                                    Current key: {maskApiKey(hedraApiKey)}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary"
                            >
                                {isSaving ? (
                                    <span className="flex items-center space-x-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                    </span>
                                ) : (
                                    'Save API Key'
                                )}
                            </button>
                        </div>

                        {/* Info about testing */}
                        <div className="mt-4 text-sm text-neutral-600">
                            <p>💡 <strong>Tip:</strong> Your API key will be validated when you generate your first video. Check the Logs page to see if it works correctly.</p>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                        Connection Status
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                            <span className="text-sm text-neutral-600">Hedra API</span>
                            <span className={`text-sm font-medium ${hedraApiKey ? 'text-green-600' : 'text-neutral-400'}`}>
                                {hedraApiKey ? '✓ Configured' : '○ Not configured'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                            <span className="text-sm text-neutral-600">Python Scripts</span>
                            <span className="text-sm font-medium text-green-600">✓ Available</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-neutral-600">Upload Directory</span>
                            <span className="text-sm font-medium text-green-600">✓ Ready</span>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                {!hedraApiKey && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="text-sm text-yellow-900">
                                <p className="font-medium mb-1">⚠️ API Key Required</p>
                                <p className="text-yellow-800">
                                    You need to configure your Hedra API key before you can generate videos.
                                    The app will work for testing, but video generation will fail without a valid API key.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
