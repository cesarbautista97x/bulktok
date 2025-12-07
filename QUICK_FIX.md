# Quick Fix Guide

## Problem: Profile Not Created & Download No Extension

### Fix 1: Create Profile Manually

**Option A: Via Browser Console**
1. Go to http://localhost:3000/account
2. Open Console (F12)
3. Run:
```javascript
fetch('/api/profile/create', { method: 'POST' })
  .then(r => r.json())
  .then(d => { console.log(d); location.reload(); })
```

**Option B: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/atbtrkdnxkaoldtlfety
2. Go to Table Editor → profiles
3. Click "Insert" → "Insert row"
4. Fill in:
   - id: (copy from Authentication → Users → your user ID)
   - email: tu_email@gmail.com
   - subscription_tier: free
   - videos_generated_this_month: 0
5. Click "Save"

### Fix 2: Download Extension

The download code has been updated. After creating your profile, try downloading again.

If still no .zip extension, the issue is browser-specific. Try:
1. Right-click downloaded file
2. "Rename" and add `.zip` manually
3. Or use Chrome/Firefox instead of Safari

### Verify You're Logged In

Run in console:
```javascript
fetch('/api/profile/create', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

If you see "Not authenticated", you need to login again at /login
