import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    console.log('=== CALLBACK HIT ===')
    console.log('Full URL:', requestUrl.href)
    console.log('Code:', code)
    console.log('All params:', Object.fromEntries(requestUrl.searchParams))

    if (!code) {
        console.log('NO CODE - Redirecting to login')
        return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
    }

    console.log('CODE RECEIVED - Redirecting to success')
    return NextResponse.redirect(new URL('/auth/success?code=' + code, requestUrl.origin))
}
