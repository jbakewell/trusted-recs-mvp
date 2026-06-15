# Trusted Recs Albums API Addendum

## Purpose

Add albums as a future recommendable item type using the Spotify Web API. This extends the existing multi-type recommendation system and should not change movie or book behavior except where shared item plumbing must become album-aware.

## Scope

Support full albums only:

- search albums
- select an album
- cache album metadata
- recommend the album to the group
- choose optional reason chips
- add an optional note
- show albums in the existing feed/card/detail system

Do not support tracks, playlists, artists as recommendations, playback, Spotify user login, listening history, user libraries, playlist creation, or Spotify social features.

## Spotify API

Use the Spotify Web API with Client Credentials flow. All Spotify calls must happen server-side.

Required environment variables:

```env
SPOTIFY_CLIENT_ID="[placeholder]"
SPOTIFY_CLIENT_SECRET="[placeholder]"
SPOTIFY_BASE_URL="https://api.spotify.com/v1"
SPOTIFY_ACCOUNTS_URL="https://accounts.spotify.com"
```

Search endpoint:

```text
GET /api/albums/search?query=
```

Spotify search call:

```text
GET https://api.spotify.com/v1/search?q={query}&type=album&limit=10&market=GB
```

Normalize Spotify results to:

```ts
type SpotifyAlbumSearchResult = {
  spotifyAlbumId: string;
  title: string;
  artists: string[];
  releaseDate: string | null;
  releaseYear: number | null;
  coverImageUrl: string | null;
  totalTracks: number | null;
  spotifyUrl: string | null;
};
```

## Data Model

Use the existing generic `items` table:

- `type = "album"`
- `externalSource = "spotify"`
- `externalId = Spotify album ID`

Add `album_metadata` with:

- `itemId`
- `spotifyAlbumId`
- `title`
- `artists`
- `releaseDate`
- `releaseYear`
- `coverImageUrl`
- `totalTracks`
- `spotifyUrl`
- `spotifyLastSyncedAt`
- standard timestamps

Treat each Spotify album ID as canonical for MVP. Do not merge remasters, deluxe editions, regional editions, or reissues.

## UI Behavior

The group category selector includes `Books`, `Movies`, and `Albums`. The add button acts on the selected category.

Album search results show cover image, album title, artists, release year, and total tracks where available.

Album feed cards reuse the existing compact recommendation card. Album detail pages reuse the existing generic item detail page and include an `Open in Spotify` link when available.

## Reason Chips

Seed album-specific reasons using `genreKey = "album_default"`:

- Great songs
- No skips
- Amazing production
- Great vocals
- Great guitar sounds
- Great lyrics
- Atmospheric
- Beautifully arranged
- Huge choruses
- Weird but brilliant
- Classic album
- Underrated
- Perfect mood
- Great for the car
- Worth hearing in full

Do not implement genre-aware album reason sorting yet.
