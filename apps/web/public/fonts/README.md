# Bundled fonts

Server-side only. These files are read by `apps/web/src/lib/studio/pdf-export.ts`
(chart symbols in the printed PDF) and by
`apps/web/src/lib/studio/generation/samplers/lettering.ts` (the sampler and
word-art lettering set). They are copied into the container image with the rest
of `apps/web/public`, so nothing here depends on a font being installed on the
host.

Nothing here is served to the browser as a webfont. Lettering is turned into
glyph outlines on the server, so the same text charts identically on a
developer's machine and on the running site.

| File | Face | Licence |
| --- | --- | --- |
| `DejaVuSans.ttf` | DejaVu Sans | DejaVu Fonts License (Bitstream Vera derivative, free) |
| `DejaVuSans-Bold.ttf` | DejaVu Sans Bold | DejaVu Fonts License (Bitstream Vera derivative, free) |
| `EBGaramond_600SemiBold.ttf` | EB Garamond SemiBold | SIL Open Font License 1.1 (`OFL.txt`) |
| `GreatVibes_400Regular.ttf` | Great Vibes | SIL Open Font License 1.1 (`OFL.txt`) |
| `DancingScript_700Bold.ttf` | Dancing Script Bold | SIL Open Font License 1.1 (`OFL.txt`) |
| `Montserrat_500Medium.ttf` | Montserrat Medium | SIL Open Font License 1.1 (`OFL.txt`) |
| `Montserrat_700Bold.ttf` | Montserrat Bold | SIL Open Font License 1.1 (`OFL.txt`) |

`OFL.txt` is the SIL Open Font License 1.1 text that ships with all four Google
Fonts families above. The DejaVu licence is at
https://dejavu-fonts.github.io/License.html.
