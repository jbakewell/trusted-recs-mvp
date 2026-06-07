# Trusted Recs MVP — Codex-Facing Product & Engineering Specification

## 0. Document purpose

This document defines the MVP for **Trusted Recs**, a web-first private movie recommendation app for friends and family.

It is intended for use by an agentic coding tool such as Codex, Claude Code, Cursor, or similar.

The coding agent must treat this as the governing specification and work through it milestone by milestone.

---

# 1. Product summary

## 1.1 Working product name

```text
Trusted Recs
```

## 1.2 Product subtitle

```text
Save the films your favourite people tell you to watch.
```

## 1.3 Core problem

Good recommendations from trusted people often disappear inside WhatsApp, family chats, and casual conversations.

The app should capture those recommendations quickly, present them beautifully, and help private groups decide what to watch later.

## 1.4 MVP scope

The MVP is **movies only**.

The long-term product may expand into:

- books
- albums
- restaurants
- places
- games
- podcasts
- events
- city-level recommendations
- cross-domain taste matching

Do not implement those future areas in the MVP.

---

# 2. Delivery model

## 2.1 Delivery chain

The project must support this delivery workflow:

```text
Phone → Codex → GitHub repo → Vercel deployment → Neon database → live test app
```

The human operator should not need to run code locally.

## 2.2 Source of truth

GitHub is the source of truth.

Recommended repo name:

```text
trusted-recs-mvp
```

## 2.3 Hosting

Use **Vercel** for the live web app and preview deployments.

Every meaningful PR should be deployable and testable via a Vercel preview URL.

## 2.4 Database

Use **Neon Postgres**.

## 2.5 Movie metadata

Use **TMDB** for movie metadata and imagery.

TMDB must be called server-side only.

---

# 3. Agent operating rules

The coding agent must obey these rules:

1. Work milestone by milestone.
2. Do not build beyond the current milestone.
3. Do not add out-of-scope features.
4. Keep each PR small and reviewable.
5. Keep the app deployable after every milestone.
6. Prioritise mobile-first usability.
7. Prioritise visual polish from the first screen.
8. Never expose secrets or API keys to the browser.
9. Do not require local development by the human operator.
10. Add tests for important logic.
11. Stop after each milestone and ask for human verification.
12. Summarise:
    - what changed
    - files created or modified
    - how to test from a phone
    - tests added
    - known limitations
    - recommended next step

---

# 4. Technical stack

Use the following stack unless explicitly instructed otherwise:

| Layer | Choice |
|---|---|
| Web framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Hosting | Vercel |
| Movie metadata | TMDB API |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Validation | Zod or equivalent |
| Package manager | [placeholder: npm / pnpm / yarn] |

Default package manager if not specified:

```text
npm
```

---

# 5. Environment variables

Create `.env.example` with the following placeholders:

```env
DATABASE_URL="[placeholder]"
TMDB_API_KEY="[placeholder]"
TMDB_BASE_URL="https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL="https://image.tmdb.org/t/p"
SESSION_SECRET="[placeholder]"
APP_BASE_URL="[placeholder]"
NODE_ENV="development"
```

Rules:

- Do not commit `.env`.
- Do not commit real API keys.
- Do not expose `TMDB_API_KEY` client-side.
- Server-side code only may call TMDB.
- Vercel environment variables must be used for deployed environments.

---

# 6. Design system requirements

## 6.1 Design philosophy

The app should feel:

- warm
- cinematic
- polished
- simple
- mobile-first
- emotionally engaging
- calm rather than noisy
- private rather than social-media-like

It should not feel like:

- an admin dashboard
- a generic CRUD app
- a public social network
- a film database clone
- a gamified ranking app

## 6.2 Editable theme tokens

All colours, fonts, radii, spacing and major visual settings must be easy to edit later.

Implement design tokens using Tailwind config and/or CSS variables.

Do not scatter hard-coded colours throughout components.

### Suggested token structure

Use semantic tokens, not literal colour names, in components.

Example:

```css
:root {
  --color-bg: [placeholder];
  --color-surface: [placeholder];
  --color-surface-elevated: [placeholder];
  --color-text: [placeholder];
  --color-text-muted: [placeholder];
  --color-accent: [placeholder];
  --color-accent-soft: [placeholder];
  --color-border: [placeholder];
  --color-danger: [placeholder];
  --color-success: [placeholder];

  --font-sans: [placeholder];
  --font-display: [placeholder];

  --radius-card: [placeholder];
  --radius-button: [placeholder];

  --shadow-card: [placeholder];
}
```

## 6.3 Default visual placeholders

Until final design choices are supplied, use sensible defaults:

```text
Primary background: [placeholder]
Card background: [placeholder]
Accent colour: [placeholder]
Primary font: [placeholder]
Display font: [placeholder]
Border radius: [placeholder]
Card shadow: [placeholder]
```

The implementation should make these easy to change in one place.

## 6.4 UI component requirements

Create reusable components for:

- buttons
- cards
- chips
- inputs
- modals/drawers
- empty states
- error states
- loading states
- avatar badges
- movie posters
- reaction buttons

Avoid duplicating styling logic across pages.

---

# 7. Product principles

## 7.1 Low-friction identity

The MVP should not force users to create full accounts.

Identity model:

```text
Group first → participant second → account optional later
```

A participant is a lightweight identity inside a group.

Examples:

- John
- Sarah
- Dad
- Mum
- Tom

Do not require:

- email
- phone number
- real name
- contact import
- date of birth
- home address
- password

## 7.2 Private groups

Groups are private by default.

There should be no public directory of groups.

Users enter groups via invite links or existing sessions.

## 7.3 Movie-only MVP

Only implement movie recommendations.

However, design the database so future item types are not blocked.

Use a generic `items` table plus movie-specific metadata.

## 7.4 Recommendation reasons should describe the movie

Reason chips should be:

- non-spoilery
- not overly personal
- genre-aware
- quick to select
- reusable
- easy to extend later

Avoid chips like:

- Feels very you
- You’d love this
- Made me think of you
- Crazy plot twist
- Shocking ending
- Big reveal
- Character dies
- You won’t see it coming

---

# 8. MVP user journeys

## 8.1 Create group

### Goal

A user creates a private movie recommendation group.

### Flow

1. User visits landing page.
2. User taps **Create a group**.
3. User enters:
   - group name
   - their display name
   - names of participants
4. App creates:
   - group
   - creator participant
   - additional participants
   - invite links
   - creator session
5. User lands on group home.
6. User can copy invite links.

### Required fields

```text
Group name
Creator display name
Participant display names
```

### Constraints

```text
Minimum group name length: 1
Maximum group name length: 80
Minimum display name length: 1
Maximum display name length: 40
Maximum MVP participants per group: 20
```

### Acceptance criteria

- No email/password required.
- Creator becomes admin.
- Participants are created.
- Invite links are generated.
- Creator session persists in browser.
- Group home is reachable after creation.

---

## 8.2 Join group via invite link

### Goal

A casual user joins with no signup friction.

### Flow

1. Recipient opens invite link.
2. Join page displays:
   - group name
   - proposed participant identity
   - button: **Continue as [display name]**
   - option: **I’m someone else**
3. User confirms.
4. App creates session.
5. User lands on group home.

### Edge cases

| Case | Behaviour |
|---|---|
| Invalid token | Show friendly invalid-link error |
| Revoked token | Show friendly revoked-link error |
| Expired session | Let user rejoin via invite link |
| Wrong person opens link | Allow “I’m someone else” |
| Participant removed | Show no-longer-active message |

### Acceptance criteria

- Invite links work from mobile browsers.
- Invite links can be shared through WhatsApp.
- Browser remembers joined participant.
- Revoked links cannot be used.
- Regenerated links work.

---

## 8.3 Recommend a movie

### Goal

A participant recommends a movie quickly.

### Flow

1. User taps **Recommend a movie**.
2. User searches for a movie.
3. App searches TMDB.
4. User selects movie from results.
5. User chooses target:
   - whole group
   - one participant
   - multiple participants
   - for later
6. App displays genre-prioritised reason chips.
7. User selects one reason chip.
8. User optionally adds a note.
9. User submits.
10. Recommendation appears in group feed.

### Acceptance criteria

- TMDB search is server-side.
- Movie metadata is cached after selection.
- Reason chip is required.
- Optional note is optional.
- Recommendation appears immediately after submit.
- Flow works well on mobile.

---

## 8.4 React to a recommendation

### Goal

Participants can quickly respond.

### Reactions

```text
Want to watch
Maybe
Seen it
Loved it
Not for me
```

### Behaviour

- One active reaction per participant per recommendation.
- Reaction can be changed.
- Reaction can be removed.
- Group reaction summary should display on card/detail page.
- Current user’s reaction should be visually clear.

### Acceptance criteria

- Reactions persist.
- Reactions update without page confusion.
- Filters use reaction state correctly.

---

## 8.5 Browse recommendations

### Required views

- All
- For me
- Want to watch
- Loved
- Seen
- By recommender

### Recommendation card must show

- movie poster or fallback
- movie title
- release year
- recommender
- target
- reason chip
- optional note preview
- reaction summary
- current user reaction
- action to open detail

---

## 8.6 Movie detail

### Required content

- large poster/backdrop
- title
- release year
- runtime
- genres
- overview
- recommended by
- recommended for
- reason
- optional note
- group reactions
- current user reaction controls

### External action placeholders

Add placeholders for future actions:

```text
Search where to watch
Search trailer
View on TMDB
```

Do not integrate streaming availability in MVP.

---

# 9. Screens and UI requirements

## 9.1 Landing page

Purpose:

- Explain product quickly.
- Show a polished example movie card.
- Allow group creation.

Content:

```text
Trusted Recs
Save the films your favourite people tell you to watch.
```

Primary CTA:

```text
Create a group
```

Secondary content:

```text
[placeholder: short landing page explanation]
```

Acceptance criteria:

- Looks polished on phone.
- Does not require login.
- Makes product purpose obvious.

---

## 9.2 Create group page

Components:

- group name input
- creator display name input
- participant display name inputs
- add participant button
- create group button

Acceptance criteria:

- Form validation is clear.
- Works on phone.
- No cramped layout.

---

## 9.3 Join invite page

Components:

- group name
- participant display name
- continue button
- “I’m someone else” option
- invalid/revoked link states

Acceptance criteria:

- Joining feels safe and simple.
- No signup wall.
- No unnecessary explanation.

---

## 9.4 Group home

Components:

- group header
- current participant indicator
- primary CTA: **Recommend a movie**
- filter tabs
- recommendation feed
- admin link if current participant is admin

Acceptance criteria:

- Main action is obvious.
- Feed is readable.
- Empty state is attractive.

---

## 9.5 Add recommendation flow

Preferred UI:

```text
[placeholder: modal / full-page / drawer decision]
```

Default if not specified:

```text
Mobile-first full-screen modal or page
```

Steps:

1. Search movie.
2. Select movie.
3. Choose target.
4. Choose reason.
5. Optional note.
6. Submit.

Acceptance criteria:

- User can complete flow quickly.
- Back/cancel behaviour is clear.
- Search state is preserved during selection where practical.

---

## 9.6 Movie search results

Each result should display:

- poster thumbnail
- title
- release year
- overview snippet

Edge cases:

- no results
- missing poster
- network error
- TMDB error

---

## 9.7 Recommendation card

Card should display:

```text
[poster/backdrop]
[title] ([year])
[recommender] recommended this [target text]
[reason chip]
[note preview if present]
[reaction controls/summary]
```

Example copy:

```text
John recommended this to everyone
Sarah recommended this for later
Mum recommended this to Tom
```

---

## 9.8 Admin invite management

Admin can:

- view participants
- copy invite links
- revoke invite links
- regenerate invite links
- see link status

Participant deletion can be deferred unless simple.

---

# 10. Recommendation reason chips

## 10.1 General rules

Reason chips should describe the film’s tone, appeal, pacing, suitability, or craft.

They should not imply private judgement about the viewer.

They should not spoil plot details.

## 10.2 Global fallback chips

Use these when genre data is missing or unclear:

1. Amazing characters
2. Beautifully made
3. Great story
4. Fast-paced
5. Slow burn
6. Hilarious
7. Tear jerker
8. Mindbending
9. Brutal
10. Uplifting
11. Visually stunning
12. Great soundtrack
13. Comfort watch
14. Cult classic
15. Great to watch with the kids
16. Worth discussing afterwards
17. Weird but brilliant
18. Gripping from the start
19. Atmospheric
20. Easy watch

---

## 10.3 Genre-prioritised chips

### Action

1. Fast-paced
2. Brutal
3. Great set pieces
4. Pure adrenaline
5. Tense
6. Explosive
7. Great fight scenes
8. High stakes
9. Gripping from the start
10. Visually spectacular
11. Lean and punchy
12. Big-screen energy
13. Relentless
14. Surprisingly emotional
15. Fun escapism

### Adventure

1. Big journey
2. Great sense of wonder
3. Fun escapism
4. Visually stunning
5. Great to watch with the kids
6. Sweeping
7. Imaginative world
8. Feel-good
9. Exciting
10. Charming
11. Big-hearted
12. Great locations
13. Family-friendly
14. Epic scale
15. Pure adventure

### Animation

1. Great to watch with the kids
2. Beautiful animation
3. Hilarious
4. Big-hearted
5. Visually inventive
6. Comfort watch
7. Surprisingly emotional
8. Great characters
9. Family-friendly
10. Clever
11. Charming
12. Feel-good
13. Great soundtrack
14. Imaginative world
15. Rewatchable

### Comedy

1. Hilarious
2. Easy watch
3. Great characters
4. Sharp writing
5. Feel-good
6. Comfort watch
7. Absurd
8. Clever
9. Quotable
10. Great cast
11. Chaotic fun
12. Darkly funny
13. Awkward in a good way
14. Rewatchable
15. Light and breezy

### Crime

1. Gripping
2. Tense
3. Brutal
4. Smart plotting
5. Great characters
6. Atmospheric
7. Dark
8. Slow burn
9. Morally murky
10. Stylish
11. Gritty
12. Great dialogue
13. High stakes
14. Worth discussing afterwards
15. Hard-boiled

### Documentary

1. Fascinating
2. Eye-opening
3. Worth discussing afterwards
4. Moving
5. Shocking but not exploitative
6. Informative
7. Inspiring
8. Strange but true
9. Important story
10. Human
11. Thought-provoking
12. Well researched
13. Unusual subject
14. Gripping real story
15. Stays with you

### Drama

1. Amazing characters
2. Great performances
3. Emotional
4. Slow burn
5. Beautifully made
6. Tear jerker
7. Thought-provoking
8. Quietly powerful
9. Human
10. Great writing
11. Worth discussing afterwards
12. Melancholy
13. Intimate
14. Subtle
15. Stays with you

### Family

1. Great to watch with the kids
2. Family-friendly
3. Comfort watch
4. Feel-good
5. Big-hearted
6. Charming
7. Funny for all ages
8. Gentle
9. Rewatchable
10. Uplifting
11. Great message
12. Magical
13. Easy watch
14. Colourful
15. Cosy

### Fantasy

1. Imaginative world
2. Magical
3. Visually stunning
4. Big adventure
5. Epic scale
6. Strange and beautiful
7. Great mythology
8. Escapist
9. Atmospheric
10. Great creatures
11. Dark fantasy
12. Dreamlike
13. Family-friendly
14. Cult classic
15. Weird but brilliant

### Horror

1. Scary
2. Creepy
3. Brutal
4. Atmospheric
5. Tense
6. Slow burn
7. Disturbing
8. Weird but brilliant
9. Stylish
10. Great creature design
11. Psychological
12. Claustrophobic
13. Darkly funny
14. Cult classic
15. Stays with you

### Mystery

1. Intriguing
2. Gripping
3. Smart plotting
4. Atmospheric
5. Tense
6. Slow burn
7. Mindbending
8. Great clues
9. Worth discussing afterwards
10. Stylish
11. Unsettling
12. Clever
13. Dark
14. Keeps you guessing
15. Satisfying mystery

### Romance

1. Romantic
2. Charming
3. Emotional
4. Bittersweet
5. Great chemistry
6. Feel-good
7. Tear jerker
8. Comfort watch
9. Beautifully made
10. Funny and warm
11. Gentle
12. Heartbreaking
13. Rewatchable
14. Great dialogue
15. Cosy

### Science Fiction

1. Mindbending
2. Big ideas
3. Visually stunning
4. Thought-provoking
5. Atmospheric
6. Strange but brilliant
7. Futuristic
8. Dystopian
9. Smart
10. Great world-building
11. Tense
12. Worth discussing afterwards
13. Philosophical
14. Dark
15. Cult classic

### Thriller

1. Tense
2. Gripping
3. Fast-paced
4. Slow burn
5. High stakes
6. Unsettling
7. Atmospheric
8. Smart plotting
9. Claustrophobic
10. Paranoid
11. Dark
12. Brutal
13. Stylish
14. Lean and punchy
15. Edge-of-seat

### War

1. Brutal
2. Powerful
3. Harrowing
4. Tense
5. Epic scale
6. Human
7. Thought-provoking
8. Visually stunning
9. Great performances
10. Historically interesting
11. Emotionally heavy
12. Worth discussing afterwards
13. Gripping
14. Anti-war
15. Stays with you

---

## 10.4 Secondary genre mappings

### History

Blend:

- Drama
- War
- Documentary

Prioritise:

1. Historically interesting
2. Powerful
3. Great performances
4. Thought-provoking
5. Beautifully made
6. Human
7. Epic scale
8. Worth discussing afterwards
9. Emotional
10. Gripping

### Music

Blend:

- Drama
- Documentary

Prioritise:

1. Great soundtrack
2. Amazing performances
3. Joyful
4. Emotional
5. Fascinating
6. Beautifully made
7. Great energy
8. Inspiring
9. Rewatchable
10. Worth discussing afterwards

### Western

Blend:

- Adventure
- Drama
- Crime

Prioritise:

1. Atmospheric
2. Gritty
3. Slow burn
4. Epic landscape
5. Morally murky
6. Great characters
7. Brutal
8. Stylish
9. Classic feel
10. Tense

### TV Movie

Use global default chips unless stronger genre metadata is also present.

---

## 10.5 Chip sorting logic

When a movie has multiple TMDB genres:

1. Start with the movie’s TMDB genre order.
2. Take the first 6 chips from the primary genre.
3. Add 4 chips from the secondary genre.
4. Add 3 chips from the tertiary genre if present.
5. Add 2 global fallback chips.
6. Remove duplicates while preserving first occurrence.
7. Cap visible chips at 12–15.
8. Add **More** to reveal the full chip list.

Example:

For a movie tagged:

```text
Science Fiction, Thriller, Mystery
```

Visible chip order might be:

1. Mindbending
2. Big ideas
3. Visually stunning
4. Thought-provoking
5. Atmospheric
6. Strange but brilliant
7. Tense
8. Gripping
9. Fast-paced
10. Smart plotting
11. Intriguing
12. Keeps you guessing
13. Worth discussing afterwards
14. Cult classic
15. More

---

## 10.6 Reason chip data model

Store reason chips in the database.

Suggested table:

```text
recommendation_reasons
```

Fields:

```text
id
label
category
genreKey nullable
sortOrder
active
spoilerRisk
familySafe
createdAt
updatedAt
```

Allowed `spoilerRisk` values:

```text
low
medium
high
```

MVP should only show:

```text
active = true
spoilerRisk = low
```

Optional future fields:

```text
tone
pace
intensity
suitability
```

Example values:

```text
tone: funny, dark, emotional, uplifting, strange
pace: fast, medium, slow-burn
intensity: gentle, moderate, intense, brutal
suitability: kids, family, adults, horror-fans
```

---

# 11. Database schema

Use Prisma.

The database must support movies now and future item types later.

## 11.1 `accounts`

Future-ready table. Full account creation is not required in MVP.

Fields:

```text
id
email nullable
createdAt
updatedAt
```

## 11.2 `groups`

Fields:

```text
id
name
createdByParticipantId nullable initially if circular relation is awkward
createdAt
updatedAt
archivedAt nullable
```

## 11.3 `participants`

Fields:

```text
id
groupId
accountId nullable
displayName
avatarSeed
role
status
createdAt
updatedAt
```

Allowed `role` values:

```text
admin
member
```

Allowed `status` values:

```text
active
removed
```

## 11.4 `invite_links`

Fields:

```text
id
groupId
participantId
tokenHash
status
createdAt
revokedAt nullable
lastUsedAt nullable
```

Allowed `status` values:

```text
active
revoked
```

Rules:

- Store token hash, not raw token.
- Raw token should only be shown/generated when creating/regenerating the invite.
- Regenerating an invite should revoke the previous active invite for that participant.

## 11.5 `sessions`

Fields:

```text
id
participantId
sessionTokenHash
createdAt
lastSeenAt
expiresAt
revokedAt nullable
```

## 11.6 `items`

Generic future-ready item table.

Fields:

```text
id
type
title
subtitle nullable
description nullable
imageUrl nullable
externalSource
externalId
createdAt
updatedAt
```

MVP allowed `type`:

```text
movie
```

Future `type` values may include:

```text
book
album
restaurant
place
game
podcast
event
```

Unique constraint:

```text
type + externalSource + externalId
```

## 11.7 `movie_metadata`

Fields:

```text
id
itemId
tmdbId
title
originalTitle nullable
releaseDate nullable
releaseYear nullable
overview nullable
posterPath nullable
backdropPath nullable
runtime nullable
genres JSON
originalLanguage nullable
popularity nullable
voteAverage nullable
voteCount nullable
tmdbLastSyncedAt nullable
createdAt
updatedAt
```

## 11.8 `recommendation_reasons`

Fields:

```text
id
label
category nullable
genreKey nullable
sortOrder
active
spoilerRisk
familySafe
createdAt
updatedAt
```

## 11.9 `recommendations`

Fields:

```text
id
groupId
itemId
recommendedByParticipantId
reasonId
note nullable
visibility
createdAt
updatedAt
deletedAt nullable
```

MVP `visibility`:

```text
group
```

## 11.10 `recommendation_targets`

Fields:

```text
id
recommendationId
targetType
participantId nullable
createdAt
```

Allowed `targetType` values:

```text
group
participant
later
```

Rules:

- If `targetType = group`, `participantId` is null.
- If `targetType = participant`, `participantId` is required.
- Multiple rows allow targeting multiple people.

## 11.11 `reactions`

Fields:

```text
id
recommendationId
participantId
reactionType
createdAt
updatedAt
```

Allowed `reactionType` values:

```text
want_to_watch
maybe
seen
loved
not_for_me
```

Unique constraint:

```text
recommendationId + participantId
```

---

# 12. API and server behaviour

Use Next.js server actions or API routes. Keep server logic cleanly separated from UI components.

## 12.1 Required capabilities

The app must support:

- create group
- create participants
- generate invite links
- claim invite link
- create session
- fetch current participant
- search TMDB
- cache selected movie
- create recommendation
- fetch recommendations
- create/update/delete reaction
- revoke invite link
- regenerate invite link

## 12.2 Permission rules

Every group-specific action must verify:

1. Current session is valid.
2. Current participant exists.
3. Participant belongs to requested group.
4. Participant is active.
5. Admin-only actions require admin role.

## 12.3 Suggested API shape

Exact implementation can vary.

Suggested routes:

```text
POST /api/groups
GET /api/groups/:groupId
POST /api/invites/claim
POST /api/invites/:participantId/revoke
POST /api/invites/:participantId/regenerate
GET /api/tmdb/search?query=
POST /api/recommendations
GET /api/groups/:groupId/recommendations
PUT /api/recommendations/:recommendationId/reaction
DELETE /api/recommendations/:recommendationId/reaction
```

Do not expose internal IDs unnecessarily in UI copy.

---

# 13. TMDB integration

## 13.1 Rules

- TMDB API calls must happen server-side.
- TMDB API key must never be exposed to browser/client JS.
- Cache only movies users interact with.
- Do not mirror or bulk import TMDB.
- Handle missing posters gracefully.
- Handle TMDB failure gracefully.

## 13.2 Required movie fields

Fetch and cache:

```text
tmdbId
title
originalTitle
releaseDate
releaseYear
overview
posterPath
backdropPath
runtime
genres
originalLanguage
popularity
voteAverage
voteCount
```

## 13.3 Image handling

Use TMDB image base URL.

Recommended image sizes:

```text
Poster thumbnail: w342
Poster/card: w500
Backdrop: w780 or w1280
```

Store image paths or constructed URLs consistently.

---

# 14. Privacy and security

## 14.1 Privacy posture

The app should minimise PII.

Do not require:

- email
- phone
- real name
- contact import
- date of birth
- precise location

Do not claim:

```text
We store no personal data
```

Taste data and group membership may still be identifying.

Better wording:

```text
Trusted Recs does not require email, phone number, real names, or contact import for MVP group use.
```

## 14.2 Security requirements

Implement:

- high-entropy invite tokens
- high-entropy session tokens
- hashed invite tokens in DB
- hashed session tokens in DB
- HTTP-only cookies where practical
- secure cookies in production
- server-side permission checks
- validation for all user input
- no public group directory
- admin-only invite management
- no client-side secrets
- no raw invite/session tokens in logs

---

# 15. Testing requirements

## 15.1 Unit tests

Add tests for:

- invite token generation
- invite token hashing/verification
- session generation
- permission checks
- recommendation target validation
- reaction validation
- reason chip sorting
- TMDB response normalisation

## 15.2 Integration tests

Add tests for:

- group creation
- invite claim
- invite revoke/regenerate
- recommendation creation
- reaction update
- recommendation filtering

## 15.3 E2E tests

Use Playwright where practical.

Core E2E flow:

1. Create group.
2. Add participants.
3. Copy/open invite link.
4. Join as participant.
5. Search movie.
6. Recommend movie.
7. React to movie.
8. Filter recommendations.
9. Revoke invite link.
10. Confirm revoked link fails.

If Playwright setup is too heavy before core flows exist, add it once flows are stable.

---

# 16. Milestone delivery plan

Each milestone should create a PR and deployable Vercel preview.

After each milestone, stop for human review.

---

## Milestone 0 — Repo and project instructions

### Goal

Prepare the repo for cloud-based agent delivery.

### Tasks

- Add `PROJECT_BRIEF.md`.
- Add `CODING_AGENT_RULES.md`.
- Add `.env.example`.
- Add initial `README.md`.
- Document Vercel, Neon and TMDB setup.

### Acceptance criteria

- Repo contains governing project instructions.
- Environment variables are documented.
- No app implementation required yet.

### Human phone test

- Open GitHub repo.
- Confirm files are visible.
- Confirm spec is readable.

### Stop point

Ask human to confirm Vercel, Neon and TMDB setup status.

---

## Milestone 1 — App foundation and first deployed page

### Goal

Create the deployable Next.js foundation and polished landing page.

### Tasks

- Create Next.js app.
- Enable TypeScript strict mode.
- Add Tailwind.
- Add reusable design tokens.
- Add base layout.
- Add landing page.
- Add placeholder example movie card.
- Add basic smoke test.

### Acceptance criteria

- App builds.
- App deploys on Vercel.
- Landing page works on mobile.
- Design tokens are centralised and editable.
- No database dependency required yet.

### Human phone test

- Open Vercel preview URL.
- Confirm page loads.
- Confirm visual direction is acceptable.

### Stop point

Ask human to approve visual direction.

---

## Milestone 2 — Neon database and Prisma schema

### Goal

Add database schema and seed data.

### Tasks

- Add Prisma.
- Implement schema.
- Add initial migration.
- Add seed script for reason chips.
- Add genre-chip mappings.
- Add `.env.example` updates if needed.
- Add database connection instructions.

### Acceptance criteria

- Prisma schema includes MVP entities.
- Seed data includes global and genre-prioritised reason chips.
- App can connect to Neon via `DATABASE_URL`.
- No secrets committed.

### Human phone test

- Open deployed app.
- Confirm no visible database error.
- Review agent evidence that migration/seed ran.

### Stop point

Ask human to confirm database wiring.

---

## Milestone 3 — Group creation

### Goal

Allow a user to create a private group.

### Tasks

- Build create group page.
- Implement group creation.
- Create creator participant.
- Create additional participants.
- Create creator session.
- Redirect to group home.
- Add validation.

### Acceptance criteria

- Group can be created without account.
- Creator becomes admin.
- Participants are stored.
- Session persists.
- Group home displays group and participant names.

### Human phone test

- Create test group.
- Add participants.
- Confirm group page loads.

### Stop point

Ask human to verify group creation flow.

---

## Milestone 4 — Invite links and join flow

### Goal

Enable casual users to join by invite link.

### Tasks

- Generate invite links.
- Build admin invite panel.
- Build join page.
- Implement invite claim.
- Create participant session.
- Add invalid/revoked states.
- Add revoke/regenerate functionality.

### Acceptance criteria

- Admin can copy invite links.
- Link opens join page.
- User can continue as named participant.
- Browser remembers identity.
- Revoked link fails.
- Regenerated link works.

### Human phone test

- Copy invite link.
- Send/open link on phone.
- Join as participant.
- Revoke link.
- Confirm old link fails.

### Stop point

Ask human to verify low-friction identity flow.

---

## Milestone 5 — TMDB movie search

### Goal

Enable movie search with metadata and images.

### Tasks

- Add TMDB server-side client.
- Add movie search endpoint/action.
- Build movie search UI.
- Display poster/title/year/overview.
- Add missing-poster fallback.
- Add loading/error states.
- Add TMDB normalisation tests.

### Acceptance criteria

- Search works.
- TMDB key remains server-side.
- Results are visually usable.
- Search works on mobile.

### Human phone test

- Search several movies.
- Confirm results are easy to identify.

### Stop point

Ask human to approve search UX.

---

## Milestone 6 — Add recommendation flow

### Goal

Allow participants to recommend movies.

### Tasks

- Build recommendation flow.
- Select movie from TMDB.
- Cache movie metadata.
- Select target.
- Use genre-prioritised reason chips.
- Add optional note.
- Submit recommendation.
- Show success state.

### Acceptance criteria

- Movie can be recommended to group/person/later.
- Reason chip is required.
- Genre-based chip ordering works.
- Note is optional.
- Recommendation appears in feed.

### Human phone test

- Recommend a movie to group.
- Recommend a movie to a person.
- Check reason chip relevance.

### Stop point

Ask human to verify recommendation flow and reason chips.

---

## Milestone 7 — Recommendation feed and movie cards

### Goal

Make the feed useful and beautiful.

### Tasks

- Build feed.
- Build movie recommendation card.
- Show poster/backdrop.
- Show social context.
- Show reason chip.
- Show note preview.
- Add empty/loading/error states.

### Acceptance criteria

- Feed looks polished.
- Cards are readable on mobile.
- Recommendations clearly show who recommended what and why.

### Human phone test

- Add multiple recommendations.
- Review feed on phone.
- Confirm cards feel appealing.

### Stop point

Ask human to approve card/feed design.

---

## Milestone 8 — Reactions and filters

### Goal

Allow participants to respond and browse useful subsets.

### Tasks

- Add reaction bar.
- Implement reaction create/update/delete.
- Show reaction summary.
- Add filters:
  - all
  - for me
  - want to watch
  - loved
  - seen
  - by recommender

### Acceptance criteria

- Reactions work.
- Reactions can be changed.
- Filters work.
- Reaction state persists.

### Human phone test

- Join as two participants.
- React to same movie.
- Test filters.

### Stop point

Ask human to verify reactions and filters.

---

## Milestone 9 — Movie detail and MVP polish

### Goal

Complete first testable MVP.

### Tasks

- Add movie detail modal/page.
- Show richer metadata.
- Show group reactions.
- Allow reaction updates from detail view.
- Add external placeholder actions.
- Polish admin page.
- Improve empty/error/loading states.
- Add final smoke/E2E tests.
- Update README.

### Acceptance criteria

- App is usable end-to-end.
- Invite links work via WhatsApp.
- Core flows work on mobile.
- Visual quality is good enough for friends/family test.
- Known limitations are documented.

### Human phone test

- Create group.
- Send invite.
- Join.
- Recommend movie.
- React.
- Filter.
- Open detail.
- Confirm app is ready for small trial.

### Stop point

Ask human whether to begin friends/family trial.

---

# 17. README requirements

The README must include:

- product summary
- tech stack
- local setup instructions for developers
- environment variables
- database migration/seed instructions
- Vercel deployment notes
- testing commands
- known limitations
- milestone status

Even though the human operator does not plan to run locally, the repo should still be understandable to future developers.

---

# 18. Future expansion notes

Do not implement these now, but avoid blocking them.

## 18.1 Books

Preparation:

- generic `items` table
- recommendation logic independent of movies

Future:

- add book metadata provider
- add `book_metadata`

## 18.2 Albums

Preparation:

- external source/id model

Future:

- add MusicBrainz/Spotify/Apple Music integration
- add album artwork and service links

## 18.3 Restaurants

Preparation:

- recommendation targets and reactions are item-type independent

Future:

- add places metadata
- add maps/booking links

## 18.4 Streaming links

Preparation:

- movie detail page includes external action area

Future:

- integrate JustWatch or equivalent

## 18.5 WhatsApp/share capture

Preparation:

- web-first invite and recommendation flows

Future:

- add PWA/share target
- add paste-from-chat parser
- add WhatsApp bot only if justified

## 18.6 City-level recommendations

Preparation:

- avoid collecting precise location in MVP
- keep private group data separate from future aggregate data

Future:

- aggregate only above privacy thresholds
- avoid exposing small-group behaviour

## 18.7 Cross-domain taste matching

Preparation:

- structured reactions
- stable participant IDs
- generic item model

Future:

- taste graph across movies/books/albums/restaurants
- transparent recommendation explanations

---

# 19. Definition of done for MVP

The MVP is done when:

1. App is deployed on Vercel.
2. Database is live on Neon.
3. User can create a group from phone.
4. Invite links can be shared via WhatsApp.
5. Recipients can join without account creation.
6. Users can search TMDB.
7. Users can recommend movies.
8. Users can choose genre-aware reason chips.
9. Users can react to recommendations.
10. Users can filter recommendations.
11. Movie cards look polished on mobile.
12. Admin can revoke/regenerate invite links.
13. Core flows have tests.
14. README explains setup and deployment.
15. Known limitations are documented.

---

# 20. Known deliberate limitations

The MVP intentionally does not include:

- full accounts
- email login
- password login
- native mobile app
- streaming availability
- restaurant/book/album support
- public discovery
- AI taste matching
- notifications
- payment
- advanced moderation

These are future features only.
