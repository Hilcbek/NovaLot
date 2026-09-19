# Auction Platform — Design System

## Concept
"A digital auction house." Instead of generic SaaS-dashboard styling, the palette borrows from real auction houses (Sotheby's/Christie's-style jewel tones: deep green, antique gold, ivory) — grounded in the subject matter, not a default AI palette. Light mode is the primary experience app-wide; the admin area alone uses a dark sidebar.

## Color Palette

| Name | Hex | Role |
|---|---|---|
| **Ink** | `#14231C` | Primary text, dark admin sidebar background |
| **Canvas** | `#F6F5F0` | App background (light mode) — warm-neutral, not stark white |
| **Surface** | `#FFFFFF` | Cards, panels, modals — sits above Canvas |
| **Auction Green** | `#1F5D48` | Brand primary — buttons, links, active states, "sold" badges |
| **Antique Gold** | `#C89B3C` | Prices, winning-bid highlights, premium/verified badges |
| **Live Coral** | `#E1523D` | Reserved ONLY for urgency: "Live now," countdown under 5 min, outbid alerts |

**Rule for Live Coral:** this is the one bold color in the system — it should appear sparingly, only where something is actually urgent or live. If it shows up on a static page with nothing time-sensitive happening, that's a sign it's being overused.

## Typography

| Role | Typeface | Notes |
|---|---|---|
| **Display / Headlines** | Fraunces | Serif with character (not a generic high-contrast serif) — used for hero headlines, auction titles on detail pages |
| **UI / Body / Data** | Sora | Clean geometric sans, good numeral clarity — used for everything else: body text, buttons, forms, prices, countdown timers (use tabular figures for numbers, not a monospace font) |

Both are on Google Fonts (loadable via the allowed Google Fonts CDN).

## Layout Principles
- **Left/right split for the auth page**: a bold Auction Green hero panel (with the live animated bid preview) on one side, a clean white form panel on the other — not a centered generic card.
- **Browse/listing pages**: image-forward auction cards with an asymmetric grid (not uniform identical rounded cards) — price shown in Antique Gold, countdown in Live Coral when under 5 minutes.
- **Admin**: dark Ink sidebar, Canvas content area, data-dense tables.
- **Radius scale**: 6px (buttons/inputs), 12px (cards), 20px (modals/hero panels) — small and consistent, not the bubbly rounded-everything SaaS look.
- **Spacing scale**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px.

## What to Avoid (so it doesn't read as AI-templated)
- No warm-cream + terracotta combo (common AI default)
- No identical rounded cards with the same soft grey shadow on everything
- No ALL-CAPS eyebrow labels above headings
- No monospace font "for data" — use Sora with tabular numerals instead
- No arrow (→) tacked onto every button label

---

## Image-Gen Prompt — Standard Block (attach this to EVERY page prompt, unchanged)

Copy-paste this exact block before any page-specific prompt:

```
App: "NovaLot" — a modern live auction bidding web app.

Style: professional, vibrant, inspired by high-end auction houses
(Sotheby's/Christie's) reimagined for the web — NOT a generic SaaS
dashboard look.

Color palette (use exactly these):
- Background/canvas: #F6F5F0 (warm ivory-white)
- Surface/cards: #FFFFFF
- Primary text/ink: #14231C (deep forest-black)
- Brand primary: #1F5D48 (deep emerald green) — buttons, links, active states
- Accent gold: #C89B3C (prices, highlights, premium badges)
- Urgency accent: #E1523D (used sparingly — only for "live now" / countdown
  under 5 minutes / outbid alerts, nowhere else)

Typography: Fraunces (serif, characterful) for headlines/titles, Sora
(clean geometric sans) for body text, UI labels, and numbers/prices
(use tabular numerals, not a monospace font).

Layout rules: small consistent border radius — 6px on buttons/inputs,
12px on cards, 20px on modals/hero panels (not overly rounded, not
sharp corners). Consistent spacing scale (4/8/12/16/24/32/48/64px).
Avoid identical uniform cards with the same soft grey shadow on
everything; avoid ALL-CAPS eyebrow labels; avoid arrows (→) tacked
onto button text.

Mood: confident, trustworthy, a little dramatic (the thrill of
bidding), but clean and uncluttered. Light mode unless stated
otherwise. High fidelity UI mockup, desktop web, 1440x1024.
```

This file holds ONLY the general guideline above. Page-specific prompts (auth, browse, detail, dashboard, admin, etc.) are generated separately, one at a time, each pairing this Standard Block with a layout description for that specific page.
