# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build static site for production
npm run build

# Start production server (after build)
npm start

# Lint the codebase
npm run lint

# Apply patches after dependency changes
npm run postinstall
```

## Architecture Overview

**Static Blog with Next.js App Router**: This is Dan Abramov's personal blog built as a static site using Next.js 15 with the App Router and React 19. The site exports to static files (`output: "export"`).

**Blog Post Structure**: Posts are stored as markdown files in `/public/[slug]/index.md` with frontmatter containing metadata (title, date, spoiler, youtube). Each post directory can contain:
- `index.md` - The main post content
- `components.js` - Post-specific React components and optional `Wrapper` component
- Asset files (images, etc.)

**Content Processing Pipeline**:
1. `app/posts.js` reads all post directories from `/public/`
2. Uses `gray-matter` to parse frontmatter from markdown files
3. Posts are sorted by date (newest first)
4. Individual posts are rendered via `app/[slug]/page.js` using `next-mdx-remote-client`

**MDX Processing**: Posts support advanced MDX features:
- JavaScript code blocks with `eval` meta execute and render inline (see `app/[slug]/mdx.js`)
- Post-specific components can be imported from `components.js` files
- Syntax highlighting via Shiki with "Overnight Slumber" theme
- Auto-linking headings, GFM support, smart quotes

**Routing**:
- `/` - Home page listing all posts (`app/page.js`)
- `/[slug]/` - Individual post pages (`app/[slug]/page.js`)
- `/atom.xml` and `/rss.xml` - Generated feeds (`app/atom.xml/route.js`, `app/rss.xml/route.js`)

**Styling**: Uses Tailwind CSS with custom CSS variables for theming (`--bg`, `--text`, `--title`, etc.). Post titles have dynamic color-coding based on post age using `colorjs.io`.

**Static Generation**: All pages are pre-generated at build time. Post pages use `generateStaticParams()` to create routes for all post directories.

## Key Files

- `app/posts.js` - Core post discovery and feed generation logic
- `app/[slug]/page.js` - Individual post rendering with MDX processing
- `app/[slug]/mdx.js` - Custom remark plugin for executable code blocks
- `next.config.js` - Static export configuration
- `public/[slug]/index.md` - Post content files with frontmatter
- `public/[slug]/components.js` - Optional post-specific React components