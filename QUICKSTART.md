# BulkTok Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Node.js Dependencies

```bash
cd bulktok
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings** → **API**
3. Copy your:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

4. Go to **SQL Editor** and run the schema:
   - Open `supabase/schema.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click **Run**

### Step 3: Get Hedra API Key

1. Sign up at [hedra.com](https://hedra.com)
2. Get your API key from the dashboard
3. Copy the API key

### Step 4: Configure Environment

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your preferred editor
```

Fill in:
```env
# Supabase (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Hedra API (from Step 3)
HEDRA_API_KEY=your_hedra_api_key_here
HEDRA_API_BASE=https://api.hedra.com/web-app/public

# Python Scripts (update paths if needed)
PYTHON_EXECUTABLE=python3
MAIN_PY_PATH=/Users/cesar/Automate/hedra-bulk/main.py
BULK_PY_PATH=/Users/cesar/Automate/hedra-bulk/bulk.py

# Upload Directories
UPLOAD_DIR=/tmp/bulktok-uploads
OUTPUT_DIR=/tmp/bulktok-outputs
```

### Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📝 First Video Generation

1. Click **Generate** in the navbar
2. Drag and drop 2-3 test images
3. Upload an audio file (MP3 or WAV)
4. Enter a prompt: "Professional talking head video"
5. Select aspect ratio: **9:16** (TikTok vertical)
6. Click **Generate Videos**
7. Go to **Downloads** to see your videos (they'll appear in 2-5 minutes)

---

## 🔧 Troubleshooting

### "Node.js not found"
Install Node.js from [nodejs.org](https://nodejs.org) (v18 or higher)

### "Python not found"
Make sure Python 3 is installed:
```bash
python3 --version
```

If not installed, download from [python.org](https://python.org)

### "Supabase connection failed"
- Double-check your Supabase URL and keys in `.env.local`
- Make sure you ran the SQL schema
- Verify your Supabase project is active

### "Hedra API error"
- Verify your Hedra API key is correct
- Check you have credits in your Hedra account
- Ensure `HEDRA_API_BASE` is set correctly

---

## 🎯 Next Steps

1. **Test the full flow**: Generate → Wait → Download
2. **Customize the UI**: Edit colors in `tailwind.config.ts`
3. **Add authentication**: Implement Supabase Auth (currently using mock user)
4. **Deploy**: Push to Vercel or your preferred hosting

---

## 💡 Tips

- **Batch size**: Start with 5-10 images for testing
- **Audio length**: Keep audio under 30 seconds for faster generation
- **Image quality**: Use high-quality images (at least 512x512px)
- **Aspect ratios**:
  - 9:16 for TikTok/Instagram Reels
  - 1:1 for Instagram posts
  - 16:9 for YouTube

---

## 📚 Resources

- [Full README](./README.md)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Hedra API Docs](https://docs.hedra.com)

---

Need help? Check the [README](./README.md) or open an issue on GitHub.
