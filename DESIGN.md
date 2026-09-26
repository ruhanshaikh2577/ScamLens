---
version: alpha
name: sovereign-vault-theme
description: "A navy-ink trust canvas built around #060B14 with emerald action color and rationed gold accents, light gray text (#F2F5F9), and the signature emerald (#059669) used as the primary chromatic accent. The system reads as software-craft documentation: dense, technical, and quietly luxurious. Display type is set in Fraunces Variable serif (Georgia fallback) at 500–700 with measured negative tracking. Cards live as navy panels (#0B1424) with hairline borders. The accent emerald appears on the brand mark, focus rings, and a few intentional CTAs — never decoratively. Page rhythm leans on product UI screenshots framed in dark panels rather than atmospheric color."

colors:
  primary: "#047857"
  on-primary: "#ffffff"
  primary-hover: "#059669"
  primary-focus: "#34D399"
  font-display: "Fraunces Variable, Georgia, serif"
  gold: "#C9A227"
  gold-deep: "#8A6D1B"
  ink: "#F2F5F9"
  ink-muted: "#C3CEDD"
  ink-subtle: "#8B98AD"
  ink-tertiary: "#79879E"
  canvas: "#060B14"
  surface-1: "#0B1424"
  surface-2: "#0F1A2E"
  surface-3: "#142238"
  surface-4: "#182742"
  hairline: "#1E2D47"
  hairline-strong: "#2A3D5C"
  hairline-tertiary: "#35496B"
  inverse-canvas: "#ffffff"
  inverse-surface-1: "#f5f6f6"
  inverse-surface-2: "#f6f7f7"
  inverse-ink: "#000000"
  semantic-success: "#27a644"
  semantic-error: "#F87171"
  semantic-error-strong: "#B91C1C"
  risk-medium: "#F59E0B"
  risk-medium-text: "#FBBF24"
  risk-high: "#EA580C"
  risk-high-text: "#FB923C"
  risk-critical: "#DC2626"
  risk-medium-text-light: "#B45309"
  risk-high-text-light: "#C2410C"
  semantic-overlay: "#000000"

typography:
  display-xl:
    fontFamily: Fraunces Variable
    fontSize: 80px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -3.0px
  display-lg:
    fontFamily: Fraunces Variable
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -1.8px
  display-md:
    fontFamily: Fraunces Variable
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1.0px
  headline:
    fontFamily: Fraunces Variable
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
  card-title:
    fontFamily: Fraunces Variable
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.4px
  subhead:
    fontFamily: Fraunces Variable
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.2px
  body-lg:
    fontFamily: Inter Variable
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.1px
  body:
    fontFamily: Inter Variable
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
  body-sm:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: Inter Variable
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  button:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
  eyebrow:
    fontFamily: Inter Variable
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: 0.4px
  mono:
    fontFamily: system mono stack
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-primary-pressed:
    backgroundColor: "{colors.primary-focus}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-tertiary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-inverse:
    backgroundColor: "{colors.inverse-canvas}"
    textColor: "{colors.inverse-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  pricing-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-card-featured:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  product-screenshot-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
  testimonial-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  customer-logo-tile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 16px
  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  text-input-focused:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  pricing-tab-default:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  pricing-tab-selected:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  cta-banner:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: 48px
  changelog-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: 24px 0
  status-badge:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    height: 56px
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 32px
---

## Overview

ScamLens's trust canvas is a deep navy-ink surface — `{colors.canvas}` is #060B14. On top sits a four-step surface ladder (`{colors.surface-1}` through `{colors.surface-4}`) for cards, panels, and lifted tiles, with hairline borders running from `{colors.hairline}` (#1E2D47) up through `{colors.hairline-strong}` and `{colors.hairline-tertiary}`. Light text (`{colors.ink}` #F2F5F9) carries the body and headlines.

The primary chromatic accent is **emerald** `{colors.primary}` (#047857) — used on the brand mark, focus rings, and the primary CTA button. A lighter hover state (`{colors.primary-hover}` #059669) and a bright focus variant (`{colors.primary-focus}` #34D399) extend the same hue. A rationed gold (`{colors.gold}` #C9A227, deep #8A6D1B on light) marks eyebrows, the verified seal, and verified checkmarks only. Risk badges use a semantic scale (neutral → amber → orange → red) so verdicts read without the brand color.

Display type runs Fraunces Variable serif (Georgia fallback) at weight 500–700 with negative letter-spacing scaling from -3.0px at 80px down to 0 at body. The body family is Inter Variable, and a system mono stack is reserved for evidence pills, IDs, and code snippets.

The page rhythm is **checker-first** — ScamLens leads with the working checker, framed in `{colors.surface-1}` panels with `{rounded.xl}` 16px corners, over a faint banknote-guilloche line motif in the hero. The chrome is intentionally minimal so the tool can do the heavy lifting.

**Key Characteristics:**
- **Dark-canvas trust system** — `{colors.canvas}` (#060B14) is a deep navy ink.
- **Emerald action accent** (`{colors.primary}` #047857) — used scarcely on brand mark, focus, and the primary CTA.
- **Rationed gold** (`{colors.gold}` #C9A227) — eyebrows, verified seal, verified checkmarks only.
- Four-step surface ladder (canvas → surface-1 → surface-2 → surface-3 → surface-4) carries hierarchy without shadow.
- Display tracking pulls aggressively negative (-3.0px at 80px); body holds at -0.05px.
- Cards use `{rounded.lg}` 12px corners with 1px hairline borders — never pill, rarely 16px.
- **Checker UI** dominates the page. The marketing chrome is a dark frame for the tool.
- No second chromatic color. No atmospheric gradients. No spotlight cards.

## Colors

> Source: ScamLens implementation (replaces the Linear-design-analysis this file was adapted from).

### Brand & Accent
- **Emerald** ({colors.primary}): The trust accent — primary CTA, brand mark, link emphasis.
- **Emerald Hover** ({colors.primary-hover}): Deep emerald (#059669) — hovered state of the primary CTA.
- **Emerald Focus** ({colors.primary-focus}): Bright focus-ring tint (#34D399) — focused inputs, focused buttons.
- **Gold** ({colors.gold}): Rationed accent (#C9A227, deep #8A6D1B on light) — eyebrows, verified seal, verified checkmarks only.

### Surface
- **Canvas** ({colors.canvas}): Default page background — #010102, near-pure black with a faint blue tint.
- **Surface 1** ({colors.surface-1}): One step above canvas — feature cards, pricing cards, product screenshot panels.
- **Surface 2** ({colors.surface-2}): Two steps above — featured pricing card, hovered cards.
- **Surface 3** ({colors.surface-3}): Three steps above — line-tertiary backgrounds, sub-nav.
- **Surface 4** ({colors.surface-4}): Four steps above — bg-level-3, deepest lifted surface.
- **Hairline** ({colors.hairline}): 1px borders on cards and dividers.
- **Hairline Strong** ({colors.hairline-strong}): Stronger 1px borders — input focus rings.
- **Hairline Tertiary** ({colors.hairline-tertiary}): Tertiary borders for nested surfaces.
- **Inverse Canvas** ({colors.inverse-canvas}): Pure white — surface of the inverse pill CTA on a small set of section openers.
- **Inverse Surface 1** ({colors.inverse-surface-1}): One step above inverse canvas.
- **Inverse Surface 2** ({colors.inverse-surface-2}): Two steps above inverse canvas.

### Text
- **Ink** ({colors.ink}): All headlines and emphasized body type — light gray #f7f8f8.
- **Ink Muted** ({colors.ink-muted}): Secondary type at #d0d6e0 — meta info on hero panels.
- **Ink Subtle** ({colors.ink-subtle}): Tertiary type at #8a8f98 — deselected pricing tabs, footer columns.
- **Ink Tertiary** ({colors.ink-tertiary}): Quaternary at #62666d — disabled, footnotes.

### Semantic
- **Success Green** ({colors.semantic-success}): Status pills, success indicators. The only semantic color on marketing.
- **Error Red** ({colors.semantic-error}, strong {colors.semantic-error-strong} on light): Form and upload errors only — never success emerald. Text use meets AA on canvas/surface in both modes.
- **Risk scale** (verdict badges only — neutral → amber → orange → red): medium {colors.risk-medium} / text {colors.risk-medium-text} (light {colors.risk-medium-text-light}); high {colors.risk-high} / text {colors.risk-high-text} (light {colors.risk-high-text-light}); critical {colors.risk-critical}.
- **Overlay** ({colors.semantic-overlay}): Pure black overlay scrim for modals.

## Typography

### Font Family

- **Fraunces Variable** — serif display face; Georgia fallback. Carries display-xl through subhead.
- **Inter Variable** — body/UI face. Carries body sizes, button labels, captions.
- **System mono stack** — `ui-monospace, SFMono-Regular, Menlo, monospace`. Used for evidence pills, IDs, and code snippets.

The marketing surface treats Display and Text as one continuous voice; the family change is silent.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 80px | 600 | 1.05 | -3.0px | Largest hero headline |
| `{typography.display-lg}` | 56px | 600 | 1.10 | -1.8px | Section opener headlines |
| `{typography.display-md}` | 40px | 600 | 1.15 | -1.0px | Sub-section headlines |
| `{typography.headline}` | 28px | 600 | 1.20 | -0.6px | Pricing tier titles, CTA banner heading |
| `{typography.card-title}` | 22px | 500 | 1.25 | -0.4px | Feature card title |
| `{typography.subhead}` | 20px | 400 | 1.40 | -0.2px | Lead body, intro paragraphs |
| `{typography.body-lg}` | 18px | 400 | 1.50 | -0.1px | Hero subhead, lead paragraphs |
| `{typography.body}` | 16px | 400 | 1.50 | -0.05px | Default body |
| `{typography.body-sm}` | 14px | 400 | 1.50 | 0 | Card body, footer columns |
| `{typography.caption}` | 12px | 400 | 1.40 | 0 | Captions, meta, status |
| `{typography.button}` | 14px | 500 | 1.20 | 0 | All button labels |
| `{typography.eyebrow}` | 13px | 500 | 1.30 | 0.4px | Section eyebrow (slight positive tracking) |
| `{typography.mono}` | 13px | 400 | 1.50 | 0 | System mono for evidence pills and code snippets |

### Principles

- **Aggressive negative tracking on display** (-3.0px at 80px ≈ 4% of size).
- **Single voice from display to body.** Display-xl at 600 → body at 400 — same family, narrower weights.
- **Eyebrow uses positive tracking** (+0.4px) — contrast against the negative-tracked display marks the eyebrow as taxonomy.
- **Mono only in code contexts.** System mono lives in evidence pills and code snippets — not on marketing chrome.

### Note on Font Substitutes

Display type is Fraunces Variable (Georgia, serif fallback), loaded via `@fontsource-variable/fraunces`; body is Inter Variable (`@fontsource-variable/inter`); mono is the system stack.

## Layout

### Spacing System

- **Base unit**: 4px.
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.
- Card interior padding: `{spacing.lg}` 24px on feature/pricing cards; `{spacing.xl}` 32px on testimonial cards; `{spacing.xxl}` 48px on CTA banners.
- Pill button padding: 8px vertical · 14px horizontal — compact button spec.
- Form input padding: 8px vertical · 12px horizontal.

### Grid & Container

- Max content width sits around 1280px.
- Card grids are 3-up at desktop, 2-up at tablet, 1-up at mobile.
- Pricing tier grid is 3-up; comparison strip below shows checkmarks per tier.
- Product screenshot panels span full content width — they're the protagonist.

### Whitespace Philosophy

The dark canvas IS the whitespace. Sections separate by lift onto surface-1 panels, not by gaps in white. Within a panel, generous `{spacing.lg}` 24px gaps between content blocks; `{spacing.section}` 96px between sections.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, no border | Default for body type, hero text, footer |
| 1 (surface lift) | `{colors.surface-1}` background on canvas, 1px `{colors.hairline}` | Default cards, product panels |
| 2 (surface-2 lift) | `{colors.surface-2}` background, 1px `{colors.hairline-strong}` | Featured pricing card, hovered cards |
| 3 (surface-3 lift) | `{colors.surface-3}` background | Sub-nav, dropdown menus |
| 4 (focus ring) | 2px `{colors.primary-focus}` outline at 50% opacity | Focused input, focused button |

Depth is carried by surface ladder + hairline borders. The brand resists drop shadows on dark almost entirely.

### Decorative Depth

- **Product UI screenshots** dominate as decorative depth.
- **No atmospheric gradients, no spotlight cards.**
- **Subtle white edge highlight** on the top edge of lifted panels — gives the dark surface a faint "pixel rendered" feel.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Small chips, status badges |
| `{rounded.sm}` | 6px | Inline tags |
| `{rounded.md}` | 8px | All buttons, form inputs |
| `{rounded.lg}` | 12px | Pricing cards, feature cards, testimonial cards |
| `{rounded.xl}` | 16px | Product screenshot panels |
| `{rounded.xxl}` | 24px | Oversized CTA banners (rare) |
| `{rounded.pill}` | 9999px | Pricing tab toggles, status pills |
| `{rounded.full}` | 9999px | Avatar circles |

### Photography & Illustration Geometry

- Product UI screenshots dominate; they sit in `{rounded.xl}` 16px tiles with `{spacing.lg}` 24px outer padding.
- Customer logo tiles render at small sizes (~24px logo height) on `{colors.canvas}` with no border.
- Avatar circles in testimonial cards use `{rounded.full}` at 32–40px sizes.

## Components

### Buttons

**`button-primary`** — Emerald CTA. The default primary CTA across all pages.
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, padding 8px 14px, rounded `{rounded.md}`.
- Pressed state lives in `button-primary-pressed` (background shifts to `{colors.primary-focus}`).
- Hover state lives in `button-primary-hover` (background shifts to `{colors.primary-hover}` deep emerald).

**`button-secondary`** — Charcoal button. Used for secondary CTAs ("Sign in", "Read changelog").
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.button}`, padding 8px 14px, rounded `{rounded.md}`. 1px `{colors.hairline}` border.

**`button-tertiary`** — Plain text button.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.button}`, rounded `{rounded.md}`, padding 8px 14px.

**`button-inverse`** — White-on-dark inverse CTA.
- Background `{colors.inverse-canvas}`, text `{colors.inverse-ink}`, type `{typography.button}`, rounded `{rounded.md}`, padding 8px 14px.

### Pricing Tabs

**`pricing-tab-default`** + **`pricing-tab-selected`** — Pill-toggle on `/pricing`.
- Default: `{colors.canvas}` background, `{colors.ink-subtle}` text, rounded `{rounded.pill}`, padding 6px 14px.
- Selected: `{colors.surface-2}` background, `{colors.ink}` text — selected = surface lift.

### Cards & Containers

**`pricing-card`** — Each tier on `/pricing`.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.lg}`, padding 24px. 1px `{colors.hairline}` border.

**`pricing-card-featured`** — Recommended tier — surface lift to surface-2.
- Background `{colors.surface-2}`, otherwise identical structure.

**`feature-card`** — Generic feature highlight tile.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.lg}`, padding 24px.

**`product-screenshot-card`** — The dominant card type — frames a high-fidelity checker UI capture.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.xl}`, padding 24px.

**`testimonial-card`** — Customer quote with avatar + name + role.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body-lg}`, rounded `{rounded.lg}`, padding 32px.

**`customer-logo-tile`** — Small tile in the customer marquee.
- Background `{colors.canvas}`, text `{colors.ink-subtle}`, type `{typography.caption}`, rounded `{rounded.xs}`, padding 16px.

**`cta-banner`** — Closing CTA panel near page bottom.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.headline}`, rounded `{rounded.lg}`, padding 48px.

### Inputs & Forms

**`text-input`** + **`text-input-focused`** — Form fields on `/contact/sales` and signup overlays.
- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.md}`, padding 8px 12px.
- Focused state retains the same surface; the focus ring is a 2px `{colors.primary-focus}` outline at 50% opacity.

### Status & Build Page

**`changelog-row`** — Each row in `/build` (changelog page) listing version, date, and changes.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.xs}`, padding 24px 0. 1px `{colors.hairline}` bottom rule.

**`status-badge`** — Small status pill.
- Background `{colors.surface-2}`, text `{colors.ink-muted}`, type `{typography.caption}`, rounded `{rounded.pill}`, padding 2px 8px.

### Navigation

**`top-nav`** — Sticky dark bar with the ScamLens wordmark left, primary nav links centered, and a `button-secondary` ("Sign in") + `button-primary` ("Get started") pair right.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-sm}`, height 56px.

### Footer

**`footer`** — Dense link grid on `{colors.canvas}` with the ScamLens wordmark left.
- Background `{colors.canvas}`, text `{colors.ink-subtle}`, type `{typography.caption}`, padding 64px 32px.

## Do's and Don'ts

### Do

- Reserve `{colors.canvas}` (#010102) as the system's anchor surface — the faint blue tint is intentional.
- Use `{colors.primary}` emerald ONLY for: brand mark, primary CTA, focus ring, link emphasis. Gold ONLY for eyebrows, seal, verified marks.
- Use the four-step surface ladder for hierarchy. Avoid skipping levels.
- Pair display weight 600 with body weight 400.
- Apply negative letter-spacing aggressively on display.
- Use product UI screenshots as the protagonist of every section.
- Compose CTAs as `{rounded.md}` 8px corners.

### Don't

- Don't ship a light-mode marketing page.
- Don't use emerald as a section background or card fill.
- Don't introduce a second chromatic accent (orange, pink, green for marketing).
- Don't add atmospheric gradients or spotlight cards.
- Don't pill-round CTAs.
- Don't use `#000000` true black as the canvas.
- Don't combine multiple bright accents in product screenshot mockups.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Desktop-XL | 1440px | Default desktop layout |
| Desktop | 1280px | Card grid 3-up maintained |
| Tablet | 1024px | Card grid 3-up → 2-up |
| Mobile-Lg | 768px | Pricing comparison becomes accordion; nav hamburger |
| Mobile | 480px | Single-column; display-xl scales 80px → ~36px |

### Touch Targets

- CTAs hold ≥40px tap height across viewports.
- Pricing tab pills hold ≥36px tap height; touch viewports grow to ≥44px.
- Form inputs hold ≥44px tap target on touch.

### Collapsing Strategy

- **Top nav**: links collapse to hamburger below 768px.
- **Card grids**: 3-up → 2-up at 1024px → 1-up below 768px.
- **Pricing comparison**: per-tier accordion below 768px.
- **Display type**: `{typography.display-xl}` 80px scales toward `{typography.display-md}` 40px on mobile.

### Image Behavior

- Product UI screenshots maintain aspect ratio and never crop.
- Customer logos in the marquee may collapse from 6-up to 3-up below 768px.

## Iteration Guide

1. Focus on ONE component at a time and reference it by its `components:` token name.
2. When introducing a section, decide first which surface lift it lives on.
3. Default body to `{typography.body}` at weight 400.
4. Run `npx @google/design.md lint DESIGN.md` after edits.
5. Add new variants as separate component entries.
6. Treat emerald as scarce: brand mark, primary CTA, focus, link emphasis. Treat gold as scarcer: eyebrows, seal, verified marks.
7. Lead every section with a product UI screenshot.

## Known Gaps

- The four-step surface ladder above is the canonical spec for this theme.
- Form-field error and validation styling is not visible on the inspected pages.
- Light mode flips the canvas ladder to paper tones (canvas #F7F9FC, surfaces #FFFFFF/#EFF3F8/#E6ECF4/#DCE4EF, hairlines #DDE4EE/#C6D2E2/#B3C2D6, inks #0A1628/#33415C/#5B6B84/#66748A) with a deepened primary (#047857); gold accents stay rationed in both modes.
- Risk badges use the semantic scale (neutral → amber → orange → red); the old single-accent badge treatment is retired.
- The custom display, text, and mono families are proprietary; an open-source substitute is acceptable.
