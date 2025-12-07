import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Test endpoint to check Hedra API key and fetch videos
 * Access at: http://localhost:3000/api/test-hedra-full
 */
export async function GET(request: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: { passed: 0, failed: 0 }
    }

    // Test 1: Get Hedra API key from database
    const test1 = { name: 'Get Hedra API Key from DB', status: 'pending', details: {} }
    let hedraApiKey = null
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('hedra_api_key, email')
            .not('hedra_api_key', 'is', null)
            .limit(1)
            .single()

        if (error || !data) {
            test1.status = 'failed'
            test1.details = { error: error?.message || 'No profiles with API key found' }
            results.summary.failed++
        } else {
            hedraApiKey = data.hedra_api_key
            test1.status = 'passed'
            test1.details = {
                email: data.email,
                keyLength: hedraApiKey?.length || 0,
                keyPreview: hedraApiKey ? `${hedraApiKey.substring(0, 10)}...${hedraApiKey.substring(hedraApiKey.length - 4)}` : null
            }
            results.summary.passed++
        }
    } catch (error: any) {
        test1.status = 'failed'
        test1.details = { error: error.message }
        results.summary.failed++
    }
    results.tests.push(test1)

    // Test 2: Test Hedra API directly
    const test2 = { name: 'Test Hedra API Direct', status: 'pending', details: {} }
    if (hedraApiKey) {
        try {
            const hedraResponse = await fetch('https://api.hedra.com/web-app/public/generations', {
                method: 'GET',
                headers: {
                    'X-API-Key': hedraApiKey.trim(),
                    'Content-Type': 'application/json',
                }
            })

            const hedraData = await hedraResponse.json()

            if (hedraResponse.ok) {
                test2.status = 'passed'
                test2.details = {
                    statusCode: hedraResponse.status,
                    videosCount: hedraData.data?.length || 0,
                    videos: hedraData.data?.slice(0, 3).map((v: any) => ({
                        id: v.id,
                        status: v.status,
                        created_at: v.created_at,
                        has_video: !!v.asset?.asset?.url,
                        has_thumbnail: !!v.asset?.thumbnail_url
                    }))
                }
                results.summary.passed++
            } else {
                test2.status = 'failed'
                test2.details = {
                    statusCode: hedraResponse.status,
                    error: hedraData
                }
                results.summary.failed++
            }
        } catch (error: any) {
            test2.status = 'failed'
            test2.details = { error: error.message }
            results.summary.failed++
        }
    } else {
        test2.status = 'skipped'
        test2.details = { reason: 'No API key available' }
    }
    results.tests.push(test2)

    // Test 3: Test /api/hedra/videos endpoint
    const test3 = { name: 'Test /api/hedra/videos Endpoint', status: 'pending', details: {} }
    if (hedraApiKey) {
        try {
            const baseUrl = request.url.replace('/api/test-hedra-full', '')
            const response = await fetch(`${baseUrl}/api/hedra/videos`, {
                headers: {
                    'x-hedra-api-key': hedraApiKey
                }
            })

            const data = await response.json()

            if (response.ok) {
                test3.status = 'passed'
                test3.details = {
                    statusCode: response.status,
                    videosCount: data.videos?.length || 0,
                    videos: data.videos?.slice(0, 3)
                }
                results.summary.passed++
            } else {
                test3.status = 'failed'
                test3.details = {
                    statusCode: response.status,
                    error: data
                }
                results.summary.failed++
            }
        } catch (error: any) {
            test3.status = 'failed'
            test3.details = { error: error.message }
            results.summary.failed++
        }
    } else {
        test3.status = 'skipped'
        test3.details = { reason: 'No API key available' }
    }
    results.tests.push(test3)

    return NextResponse.json(results, {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
