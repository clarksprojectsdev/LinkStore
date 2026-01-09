# EAS Hosting Setup Guide

## Why EAS Hosting?
- Designed specifically for Expo projects
- Handles Expo Router automatically
- No Metro serializer issues
- Integrated with Expo ecosystem

## Setup Steps

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account:**
   ```bash
   eas login
   ```

3. **Configure EAS (if not already done):**
   ```bash
   eas build:configure
   ```

4. **Deploy to EAS Hosting:**
   ```bash
   eas deploy --platform web
   ```

5. **Your store will be available at:**
   - `https://linkstore-[hash].exp.direct` (temporary)
   - Or configure a custom domain in EAS dashboard

## Benefits
- ✅ No Metro module resolution errors
- ✅ Automatic handling of Expo Router
- ✅ Built-in CDN and optimization
- ✅ Easy updates with `eas deploy`
- ✅ Free tier available

## Alternative: Keep Vercel for static assets
If you prefer Vercel, you can:
1. Export locally: `npx expo export --platform web`
2. Deploy the `web-build` folder to Vercel manually
3. This bypasses the build process on Vercel
