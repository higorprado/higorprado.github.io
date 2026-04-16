# higorprado.me

Personal portfolio and blog. Built with [Eleventy](https://www.11ty.dev/), styled with [Catppuccin](https://catppuccin.com/).

## Local development

```bash
npm install
npm run serve
```

Open http://localhost:8080

## Build

```bash
npm run build
```

Output goes to `_site/`.

## Deploy

Push to `main`. GitHub Actions builds and deploys to GitHub Pages automatically.

## Adding a blog post

Create `src/blog/posts/YYYY-MM-DD-slug.md`:

```markdown
---
title: "Post Title"
description: "Short description"
date: YYYY-MM-DD
---

Content here.
```
