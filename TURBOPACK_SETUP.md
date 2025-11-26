# Turbopack Configuration

## Overview
This project uses **Turbopack** as the default bundler (Next.js 15.5.6+). Turbopack is a Rust-based, incremental bundler that provides significantly faster development and build times.

## Quick Start

### Development
```bash
# Default: Uses Turbopack automatically (no flag needed)
npm run dev

# Fallback: Use Webpack if needed
npm run dev:webpack
```

**Note:** In Next.js 15.5+, Turbopack is the **default bundler**. There is no `--turbopack` flag - it's always used unless you explicitly opt into Webpack with `--webpack`.

### Build
```bash
# Default: Uses Turbopack
npm run build

# Fallback: Use Webpack if needed
npm run build:webpack
```

### Performance Debugging
```bash
# Generate trace file for performance analysis
npm run dev:trace
# Output: .next/dev/trace-turbopack
```

## Configuration

### Filesystem Caching (Enabled)
- **Dev**: `experimental.turbopackFileSystemCacheForDev: true`
- **Build**: `experimental.turbopackFileSystemCacheForBuild: true`

This caches compiler artifacts on disk for faster subsequent runs.

### Path Aliases
Turbopack automatically reads `tsconfig.json` paths:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

Manual override available in `next.config.js`:
```js
turbopack: {
  resolveAlias: {
    '@': path.join(__dirname),
  }
}
```

## Supported Features

✅ **Fully Supported:**
- TypeScript & JavaScript (via SWC)
- JSX/TSX with Fast Refresh
- React Server Components
- CSS Modules & Global CSS
- PostCSS (Tailwind, Autoprefixer)
- Sass/SCSS
- Static assets (images, fonts, JSON)
- Path aliases from tsconfig.json
- Babel (auto-detected if config present)

⚠️ **Known Limitations:**
- Webpack plugins not supported (use loaders instead)
- Some legacy CSS Modules features
- Custom Sass functions (`sassOptions.functions`) not supported
- Yarn PnP not planned

## Performance Tips

1. **First Run**: May be slower as cache builds up
2. **Subsequent Runs**: Much faster due to incremental compilation
3. **Large Apps**: Turbopack only bundles what's requested (lazy bundling)
4. **Cache**: Delete `.next` folder to reset cache if issues occur

## Migration Notes

### From Webpack
- Remove `--turbo` flag (Turbopack is now default)
- Use `--webpack` flag to opt back into Webpack
- Webpack config in `next.config.js` only applies with `--webpack` flag

### CSS Module Ordering
Turbopack follows JS import order for CSS modules. If you see styling issues:
- Use `@import` in CSS to force ordering
- Or adjust conflicting CSS rules

### Bundle Sizes
Turbopack may produce fewer but larger chunks compared to Webpack. Focus on:
- Core Web Vitals
- Application-level metrics
- Not just bundle size

## Troubleshooting

### Performance Issues
1. Enable tracing: `npm run dev:trace`
2. Check `.next/dev/trace-turbopack` file
3. Report to Next.js team with trace file

### Build Errors
1. Clear cache: `npm run clean`
2. Try Webpack fallback: `npm run build:webpack`
3. Check for unsupported features (see limitations above)

### Module Resolution
If files outside project root aren't resolving:
```js
turbopack: {
  root: path.resolve(__dirname, '..'), // Parent directory
}
```

## References
- [Next.js Turbopack Docs](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)
- [Turbopack API Reference](https://turbo.build/pack/docs/api-reference)

