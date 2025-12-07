import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // MIDDLEWARE DISABLED - Session stored in localStorage, not cookies
    // TODO: Configure Supabase to use cookie-based sessions for middleware to work
    return NextResponse.next()
}

export const config = {
    matcher: ['/generate/:path*', '/downloads/:path*', '/settings/:path*', '/account/:path*', '/logs/:path*', '/login'],
}
