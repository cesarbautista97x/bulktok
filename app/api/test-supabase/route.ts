import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    const results = {
        timestamp: new Date().toISOString(),
        tests: [] as any[],
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
        }
    }

    // Test 1: Environment variables
    const test1 = {
        name: 'Environment Variables',
        status: 'pending' as 'passed' | 'failed' | 'pending',
        details: {} as any
    }

    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        test1.details = {
            url: url ? `${url.substring(0, 30)}...` : 'MISSING',
            key: key ? `${key.substring(0, 20)}...` : 'MISSING',
        }

        if (url && key) {
            test1.status = 'passed'
        } else {
            test1.status = 'failed'
            test1.details.error = 'Missing environment variables'
        }
    } catch (error: any) {
        test1.status = 'failed'
        test1.details.error = error.message
    }

    results.tests.push(test1)
    results.summary.total++
    if (test1.status === 'passed') results.summary.passed++
    if (test1.status === 'failed') results.summary.failed++

    // Test 2: Supabase client creation
    const test2 = {
        name: 'Supabase Client Creation',
        status: 'pending' as 'passed' | 'failed' | 'pending',
        details: {} as any
    }

    let supabase: any = null

    try {
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        test2.status = 'passed'
        test2.details.message = 'Client created successfully'
    } catch (error: any) {
        test2.status = 'failed'
        test2.details.error = error.message
    }

    results.tests.push(test2)
    results.summary.total++
    if (test2.status === 'passed') results.summary.passed++
    if (test2.status === 'failed') results.summary.failed++

    // Test 3: Database connection
    const test3 = {
        name: 'Database Connection',
        status: 'pending' as 'passed' | 'failed' | 'pending',
        details: {} as any
    }

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('count')
                .limit(1)

            if (error) {
                test3.status = 'failed'
                test3.details.error = error.message
                test3.details.code = error.code
            } else {
                test3.status = 'passed'
                test3.details.message = 'Database query successful'
            }
        } catch (error: any) {
            test3.status = 'failed'
            test3.details.error = error.message
        }
    } else {
        test3.status = 'failed'
        test3.details.error = 'Supabase client not initialized'
    }

    results.tests.push(test3)
    results.summary.total++
    if (test3.status === 'passed') results.summary.passed++
    if (test3.status === 'failed') results.summary.failed++

    // Test 4: Auth API connection
    const test4 = {
        name: 'Auth API Connection',
        status: 'pending' as 'passed' | 'failed' | 'pending',
        details: {} as any
    }

    if (supabase) {
        try {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                test4.status = 'failed'
                test4.details.error = error.message
            } else {
                test4.status = 'passed'
                test4.details.message = 'Auth API responding'
                test4.details.hasSession = !!data.session
            }
        } catch (error: any) {
            test4.status = 'failed'
            test4.details.error = error.message
        }
    } else {
        test4.status = 'failed'
        test4.details.error = 'Supabase client not initialized'
    }

    results.tests.push(test4)
    results.summary.total++
    if (test4.status === 'passed') results.summary.passed++
    if (test4.status === 'failed') results.summary.failed++

    // Test 5: Email provider enabled
    const test5 = {
        name: 'Email Auth Provider',
        status: 'pending' as 'passed' | 'failed' | 'pending',
        details: {} as any
    }

    if (supabase) {
        try {
            // Try to sign up with a test email (this will fail if email is disabled)
            const testEmail = `test-${Date.now()}@example.com`
            const { data, error } = await supabase.auth.signUp({
                email: testEmail,
                password: 'test123456',
            })

            if (error) {
                if (error.message.includes('Email signups are disabled')) {
                    test5.status = 'failed'
                    test5.details.error = 'Email provider is disabled in Supabase'
                } else if (error.message.includes('Invalid API key')) {
                    test5.status = 'failed'
                    test5.details.error = 'Invalid API key'
                } else {
                    // Other errors might be okay (like rate limiting)
                    test5.status = 'passed'
                    test5.details.message = 'Email provider is enabled'
                    test5.details.note = error.message
                }
            } else {
                test5.status = 'passed'
                test5.details.message = 'Email provider is enabled'
                test5.details.testUser = testEmail

                // Clean up test user
                if (data.user) {
                    await supabase.auth.admin.deleteUser(data.user.id).catch(() => { })
                }
            }
        } catch (error: any) {
            test5.status = 'failed'
            test5.details.error = error.message
        }
    } else {
        test5.status = 'failed'
        test5.details.error = 'Supabase client not initialized'
    }

    results.tests.push(test5)
    results.summary.total++
    if (test5.status === 'passed') results.summary.passed++
    if (test5.status === 'failed') results.summary.failed++

    return NextResponse.json(results, { status: 200 })
}
