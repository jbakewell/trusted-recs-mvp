# Trusted Recs — Final UX Design Guide for Codex

## 0. Purpose

Use this UX design guide alongside `PROJECT_BRIEF.md`.

`PROJECT_BRIEF.md` defines the product, technical scope, data model, and delivery milestones. This document defines the final visual direction, layout framework, component rules, mobile behaviour, and implementation guardrails required to deliver a polished mobile-first web app.

Codex must treat this as the governing UX specification.

Primary UX goal:

```text
Make it extremely easy and emotionally satisfying for a small private group to save, browse, and react to trusted movie recommendations from people they know.
```

The app must feel polished from Milestone 1 onward. Do not leave UX polish until the end.

---

# 1. Approved visual direction

## 1.1 Design north star

```text
Trusted Recs should feel like a calm, cinematic, mobile-first web app with restrained mid-century editorial design: warm paper surfaces, charcoal typography, rose accent colour, flat bordered cards, generous spacing, and subtle geometric motifs.
```

## 1.2 Visual character

The interface should feel:

- private
- warm
- cinematic
- editorial
- mobile-first
- simple
- polished
- calm
- emotionally engaging
- lightly nostalgic without becoming retro-themed

It should not feel:

- like an admin dashboard
- like IMDb or TMDB
- like a public social network
- like a gamified ranking app
- like a generic Tailwind CRUD prototype
- like a technical demo
- like a login-heavy SaaS product
- like a retro poster converted directly into an app

## 1.3 Approved style language

Use:

- warm paper backgrounds
- charcoal text instead of pure black
- dusty rose / print pink as the default primary accent
- flat cards
- thin borders
- minimal shadows
- square or near-square corners
- condensed uppercase headings
- editorial spacing
- subtle abstract geometric motifs
- movie posters as emotional anchors, but never as the only source of visual quality

Avoid:

- gradients
- glassmorphism
- heavy shadows
- large rounded SaaS cards
- generic blue primary buttons
- noisy decoration
- hard-coded one-off colours
- overuse of icons
- cramped mobile modals

---

# 2. Approved colour system

All colours must be implemented as CSS variables and mapped into Tailwind tokens. Components must use semantic tokens, not repeated hard-coded hex values.

## 2.1 Core tokens

```css
:root {
  /* Backgrounds */
  --color-bg-page: #F1EADF;
  --color-bg-surface: #FBF7EF;
  --color-bg-muted: #E5DDD1;
  --color-bg-inset: #D8CFC1;

  /* Text */
  --color-text-primary: #2D2D27;
  --color-text-secondary: #56524B;
  --color-text-muted: #6F665B;
  --color-text-inverse: #F8F1E7;

  /* Borders */
  --color-border-subtle: #D0C6B8;
  --color-border-strong: #8E8374;

  /* Primary accent — approved final direction */
  --color-accent: #C95F82;
  --color-accent-hover: #A94E6D;
  --color-accent-soft: #E8C1CD;

  /* Secondary accent colours */
  --color-accent-teal: #5F93AA;
  --color-accent-green: #5B9277;
  --color-accent-orange: #C8793A;
  --color-accent-purple: #6B4568;

  /* Status */
  --color-success: #4F8068;
  --color-warning: #B97832;
  --color-error: #A83C35;
  --color-info: #4E8298;

  /* Focus */
  --color-focus-ring: #2F6FEB;
}
```

## 2.2 Colour usage rules

Default app background:

```css
background: var(--color-bg-page);
```

Default card/panel background:

```css
background: var(--color-bg-surface);
```

Default text:

```css
color: var(--color-text-primary);
```

Primary CTA / selected reason chip:

```css
background: var(--color-accent);
color: var(--color-text-inverse);
```

Hover state:

```css
background: var(--color-accent-hover);
```

Normal app screens should use no more than one dominant accent colour. The secondary accents may appear only in:

- small status markers
- reason chip variants
- abstract geometric motifs
- reaction summaries
- empty-state illustrations

Do not use generic SaaS blue as the primary action colour.

## 2.3 Approved colour ratio

For standard product screens:

```text
80% warm paper / neutral UI
15% charcoal text and structure
5% rose accent colour
```

For empty states or feature panels, secondary colours may be more visible, but must remain controlled.

---

# 3. Typography

Use free/open-source fonts only.

Load fonts through Next.js font optimisation or equivalent.

## 3.1 Font families

```css
:root {
  --font-ui: "IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "IBM Plex Sans Condensed", "Arial Narrow", sans-serif;
  --font-serif-accent: "Libre Baskerville", Georgia, serif;
}
```

## 3.2 Type scale

```css
:root {
  --font-size-display-lg: 44px;
  --font-size-display-md: 34px;
  --font-size-page-title: 28px;
  --font-size-section-title: 20px;
  --font-size-card-title: 17px;
  --font-size-body: 15px;
  --font-size-body-sm: 13px;
  --font-size-caption: 12px;

  --line-height-display: 1;
  --line-height-title: 1.15;
  --line-height-body: 1.55;
  --line-height-caption: 1.35;
}
```

## 3.3 Text styles

### Page title

```css
font-family: var(--font-display);
font-size: 28px;
line-height: 1.1;
font-weight: 600;
letter-spacing: 0.04em;
text-transform: uppercase;
```

### Section title

```css
font-family: var(--font-display);
font-size: 20px;
line-height: 1.2;
font-weight: 600;
letter-spacing: 0.04em;
text-transform: uppercase;
```

### Card title

```css
font-family: var(--font-ui);
font-size: 17px;
line-height: 1.3;
font-weight: 600;
letter-spacing: 0;
```

### Body

```css
font-family: var(--font-ui);
font-size: 15px;
line-height: 1.55;
font-weight: 400;
```

### Metadata / labels

```css
font-family: var(--font-ui);
font-size: 12px;
line-height: 1.35;
font-weight: 700;
letter-spacing: 0.08em;
text-transform: uppercase;
```

### Editorial accent

```css
font-family: var(--font-serif-accent);
font-style: italic;
font-size: 16px;
line-height: 1.4;
font-weight: 400;
```

Use the serif accent only for short editorial moments, such as landing-page supporting text or empty-state copy.

## 3.4 Typography constraints

Do not:

- use condensed display type for paragraphs
- make the whole UI uppercase
- introduce extra font families
- use novelty retro fonts
- use font sizes outside the defined scale without documenting why

---

# 4. Global layout framework

The app is mobile-first. Every primary flow must work perfectly on a phone browser.

## 4.1 Breakpoints

```text
Mobile: 0–639px
Tablet: 640–1023px
Desktop: 1024px+
```

## 4.2 Mobile viewport assumptions

Design primarily for:

```text
Viewport width: 360px–430px
Viewport height: 700px–950px
```

All key flows must remain usable at 360px width.

## 4.3 Root app shell

```text
Root app:
- Width: 100vw
- Min-height: 100dvh
- Background: --color-bg-page
- Display: flex
- Flex-direction: column
- Overflow-x: hidden
```

Mobile main content:

```text
Main content:
- Width: 100%
- Max-width: 480px
- Margin: 0 auto
- Padding: 20px 16px 96px
```

Desktop main content:

```text
Main content:
- Max-width: 1120px
- Margin: 0 auto
- Padding: 40px 32px 80px
```

## 4.4 Header

Mobile header:

```text
Height: 56px
Width: 100%
Position: sticky top 0
Z-index: 40
Background: --color-bg-page
Border-bottom: 1px solid --color-border-subtle
Padding: 0 16px
Display: flex
Align-items: center
Justify-content: space-between
```

Header content:

- left: product mark, group icon, or back button
- centre: group/page title
- right: participant badge, close button, or menu action

Keep the header visually light. Do not make it a large toolbar.

## 4.5 Bottom action area

For mobile flows with a primary action, use a sticky/fixed bottom action area.

```text
Position: sticky or fixed bottom 0
Background: --color-bg-page
Border-top: 1px solid --color-border-subtle
Padding: 12px 16px calc(12px + safe-area-inset-bottom)
```

Use this for:

- create group submit
- join group confirm
- add recommendation continue/submit
- multi-step flow navigation

Primary actions must be reachable without scrolling to the end of a long page.

## 4.6 Bottom navigation decision

Do not implement a persistent bottom navigation in the first MVP unless later explicitly approved.

Rationale:

- The MVP does not yet need enough top-level destinations to justify it.
- It adds cognitive weight.
- It makes the app feel more like a social/productivity platform than a lightweight recommendation space.

Use instead:

- prominent group-home CTA: `Recommend a movie`
- filter chips
- header menu/admin link when needed
- contextual links from cards/details

---

# 5. Spacing system

Use an 8px base spacing system, with 4px for micro-adjustment.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

Mobile defaults:

```text
Page side padding: 16px
Section gap: 24px
Card padding: 16px
Form field gap: 16px
Button group gap: 12px
Feed card gap: 16px
```

Desktop defaults:

```text
Page side padding: 32px
Section gap: 32px
Card padding: 24px
Feed grid gap: 24px
```

Do not introduce arbitrary spacing values unless there is a documented layout reason.

---

# 6. Radius, borders, and shadows

The style should feel flat, editorial, and printed rather than soft and SaaS-like.

```css
:root {
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-card: 4px;
  --radius-button: 2px;

  --border-subtle: 1px solid var(--color-border-subtle);
  --border-strong: 1px solid var(--color-border-strong);

  --shadow-subtle: 0 1px 2px rgba(45, 45, 39, 0.08);
}
```

Rules:

- Cards use thin borders.
- Buttons use 2px radius.
- Inputs use 0–2px radius.
- Avoid 16px+ card radii.
- Avoid large soft shadows.
- Avoid gradients.

---

# 7. Reusable component specifications

Build reusable components before page-specific UI.

Required primitives:

- Button
- Input
- Textarea
- Card
- Chip
- AvatarBadge
- MoviePoster
- EmptyState
- LoadingSkeleton
- ErrorState
- StepIndicator
- RecommendationCard
- ReactionControls

## 7.1 Primary button

```text
Height: 44px mobile, 40px desktop
Min width: 120px
Padding: 0 18px
Border radius: 2px
Border: 1px solid --color-accent
Background: --color-accent
Text: --color-text-inverse
Font: IBM Plex Sans, 13px, 700, uppercase, 0.06em tracking
Display: inline-flex
Align-items: center
Justify-content: center
Gap: 8px
```

States:

```text
Hover: background --color-accent-hover
Focus: 2px solid --color-focus-ring, 2px offset
Disabled: opacity 0.45, cursor not-allowed
Loading: preserve button width, show small spinner plus action copy
```

## 7.2 Secondary button

```text
Height: 44px mobile, 40px desktop
Padding: 0 18px
Border: 1px solid --color-border-strong
Background: transparent
Text: --color-text-primary
Border radius: 2px
```

Hover:

```text
Background: --color-bg-muted
```

## 7.3 Text button

```text
Height: 40px
Padding: 0 4px
Text colour: --color-accent
Font weight: 600
Underline: on hover/focus only
```

## 7.4 Input field

```text
Height: 46px mobile
Width: 100%
Background: --color-bg-surface
Border: 1px solid --color-border-strong
Border radius: 0
Padding: 0 12px
Font: IBM Plex Sans 15px
Text: --color-text-primary
Placeholder: --color-text-muted
```

Focus:

```text
Outline: 2px solid --color-focus-ring
Outline-offset: 2px
```

Error:

```text
Border: 1px solid --color-error
Error text: 13px, --color-error
```

## 7.5 Textarea

```text
Min-height: 96px
Width: 100%
Padding: 12px
Border: 1px solid --color-border-subtle
Background: --color-bg-surface
Border radius: 2px
Font: IBM Plex Sans 15px
Resize: vertical on desktop, fixed on mobile unless necessary
```

## 7.6 Card

```text
Background: --color-bg-surface
Border: 1px solid --color-border-subtle
Border radius: 4px
Box shadow: none by default
Padding: 16px mobile, 24px desktop
```

Clickable card state:

```text
Hover desktop: border --color-border-strong, shadow --shadow-subtle
Focus: 2px solid --color-focus-ring, 2px offset
```

## 7.7 Chip

Used for reason chips, filters, metadata, and status.

```text
Height: 36px minimum for reason chips
Height: 32px minimum for compact metadata chips
Padding: 0 12px
Border: 1px solid --color-border-subtle
Border radius: 999px for reason/filter chips
Background: --color-bg-surface
Font: 12px, 700, uppercase, tracking 0.06em
Display: inline-flex
Align-items: center
Justify-content: center
Gap: 6px
```

Selected reason chip:

```text
Background: --color-accent
Border: --color-accent
Text: --color-text-inverse
```

Selected filter chip:

```text
Background: --color-text-primary
Text: --color-text-inverse
Border: --color-text-primary
```

Do not implement reason chips as square icon tiles by default. Use wrapped text chips.

## 7.8 Avatar badge

Participant identity should feel light and friendly, not account-heavy.

```text
Size: 32px
Shape: circle
Background: deterministic colour based on avatarSeed
Text: initials, 12px, 700
Border: 1px solid neutral border
```

Use avatar badges in recommendation cards, headers, and participant lists.

## 7.9 Movie poster

Poster component must handle missing images.

Mobile feed poster:

```text
Width: 92px preferred
Minimum width: 84px if space is tight
Aspect ratio: 2 / 3
Border: 1px solid --color-border-subtle
Background: --color-bg-inset
Object-fit: cover
```

Missing poster fallback:

```text
Same dimensions
Background: --color-bg-inset
Centered abstract geometric mark
Optional film initial if space permits
```

Movie detail poster:

```text
Width: 112px–128px mobile
Aspect ratio: 2 / 3
```

---

# 8. Screen specifications

## 8.1 Landing page

Purpose:

```text
Explain the product in under 5 seconds and get the user to create a private group.
```

Mobile layout:

```text
Container:
- Max-width: 480px
- Padding: 32px 16px 96px

Hero:
- Top margin: 24px
- Title block height: auto
- Main title max width: 340px
- CTA visible within first viewport on a 390x844 phone
```

Content order:

1. Product name
2. Subtitle
3. Short explanation
4. Primary CTA
5. Example recommendation card
6. Privacy reassurance

Copy:

```text
Trusted Recs
Save the films your favourite people tell you to watch.
```

Suggested explanation:

```text
Create a private group, save movie recommendations, and keep track of what everyone actually wants to watch.
```

Primary CTA:

```text
Create a group
```

Privacy reassurance:

```text
No email, password, phone number, or contact import required for MVP group use.
```

Acceptance criteria:

- CTA visible without scrolling on a 390px wide phone.
- Product purpose is clear from first screen.
- No account/login language dominates the page.
- Page uses the approved visual system.

## 8.2 Create group page

Purpose:

```text
Create a private group with lightweight participant names.
```

Mobile layout:

```text
Header: 56px sticky
Main: max-width 480px, padding 20px 16px 96px
Form sections stacked vertically
Sticky bottom submit area
```

Form structure:

1. Group name
2. Your display name
3. People in this group
4. Add participant control
5. Create group action

Participant input pattern:

```text
Each participant row:
- Input width: remaining space
- Remove button: 44px square touch target
- Row gap: 8px
```

Validation:

- Validate on blur and submit.
- Do not show errors before interaction unless submit fails.
- Error text sits directly below field.
- Keep form values intact after validation failure.

Empty participant guidance:

```text
Add the people you usually swap movie recommendations with.
```

Acceptance criteria:

- User can complete the form comfortably on phone.
- Submit action is not lost below the keyboard.
- Inputs are at least 44px high.
- Validation is readable and specific.

## 8.3 Join invite page

Purpose:

```text
Let a recipient join safely and instantly without account friction.
```

Mobile layout:

```text
Centered card within page
Container max-width: 480px
Padding: 32px 16px
Card padding: 24px
```

Content hierarchy:

1. Group name
2. Invitation explanation
3. Proposed participant identity
4. Primary CTA: Continue as [Name]
5. Secondary action: I’m someone else

Suggested copy:

```text
You’ve been invited to join [Group Name].
Continue as [Participant Name] to see and share movie recommendations.
```

Error states:

Invalid token:

```text
This invite link does not work.
Ask the group admin for a new link.
```

Revoked token:

```text
This invite link has been replaced.
Ask the group admin for the latest link.
```

Acceptance criteria:

- Normal join is one tap after opening the link.
- Page feels private and safe.
- No signup wall.
- Works from WhatsApp in a mobile browser.

## 8.4 Group home / recommendation feed

Purpose:

```text
Show the group’s movie recommendations and make recommending a movie obvious.
```

Mobile layout:

```text
Header:
- Group title centre or left depending route convention
- Participant badge right

Main:
- Padding 16px
- Group summary block
- Full-width primary CTA
- Filter chip row
- Feed
```

Recommended group summary:

```text
PRIVATE GROUP
The Friday Film Club
You’re browsing as John
```

Primary CTA:

```text
Recommend a movie
```

CTA rules:

- Full-width on mobile.
- Use rose accent.
- Place near top, before feed.
- Do not duplicate with bottom navigation.

Filters:

```text
Horizontal scroll chip row
Height: 40px
Gap: 8px
No visible horizontal scrollbar required
Must not cause page-level horizontal scroll
```

Feed:

```text
Single column on mobile
Card gap: 16px
```

Desktop:

```text
Max-width: 1120px
Optional two-column layout:
- Main feed: minmax(0, 1fr)
- Right rail: 320px for group/admin summary
```

Acceptance criteria:

- Recommend button is visible near the top.
- Current participant identity is clear.
- Feed cards are readable and appealing.
- No horizontal page scroll.

## 8.5 Add recommendation flow

Preferred UX:

```text
Mobile-first full-page route.
```

Do not use a cramped desktop-style modal on mobile.

Steps:

1. Search movie
2. Select movie
3. Choose target
4. Choose reason chip
5. Optional note
6. Submit

Mobile layout contract:

```text
Container:
- Width: 100vw
- Min-height: 100dvh
- Background: --color-bg-page
- Header: 56px sticky
- Main: padding 16px 16px 96px
- Bottom action: sticky/fixed
```

Progress indicator:

```text
Use a restrained 5-step indicator.
Active step uses --color-accent.
Inactive steps use muted neutral circles/lines.
Do not make this visually heavier than the form content.
```

Primary heading for reason step:

```text
What makes it worth watching?
```

Supporting copy:

```text
Pick the reason you’d recommend it.
```

Back behaviour:

- Back returns to previous step.
- Cancel asks for confirmation only if the user has selected a movie or entered a note.
- Preserve search results where practical.

Submit button:

- Disabled until required data exists.
- Reason chip is required.
- Loading state prevents duplicate submissions.

Acceptance criteria:

- Complete flow works comfortably on phone.
- User never has to hunt for the next action.
- Keyboard does not obscure critical actions.
- User can recover from errors without losing work.

## 8.6 Movie search UI

Search input:

```text
Height: 46px
Sticky near top within flow if result list is long
```

Result card mobile:

```text
Display: grid
Grid columns: 64px minmax(0, 1fr)
Gap: 12px
Padding: 12px
Border: 1px solid --color-border-subtle
Background: --color-bg-surface
```

Poster thumbnail:

```text
Width: 64px
Aspect ratio: 2 / 3
```

Result text:

```text
Title: 16px/21px, 600
Year: 13px/18px, muted
Overview: 13px/19px, secondary, max 3 lines
```

States:

- Loading skeleton: 5 result rows
- No results: calm empty state with suggestion to check spelling
- TMDB error: clear retry action
- Missing poster: fallback poster component

Acceptance criteria:

- Results are easy to distinguish on phone.
- Overview never makes a result card excessively tall.
- Tapping anywhere on the result selects the movie.

## 8.7 Target selection

Options:

1. Everyone
2. Specific people
3. For later

Mobile UI:

```text
Use large selectable rows or chips.
Minimum touch target: 44px.
Selected state must be visually obvious.
```

Suggested labels:

```text
Everyone in the group
Specific people
For later
```

For multiple people:

- Show participant chips with avatar initials.
- Selected participants use dark fill or accent border.
- Do not introduce complex privacy language.

Acceptance criteria:

- User understands who the recommendation is for.
- Multiple selected people are visibly clear.
- Target selection is accessible by keyboard.

## 8.8 Reason chip selection

Purpose:

```text
Let the recommender quickly describe why the movie is worth watching without spoilers.
```

Layout:

```text
Chip container:
- Display: flex
- Flex-wrap: wrap
- Gap: 8px
```

Chip dimensions:

```text
Min height: 36px
Padding: 0 14px
Border radius: 999px
```

Selected chip:

```text
Background: --color-accent
Border: --color-accent
Text: --color-text-inverse
```

More behaviour:

- Initially show 12–15 chips.
- If more exist, show a `More reasons` chip/button.
- Expanded state must not lose selected chip.
- Selected chip must remain visible after expansion.

Acceptance criteria:

- At least one reason chip must be selected.
- Chips are non-spoilery.
- Chip selection is obvious and tappable.
- Genre-aware sorting is reflected in visible order.

## 8.9 Optional note

Note field:

```text
Min height: 96px
Max length: 280 characters for MVP
Show remaining character count only after user starts typing
```

Placeholder:

```text
Add a short note if useful.
```

Do not make the note feel required.

Acceptance criteria:

- Optional note is visually secondary to reason chip.
- Note preview on cards does not dominate the feed.

## 8.10 Recommendation card

This is the most important reusable UI object.

Mobile card layout:

```text
Card:
- Width: 100%
- Background: --color-bg-surface
- Border: 1px solid --color-border-subtle
- Border radius: 4px
- Padding: 12px
- Display: grid
- Grid-template-columns: 92px minmax(0, 1fr)
- Gap: 12px
```

Poster:

```text
Width: 92px
Aspect ratio: 2 / 3
```

Text column order:

1. Recommender context
2. Movie title/year
3. Genre metadata
4. Reason chip
5. Optional note preview
6. Target context
7. Reaction summary/actions

Preferred copy structure:

```text
Sarah recommended this
THE APARTMENT
1960 · Comedy, Drama

[WITTY & SMART]

“Hilarious and strangely beautiful.
One of my all-time favourites.”

For everyone
Want to watch · 2     Loved it · 1
```

Context copy examples:

```text
Sarah recommended this
Tom recommended this
Mum recommended this
```

Target copy examples:

```text
For everyone
For Sarah
For later
```

Reason chip:

- Small but prominent.
- Use rose soft background for unselected card display unless the selected state is interactive.
- Do not make the reason chip visually overpower the title.

Note preview:

```text
Max 2 lines
13px/19px
Text secondary
```

Reaction summary:

```text
Use compact icon + text/count rows.
Do not rely on icon alone.
Current user reaction must be visually distinguishable.
```

Avoid unexplained floating badges on every card. If avatar initials appear, they must clearly relate to recommender or current user.

Acceptance criteria:

- User can scan who recommended what and why within 2 seconds.
- Poster does not crowd the text.
- Long titles truncate cleanly.
- Missing posters look intentional.
- Card remains readable at 360px width.
- Card feels editorial, not like a database row.

## 8.11 Reaction controls

Reaction types:

```text
Want to watch
Maybe
Seen it
Loved it
Not for me
```

Mobile UI:

```text
Horizontal scroll chip row or compact wrapped row.
Minimum chip height: 36px.
Selected reaction must be visually dominant.
```

Recommended icon use:

- Optional.
- Pair with text.
- Do not rely on emoji alone.

Behaviour:

- Tap selected reaction again to remove it.
- Tap different reaction to replace it.
- Show optimistic update if implementation is safe.
- Roll back gracefully on error.

Acceptance criteria:

- Current user reaction is obvious.
- User can change reaction with one tap.
- Reaction summary updates without page confusion.

## 8.12 Movie detail page

Preferred mobile pattern:

```text
Full-page route.
```

Avoid small modal overlays on mobile.

Mobile layout:

```text
Header: back button + title
Hero area:
- Poster + title block
- Optional backdrop only if low-contrast and not disruptive
Content sections:
- Overview
- Recommended by / for
- Reason and note
- Reactions
- External action placeholders
```

Hero mobile:

```text
Poster width: 112px
Title column: flexible
Gap: 16px
```

External actions:

```text
Search where to watch
Search trailer
View on TMDB
```

These are placeholders only unless already scoped.

Acceptance criteria:

- Detail view is cinematic but readable.
- Reaction controls are available.
- Back navigation returns to the same feed state where practical.

## 8.13 Admin invite management

Purpose:

```text
Let group admin copy, revoke, and regenerate invite links without making the app feel like admin software.
```

Mobile layout:

```text
Participant list as cards/rows
Each participant row:
- Avatar
- Display name
- Role/status
- Copy link button
- More actions menu for revoke/regenerate
```

Copy link action:

- Show toast: `Invite link copied`
- Do not expose raw token except through copyable link.

Revoked state:

```text
Link revoked
Regenerate link
```

Acceptance criteria:

- Admin can copy invite links on phone.
- Revoked/regenerated state is clear.
- Page remains warm and non-technical.

---

# 9. Empty, loading, and error states

Do not leave blank screens.

## 9.1 Empty feed

Suggested copy:

```text
No recommendations yet.
Start by saving the first film someone should watch.
```

Primary action:

```text
Recommend a movie
```

Visual:

- Small abstract geometric illustration
- Use paper background, charcoal, rose accent, and optionally one secondary colour
- Keep it compact

## 9.2 Empty search

```text
No films found.
Try a shorter title or check the spelling.
```

## 9.3 Loading

Use skeletons matching final layout:

- movie card skeleton
- search result skeleton
- detail skeleton

Avoid full-screen spinners except during initial app load.

## 9.4 Error

Error copy should be human and specific.

Example:

```text
Movie search is not available right now.
Try again in a moment.
```

Always offer a retry action where appropriate.

---

# 10. Signature motif

Add one subtle recurring brand motif.

Approved motif options:

- overlapping circles / keyhole shape
- small abstract film-club mark
- simple paper-cut geometric cluster

Usage:

- landing page
- empty states
- missing poster fallback
- very small brand mark in header
- occasional footer/feature panel

Do not use decorative geometry behind dense UI, forms, tables, or recommendation cards.

Motif colour rule:

```text
1 neutral base + charcoal + rose accent + maximum 1 secondary accent
```

---

# 11. Mobile-first interaction rules

- All tap targets must be at least 44px high/wide where practical.
- Primary actions must be reachable near the bottom of the screen in multi-step flows.
- Avoid hover-only UI.
- Horizontal chip rows must not cause page-level horizontal scrolling.
- Forms must not become unusable when the mobile keyboard is open.
- Avoid dense tables on mobile.
- Use full-screen pages/drawers rather than cramped modals.
- Preserve state when navigating back through multi-step flows where practical.

---

# 12. Accessibility requirements

Minimum requirements:

```text
- All interactive elements keyboard reachable.
- Visible focus state required for buttons, links, inputs, chips, tabs, cards, and menu items.
- Text contrast must meet WCAG AA.
- Do not communicate state by colour alone.
- Minimum practical touch target: 44px.
- Inputs must have programmatic labels.
- Error messages must be associated with fields.
- Modal/drawer focus must be trapped if modal pattern is used.
- Closing modal returns focus to triggering element.
- Page headings must follow logical hierarchy.
```

Reason chips:

- Use button elements or accessible radio-like pattern.
- Selected state must be exposed with `aria-pressed`, `aria-selected`, or equivalent.
- Do not implement chips as inaccessible spans/divs.

Reaction controls:

- Use buttons.
- Expose selected reaction to assistive tech.
- Do not rely only on icon/emoji.

---

# 13. Responsive behaviour

## Mobile: 0–639px

```text
- Single column
- Max content width: 480px
- Page padding: 16px
- Full-width primary buttons
- Sticky bottom action areas in flows
- Horizontal scroll or wrapped chip rows
- Full-screen add/detail flows
```

## Tablet: 640–1023px

```text
- Content max-width: 720px
- Page padding: 24px
- Cards may remain single column for readability
- Forms can remain max-width 520px
```

## Desktop: 1024px+

```text
- Content max-width: 1120px
- Page padding: 32px–40px
- Group home may use main feed + right rail
- Recommendation feed may use one wide column or two columns only if cards remain readable
```

Do not implement desktop grid changes that make mobile code fragile.

---

# 14. Implementation sequence for Codex

Codex must implement UX in this order.

## Phase A — Foundation

1. Add font loading.
2. Create global CSS variables.
3. Map tokens into Tailwind config.
4. Create base layout shell.
5. Create core primitives:
   - Button
   - Input
   - Textarea
   - Card
   - Chip
   - AvatarBadge
   - MoviePoster
   - EmptyState
   - LoadingSkeleton
   - ErrorState
   - StepIndicator
6. Verify mobile width before building full pages.

## Phase B — Screen layouts

1. Landing page.
2. Create group page.
3. Join invite page.
4. Group home shell.
5. Add recommendation flow shell.
6. Search result UI.
7. Recommendation card.
8. Detail page.
9. Admin invite page.

## Phase C — Interaction polish

1. Form validation states.
2. Loading states.
3. Empty states.
4. Error states.
5. Focus states.
6. Mobile keyboard behaviour.
7. Safe-area bottom padding.
8. Final visual QA.

Do not start by styling each page independently. Build shared primitives first.

---

# 15. CSS and layout anti-patterns to avoid

Do not:

- use arbitrary negative margins to fix layout
- use absolute positioning for normal page layout
- hard-code colours inside components instead of tokens
- introduce extra font families
- use large rounded SaaS cards
- use heavy shadows
- use gradients
- use generic blue primary buttons
- use desktop modal patterns on mobile
- add persistent bottom navigation unless explicitly approved
- allow horizontal page scrolling
- hide overflow to mask broken layout
- duplicate button/card/input styles across pages
- build recommendation cards differently in feed and detail without reason
- use tiny tap targets in admin controls
- use tables for mobile invite management
- put TMDB poster images in layouts without missing-image fallback
- copy generated reference mockups literally where they conflict with this written spec

---

# 16. Visual QA checklist

Every milestone with UI must pass this checklist before stopping for review.

## Mobile layout

- [ ] Works at 360px width.
- [ ] Works at 390px width.
- [ ] No horizontal scrolling.
- [ ] Primary action is easy to find.
- [ ] Touch targets are comfortable.
- [ ] Sticky bottom actions do not cover content.
- [ ] Keyboard does not block form completion.

## Visual system

- [ ] Uses warm paper background.
- [ ] Uses charcoal text, not pure black.
- [ ] Uses IBM Plex Sans / IBM Plex Sans Condensed.
- [ ] Uses rose accent as primary accent.
- [ ] Uses accent colour sparingly.
- [ ] Cards are flat and bordered.
- [ ] Buttons are squared-off and typographic.
- [ ] Reason chips are wrapped/pill style, not square icon tiles.
- [ ] No gradients or glossy effects.
- [ ] No generic SaaS blue primary CTA.

## Components

- [ ] Button states implemented.
- [ ] Input states implemented.
- [ ] Chip selected/focus states implemented.
- [ ] Poster fallback implemented.
- [ ] Empty/loading/error states implemented.
- [ ] Reusable components are used consistently.
- [ ] Recommendation card feels polished and editorial.

## Accessibility

- [ ] Focus states visible.
- [ ] Inputs have labels.
- [ ] Interactive chips are accessible buttons.
- [ ] Contrast is acceptable.
- [ ] State is not colour-only.
- [ ] Logical heading order.

---

# 17. Milestone-specific UX acceptance criteria

## Milestone 1 — Landing page

- [ ] Looks polished on a phone.
- [ ] CTA visible in first viewport.
- [ ] Example movie card demonstrates product value.
- [ ] Visual style matches this UX guide.
- [ ] Tokens are centralised and editable.

## Milestone 3 — Group creation

- [ ] Form is comfortable on mobile.
- [ ] Participant entry is simple.
- [ ] Sticky submit action works.
- [ ] Validation is clear and non-hostile.

## Milestone 4 — Invite links

- [ ] Join page is one-tap for normal users.
- [ ] Wrong-person path is available but secondary.
- [ ] Admin invite management is usable on phone.
- [ ] Copy/revoke/regenerate actions are visually clear.

## Milestone 5 — Movie search

- [ ] Results are easy to scan.
- [ ] Poster/title/year/overview hierarchy is clear.
- [ ] Missing posters look intentional.
- [ ] Loading/error/no-result states exist.

## Milestone 6 — Add recommendation

- [ ] Flow can be completed quickly on phone.
- [ ] Step progression is clear.
- [ ] Reason chips are tappable and genre-relevant.
- [ ] Submit state prevents duplicates.

## Milestone 7 — Feed/cards

- [ ] Recommendation cards feel appealing.
- [ ] Who/what/why is clear at a glance.
- [ ] Long titles and missing images are handled.
- [ ] Feed empty state is attractive.

## Milestone 8 — Reactions/filters

- [ ] Current user reaction is obvious.
- [ ] Reaction changes are simple.
- [ ] Filters are mobile-friendly.
- [ ] Horizontal chip rows do not break layout.

## Milestone 9 — Detail/polish

- [ ] Detail view feels cinematic but readable.
- [ ] Reactions work from detail.
- [ ] External placeholders are clearly secondary.
- [ ] End-to-end mobile flow feels ready for friends/family trial.

---

# 18. Final UX definition of done

The MVP UX is done when:

1. A user can create a group from a phone without friction.
2. A recipient can join from a WhatsApp link without confusion.
3. A participant can recommend a film in under 60 seconds after finding it.
4. The feed is attractive enough that users want to browse it.
5. Recommendation cards clearly communicate who recommended the film, for whom, and why.
6. Reason chips are quick, non-spoilery, and visually satisfying.
7. Reactions are obvious and low-effort.
8. Empty states feel intentional.
9. Error states are recoverable.
10. The app never feels like a database admin UI.
11. The app has no mobile layout breakage at common phone widths.
12. Styling is token-driven and maintainable.
13. Codex has not introduced scattered one-off CSS hacks.

---

# 19. Approved reference interpretation

The generated visual mockups are approved as **directional visual references only**.

Codex must not attempt to reproduce presentation-only elements such as:

- phone mockup frames
- side style-guide panels
- external explanatory annotations
- design-board colour swatches
- marketing footer bars

Codex should implement the actual app screens according to this written guide.

The key takeaways from the approved reference are:

- rose accent as primary colour
- no persistent bottom nav for MVP
- polished editorial recommendation cards
- wrapped reason chips
- warm paper surfaces
- condensed titles
- subtle geometric motif
- mobile-first layout discipline

