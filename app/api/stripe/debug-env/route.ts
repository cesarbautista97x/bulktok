import { NextResponse } from 'next/server'

// Diagnostic endpoint to check environment variables
export async function GET() {
    return NextResponse.json({
        stripe_secret_key_prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10),
        is_live_key: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live'),
        stripe_price_id_pro: process.env.STRIPE_PRICE_ID_PRO,
        stripe_price_id_unlimited: process.env.STRIPE_PRICE_ID_UNLIMITED,
        stripe_webhook_secret_prefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10),
        publishable_key_prefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10),
    })
}
