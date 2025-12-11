import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

// Test endpoint to verify Stripe can access the price
export async function GET() {
    try {
        const priceId = process.env.STRIPE_PRICE_ID_PRO

        console.log('Testing Stripe price access...')
        console.log('Price ID:', priceId)
        console.log('Secret Key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 15))

        // Try to retrieve the price directly
        const price = await stripe.prices.retrieve(priceId!)

        return NextResponse.json({
            success: true,
            price: {
                id: price.id,
                active: price.active,
                currency: price.currency,
                unit_amount: price.unit_amount,
                product: price.product,
            }
        })
    } catch (error: any) {
        console.error('Stripe price test error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            type: error.type,
            code: error.code,
            price_id_tested: process.env.STRIPE_PRICE_ID_PRO,
            secret_key_prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 15),
        }, { status: 500 })
    }
}
