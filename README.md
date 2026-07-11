# Abigail Marie Photography

Static site for Abigail Marie Photography, built with [Astro](https://astro.build). A static
clone of the Squarespace site content — home, gallery, packages, and contact pages.

## Project Structure

```text
/
├── public/
│   ├── _headers        # Cloudflare Pages response headers
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── gallery.astro
│   │   ├── packages.astro
│   │   └── contact.astro
│   └── styles/
│       └── global.css
└── package.json
```

Photography images are hotlinked directly from the Squarespace CDN.

## Commands

| Command             | Action                                       |
| :------------------- | :-------------------------------------------- |
| `npm install`         | Install dependencies                          |
| `npm run dev`         | Start local dev server at `localhost:4321`    |
| `npm run build`       | Build the static site to `./dist/`            |
| `npm run preview`     | Preview the production build locally          |

## Deploying to Cloudflare Pages

This project builds to static HTML/CSS/JS with no server-side runtime, so it deploys directly to
Cloudflare Pages.

### Option A: Cloudflare dashboard (Git integration)

1. Push this repository to GitHub (already done if you're reading this from the repo).
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the `abigailmariephotography-site` repository.
4. Set the build configuration:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy. Cloudflare will rebuild automatically on every push to `main`.

### Option B: Wrangler CLI

```sh
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name=abigailmariephotography-site
```

`public/_headers` is copied into the build output automatically by Astro and applies security
and caching headers on Cloudflare Pages.
