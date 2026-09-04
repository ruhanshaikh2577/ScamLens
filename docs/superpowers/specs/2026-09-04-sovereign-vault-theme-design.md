# Sovereign Vault theme — design spec (2026-09-04)

Reskin ScamLens from the Linear-clone look (near-black + lavender) to a
trust-and-authority visual language. Presentation only: no layout,
routing, i18n, or content changes. All 8 locales inherit it free.

## 1. Palette

Dark-first. Navy-ink replaces black; emerald replaces lavender as the
single action color; gold is rationed to eyebrows/seal/verified marks.

Dark:
- canvas `#060B14`, surface-1 `#0B1424`, surface-2 `#0F1A2E`,
  surface-3 `#142238`, surface-4 `#182742`
- hairline `#1E2D47`, hairline-strong `#2A3D5C`, hairline-tertiary `#35496B`
- ink `#F2F5F9`, ink-muted `#C3CEDD`, ink-subtle `#8B98AD`,
  ink-tertiary `#5F6B80`
- primary (buttons) `#059669`, on-primary `#FFFFFF`,
  primary-hover `#10B981`, primary-focus `#34D399`
  (as-built 2026-09-04: primary `#047857`, hover `#059669` — darkened
  for WCAG AA on white button text; light mode already `#047857`).
- gold `#C9A227` — eyebrows, seal motif, verified checkmarks ONLY.
  Never buttons, fills, or body text.

Light:
- canvas `#F7F9FC`, surfaces `#FFFFFF / #EFF3F8 / #E6ECF4 / #DCE4EF`
- ink `#0A1628`, muted `#33415C`, subtle `#5B6B84`, tertiary `#7A879C`
- primary `#047857`, hover `#059669`, focus `#059669`
- gold-700 `#8A6D1B` for eyebrows/seal.

Contrast: white on `#059669` ≥ 4.5:1; `#34D399` and `#C9A227` on navy
≥ 5:1. Large/bold-only use otherwise.

## 2. Typography

- Display/headlines: Fraunces variable (serif), fallback Georgia, serif.
- Body/UI: Inter Variable (unchanged). Mono: unchanged system stack.
- No other type changes (sizes, tracking, scale stay per DESIGN.md).

## 3. Motifs

- Hero: replace lavender aurora blobs with a faint banknote-guilloche
  line pattern (emerald, ~8% opacity) + one soft emerald glow.
- Verified seal: thin gold circular checkmark badge, used in exactly
  two places — hero trust row and checker Low-risk result.
- Gold anywhere else is a bug.

## 4. Component mapping

- btn-primary/links/focus-rings/selection: lavender → emerald.
- .eyebrow: lavender → gold.
- Cards/surfaces/nav Radii/motion: untouched.
- Logo mark stroke `#5e6ad2` → emerald `#10B981` (Layout.astro ×2).
- Risk badges: replace all-lavender scale with semantic scale —
  low neutral, medium amber `#F59E0B`, high orange `#EA580C`, critical
  solid red `#DC2626` (dark mode; light mode uses 700-steps
  `#B45309 / #C2410C / #B91C1C` for text, tinted fills).
- DESIGN.md updated to match new tokens.

## 5. Rollout

Files: `src/styles/global.css`, `src/layouts/Layout.astro`,
checker result components (seal hookup), `DESIGN.md`.
Verify: `npm run build`, `npm test`, page-by-page visual pass in dark
+ light modes, contrast spot-checks on buttons/eyebrows/links.

Out of scope: layout changes, new pages, i18n string changes, logo
redesign, light-mode default flip.
