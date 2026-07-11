# ContentRepurposer

Write once, publish everywhere. AI-powered social media content repurposing tool.

## Features

- Transform blog posts, articles, or transcripts into platform-specific content
- Support for Twitter, LinkedIn, Instagram, TikTok, Facebook
- Choose from Professional, Casual, Funny, or Inspirational tones
- One-click copy to clipboard
- Free during beta

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS v4
- **AI**: Google Gemini 2.0 Flash
- **Deployment**: Vercel (free tier)

## Getting Started

### 1. Clone and install

`ash
cd content-repurposer
npm install
`

### 2. Set up environment variables

`ash
cp .env.example .env.local
`

Edit .env.local and add your Google API key:
- Get a free key at: https://aistudio.google.com/apikey
- Key format: GOOGLE_API_KEY=AIza...

### 3. Run development server

`ash
npm run dev
`

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

`ash
npm run build
npm start
`

## Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Import your repository
4. Add environment variable GOOGLE_API_KEY
5. Click Deploy

That's it! Your app is live.

## Waitlist Storage

The waitlist currently stores emails in data/waitlist.json. For production, replace with:
- **Resend** (recommended): https://resend.com (free tier: 3000 emails/month)
- **Mailchimp**: https://mailchimp.com
- **Supabase**: https://supabase.com

## Monetization (Coming Soon)

- Free: 3 generations/month
- Pro (/month): 50 generations, all platforms, direct publishing
- Team (/month): 200 generations, team features, API access

## License

MIT