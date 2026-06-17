# AudioSRT — Free Audio Transcription & SRT Subtitle Generator

A complete, production-ready Astro JS website for free browser-based audio transcription and SRT subtitle generation. Powered by Whisper AI via Transformers.js — your audio never leaves your device.

## Tech Stack

- **Astro 4** — static site framework
- **Tailwind CSS** — utility-first styling
- **Transformers.js** — Whisper AI in the browser (WebAssembly)
- **Cloudflare Pages** — zero-cost static hosting

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
cd audiosrt
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. This is a fully static site — no server required.

### Preview Production Build

```bash
npm run preview
```

## Deployment — Cloudflare Pages

### Option 1: GitHub Integration (Recommended)

1. Push this repo to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create a project
3. Connect your GitHub repo
4. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `18` (set in Environment Variables: `NODE_VERSION=18`)
5. Click Deploy

Cloudflare Pages will automatically redeploy on every push to `main`.

### Option 2: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy dist --project-name=audiosrt
```

### Option 3: Direct Upload

```bash
npm run build
```

Then drag and drop the `dist/` folder into Cloudflare Pages > Direct Upload.

## Configuration

### Custom Domain

In Cloudflare Pages > your project > Custom Domains, add your domain. Cloudflare handles SSL automatically.

### AdSense Setup

1. Get your AdSense publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXXX`)
2. In `src/layouts/BaseLayout.astro`, replace `ca-pub-YOUR-ADSENSE-ID` with your real ID
3. In `src/components/AdSlot.astro`, replace the placeholder divs with actual AdSense `<ins>` tags
4. Add the AdSense script tag in `BaseLayout.astro`

### Site URL

In `astro.config.mjs`, update `site` to your actual domain:

```js
export default defineConfig({
  site: 'https://yourdomain.com',
  // ...
});
```

This is used for sitemap generation and canonical URLs.

## File Structure

```
audiosrt/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Home page
│   │   ├── tool.astro           # Main transcription tool
│   │   ├── about.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── contact.astro
│   │   └── blog/
│   │       ├── index.astro      # Blog listing
│   │       └── [slug].astro     # Dynamic blog posts
│   ├── content/
│   │   └── blog/                # Markdown blog posts
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── AdSlot.astro
│   └── layouts/
│       └── BaseLayout.astro     # HTML shell with SEO meta
├── public/
│   ├── robots.txt
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── wrangler.toml
└── package.json
```

## Adding Blog Posts

Create a new `.md` file in `src/content/blog/` with this frontmatter:

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
description: "Meta description for SEO."
pubDate: "2026-01-01"
---

# Your Post Title

Content here...
```

The post will automatically appear at `/blog/your-post-slug` and in the blog listing.

## SEO

- Each page has unique `<title>`, `<meta description>`, Open Graph, and Twitter Card tags
- Sitemap generated automatically by `@astrojs/sitemap` at `/sitemap-index.xml`
- `robots.txt` at `/robots.txt`
- JSON-LD structured data on homepage and tool page
- FAQ schema on homepage
- All images are SVG — no render-blocking image loads

## Privacy Architecture

The transcription tool runs 100% in the browser:
1. User selects audio file → read by File API (stays in browser memory)
2. Whisper model downloads from CDN once, then cached
3. Web Audio API decodes audio locally (16kHz mono PCM)
4. Transformers.js runs Whisper inference via WebAssembly
5. Transcript returned to JavaScript — never transmitted anywhere
6. SRT file generated and downloaded locally

No audio data ever touches the AudioSRT server (which is just a Cloudflare CDN edge node serving static files).
