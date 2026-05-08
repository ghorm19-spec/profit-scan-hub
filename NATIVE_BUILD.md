# Score Flipp — Native (iOS / Android) Build Guide

The web app is store-ready. To submit to the Apple App Store or Google Play, wrap it with [Capacitor](https://capacitorjs.com). This must be done on **your own machine** (Lovable's preview can't run native toolchains).

## Optional env vars (set before `bun run build`)

Create a `.env.local` in the project root:
```
VITE_REVENUECAT_WEB_KEY=rcb_xxx       # from app.revenuecat.com → Project → API keys → Web Billing
VITE_SENTRY_DSN=https://xxx@sentry.io/yyy
```
Without these, Pro unlocks in test mode (local-only) and Sentry is disabled.

## 1. One-time setup


Clone the project locally (use the GitHub button in Lovable), then:

```bash
bun install
bun add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android \
        @capacitor/camera @capacitor/splash-screen @capacitor/status-bar \
        @capacitor-mlkit/barcode-scanning
bun run build
bunx cap add ios
bunx cap add android
bunx cap sync
```

## 2. Required tools

- **iOS**: macOS + Xcode 15+, an Apple Developer account ($99/yr)
- **Android**: Android Studio + a Google Play Console account ($25 one-time)

## 3. Open the native projects

```bash
bunx cap open ios       # opens Xcode
bunx cap open android   # opens Android Studio
```

## 4. Set the app icon

Use [appicon.co](https://appicon.co) — drop in `public/icon-1024.png` and it generates every iOS + Android size. Replace `ios/App/App/Assets.xcassets/AppIcon.appiconset` and `android/app/src/main/res/mipmap-*` folders.

## 5. Permissions to declare

**iOS** (`ios/App/App/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>Score Flipp needs your camera to scan items for resale analysis.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Score Flipp uses your photos to analyze items you'd like to flip.</string>
```

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

## 6. Submission checklist

- [ ] App icon (1024×1024) ✅ already at `public/icon-1024.png`
- [ ] Splash screen (use [capacitor-assets](https://github.com/ionic-team/capacitor-assets))
- [ ] Privacy Policy URL → `https://yourdomain.com/privacy` ✅ in app
- [ ] Terms URL → `https://yourdomain.com/terms` ✅ in app
- [ ] Account deletion path ✅ in Profile
- [ ] 6.7" + 6.5" + 5.5" screenshots (use the iOS simulator)
- [ ] App description, keywords, category = "Shopping" or "Business"
- [ ] Age rating: 4+ (no objectionable content)
- [ ] Sign in with Apple — **required by Apple if you offer Google sign-in**. Add `@capacitor-community/apple-sign-in` and enable Apple as a provider in your backend.

## 7. Build & upload

```bash
bun run build && bunx cap sync
bunx cap open ios       # → Product → Archive → Distribute via App Store Connect
bunx cap open android   # → Build → Generate Signed Bundle → upload to Play Console
```

## 8. Whenever you change web code

```bash
bun run build && bunx cap sync
```

That's it.
