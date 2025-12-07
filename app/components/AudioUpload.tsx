'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface AudioUploadProps {
    audio: File | null
    onAudioChange: (file: File | null) => void
}

export default function AudioUpload({ audio, onAudioChange }: AudioUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onAudioChange(acceptedFiles[0])
            }
        },
        [onAudioChange]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a', '.aac'],
        },
        maxFiles: 1,
    })

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="space-y-4">
            {!audio ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-7 h-7 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-base font-medium text-neutral-700">
                                {isDragActive ? 'Drop audio here' : 'Upload audio track'}
                            </p>
                            <p className="text-sm text-neutral-500 mt-1">
                                Drag & drop or click • MP3, WAV, M4A, AAC
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                                {audio.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {formatFileSize(audio.size)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onAudioChange(null)}
                        className="ml-3 p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove audio"
                    >
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    )
}
