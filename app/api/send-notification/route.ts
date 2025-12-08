import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, type, ip, timestamp } = await request.json()

        // Admin email for notifications
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-email@example.com'

        // Log the security event
        console.log('🔔 Security Alert:', {
            userEmail: email,
            type,
            ip,
            timestamp,
            message: type === 'api_key_changed'
                ? `User ${email} changed API Key from IP ${ip}`
                : 'Unknown security event'
        })

        // TODO: Send email to ADMIN (not user)
        // This notifies YOU when someone changes their API key

        // Example with Resend (uncomment when you add RESEND_API_KEY to .env):
        /*
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        await resend.emails.send({
            from: 'alerts@bulktok.com',
            to: ADMIN_EMAIL,  // Send to YOU, not the user
            subject: '⚠️ BulkTok Alert: User Changed API Key',
            html: `
                <h2>API Key Change Alert</h2>
                <p>A user has changed their Hedra API key.</p>
                <hr/>
                <p><strong>User:</strong> ${email}</p>
                <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${ip}</p>
                <hr/>
                <p><small>This could indicate account sharing. Review if necessary.</small></p>
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
