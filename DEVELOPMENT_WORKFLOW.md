# Development Workflow Guide

## The Problem We Solved
The theme customizer was showing a white page because `assets/tailwind.css` and `assets/bundle.js` were missing. These files need to be compiled from source before running the Shopify theme.

## Project Structure
```
paliroots/
├── src/                     # Source files (NOT uploaded to Shopify)
│   ├── styles/main.css      # Tailwind source
│   └── scripts/main.js      # JavaScript with GSAP
├── assets/                  # Compiled assets (uploaded to Shopify)
│   ├── tailwind.css         # Compiled from src/styles/main.css
│   ├── bundle.js           # Compiled from src/scripts/main.js
│   └── other-assets...
├── package.json            # Build tools (NOT uploaded to Shopify)
├── .shopifyignore          # Prevents source files from uploading
└── tailwind.config.js      # Config (NOT uploaded to Shopify)
```

## Key Files
- **`.shopifyignore`** - Prevents source files and build tools from being uploaded to Shopify
- **`package.json`** - Contains build scripts, stays local only
- **`src/`** - Source files for CSS and JavaScript, stays local only

## Workflow Commands

### Initial Setup (one-time)
```bash
npm install
npm run build  # Creates assets/tailwind.css and assets/bundle.js
```

### Development (daily workflow)
```bash
npm run dev    # Runs both Shopify theme dev AND watches for file changes
```
This runs in parallel:
- `shopify theme dev --store=paliroots-dev` (Shopify development server)
- `tailwindcss --watch` (rebuilds CSS when src/styles/ changes)
- `esbuild --watch` (rebuilds JS when src/scripts/ changes)

### Manual Build (when needed)
```bash
npm run build  # Build production assets
npm run push   # Build + push to Shopify store
```

## Important Notes

1. **Always build before theme dev**: The compiled assets must exist before running `shopify theme dev`

2. **Source files stay local**: Everything in `src/`, `package.json`, and `tailwind.config.js` never gets uploaded to Shopify

3. **Only compiled assets upload**: Shopify only receives the final `assets/tailwind.css` and `assets/bundle.js`

4. **File watching**: Use `npm run dev` to automatically rebuild assets when source files change

## Troubleshooting

**Theme customizer shows white page?**
- Run `npm run build` to ensure `assets/tailwind.css` and `assets/bundle.js` exist
- Check browser console for 404 errors on missing assets

**Changes to CSS/JS not showing?**
- Make sure you're editing files in `src/` not `assets/`
- Run `npm run build` or ensure `npm run dev` is running with file watching

**Package.json disappeared after theme push?**
- This is normal! The `.shopifyignore` file prevents it from being uploaded
- Keep `package.json` local and use it for building assets only