# Generating App Store / Play Store marketing screenshots

There's an automated capture script at [scripts/marketing-screenshots.ts](../scripts/marketing-screenshots.ts).

## Quick start

```bash
# First-run only: install the browser binary
pnpm exec playwright install chromium

# Capture from the live site (splash gate cookie is set automatically)
SPLASH_PASSWORD=<value> pnpm screenshots

# Or hit a local dev server
BASE_URL=http://localhost:3000 SPLASH_PASSWORD=<value> pnpm screenshots
```

Output lands in `apps/mobile/marketing/screenshots/{platform}/{device}/`
as PNGs at the native viewport size. The folder is gitignored — re-run
the script when you want fresh frames.

Frames captured per device (6 each):

1. `01-home` — the personalised home rail stack
2. `02-recipe` — the cooking category index
3. `03-saved` — `/me/bookmarks`
4. `04-search` — `/search?q=pasta`
5. `05-notifications` — `/me/notifications`
6. `06-cooking-mode` — a recipe with cooking mode toggled on. Picks the
   first recipe link off the home page unless you set
   `FRAME_COOKING_MODE_PATH=/cooking/foo-bar` to lock to a specific one.

Required dimensions (the script renders at these sizes natively):

| Platform               | Pixel size (portrait) |
| ---------------------- | --------------------- |
| iPhone 6.7"            | 1290×2796             |
| iPhone 6.5"            | 1242×2688             |
| iPhone 5.5"            | 1242×2208             |
| iPad Pro 12.9" (6th)   | 2048×2732             |
| Android phone          | 1080×1920 (min)       |
| Android 7" tablet      | 1200×1920             |
| Android 10" tablet     | 1600×2560             |

Sequence to capture (5-6 frames each):

1. **Home rail stack** — the personalised home for a signed-in user
   showing the in-progress strip, in-season rail, and editorial picks.
2. **A recipe in cooking mode** — paginated step view with the
   ingredients pinned and the previous/next toolbar visible.
3. **Saved view** — `/me/bookmarks` with several saved recipes.
4. **Search** — `/search` with a query like "pasta" and a few results.
5. **Notifications** — `/me/notifications` showing a moderation outcome.
6. **A tutorial in regular reading mode** — to show the full editorial
   shape: hero, info bar, body content.

When framing, leave 24px breathing room on each side so the platform's
glossy frame doesn't crop content. App Store / Play screenshots are
displayed at small sizes; legible big type matters more than detail.

Brand-aligned: cream / sage / Fraunces. Don't add device-frame mockups
(those are off-brand against the slow-living register); the App Store
auto-frames screenshots itself on the "Featured" tile.
