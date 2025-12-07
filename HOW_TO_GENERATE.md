# How to Actually Generate Videos with BulkTok

## Current Situation

You're viewing a **static HTML demo** (`demo-test.html`) which only shows the UI but doesn't actually generate videos. The "Success!" message is just a preview.

## Option 1: Use Python Scripts Directly (Works Now)

Your existing Python scripts (`main.py` and `bulk.py`) can generate videos right now:

```bash
# Navigate to the directory
cd /Users/cesar/Automate/hedra-bulk

# Generate videos from a folder of images
python3 bulk.py \
  --root /path/to/folder/with/images \
  --audio_file /path/to/your/audio.mp3 \
  --text_prompt "Professional talking head video" \
  --aspect_ratio 9:16 \
  --resolution 540p
```

**This will actually call Hedra API and generate videos!**

---

## Option 2: Install Node.js and Run BulkTok Web App

To use the beautiful web interface with drag-and-drop:

### Step 1: Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS version** (recommended)
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Set Up BulkTok

```bash
# Navigate to BulkTok directory
cd /Users/cesar/Automate/hedra-bulk/bulktok

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your API keys
nano .env.local
```

### Step 3: Configure Environment Variables

Edit `.env.local` and add:

```env
# Your Hedra API key
HEDRA_API_KEY=your_actual_hedra_api_key_here

# Supabase (optional for now - can use mock data)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Python paths (already correct)
PYTHON_EXECUTABLE=python3
MAIN_PY_PATH=/Users/cesar/Automate/hedra-bulk/main.py
BULK_PY_PATH=/Users/cesar/Automate/hedra-bulk/bulk.py
```

### Step 4: Run the App

```bash
npm run dev
```

Then open http://localhost:3000 in Chrome!

---

## Quick Test (No Node.js Required)

Want to test if Hedra API works right now? Try this:

```bash
cd /Users/cesar/Automate/hedra-bulk

# Test with one image
python3 main.py \
  --image /path/to/test/image.jpg \
  --audio_file /path/to/test/audio.mp3 \
  --text_prompt "Test video" \
  --aspect_ratio 9:16 \
  --resolution 540p
```

Make sure your `HEDRA_API_KEY` environment variable is set:
```bash
export HEDRA_API_KEY="your_key_here"
```

---

## Summary

- **demo-test.html** = Just a UI preview, doesn't generate videos
- **Python scripts** = Actually generate videos, work right now
- **BulkTok web app** = Beautiful UI + video generation, requires Node.js

Choose the option that works best for you!
