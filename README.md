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
- **AI**: Moonshot / DeepSeek / 智谱GLM / 通义千问 (OpenAI-compatible)
- **Deployment**: Vercel (free tier)

## Getting Started

### 1. Clone and install

```bash
cd content-repurposer
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add **at least one** API key from the providers below:

| Provider | API Key Env Var | Register | Model |
|----------|----------------|----------|-------|
| **Moonshot (Kimi)** | `MOONSHOT_API_KEY` | https://platform.moonshot.cn/ | moonshot-v1-8k |
| **DeepSeek** | `DEEPSEEK_API_KEY` | https://platform.deepseek.com/ | deepseek-chat |
| **智谱 GLM** | `ZHIPU_API_KEY` | https://open.bigmodel.cn/ | glm-4-flash (免费) |
| **通义千问** | `QWEN_API_KEY` | https://dashscope.console.aliyun.com/ | qwen-turbo (免费) |

> **推荐**: 智谱 GLM-4-Flash 完全免费，通义千问 qwen-turbo 也有免费额度。

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

## Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Import your repository
4. Add **at least one** AI API key in Environment Variables (e.g. `ZHIPU_API_KEY`)
5. Click Deploy

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
