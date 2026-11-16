# Joshua Ferreira — personal portfolio

A static Astro portfolio connecting software engineering, AI/ML exploration, game development, and IT. Includes a scrolling homepage, story, experience, project collection, four project writeups, and a custom 404 page.

## Development

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Default local URL: `http://localhost:4321/Portfolio_Website/`.

```sh
npm run build
npm run preview
```

`dist/` is the complete, portable static site. No backend, external font requests, analytics, or contact form service is required. LinkedIn is the primary contact route. Fonts ship locally through Fontsource packages with their upstream licenses.

## Update content

- `src/data/site.ts`: biography-related traits, interests, work experience, project descriptions, public repository links, and LinkedIn.
- `src/pages/`: page composition and story copy.
- `src/styles/global.css`: visual system and responsive styles.
- `src/components/ProjectArt.astro`: original conceptual artwork. These are labeled illustrations, not screenshots or scientific results.
- `src/scripts/orbit.ts`: a decorative Canvas 2D globe with projected points and orbit rings. It does not simulate a neural model.

The experience source was the owner-provided “Internship/Job Descriptions/info” spreadsheet, reviewed November 16, 2026. Pay and references’ information are excluded. Current roles reflect that source update; update them when circumstances change. The Merrimack start year was absent from the source and is intentionally omitted. Do not infer current education from the archived portfolio.

Project scope is grounded in reviewed repository documentation and code. Centurion is a development implementation, Neural Foundations is an archived fixed-weight exercise with no training, and TV Price Analysis is coursework. Fly Table Game is a private project represented only by an authorized high-level description and newly authored conceptual artwork; no private assets, source, or downloads are included.

## Verify

Start the production preview, then run:

```sh
npm test
```

The Playwright suite uses `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to a local Chromium executable on another machine. Tests cover direct page loads, WCAG A/AA automated checks with axe, responsive overflow, runtime errors, navigation, filters, motion preferences, and essential content without JavaScript. Automated accessibility checks supplement manual visual and keyboard inspection.

## Deploy

The GitHub Actions workflow builds and publishes `master` to GitHub Pages. Select **GitHub Actions** as the repository’s Pages source. Subsequent pushes to `master` redeploy automatically.

Expected project URL: `https://kointaker.github.io/Portfolio_Website/`.

For another host, set the origin and deployment path at build time:

```sh
SITE_URL=https://example.com BASE_PATH=/ npm run build
```

Upload `dist/` to the new static host. Each page has its own directory and `index.html`; direct links do not require SPA rewrites. Configure the host to serve `404.html` for missing paths. GitHub Pages is temporary testing hosting and is publicly accessible.

## Design and accessibility

Locally served Manrope, Space Grotesk, and IBM Plex Mono; a blue-black and mint palette; original CSS/SVG project illustrations; and one lightweight Canvas interaction. All essential page content and links are server-rendered. Motion respects the operating-system preference and can also be disabled using the footer control. Animation pauses offscreen and when the tab is hidden. Mobile navigation also remains accessible without JavaScript.
