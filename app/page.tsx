'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 relative">

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
                            Automate Your TikTok
                            <span className="block gradient-text">Video Generation</span>
                        </h1>
                        <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
                            Upload your audios and images in bulk. Generate hundreds of professional videos automatically with Hedra AI. Download everything with one click.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => router.push('/login')}
                                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                            >
                                Start Free Trial
                            </button>
                            <button
                                onClick={() => {
                                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className="bg-white text-neutral-900 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-50 transition-all duration-200 shadow-md border-2 border-neutral-200 text-lg"
                            >
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Bulk Upload</h3>
                            <p className="text-neutral-600">Upload hundreds of audios and images at once. No manual work required.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Auto Generate</h3>
                            <p className="text-neutral-600">AI-powered video generation with Hedra. Set it and forget it.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Easy Download</h3>
                            <p className="text-neutral-600">Download all your videos with one click. Filter by date if needed.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Video Section */}
            <div id="demo" className="bg-gradient-to-br from-neutral-50 to-primary-50 py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                            See BulkTok in Action
                        </h2>
                        <p className="text-xl text-neutral-600">
                            Watch how easy it is to generate hundreds of videos automatically
                        </p>
                    </div>

                    {/* Video Player */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="aspect-video bg-neutral-900 flex items-center justify-center relative">
                            {/* Demo Video Placeholder */}
                            <img
                                src="/demo-placeholder.png"
                                alt="BulkTok Demo - Watch how to automate video generation"
                                className="w-full h-full object-cover"
                            />

                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer group">
                                <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </div>

                            {/* When you have a real video, replace the above with: */}
                            {/* 
                            <video 
                                className="w-full h-full" 
                                controls 
                                poster="/demo-placeholder.png"
                            >
                                <source src="/demo-video.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            */}
                        </div>
                    </div>

                    {/* Video Features */}
                    <div className="mt-12 flex justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-2xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-1">Upload in Bulk</h4>
                                    <p className="text-neutral-600 text-sm">Drag and drop hundreds of files at once</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-1">Automatic Processing</h4>
                                    <p className="text-neutral-600 text-sm">AI generates videos while you sleep</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-1">Track Progress</h4>
                                    <p className="text-neutral-600 text-sm">Monitor all your videos in real-time</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-1">Download Everything</h4>
                                    <p className="text-neutral-600 text-sm">Get all videos with one click</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-neutral-600">
                            Choose the plan that fits your needs
                        </p>
                    </div>

                    {/* Pricing Cards - Simplified from pricing page */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Pro Plan */}
                        <div className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 p-8 hover:border-primary-300 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Pro Plan</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-bold text-neutral-900">$19.97</span>
                                <span className="text-neutral-600">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700"><strong>300 videos/month</strong></span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700">Bulk upload</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-neutral-700">Priority support</span>
                                </li>
                            </ul>
                            <Link
                                href="/pricing"
                                className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 text-center"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Unlimited Plan */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-2xl p-8 relative">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-purple-900 font-bold px-4 py-1 rounded-bl-xl text-sm">
                                POPULAR
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Unlimited Plan</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-bold text-white">$29.97</span>
                                <span className="text-purple-100">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white"><strong>UNLIMITED videos</strong></span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">No restrictions</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white">VIP support</span>
                                </li>
                            </ul>
                            <Link
                                href="/pricing"
                                className="block w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-xl hover:bg-purple-50 transition-all duration-200 text-center"
                            >
                                Get Unlimited
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/pricing" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                            View detailed pricing →
                        </Link>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Automate Your Content?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Join creators who are generating hundreds of videos effortlessly
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg text-lg"
                    >
                        Start Your Free Trial
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-neutral-900 text-neutral-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">BulkTok</h3>
                            <p className="text-sm">
                                Automate your TikTok video generation with AI-powered bulk processing.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Sign Up</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="mailto:cesarbautista97x@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-neutral-800 pt-8 text-center text-sm">
                        <p>&copy; 2025 BulkTok. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
