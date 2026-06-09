# Trusted Recs — Supplementary UX Guide for Overprint Geometry, Colour Warmth, and “Living” Decorative Motifs

## 0. Purpose

Use this supplementary guide alongside:

- `PROJECT_BRIEF.md`
- `TRUSTED_RECS_FINAL_UX_DESIGN_GUIDE_FOR_CODEX_v2.md`

This file refines the approved visual direction by adding more of the mid-century colour richness and overlapping geometric graphic language agreed during design review.

The goal is to make the app feel more visually alive, warm, and distinctive without making it noisy, decorative, or harder to use.

Primary design addition:

```text
Use restrained mid-century overprint geometry throughout the app: overlapping circles, arches, semicircles, triangles, keyholes, vertical rules, and cropped corner forms with subtle screen-printed / risograph-like texture.
```

The effect should feel:

- warm
- tactile
- designed
- slightly imperfect
- screen-printed
- editorial
- premium
- calm

It must not feel:

- messy
- grungy
- cartoonish
- random clip-art
- decorative wallpaper
- visually distracting
- like a generated background image pasted behind UI

---

# 1. Updated visual priority

The current implemented prototype is clean but too restrained. It uses the base paper, charcoal, and rose system correctly, but needs more subtle mid-century colour and more distinctive geometric graphic moments.

The implementation should now include:

1. Multi-colour participant avatars.
2. Overlapping geometric motif components.
3. Cropped shape clusters in corners and edges.
4. Better missing-poster fallback artwork.
5. Small mid-century colour divider bars beside section headings.
6. Subtle random decorative motif generation on page load, where safe.
7. More expressive empty states using the motif system.

Do not add colour by making large UI panels bright. Add colour through controlled decorative and identity details.

---

# 2. Signature graphic style

## 2.1 Approved description

```text
Signature graphic style: restrained mid-century overprint geometry. Use overlapping circles, arches, triangles, keyholes, and vertical rules with a subtle screen-printed / risograph-like texture. Shapes should have slight ink variation, faint paper grain, and gently imperfect hand-cut edges. Colours may overlap with translucent multiply-like interaction. Keep the effect warm and tactile, not distressed, dirty, or grungy.
```

## 2.2 Preferred motifs

Use these shape families:

- circles
- overlapping circles
- semicircles
- quarter circles
- arches
- triangles
- keyhole silhouettes
- vertical rule clusters
- small dots
- cropped edge shapes
- abstract “landscape” clusters

Avoid:

- stars as a default motif
- confetti
- emoji-like marks
- glossy icons
- complex illustrations
- photographic textures
- AI-generated bitmap backgrounds
- decorative motifs behind readable text

---

# 3. Updated colour usage

The primary accent remains rose.

```css
--color-accent: #C95F82;
--color-accent-hover: #A94E6D;
--color-accent-soft: #E8C1CD;
```

Secondary accents should now be used more visibly, but only in controlled UI details.

```css
--color-accent-teal: #5F93AA;
--color-accent-green: #5B9277;
--color-accent-orange: #C8793A;
--color-accent-purple: #6B4568;
--color-accent-olive: #8A8A54;
```

Add olive if not already present.

## 3.1 Colour usage rule

Use the broader palette in:

- participant avatars
- geometric motifs
- poster fallbacks
- empty states
- reaction accents
- reason chip soft tints
- tiny section dividers
- decorative corner crops

Do not use secondary colours in:

- primary CTA backgrounds
- large content panels
- full page backgrounds
- dense forms
- body text
- major navigation backgrounds

The app should still read as:

```text
warm paper + charcoal + rose, enriched with restrained mid-century colour accents.
```

---

# 4. Participant colour system

Group members should use the full mid-century palette more liberally.

## 4.1 Avatar palette

Create deterministic participant avatar colours from this set:

```css
--avatar-rose: #C95F82;
--avatar-teal: #5F93AA;
--avatar-green: #5B9277;
--avatar-orange: #C8793A;
--avatar-purple: #6B4568;
--avatar-olive: #8A8A54;
--avatar-charcoal: #2D2D27;
--avatar-paper-muted: #D8CFC1;
```

## 4.2 Avatar rules

Participant avatars must:

- be deterministic based on `avatarSeed` or participant ID
- remain stable across sessions
- use initials
- have sufficient contrast
- use colour as identity enhancement, not the only identifier

Recommended avatar component:

```text
Size: 32px default
Large size: 40px for participant management
Shape: circle
Background: deterministic avatar colour
Text: initials, 12px–14px, 700
Border: 1px solid rgba/neutral border
```

If the background is dark, use paper/inverse text. If the background is light, use charcoal text.

---

# 5. OverprintMotif component

Create a reusable decorative motif component.

Recommended file:

```text
components/visual/OverprintMotif.tsx
```

## 5.1 Purpose

`OverprintMotif` renders small inline SVG compositions that create the app’s signature mid-century overprint geometry.

It must be:

- reusable
- token-driven
- decorative only
- accessible-safe
- lightweight
- visually consistent
- not dependent on bitmap image assets

## 5.2 Component API

```ts
type OverprintMotifVariant =
  | "brandMark"
  | "cornerCluster"
  | "bottomLandscape"
  | "posterFallback"
  | "emptyState"
  | "sectionDivider"
  | "quotePanel"
  | "edgeBars";

type OverprintMotifPalette =
  | "roseTealOlive"
  | "roseGreenOrange"
  | "tealOliveCharcoal"
  | "rosePurpleOrange"
  | "mixed";

type OverprintMotifIntensity = "subtle" | "standard" | "bold";

type OverprintMotifProps = {
  variant: OverprintMotifVariant;
  palette?: OverprintMotifPalette;
  intensity?: OverprintMotifIntensity;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};
```

## 5.3 Required behaviour

Every motif must:

```text
- Render as inline SVG.
- Use CSS variables for colours.
- Set aria-hidden="true".
- Set pointer-events: none.
- Never block interaction.
- Never contain meaningful text.
- Never be required to understand the page.
```

## 5.4 Overprint styling

Use:

```css
.motif-shape {
  opacity: 0.68;
  mix-blend-mode: multiply;
}
```

Intensity mapping:

```text
subtle: opacity 0.45–0.60
standard: opacity 0.62–0.78
bold: opacity 0.78–0.88
```

Use `mix-blend-mode: multiply` only inside decorative motif SVGs/containers. Do not use it on text, buttons, cards, or functional controls.

## 5.5 Subtle grain

Add optional very subtle SVG grain at 2–4% effective opacity.

This may use an SVG filter such as `feTurbulence`, but keep it light.

Do not make the interface look dirty, distressed, or aged.

```text
Texture target: tactile print warmth, not vintage decay.
```

---

# 6. RandomMotifField component

The app may generate subtle random shape decorations when pages load to keep the UI feeling alive and interesting.

Recommended file:

```text
components/visual/RandomMotifField.tsx
```

## 6.1 Purpose

`RandomMotifField` creates decorative shape clusters in safe page regions such as corners, empty states, landing-page lower areas, and card backgrounds.

It should create variety without causing layout shift, hydration errors, or visual noise.

## 6.2 Critical implementation rule: avoid hydration mismatch

In Next.js, do not generate random decorative positions during server render unless the same seed is guaranteed on client and server.

Preferred implementation:

```text
Use deterministic pseudo-random generation from a seed.
```

Acceptable seed sources:

- explicit `seed` prop passed by page/component
- route pathname + group ID + stable suffix
- participant/group ID for group-specific motifs
- current timestamp only after client hydration, if motif container renders empty on server

Avoid:

```text
Math.random() directly during SSR render.
```

## 6.3 Recommended API

```ts
type RandomMotifFieldProps = {
  seed: string;
  density?: "low" | "medium";
  placement?: "corner" | "edge" | "background" | "emptyState";
  palette?: "mixed" | "roseTealOlive" | "roseGreenOrange";
  className?: string;
};
```

## 6.4 Deterministic pseudo-random requirement

Implement a small seeded PRNG helper.

Recommended file:

```text
lib/visual/seededRandom.ts
```

Expected behaviour:

```text
same seed -> same motif layout
new seed -> different motif layout
no layout shift after hydration
```

## 6.5 Safe randomisation bounds

Randomisation may affect:

- shape position within a decorative container
- shape rotation
- shape size within a narrow range
- shape opacity within approved intensity range
- selected palette colours
- shape type from approved list

Randomisation must not affect:

- page layout dimensions
- text position
- button position
- form layout
- critical content hierarchy
- accessibility tree
- interactive areas

## 6.6 Placement rules

Use `RandomMotifField` only in safe decorative zones:

```text
- landing page lower-left or lower-right corner
- empty feed card background corner
- missing poster fallback
- movie detail hero background edge
- quote/feature panels
- group home lower decorative area
```

Do not use random motifs:

```text
- behind form fields
- behind movie search results
- behind recommendation card text
- in sticky headers
- in sticky bottom action bars
- under buttons
- inside dense participant management lists
```

## 6.7 Density rules

```text
low density: 2–4 shapes
medium density: 4–7 shapes
Do not use high density in the MVP.
```

Each motif field should have at most one strong colour and 2–3 supporting colours.

---

# 7. Section divider colour bars

Add a tiny mid-century colour detail beside important section headings.

Recommended component:

```text
components/visual/SectionAccentBars.tsx
```

## 7.1 Visual specification

```text
Container:
- Display: inline-flex
- Gap: 4px
- Align-items: center

Bars:
- Height: 3px
- Width: 18px
- Border radius: 0
- Colours: rose, teal, orange or olive
```

Usage examples:

```text
RECENT RECOMMENDATIONS    [rose bar] [teal bar] [orange bar]
WHAT YOU’LL SAVE           [rose bar]
YOUR TRUSTED CIRCLE        [teal bar] [olive bar]
```

Use sparingly. Do not attach bars to every heading.

---

# 8. Reason chip colour tints

Keep selected reason chips rose.

Unselected chips may use very subtle category tints, especially once genre-specific reason chips appear.

## 8.1 Soft tint tokens

```css
--chip-soft-rose: #F0D4DD;
--chip-soft-teal: #D8E6EA;
--chip-soft-green: #DCE8DF;
--chip-soft-orange: #EEDCC7;
--chip-soft-purple: #E2D4E0;
--chip-soft-olive: #E4E3D0;
```

## 8.2 Suggested mapping

```text
Witty & Smart: rose
Visually Stunning: teal
Comfort Watch / Family: green
Perfect Escape / Great Soundtrack: orange
Thrilling / Brutal / Strange: purple
Classic / Atmospheric: olive or neutral
```

## 8.3 Constraints

- Soft tints must remain subtle.
- Text must remain high-contrast.
- Selected state still uses `--color-accent` unless explicitly overridden.
- Do not make the chip area look like confetti.

---

# 9. Reaction colour accents

Use restrained colour accents for reaction summaries and selected reaction controls.

```css
--reaction-want: #5F93AA;
--reaction-maybe: #C8793A;
--reaction-seen: #6F665B;
--reaction-loved: #C95F82;
--reaction-not-for-me: #6B4568;
```

Rules:

- Use colour on icon/stroke/fill accents.
- Selected reaction may use a soft tinted background.
- Do not turn the full reaction bar into a row of loud coloured buttons.
- Pair icons with labels or accessible labels.

---

# 10. Movie poster fallback artwork

The current fallback poster must be upgraded.

## 10.1 Requirement

When a movie poster is missing, show a designed fallback poster using the motif system.

Do not show a plain beige rectangle with a letter unless there is no alternative.

## 10.2 Fallback poster specification

```text
Aspect ratio: 2 / 3
Background: --color-bg-inset or --color-bg-muted
Motif: OverprintMotif variant="posterFallback"
Colours: charcoal + rose + teal/olive/orange
Optional title initial: large condensed letter if useful
Border: 1px solid --color-border-subtle
```

The fallback must feel like a small abstract paperback/LP cover.

## 10.3 Constraints

- Do not obscure movie title text outside the poster.
- Do not generate random image files.
- Use inline SVG and CSS tokens.
- Keep the fallback consistent across feed, search, and detail.

---

# 11. Empty state graphics

Empty states should use the motif system to create a warm, premium moment.

## 11.1 Empty feed layout

```text
Card or panel:
- Background: --color-bg-surface
- Border: 1px solid --color-border-subtle
- Padding: 20px
- Position: relative
- Overflow: hidden
```

Add:

```text
OverprintMotif variant="emptyState" or RandomMotifField placement="emptyState"
Position: bottom-right or bottom-left
Opacity/intensity: subtle or standard
```

Text:

```text
No recommendations yet.
Start by saving the first film someone should watch.
```

CTA:

```text
Recommend a movie
```

## 11.2 Constraints

- Graphic must not reduce text contrast.
- Graphic must not sit behind the CTA.
- Graphic must not create scrollbars.

---

# 12. Landing page graphic treatment

The landing page should include a larger overlapping-shape composition.

## 12.1 Layout

Recommended placement:

```text
Bottom-left or bottom-right cropped shape cluster
Width: 220–320px on mobile
Height: 180–260px on mobile
Position: absolute within hero/lower section
Overflow: hidden
Z-index: behind content but above page background
```

## 12.2 Motif style

Use:

```text
OverprintMotif variant="bottomLandscape" size="xl" intensity="standard"
```

or:

```text
RandomMotifField placement="corner" density="medium"
```

## 12.3 Constraints

- CTA must stay readable and visible.
- Motif must not force the hero to become taller.
- Motif must not obscure the example recommendation card.
- Use no more than 4–6 shapes in the landing hero.

---

# 13. Group home decorative treatment

Group home should remain functional, but can include more colour warmth.

Use:

1. Multi-colour participant/avatar badges.
2. SectionAccentBars beside `Recent recommendations`.
3. Optional cropped motif in empty feed state.
4. Optional tiny colour-rule detail in RecommendationCard footer.

Do not place large random motifs behind active feed cards.

---

# 14. Recommendation cards — colour enrichment

Recommendation cards should stay clean and editorial.

Optional enhancements:

## 14.1 Tiny colour rule

Add a small colour accent to the card, based on recommender avatar colour or reason category.

```text
Position: top-right mini bars or left border rule
Width: 3px if vertical rule
Height: auto or 32–48px
Colour: avatar/reason accent
Opacity: 0.8
```

Use only if it does not make cards noisy.

## 14.2 Reason chip soft tint

On non-interactive card display:

```text
Reason chip background: soft tint matching reason type
Text: charcoal or stronger related colour
Border: subtle matching tint
```

Example:

```text
Witty & Smart -> rose soft
Visually Stunning -> teal soft
Perfect Escape -> orange soft
```

## 14.3 Footer reaction accents

Use small coloured icons/counts for reaction types, not large coloured blocks.

---

# 15. Practical implementation notes

## 15.1 SVG over bitmap

Implement motifs with inline SVG and CSS variables.

Do not use AI-generated PNG/JPG assets for the production motif system.

Reasons:

- scalable
- themeable
- lightweight
- consistent
- easy to adjust
- no asset bloat
- works with design tokens

## 15.2 Shape imperfection

To avoid overly perfect digital geometry, use:

- slight rotation
- slight offset
- hand-authored SVG paths for some arcs
- non-identical radii
- subtle opacity variation
- very light grain overlay

Do not overdo this. The result should still feel clean and premium.

## 15.3 Performance

- Keep SVGs small.
- Avoid expensive filters on large full-screen areas.
- Prefer fixed SVG motifs for repeated components.
- Use random motif fields sparingly.
- Do not animate motifs in MVP unless explicitly requested later.

## 15.4 Accessibility

All decorative motifs must be:

```text
aria-hidden="true"
pointer-events: none
not keyboard focusable
not announced by screen readers
```

Motifs must never be the only way to convey state or meaning.

---

# 16. Implementation task list for Codex

Add this as a UX polish milestone or incorporate into the next visual polish pass.

## 16.1 Build visual components

Create:

```text
components/visual/OverprintMotif.tsx
components/visual/RandomMotifField.tsx
components/visual/SectionAccentBars.tsx
lib/visual/seededRandom.ts
```

## 16.2 Update tokens

Add:

```css
--color-accent-olive: #8A8A54;

--chip-soft-rose: #F0D4DD;
--chip-soft-teal: #D8E6EA;
--chip-soft-green: #DCE8DF;
--chip-soft-orange: #EEDCC7;
--chip-soft-purple: #E2D4E0;
--chip-soft-olive: #E4E3D0;

--reaction-want: #5F93AA;
--reaction-maybe: #C8793A;
--reaction-seen: #6F665B;
--reaction-loved: #C95F82;
--reaction-not-for-me: #6B4568;
```

## 16.3 Update AvatarBadge

- Use deterministic colour palette.
- Ensure contrast-safe text colour.
- Keep initials visible.

## 16.4 Update MoviePoster fallback

- Use `OverprintMotif variant="posterFallback"`.
- Remove plain placeholder appearance.

## 16.5 Update empty states

- Add motif in empty feed and empty search states.
- Keep copy and CTA readable.

## 16.6 Update section headings

- Add `SectionAccentBars` to key headings only.
- Use sparingly.

## 16.7 Update reason chips

- Add optional soft tint variant based on reason type/category.
- Preserve selected rose state.

## 16.8 Add random motifs carefully

- Implement `RandomMotifField` with deterministic seeded PRNG.
- Use only in approved safe zones.
- Avoid SSR/client mismatch.
- Avoid layout shift.

---

# 17. Acceptance criteria

This supplementary visual system is successful when:

- The app feels more mid-century and visually distinctive.
- Participant avatars use the broader palette.
- Empty states and poster fallbacks feel intentionally designed.
- Overlapping geometric motifs appear in corners/edges/background moments.
- The app still feels calm and usable.
- No decorative motif interferes with text or controls.
- No page has horizontal scrolling due to decorative elements.
- No hydration mismatch warnings occur from random motif generation.
- Motifs are implemented with SVG/CSS, not bitmap image assets.
- The product remains warm paper + charcoal + rose, enriched by secondary colour accents.

---

# 18. Anti-patterns to avoid

Do not:

- cover pages with random decorative shapes
- place motifs behind readable text
- use high-density confetti patterns
- add animated backgrounds in MVP
- use bitmap images for core motifs
- generate different random layouts on server and client
- create hydration errors
- use random colours outside the approved palette
- make every chip a different bright colour
- make the app feel childish
- make forms harder to read
- let decorative elements define layout height
- use `Math.random()` directly inside SSR-rendered React output

---

# 19. Final visual target

After this supplement is implemented, the app should feel closer to the approved design previews:

```text
A calm mobile-first movie recommendation app with warm paper surfaces, charcoal editorial typography, rose primary actions, colourful participant identity, and beautiful mid-century overprint geometry appearing subtly in corners, empty states, poster fallbacks, and brand moments.
```

The user reaction should be:

```text
“Ooo — lovely design.”
```

not:

```text
“This is a clean prototype.”
```
