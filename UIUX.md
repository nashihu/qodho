# UI/UX Review & Engineering Specification: Qodho Tracker

> **Document Type:** Agent-Friendly UI/UX Audit & Implementation Specification  
> **Target Application:** Qodho Tracker (`/src/app/page.jsx`, `/src/components/Navbar.jsx`, `/src/components/LifetimeSummary.jsx`)  
> **Status:** Ready for Implementation  
> **Evaluator:** UI/UX Design & Frontend Engineering Expert  

---

## 1. Executive Summary

A comprehensive usability, layout, and visual design analysis was conducted on the **Qodho Tracker** web application across **Mobile (Viewport: 375px - 430px)** and **PC / Desktop (Viewport: 1024px - 1440px+)** based on the current production screens (`media_1791268934556.png` and `media_1791268934557.png`).

### Core Findings
1. **Critical Visual Glitch:** An unstyled native horizontal scrollbar track (`overflow-x-auto` without scrollbar suppression) appears directly beneath navigation tabs on **both** mobile and desktop views, disrupting the premium Islamic green aesthetic and resembling a broken UI element.
2. **Cognitive Redundancy & Banner Stacking:** When user data is empty (`totalDays === 0`), the screen renders **three overlapping empty state representations**:
   - An amber warning banner with *"Atur Durasi di Kalkulator"* button.
   - An estimation card immediately below with a second *"Kalkulator Durasi"* button.
   - A grid of five disabled prayer cards with `Ban` icons and inactive grey buttons.
3. **Contradictory Interaction Mental Model:** Button copywriting mixes opposing mathematical paradigms:
   - Primary button: `"Sudah Qodho Subuh (-1)"` (decrementing remaining debt).
   - Secondary button: `"+5 Qodho"` (incrementing completed count).
   - Tertiary button: `"Koreksi"` (decrementing completed count).
   Users struggle to discern whether they are incrementing accomplishments or decrementing liability.
4. **Mobile Real Estate Inefficiency:** On mobile, the top header, alert banner, calculation bar, and summary card consume more than **100% of the initial viewport**, completely hiding the core daily utility—the prayer counter buttons—below the fold.

---

## 2. Heuristic Usability Evaluation (Nielsen Norman Group)

| Usability Heuristic | Severity (0-4) | Observation in Qodho Tracker |
| :--- | :---: | :--- |
| **H1: Visibility of System Status** | **2 (Minor)** | Stats display `0 kali`, but there is no onboarding indication explaining *why* it is 0 or what steps remain to activate the tracker. |
| **H2: Match between System & Real World** | **3 (Major)** | Mixing `-1` and `+5` in the same card confuses the user's mental model between "Utang yang tersisa" vs "Sholat yang telah diselesaikan". |
| **H3: User Control & Freedom** | **2 (Minor)** | The `Reset` button is placed alongside standard management buttons (`Backup Data`, `Kalkulator Durasi`) with only a native browser `confirm()` popup preventing accidental data erasure. |
| **H4: Consistency & Standards** | **3 (Major)** | Two consecutive cards feature the exact same Call To Action (`Atur Durasi di Kalkulator` vs `Kalkulator Durasi`). Scrollbar leaks across nav containers. |
| **H5: Error Prevention** | **2 (Minor)** | Koreksi button has subtle disabled state; no undo snackbar after accidental increment. |
| **H6: Recognition Rather Than Recall** | **1 (Cosmetic)** | Users have to remember which period was calculated without a visible summary badge when periods are unconfigured. |
| **H7: Flexibility & Efficiency of Use** | **3 (Major)** | Daily tracking on mobile requires long vertical scrolling past redundant banners before reaching prayer buttons. |
| **H8: Aesthetic & Minimalist Design** | **3 (Major)** | Header is cluttered on mobile. Zero-state shows 5 disabled cards occupying large visual real estate instead of a single welcoming empty-state illustration. |

---

## 3. Screen-by-Screen Detailed Review

### 3.1 Header & Navigation (`src/components/Navbar.jsx`)

#### Current Defects
- **Desktop:**
  - The tab bar container uses `overflow-x-auto`, rendering a persistent grey scrollbar track beneath tabs, even when content fits within the viewport.
  - The "Masuk dengan Google" / User Profile badge is positioned at the far right inside the flex container, causing uneven vertical alignment with the centered tabs.
- **Mobile:**
  - The header is vertically fragmented into 3 rows:
    1. Logo & App Title (`Qodho Tracker`)
    2. Navigation pill container (`Ringkasan Lifetime`, `Tambah Qodho Udzur`, `Artikel & Panduan`)
    3. User profile avatar & logout button floating alone in an orphaned centered row.
  - The navigation items clip off-screen with an unsightly grey native scrollbar.
  - The header consumes ~180px–220px (nearly 28% of a standard mobile screen height).

#### Expectation & Target Specification
- **Scrollbar Suppression:** Implement `.no-scrollbar` or Tailwind utility classes (`scrollbar-none`, `[-ms-overflow-style:none]`, `[scrollbar-width:none]`, `[&::-webkit-scrollbar]:hidden`).
- **Mobile Responsive Layout:**
  - Top row: Logo + User Profile / Login Avatar (aligned horizontally, `justify-between`).
  - Second row: Horizontal scrollable segment tabs with smooth touch swiping and edge fade gradient (without visible scrollbars).
  - Alternative enhancement: For mobile, consider standard bottom navigation bar for high-frequency actions (`Ringkasan`, `Tambah`, `Kalender`, `Panduan`).

---

### 3.2 Onboarding & Zero-State (`src/components/LifetimeSummary.jsx`)

#### Current Defects
- **Redundant Banners:**
  - **Banner 1 (Amber):** `"Belum Ada Durasi Qodho Yang Diatur"` with button `"Atur Durasi di Kalkulator"`.
  - **Card 2 (White/Green):** `"Estimasi Durasi Qodho - 0 Tahun"` with button `"Kalkulator Durasi"`.
  - Displaying both simultaneously creates visual noise and feels like an unhandled edge case.
- **Dead State Card Grid:**
  - Below the summary cards, the app renders five disabled prayer cards (`Subuh`, `Dzuhur`, `Ashar`, `Maghrib`, `Isya`), all grayed out with `"Sholat ini tidak ada utang pada periode terpilih"`.
  - On mobile, this requires the user to scroll through a graveyard of inactive elements that serve no operational purpose until calculation is configured.

#### Expectation & Target Specification
- **Single Unified Zero-State Onboarding Component:**
  - When `totalDays === 0` (or `initialTotalPrayers === 0`), suppress the redundant calculation summary card and the five disabled prayer counter cards.
  - Render a single, beautiful **Empty State Welcome Card**:
    - **Visual:** Friendly Islamic/geometric illustration or clean calendar icon.
    - **Headline:** *"Mulai Hitung Qodho Sholat Anda"*
    - **Description:** *"Tentukan perkiraan masa baligh, periode tidak sholat, atau udzur syar'i untuk memulai pencatatan hutang sholat fardhu."*
    - **Primary CTA:** Prominent, high-contrast button: `Hitung Utang Sholat Sekarang →` (deep links to `/kalkulator`).
    - **Secondary Action:** `Restore Backup JSON` (for returning users recovering their data).

---

### 3.3 Main Metrics Dashboard (`Overview Progress Card`)

#### Current Defects
- **Mobile Viewport Bloat:**
  - `TOTAL HUTANG SHOLAT`, `SUDAH DI-QODHO`, and `SISA HARUS DI-QODHO` are stacked vertically in a 1-column layout on mobile.
  - Each metric block takes ~70px plus padding, resulting in a ~320px tall dark green card.
- **Desktop Balance:**
  - On desktop, the 3-column card looks clean and well-proportioned, but the empty watermark icon (`Sparkles`) at the bottom right is partially cut off awkwardly and clips into text when scaled.

#### Expectation & Target Specification
- **Mobile Layout Optimization:**
  - Transform the 3 metrics into a compact **2x2 or 3-column horizontal summary grid** on mobile:
    - Left column: `Total Utang: 0`
    - Middle column: `Terselesaikan: 0`
    - Right column: `Sisa Utang: 0`
  - Reduce vertical padding (`p-4` instead of `p-6`).
  - Place the progress bar immediately underneath in the same container.
  - Keep height under **140px on mobile** so prayer counter buttons remain immediately visible above the fold.

---

### 3.4 Prayer Counter Cards (`Prayer Counters Section`)

#### Current Defects
- **Ambiguous Math Signage:**
  - Main button: `Sudah Qodho Subuh (-1)`
  - Sub-button: `+5 Qodho`
  - Sub-button: `Koreksi`
  - *Conflict:* The main button shows `-1` (meaning "reduce debt"), while the bulk button shows `+5` (meaning "add completed prayer"). The user's brain must toggle between debt perspective and completion perspective in the same UI card.
- **Disabled State Readability:**
  - In disabled mode, the text `"Sholat ini tidak ada utang pada periode terpilih"` has low visual contrast against the muted slate background.
  - Greyed-out buttons look like broken interactions rather than intentionally inactive states.
- **Touch Target & Ergonomics:**
  - On mobile, the primary button is easy to tap, but `+5 Qodho` and `Koreksi` are cramped at the bottom with small touch targets (~32px height), violating mobile ergonomics standards (minimum 44x44px).

#### Expectation & Target Specification
- **Unified Copywriting & Signage:**
  - Clear label hierarchy:
    - Metric headline: `Sisa Utang: 120 kali` (with badge `Progress: 15 / 135 Selesai`).
    - Primary CTA: `+1 Selesai Qodho` (Icon: Checkmark or Chevron Up). Clear positive reinforcement!
    - Bulk CTA: `+5 Selesai`
    - Undo/Correction CTA: `-1 Koreksi` (or subtle undo icon).
- **Active vs. Zero State Treatment:**
  - If a specific prayer has 0 debt while others have debt: Show a sleek badge `Lunas / Tidak Ada Utang` with a green checkmark instead of a disabled grey box.
- **Haptic & Visual Feedback:**
  - Add micro-animations (e.g. scale click `active:scale-95`, subtle confetti/particle or glow on completion, optimistic counter update).

---

### 3.5 Destructive Action & Tools Placement

#### Current Defects
- The `Reset` button (red text/border) sits right inside the main header card between `Kalkulator Durasi` and `Backup Data`.
- Accidental taps on mobile are common because it is positioned next to standard navigational actions.

#### Expectation & Target Specification
- Move `Reset Data` into a dedicated **"Pengaturan & Data"** modal or place it at the very bottom of the page inside an expandable `Opsi Lanjutan / Zona Bahaya` accordion.
- When clicked, trigger an accessible custom confirmation modal (not the native browser `window.confirm`).

---

## 4. UI/UX Design System Specifications

### 4.1 Typography Scale & Hierarchy

| Element | Desktop Class | Mobile Class | Weight | Color |
| :--- | :--- | :--- | :--- | :--- |
| **App Title** | `text-xl` | `text-lg` | Bold (`700`) | `text-white` |
| **Card Header** | `text-base` | `text-sm` | Bold (`700`) | `text-slate-800` |
| **Big Numbers (Metrics)**| `text-3xl` | `text-2xl` | Extra Bold (`800`) | `text-white` / `text-slate-900` |
| **Subtext / Helper** | `text-xs` | `text-[11px]` | Medium (`500`) | `text-slate-500` / `text-emerald-200` |
| **Button Text (Primary)**| `text-sm` | `text-xs` | Semi-bold (`600`) | `text-white` |

### 4.2 Color Palette Tokens

```css
/* Brand Emerald */
--brand-primary-900: #064e3b;  /* Header & Primary Card Background */
--brand-primary-800: #065f46;  /* Card Highlights */
--brand-primary-600: #059669;  /* Primary Interactive Buttons */
--brand-primary-500: #10b981;  /* Progress Bar & Success Badges */
--brand-primary-50:  #ecfdf5;  /* Subtle Card Backgrounds */

/* Accent & Warnings */
--accent-amber-500:   #f59e0b;  /* Onboarding Highlights */
--accent-amber-50:    #fffbeb;  /* Info Banner */
--accent-rose-500:    #f43f5e;  /* Sisa Hutang Metric & Danger */
--accent-rose-50:     #fff1f2;  /* Correction Button Hover */

/* Neutral & Slate */
--surface-bg:         #f8fafc;  /* App Background (slate-50) */
--surface-card:       #ffffff;  /* Card Background */
--border-subtle:      #e2e8f0;  /* Card Borders (slate-200) */
--text-primary:       #0f172a;  /* slate-900 */
--text-secondary:     #64748b;  /* slate-500 */
```

### 4.3 Mobile Touch Target Standards
- **Primary Buttons:** Minimum height `44px` (e.g. `py-3` on mobile), full width for one-hand thumb reach.
- **Secondary Actions:** Minimum height `38px` with at least `8px` spacing to prevent fat-finger miss-clicks.
- **Sticky / Fold Efficiency:** The user should reach at least **Subuh and Dzuhur counter buttons without scrolling** on iPhone 13/14/15 (390px x 844px).

---

## 5. Agent Action Plan & Implementation Tasks

To execute these design improvements cleanly without regressions, follow this step-by-step technical plan:

### Task 1: Fix Native Horizontal Scrollbars
- **File:** `src/app/globals.css`
- **Action:** Add global utility class to hide scrollbars while maintaining touch scrollability:
```css
@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```
- **File:** `src/components/Navbar.jsx`
- **Action:** Add `no-scrollbar` to the `<nav>` container on line 169:
```jsx
<nav className="flex items-center gap-1.5 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800/80 w-full md:w-auto overflow-x-auto no-scrollbar">
```

### Task 2: Refactor Mobile Header Layout (`src/components/Navbar.jsx`)
- **Action:**
  - Group Logo and Profile/Login into the top bar (`flex items-center justify-between w-full`).
  - Move the tabs row below the top bar on mobile, styled with `no-scrollbar` and edge fade.
  - Eliminate the orphaned 3rd row where the user profile currently sits alone.

### Task 3: Unify Zero-State & Remove Banner Duplication (`src/components/LifetimeSummary.jsx`)
- **Action:**
  - When `totalDays === 0` (or `initialTotalPrayers === 0`):
    - Do NOT render the amber banner AND the calculation bar AND the 5 disabled cards.
    - Instead, render a clean, high-impact **Empty State Card**:
      ```jsx
      {totalDays === 0 ? (
        <EmptyOnboardingCard onOpenBackup={() => setIsBackupOpen(true)} />
      ) : (
        <>
          <ActiveCalculationSummaryBar ... />
          <OverviewProgressCard ... />
          <PrayerCountersGrid ... />
        </>
      )}
      ```

### Task 4: Compact the Mobile Overview Card (`src/components/LifetimeSummary.jsx`)
- **Action:**
  - Change the stat grid from `grid-cols-1 md:grid-cols-3` to `grid-cols-3 gap-2 md:gap-6`.
  - On mobile, display compact metric cards (Label, Value, unit) side-by-side so the entire card height is under 150px.
  - Preserve the progress bar at the bottom.

### Task 5: Harmonize Prayer Counter Mental Model (`src/components/LifetimeSummary.jsx`)
- **Action:**
  - Change primary button copy from `Sudah Qodho Subuh (-1)` to:
    ```jsx
    <span>+1 Qodho Selesai</span>
    ```
  - Change secondary bulk button to:
    ```jsx
    <span>+5 Selesai</span>
    ```
  - Change correction button to:
    ```jsx
    <span>-1 Koreksi</span>
    ```
  - In the card header, show both metrics clearly:
    - **Sisa:** `X kali`
    - **Selesai:** `Y / Z`
  - This eliminates confusion: all button labels explicitly specify **what action you are performing on completed prayers**.

### Task 6: Relocate Danger Action (`Reset`)
- **Action:**
  - Remove `Reset` from the top header bar next to `Backup Data`.
  - Add an options dropdown or place a subtle button at the bottom of the page: `"Reset Progress Data"`.

---

## 6. Acceptance Criteria & QA Checklist

- [ ] **Scrollbars:** No visible scrollbar track appears under navigation tabs on Chrome, Safari, Firefox, iOS Safari, or Android Chrome.
- [ ] **Mobile Viewport Efficiency:** On viewport `390px x 844px`, the prayer counter buttons for at least the first prayer are visible above the fold on initial load.
- [ ] **Zero-State Cohesion:** When no period is configured, the user sees a single clear Onboarding card with one primary action button pointing to `/kalkulator`.
- [ ] **Copy & Logic Clarity:** All counter buttons follow the additive completion model (`+1 Qodho Selesai`, `+5 Selesai`, `-1 Koreksi`).
- [ ] **Touch Targets:** All interactive buttons on mobile are at least `40px` to `44px` tall.
- [ ] **Responsive Breakpoints:** Layout renders cleanly across `375px` (mobile), `768px` (tablet), `1024px` (laptop), and `1440px` (desktop) without horizontal document overflow.
- [ ] **Safety:** Resetting progress requires deliberate action and cannot be triggered by an accidental misclick next to backup actions.
