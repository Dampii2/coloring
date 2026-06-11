# The Weave

A vision- and narrative-driven social ecosystem that replaces the superficial *like* with deep, meaningful connection. Instead of a profile, users have a **living story** — a dynamic, evolving collection of their life's turning points, passions, and the messy human bits that actually matter.

## Core Concepts

- **The Soul Matching Algorithm** — Connects people by the *why* of their life, not the *what*. The Emotional Resonance Engine maps each story to an emotional vector (longing, resilience, grief, joy, wonder) and bridges souls who share an emotional frequency, regardless of topic.
- **The Weave** — The home screen isn't a scrolling feed; it's a digital quilt. Fragments of stories float in a thematic cloud. You don't swipe — you dive into a story.
- **Echoes** — Likes and comments are gone. An *echo* is a written or vocal response acknowledging a specific part of a story: "I've been there too." Intimate, threaded, personal.
- **Narrative Onboarding** — New users aren't filling out a bio. A *Story Guide* asks evocative, evolving questions in a space that feels safe and sacred, with consent-based sharing.
- **Atmospheric Interface** — The palette and mood shift in real time based on the emotional tone of the story you're reading.

## Tech Stack

- **Client** — React + Vite (`client/`)
- **Server** — Node + Express (`server/`)
- npm workspaces monorepo

## Getting Started

```bash
npm install
npm run dev
```

This starts the Express API on port `3001` and the Vite dev server (which proxies `/api` to the server).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run client and server concurrently |
| `npm run start:server` | Run the Express API only |
| `npm run start:client` | Run the Vite dev server only |

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/stories` | All story fragments with emotional vectors |
| `GET` | `/api/stories/:id` | A single story |
| `POST` | `/api/echoes` | Create an echo response |
| `GET` | `/api/stories/:id/echoes` | Echoes for a story |
| `GET` | `/api/resonance/:storyId` | Soul matches by emotional resonance |

## Routes (Client)

- `/` — **The Weave** (organic floating story quilt)
- `/story/:id` — **Story View** (full story, echoes, resonant souls)
- `/onboarding` — **Story Guide** (5-step narrative onboarding)
