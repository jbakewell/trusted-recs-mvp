# Trusted Recs - Minimal UI Plan for Books Extension

## Purpose

This note explains a small UI update now that Books are being added alongside Movies.
The goal is to keep the app feeling almost the same, while making the feed and add flow work cleanly for multiple item types.

## Core changes

### 1. Replace the large "Recommend a movie" button

Remove the large movie-specific pill button.
Replace it with a compact circular `+` button in the top-right area of the category selector.

Behaviour:

- In Movies view, `+` means Recommend a movie.
- In Books view, `+` means Recommend a book.

Requirements:

- Visually use the existing accent colour.
- Keep it compact and mobile-friendly.
- Add an accessible label based on the current category.
- Do not use a floating action button unless necessary; prefer an in-layout button.

### 2. Add a simple category selector above the list/feed

For the current phase, support:

- Books
- Movies

Later this may expand to Albums.

Rules:

- Active category must be visually obvious.
- Switching category updates the list/feed contents.
- Keep the selector light and compact.
- Use the existing visual language of the app.

### 3. Keep the feed layout the same

Do not redesign the list cards.
The feed should continue to show a vertically stacked list of recommendation cards.
Only adapt the metadata based on item type.

### 4. Keep the recommendation flow almost identical

Reuse the existing recommendation flow.
The main change is that the current category determines what the `+` action opens.

## Local implementation choices

- Movies remain the default category.
- Compact list cards do not show reason chips; reasons remain on the item detail page.
- The existing two-step add flow remains in place.
- Book search uses Google Books without introducing a new runtime dependency.
