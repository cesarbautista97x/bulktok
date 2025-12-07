import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // List all prices
        const prices = await stripe.prices.list({
            limit: 100,
            active: true,
        })

        const priceDetails = prices.data.map(price => ({
            id: price.id,
            product: price.product,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency,
            recurring: price.recurring?.interval,
            active: price.active,
        }))

        // Get configured price IDs
        const configuredPrices = {
            pro: process.env.STRIPE_PRICE_ID_PRO,
            unlimited: process.env.STRIPE_PRICE_ID_UNLIMITED,
        }

        // Check if configured prices exist
        const proExists = prices.data.find(p => p.id === configuredPrices.pro)
        const unlimitedExists = prices.data.find(p => p.id === configuredPrices.unlimited)

        return NextResponse.json({
            configured: configuredPrices,
            validation: {
                pro: proExists ? 'EXISTS' : 'NOT_FOUND',
                unlimited: unlimitedExists ? 'EXISTS' : 'NOT_FOUND',
            },
            all_prices: priceDetails,
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
