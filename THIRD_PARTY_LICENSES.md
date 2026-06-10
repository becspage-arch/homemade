# Third-party licences

Homemade depends on a number of open-source projects. The notices below
cover the third-party software whose code or output ships with the
application or is rendered into user-facing surfaces.

For ordinary npm dependencies whose licence terms only require the licence
text in the package (MIT, Apache-2.0, ISC), see each package's own
`LICENSE` / `README` in `node_modules`. The notices below cover the
dependencies whose licence terms require attribution at the application
level or whose output is rendered for end users.

## freesewing — MIT

The sewing grading wrapper at `apps/web/src/lib/sewing/grading/` calls
into the freesewing engine to render parametric sewing patterns. The
engine, its bundled plugins, and the body block designs (Bella, Brian)
and the Aaron T-shirt design are MIT-licensed open-source software
created by Joost De Cock and contributors. The freesewing project page is
https://freesewing.org.

The freesewing packages embedded in Homemade as of this writing:

- `@freesewing/core` 4.9.0
- `@freesewing/core-plugins` 4.9.0 (transitive)
- `@freesewing/utils` 4.9.0
- `@freesewing/models` 4.9.0
- `@freesewing/library` 4.9.0
- `@freesewing/config` 4.9.0
- `@freesewing/bella` 4.9.0 — women's body block
- `@freesewing/brian` 4.9.0 — men's body block
- `@freesewing/aaron` 4.9.0 — knit T-shirt
- `@freesewing/plugin-bundle` 2.22.2
- `@freesewing/plugin-bust` 4.9.0
- `@freesewing/plugin-transform` 4.9.0

The MIT licence in full:

```
MIT License

Copyright (c) Joost De Cock and the freesewing contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Drafted patterns rendered by the freesewing engine carry a footer credit
line: "This pattern was drafted using freesewing. The freesewing project
is MIT-licensed open-source software created by Joost De Cock.
https://freesewing.org" The credit is hidden on PROJECTOR-mode output so
the grid stays clean for fabric calibration; PRINT and BROWSE output
carry it.

The wrapper isolates all `@freesewing/*` imports to
`apps/web/src/lib/sewing/grading/`. Studio, API routes, and content
authoring scripts call into the wrapper instead so the boundary stays
clean and a future engine swap (if needed) is a one-file change.
