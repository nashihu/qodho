# Implementation Plan - Integrate Google Sign-In (Next.js & Netlify)

Integrate Google OAuth authentication into the Next.js 14 application (`qodho-sholat-app`) using `next-auth`. Credentials will be stored in `.env.local` for local development and Netlify Environment Variables for production (`https://qodho.netlify.app`). A clean Google Sign-In / user profile section will be added to the main navigation header.

## User Review Required - Google Cloud Console & Netlify Setup Guide

> [!IMPORTANT]
> When configuring your OAuth 2.0 Web Application credentials in the [Google Cloud Console](https://console.cloud.google.com/):

### 1. Authorized JavaScript Origins
Add both local and production domain URLs:
- `http://localhost:3000`
- `https://qodho.netlify.app`

### 2. Authorized Redirect URIs
Add both local and production NextAuth callback URLs:
- `http://localhost:3000/api/auth/callback/google`
- `https://qodho.netlify.app/api/auth/callback/google`

### 3. Environment Variables Configuration

#### A. Local Development (`.env.local`)
Create/update `.env.local` in your root directory:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="a-random-secure-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

#### B. Production (Netlify Environment Variables)
In your **Netlify Dashboard** -> **Site configuration** -> **Environment variables**:
Add the following variables:
- `GOOGLE_CLIENT_ID` = *(your Google Client ID)*
- `GOOGLE_CLIENT_SECRET` = *(your Google Client Secret)*
- `NEXTAUTH_SECRET` = *(a random secure secret string)*
- `NEXTAUTH_URL` = `https://qodho.netlify.app`

---

## Proposed Changes

### Dependencies & Environment

#### [MODIFY] [package.json](file:///Users/ahmadnashihuddien/Documents/work/youtube/qodho/package.json)
- Add `next-auth` dependency.

#### [NEW] [.env.local](file:///Users/ahmadnashihuddien/Documents/work/youtube/qodho/.env.local)
- Create local environment file with placeholder credential variables.

---

### Auth API & Providers

#### [NEW] [src/app/api/auth/[...nextauth]/route.js](file:///Users/ahmadnashihuddien/Documents/work/youtube/qodho/src/app/api/auth/%5B...nextauth%5D/route.js)
- Implement NextAuth API route handler with `GoogleProvider`.

#### [NEW] [src/components/AuthProvider.jsx](file:///Users/ahmadnashihuddien/Documents/work/youtube/qodho/src/components/AuthProvider.jsx)
- Create client wrapper component utilizing `SessionProvider` from `next-auth/react`.

#### [MODIFY] [src/app/layout.jsx](file:///Users/ahmadnashihuddien/Documents/work/youtube/qodho/src/app/layout.jsx)
- Wrap root layout body with `<AuthProvider>`.

---

### UI Components

#### [MODIFY] [src/components/Navbar.jsx](file:///Users/ahmadnashihuddien/Documents/work/youtube/qodho/src/components/Navbar.jsx)
- Add Google Sign-In & User Profile state to the header:
  - When unauthenticated: Display **"Masuk dengan Google"** button with official Google logo.
  - When authenticated: Display user profile picture / name badge and a **"Keluar"** button.

---

## Verification Plan

### Automated Tests / Builds
- Run `npm run build` locally to ensure static analysis and NextAuth routes compile cleanly.

### Manual Verification
- Test local login state rendering and Navbar UI on `http://localhost:3000`.
- Verify callback URL endpoints and environment variable setups.
