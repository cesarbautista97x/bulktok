'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
    images: File[]
    onImagesChange: (files: File[]) => void
    maxFiles?: number
}

export default function ImageUpload({
    images,
    onImagesChange,
    maxFiles = 50,
}: ImageUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newImages = [...images, ...acceptedFiles].slice(0, maxFiles)
            onImagesChange(newImages)
        },
        [images, maxFiles, onImagesChange]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        },
        maxFiles: maxFiles - images.length,
    })

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
    }

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-lg font-medium text-neutral-700">
                            {isDragActive ? 'Drop images here' : 'Upload your images'}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                            Drag & drop or click to browse • PNG, JPG, WEBP
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                            {images.length} / {maxFiles} images uploaded
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {images.map((file, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                <button
                                    onClick={() => removeImage(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                                    aria-label="Remove image"
                                >
                                    <svg
                                        className="w-4 h-4"
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
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-white text-xs truncate">{file.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
