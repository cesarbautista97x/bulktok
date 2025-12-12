'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Global error boundary caught:', error)
        }

        // TODO: Log to error monitoring service (Sentry, LogRocket, etc.)
        // logErrorToService(error)
    }, [error])

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center">
                {/* Error Icon */}
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Error Message */}
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Something went wrong
                </h2>
                <p className="text-neutral-600 mb-6">
                    We encountered an unexpected error. Don't worry, your data is safe.
                </p>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-xs font-mono text-neutral-700 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-neutral-500 mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 rounded-lg font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    >
                        Go Home
                    </a>
                </div>

                {/* Support Link */}
                <p className="text-sm text-neutral-500 mt-6">
                    If this persists,{' '}
                    <a
                        href="mailto:nc.nowccom@gmail.com"
                        className="text-primary-600 hover:text-primary-700 underline"
                    >
                        contact support
                    </a>
                </p>
            </div>
        </div>
    )
}
