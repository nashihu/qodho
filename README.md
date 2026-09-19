# Qodho Tracker & Calculator Web Application

A modern, responsive, and SEO-optimized web application built with **Next.js 14+ (App Router)** and **Tailwind CSS** to calculate, track, and fulfill missed daily prayers (*Qodho Sholat Fardhu*).

---

## 🚀 Technical Stack

- **Framework**: Next.js 14+ (App Router)
- **UI & Styling**: React 18, Tailwind CSS v3, Lucide React Icons
- **State & Persistence**: Browser `localStorage` with custom window event listeners (`qodho_updated`, `storage`)
- **SEO & Export**: Static Site Generation (SSG), JSON-LD Schema.org metadata, exported to `dist/` for Netlify deployment (`output: 'export'`)

---

## 📌 Project Architecture & Routing

```
qodho/
├── dist/                           # Netlify static build output directory
├── next.config.mjs                 # Configured with distDir: 'dist' and output: 'export'
├── tailwind.config.js & postcss    # Tailwind CSS configuration
├── src/
│   ├── app/                        # Next.js App Router routes
│   │   ├── layout.jsx              # Root Layout with global SEO metadata & footer
│   │   ├── page.jsx                # Home Dashboard (Lifetime Tracker, Udzur, Articles)
│   │   ├── kalkulator/page.jsx     # Multi-Period Qodho Duration & Prayer Calculator
│   │   ├── kalender/page.jsx       # Interactive Monthly Qodho Calendar View
│   │   └── artikel/
│   │       ├── page.jsx            # SEO Article Listing
│   │       └── [slug]/page.jsx     # SEO Article Detail (JSON-LD, OpenGraph)
│   ├── components/                 # Reusable React UI Components
│   │   ├── Navbar.jsx              # Cross-route navigation bar
│   │   ├── LifetimeSummary.jsx     # Home tracker & per-prayer counter cards
│   │   ├── ManualMissedPrayer.jsx  # Manual udzur (sick/travel) missed prayer log
│   │   └── ArticleSection.jsx      # Article grid card & reader modal
│   ├── data/
│   │   └── articles.js             # Educational article content & image metadata
│   └── utils/
│       └── qodhoCalculator.js      # Overlap merging & period calculation engine
```

---

## 🌟 Key Features

### 1. Home Dashboard (`/`)
- **Duration Summary Bar**: Displays active date range / duration with shortcut link to `/kalkulator`.
- **Overview Card**: Total missed prayers, completed count, remaining debt, and visual progress percentage bar.
- **Prayer Counter Cards**: Individual cards for **Subuh**, **Dzuhur**, **Ashar**, **Maghrib**, and **Isya** with `-1 Qodho`, `+5 Qodho`, and `Koreksi` buttons.
- **Zero Default Initial State**: Fresh / Incognito sessions default to **0** total debt with an onboarding banner.

### 2. Multi-Period Qodho Calculator (`/kalkulator`)
- **Calendar Date Range Picker**: Select `startDate` and `endDate` with quick presets (`1 Bulan`, `3 Bulan`, `1 Tahun`, `2 Tahun`, `3 Tahun`, `5 Tahun`, `10 Tahun`).
- **Per-Prayer Selection**: Checkboxes to select which specific prayers were missed (*Subuh, Dzuhur, Ashar, Maghrib, Isya*).
- **Multi-Period Entries**: Add multiple distinct date periods (e.g. August = Subuh only, September = Isya only).
- **Overlap Merging Engine**: Merges overlapping date ranges and prayer requirements without double-counting.
- **Counter Preservation**: Modifying periods strictly preserves existing `completed` counter progress.

### 3. Interactive Qodho Calendar View (`/kalender`)
- **Monthly Grid**: Month/year switcher (`<`, `>`, Today, Jump to Start Date).
- **3 Color Day Indicators with Progress Opacity**:
  - ⚪ **White**: Dates outside missed sholat range.
  - 🔴 **Solid Red (0/5)**: Dates where 0 required prayers have been paid.
  - 🟡 **Progress Opacity (1/5 to 4/5)**: Dynamic opacity (20%–80%) representing partial daily completion.
  - 🟢 **Solid Green (5/5 Lunas)**: Dates where all required prayers are completed.
- **Day Breakdown Modal**: Click any date cell to view a checklist of required, completed, or unrequired prayers.

### 4. Cross-Page Navigation (`Navbar.jsx`)
- Path-aware navbar using `usePathname` and `router.push('/?tab=...')` so clicking tabs from any subpage (`/kalender`, `/kalkulator`, `/artikel`) seamlessly returns to the home tab view.

### 5. SEO Article Section (`/artikel` & `/artikel/[slug]`)
- Fully static pre-rendered articles with OpenGraph social tags and Schema.org JSON-LD structured data.

---

## 🛠️ Development & Build Commands

### Start Local Development Server
```bash
yarn dev
# or
npm run dev
```
App will be available at `http://localhost:3000`.

### Production Build & Export to `dist/`
```bash
npx next build
# or
npm run build
```
The static site is generated into the `dist/` directory ready for deployment on Netlify.

---

## 📦 Netlify Deployment Settings

- **Build Command**: `yarn build` (or `npm run build`)
- **Publish Directory**: `dist`
