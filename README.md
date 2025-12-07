# BulkTok

A minimal SaaS web app for TikTok creators and agencies to automate bulk video generation using AI.

## Features

- 🎬 **Bulk Video Generation**: Upload multiple images with one audio track to generate videos automatically
- 📥 **Smart Downloads**: Filter and download videos by date range (Last 24h, Today, Custom)
- 📊 **Real-time Status**: Track video generation progress (Queued → Processing → Complete)
- 🎨 **Modern UI**: Clean, creator-friendly interface built with Next.js and TailwindCSS
- 💾 **Supabase Backend**: Secure data storage with Row Level Security
- 🔌 **Hedra API Integration**: Powered by Hedra's video generation API

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Video Generation**: Python scripts (main.py, bulk.py) + Hedra API
- **UI Components**: Custom components with react-dropzone, sonner (toasts)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- Hedra API key

### Installation

1. **Clone the repository**
   ```bash
   cd bulktok
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
   - `HEDRA_API_KEY`: Your Hedra API key
   - `PYTHON_EXECUTABLE`: Path to Python (e.g., `python3`)
   - `MAIN_PY_PATH`: Absolute path to main.py
   - `BULK_PY_PATH`: Absolute path to bulk.py

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase project:
   ```bash
   # Copy contents of supabase/schema.sql
   # Paste into Supabase SQL Editor and run
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
bulktok/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # Video generation endpoint
│   │   └── videos/
│   │       ├── route.ts           # Fetch videos
│   │       └── download/route.ts  # Download videos
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── AudioUpload.tsx
│   │   ├── VideoCard.tsx
│   │   ├── DateRangePicker.tsx
│   │   └── ProgressBar.tsx
│   ├── generate/page.tsx          # Upload & generate page
│   ├── downloads/page.tsx         # Downloads page
│   ├── account/page.tsx           # Account management
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── supabase.ts                # Supabase client
├── supabase/
│   └── schema.sql                 # Database schema
└── package.json
```

## Usage

### 1. Generate Videos

1. Navigate to the **Generate** page
2. Upload multiple images (PNG, JPG, WEBP)
3. Upload one audio track (MP3, WAV, M4A, AAC)
4. Enter a text prompt describing the video style
5. Select aspect ratio (1:1, 9:16, 16:9) and resolution
6. Click **Generate Videos**
7. Videos will be queued and processed (typically 2-5 minutes per video)

### 2. Download Videos

1. Navigate to the **Downloads** page
2. Select a time range filter (Last 24h, Today, or Custom)
3. View your videos with status indicators
4. Download individual videos or use **Download All** for bulk download (creates ZIP)

### 3. Monitor Usage

1. Navigate to the **Account** page
2. View your monthly usage and subscription status
3. Upgrade to Pro for higher limits ($19.97/month)

## API Endpoints

### POST `/api/generate`
Generate videos from images and audio

**Request**: Multipart form data
- `images`: File[] - Array of image files
- `audio`: File - Audio file
- `prompt`: string - Text prompt
- `aspectRatio`: string - "1:1" | "9:16" | "16:9"
- `resolution`: string - "540p" | "720p" | "1080p"

**Response**:
```json
{
  "success": true,
  "batchId": "uuid",
  "videoCount": 24,
  "videoIds": ["uuid1", "uuid2", ...]
}
```

### GET `/api/videos`
Fetch videos with date filtering

**Query Parameters**:
- `timeRange`: "last24h" | "today" | "custom"
- `startDate`: ISO date string (for custom range)
- `endDate`: ISO date string (for custom range)

**Response**:
```json
{
  "videos": [
    {
      "id": "uuid",
      "status": "complete",
      "videoUrl": "https://...",
      "thumbnailUrl": "https://...",
      "createdAt": "2024-12-04T12:00:00Z",
      "aspectRatio": "9:16",
      "prompt": "..."
    }
  ]
}
```

### GET `/api/videos/download`
Download videos

**Query Parameters**:
- `id`: string - Single video ID
- `ids`: string - Comma-separated video IDs (for bulk download)

**Response**: Video file (MP4) or ZIP archive

## Development

### Type Checking
```bash
npm run type-check
```

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform.

## Roadmap

- [ ] Stripe payment integration
- [ ] Email notifications when videos are ready
- [ ] Video editing capabilities
- [ ] Batch scheduling
- [ ] Team collaboration features
- [ ] Analytics dashboard

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
