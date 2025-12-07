import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Navbar from './components/Navbar'
import { AuthProvider } from './providers/AuthProvider'
import ParticleBackground from './components/ParticleBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'BulkTok - Automate TikTok Video Generation',
    description: 'Generate hundreds of TikTok videos per day using AI. Save hours of manual work.',
    keywords: 'TikTok, video generation, AI, bulk upload, content creation',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ParticleBackground />
                <AuthProvider>
                    <Navbar />
                    <main className="min-h-screen pt-16 relative z-10">
                        {children}
                    </main>
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </body>
        </html>
    )
}
