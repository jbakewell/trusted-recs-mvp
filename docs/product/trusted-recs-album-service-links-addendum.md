# Trusted Recs Album Service Links Addendum

## Purpose

Add lightweight external music links for album recommendations:

- open the exact Spotify album when available
- search for the album on the participant's preferred music service
- keep all actions external links

Do not add playback, previews, Spotify login, account linking, universal smart links, or cross-service matching APIs.

## Supported Preferred Services

Participants can choose:

- `none`
- `spotify`
- `apple_music`
- `youtube_music`
- `amazon_music`
- `bandcamp`

The preference is per participant.

## Detail Page Behavior

Album detail pages show a `Music links` section:

- If preference is `none`, show `Open in Spotify` when `spotifyUrl` exists.
- If preference is `spotify`, show exact `Open in Spotify` when available; otherwise show `Search on Spotify`.
- If preference is Apple Music, YouTube Music, Amazon Music, or Bandcamp, show that search link as primary and exact Spotify as secondary when available.
- If no link can be generated, show `No music links available yet.`

External links open in a new tab/window with `rel="noopener noreferrer"`.

## Search URLs

Build search queries from `{primary artist} {album title}`. If artist is missing, use album title only.

- Apple Music: `https://music.apple.com/search?term={encodedQuery}`
- YouTube Music: `https://music.youtube.com/search?q={encodedQuery}`
- Amazon Music UK: `https://music.amazon.co.uk/search/{encodedQuery}`
- Bandcamp: `https://bandcamp.com/search?q={encodedQuery}`
- Spotify fallback search: `https://open.spotify.com/search/{encodedQuery}`
