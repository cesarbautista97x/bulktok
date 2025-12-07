import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for local development
// In production (Vercel), these will be replaced with actual env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atbtrkdnxkaoldtlfety.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0YnRya2RueGthb2xkdGxmZXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTY5NTUsImV4cCI6MjA4MDQ5Mjk1NX0.ugKUEldE1XLUKwEg6dZqy3ES54rlhqK2l6cceccc2SU'

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. ' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    )
}

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
})
