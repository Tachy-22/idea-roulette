# 🎡 IdeaRoulette - Swipe Startup Ideas Like TikToks

Perfect 🔥

**Tagline:** "Swipe startup ideas like TikToks — the more you scroll, the smarter they get."

## 💡 Product Vision

An **endlessly scrollable, full-screen experience** where users consume, like, remix, and share startup ideas as if they were TikTok videos — each one alive with motion, personality, and generative AI.

## 🔥 Core Experience

You open the site → AI instantly starts showing startup ideas as full-screen "cards" with animations and fake "pitch energy." → You swipe up for next idea → Like, remix, or share any one → The more you engage, the smarter (and eerier) the ideas get.

**It's like TikTok + YC Demo Day + AI.**

## 🧠 Content Unit — "Idea Card"

Each idea fills the screen like a TikTok video:

```
🧠 [Category Badge: "AI / Productivity"]
💡 [Idea Name + Emoji]
📜 [Tagline]
📝 [Short Description (2 lines)]
⭐ [AI Rating Bar]
❤️ 🔁 💬 [Action Buttons, bottom right column]
🪄 [Remix or "Expand" button bottom center]
```

Each card feels **alive** with:
- Animated entry (Framer Motion fade-up or parallax)
- Slight motion of background (gradient or pattern)
- Sound effect or subtle whoosh on load
- Transition like TikTok swipe

## 🎡 User Flow

| Action | Result |
|--------|--------|
| **Swipe up** | Next idea (Framer Motion transition up) |
| **Swipe down** | Previous idea |
| **Tap ❤️** | Like + Confetti animation |
| **Tap 🔁 Remix** | Generates 3 remixes of that idea |
| **Tap 💬** | Opens popup with "sample comments" (fake social proof) |
| **Long press / Expand** | Shows deeper "How it works" screen with mock UI + features |
| **Swipe 10+ ideas** | Unlocks "Founder Personality" profile |
| **Tap Share** | Generates an image + link to post on X |

## 💫 Visual Identity

| Element | Behavior |
|---------|----------|
| Background | Gradient shifts per idea category |
| Transitions | Smooth 3D scroll — card slides up, next fades in |
| Buttons | Floating right column (like TikTok) with Framer Motion hover scaling |
| Likes | Burst of confetti and "🔥 Founder vibes" message |
| Font | Modern / minimal — Inter or Geist |
| Vibe | High-energy, playful, AI-magic aesthetic |

## 🧠 Idea Card Structure

```json
{
  "name": "DreamSync",
  "emoji": "💭",
  "tagline": "Record and analyze your dreams using AI.",
  "category": "AI / Lifestyle",
  "rating": 8.4,
  "description": "DreamSync lets you voice-record your dreams, then GPT turns them into a daily dream journal and insight report.",
  "tags": ["AI", "mental health", "sleep"],
  "remixes": [
    "DreamSync for couples",
    "DreamSync for productivity", 
    "DreamSync for pets"
  ]
}
```

## ⚙️ Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 15 (App Router) |
| UI Library | shadcn/ui (compulsory) |
| Animations | Framer Motion |
| AI | Google Gemini 2.5 Flash |
| Storage | Local Storage |
| Styling | Tailwind CSS |
| Hosting | Vercel |

## 🧩 Architecture

```
app/
├── page.tsx (main feed)
├── api/
│   └── ideas/
│       └── route.ts (Gemini integration)
├── components/
│   ├── ui/ (shadcn components)
│   ├── IdeaCard.tsx
│   ├── IdeaFeed.tsx
│   ├── IdeaActions.tsx
│   └── PersonalityModal.tsx
└── lib/
    ├── gemini.ts
    └── storage.ts
```

## 💥 Addictive Design Hooks

| Hook | Implementation |
|------|----------------|
| **Infinite Scroll** | Feeds don't end — always preload next 10 |
| **Random Reward Loop** | Occasionally show "viral idea" (9.8/10 rating) |
| **Progressive Personalization** | Every 10 swipes, update "Your Founder Persona" |
| **Visual Novelty** | Background gradients, subtle animations per idea |
| **Social Proof** | Fake "🔥 2.3k founders liked this idea" |
| **Share Loop** | "Tweet your favorite idea" → auto-generates image preview |

## 🧠 AI System

**Endpoint:** `/api/ideas`

Uses Google Gemini 2.5 Flash to generate creative startup ideas based on:
- User preferences stored in localStorage
- Previous likes/remixes
- Category preferences
- Engagement patterns

## 📈 Target Metrics

| Metric | Target |
|--------|--------|
| Average session duration | 5+ minutes |
| Average swipes per session | 40+ |
| Share rate | 20% |
| Return rate (7 days) | 35% |

## 📆 Development Roadmap

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | 1 week | Base UI + Framer Motion vertical feed |
| Phase 2 | 1 week | Gemini idea generation + like/remix actions |
| Phase 3 | 1 week | Personalization + personality modal + polish |
| Phase 4 | Optional | Analytics + share images + hosting |

## 🚀 Getting Started

```bash
# Clone and install
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Google Gemini API key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ✨ Key Features

- **TikTok-style vertical scrolling** with Framer Motion
- **AI-powered idea generation** using Gemini 2.5 Flash
- **Local storage** for user preferences and liked ideas
- **shadcn/ui components** for consistent, beautiful UI
- **Infinite scroll** with preloading
- **Personality profiling** based on engagement
- **Share functionality** for social virality
- **Remix system** for idea variations

## 🎯 TL;DR

**Concept:** Swipe startup ideas like TikTok videos  
**Core Loop:** Swipe → Like/Remix → Smarter Feed  
**UI Feel:** Full-screen, vertical scroll, motion-heavy  
**AI Role:** Generate endless unique idea content  
**Stack:** Next.js 15 + shadcn/ui + Framer Motion + Gemini 2.5 Flash  
**MVP Time:** 2–3 weeks

---

*Want to feel like a TikTok-addicted founder? Start swiping startup ideas.*
# idea-roulette
