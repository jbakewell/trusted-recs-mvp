# Trusted Recs - Movie Watch Providers MVP Addendum

Add lightweight movie watch-provider availability to movie detail pages using TMDB Watch Providers.

Scope:
- Server-side TMDB watch-provider lookup.
- Default region `GB`, configurable with `DEFAULT_WATCH_REGION`.
- Normalised groups: Stream, Rent, Buy, Free, Ads.
- Display only on movie detail pages.
- Include the TMDB watch-options link when present.
- Show calm empty/error states.

Non-goals:
- No JustWatch/commercial provider integrations.
- No subscription preferences, price comparison, playback, alerts, or feed-card provider lists.
- No region settings UI in this MVP.
