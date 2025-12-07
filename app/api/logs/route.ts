import { NextRequest, NextResponse } from 'next/server'
import { logStore } from '@/lib/log-store'

export async function GET() {
    return NextResponse.json({ logs: logStore.getLogs() })
}

export async function POST(request: NextRequest) {
    const { level, message } = await request.json()
    logStore.addLog(level, message)
    return NextResponse.json({ success: true })
}

export async function DELETE() {
    logStore.clearLogs()
    return NextResponse.json({ success: true })
}
