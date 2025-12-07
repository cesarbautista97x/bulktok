# BulkTok - Supabase Setup Guide

## Prerequisites
- Supabase account (https://supabase.com)
- Google Cloud Console account (for OAuth)

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: bulktok
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be ready (~2 minutes)

---

## Step 2: Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press `Cmd/Ctrl + Enter`
6. Verify tables created:
   - Go to **Table Editor**
   - You should see: `videos`, `profiles`

---

## Step 4: Configure Google OAuth

### 4.1 Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **BulkTok**
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **BulkTok**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `https://xxxxx.supabase.co/auth/v1/callback`
     (Replace `xxxxx` with your Supabase project ID)

7. Click **Create**
8. Copy **Client ID** and **Client Secret**

### 4.2 Supabase OAuth Configuration

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable Google provider
4. Paste:
   - **Client ID**: from Google Cloud Console
   - **Client Secret**: from Google Cloud Console
5. Click **Save**

---

## Step 5: Test Authentication

1. Start your development server:
```bash
npm run dev
```

2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected to `/generate`
6. Check Supabase **Authentication** → **Users** to see your user

---

## Step 6: Verify Database

1. Go to Supabase **Table Editor** → **profiles**
2. You should see your profile created automatically
3. Verify fields:
   - `id`: matches your auth user ID
   - `email`: your Google email
   - `subscription_tier`: 'free'
   - `videos_generated_this_month`: 0

---

## Troubleshooting

### "Invalid login credentials" error
- Check that Google OAuth is enabled in Supabase
- Verify redirect URI matches exactly
- Make sure you're using the correct Client ID/Secret

### Profile not created automatically
- Check SQL Editor for errors
- Verify trigger `on_auth_user_created` exists
- Run this query to check:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### RLS Policy errors
- Make sure RLS is enabled on tables
- Verify policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

---

## Next Steps

After Supabase is configured:
1. Set up Stripe (see Stripe setup guide)
2. Test video generation with usage limits
3. Deploy to production

---

## Production Checklist

Before deploying:
- [ ] Update Google OAuth redirect URIs with production domain
- [ ] Add production URL to Supabase **Site URL** in Auth settings
- [ ] Set environment variables in production
- [ ] Test authentication flow in production
- [ ] Verify RLS policies are working
