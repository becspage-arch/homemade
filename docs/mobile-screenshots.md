# Generating App Store / Play Store marketing screenshots

Workflow: open the public site at the right viewport size in a headless
browser, screenshot the framed page, then crop to platform requirements.

Until the headless screenshot job lands, capture by hand using a real
device or a browser at the required dimensions. Required dimensions:

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
