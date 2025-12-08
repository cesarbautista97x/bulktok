import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, type, ip, timestamp } = await request.json()

        // Log the security event
        console.log('🔔 Security Notification:', {
            email,
            type,
            ip,
            timestamp,
            message: type === 'api_key_changed'
                ? `API Key was changed from IP ${ip}`
                : 'Unknown security event'
        })

        // TODO: Implement actual email sending with Resend, SendGrid, or similar
        // For now, we just log it

        // Example with Resend (uncomment when you add RESEND_API_KEY to .env):
        /*
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        await resend.emails.send({
            from: 'security@bulktok.com',
            to: email,
            subject: '⚠️ Security Alert: API Key Changed',
            html: `
                <h2>Security Alert</h2>
                <p>Your Hedra API key was changed.</p>
                <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${ip}</p>
                <p>If this wasn't you, please secure your account immediately.</p>
            `
        })
        */

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Notification error:', error)
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        )
    }
}
