import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atbtrkdnxkaoldtlfety.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0YnRya2RueGthb2xkdGxmZXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTY5NTUsImV4cCI6MjA4MDQ5Mjk1NX0.ugKUEldE1XLUKwEg6dZqy3ES54rlhqK2l6cceccc2SU'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0YnRya2RueGthb2xkdGxmZXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTY5NTUsImV4cCI6MjA4MDQ5Mjk1NX0.ugKUEldE1XLUKwEg6dZqy3ES54rlhqK2l6cceccc2SU'

// Check if Supabase is configured
export const useSupabase = supabaseUrl !== 'https://placeholder.supabase.co' && !!supabaseServiceKey

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
