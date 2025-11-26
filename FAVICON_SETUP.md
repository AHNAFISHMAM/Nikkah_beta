# Favicon Setup Guide

## ✅ Quick Fix Applied

I've added favicon metadata to your `app/layout.tsx`. The 404 error should be resolved.

## 🎨 Add Your Custom Favicon

### Option 1: Generate a Favicon Online (Recommended)

1. **Visit a favicon generator:**
   - https://favicon.io/ (Free, simple)
   - https://realfavicongenerator.net/ (Advanced, multiple sizes)

2. **Create your favicon:**
   - Use your logo or create a simple design
   - Download the generated `favicon.ico` file

3. **Place it in the `public` folder:**
   ```
   public/
     └── favicon.ico
   ```

4. **That's it!** Next.js will automatically serve it.

### Option 2: Use Next.js App Directory (Next.js 13+)

You can also place `favicon.ico` directly in the `app` directory:

```
app/
  └── favicon.ico
```

Next.js will automatically detect and serve it.

### Option 3: Create a Simple SVG Favicon

Create `app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#625BFF"/>
  <text x="50" y="65" font-size="50" text-anchor="middle" fill="white">ن</text>
</svg>
```

Next.js will automatically convert it to a favicon.

## 📝 Current Setup

Your `app/layout.tsx` now includes:

```typescript
icons: {
  icon: '/favicon.ico',
  shortcut: '/favicon.ico',
  apple: '/favicon.ico',
}
```

This tells browsers where to find your favicon.

## ✅ Verification

After adding your favicon:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Check in browser:**
   - Visit `http://localhost:3000/favicon.ico`
   - Should return 200 (not 404)
   - Favicon should appear in browser tab

3. **Clear browser cache** if you don't see it:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## 🎨 Design Suggestions

For NikahPrep, consider:
- Islamic geometric pattern
- Crescent moon and star
- Arabic letter "ن" (Nun) in a circle
- Gradient from purple to gold (matching your brand colors)

## 📚 Additional Icons (Optional)

For better mobile support, you can also add:

- `apple-touch-icon.png` (180x180) - iOS home screen
- `icon-192.png` (192x192) - Android
- `icon-512.png` (512x512) - Android

Place these in the `public` folder and reference them in metadata.

## ✅ Status

- ✅ Favicon metadata added to layout
- ✅ Public directory created
- ⏳ Add your actual favicon.ico file (see instructions above)

The 404 error will be resolved once you add the actual favicon file!

