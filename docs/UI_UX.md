# UI/UX Specification — Gym App

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Thumb-Friendly** | Primary actions within bottom 25% of screen reachability |
| **Glanceable** | Timer and stage info readable at a glance during intense exercise |
| **Distraction-Free** | Minimal chrome during active session — focus on timer and media |
| **Touch-First** | All interactions designed for touch; no hover states as primary affordance |
| **Offline-Transparent** | No loading spinners for local data; everything feels instant |

---

## 2. Screen Inventory & Layouts

### 2.1 Home / Dashboard

```
┌─────────────────────────────┐
│  Gym App              [≡]   │  ← Header with settings menu
├─────────────────────────────┤
│                             │
│  My Plans                   │  ← Section title
│                             │
│  ┌───────────────────────┐  │
│  │ 🏃 Morning HIIT       │  │  ← Plan card (tap to detail)
│  │ 12 stages · 25 min    │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 💪 Upper Body Strength │  │
│  │ 8 exercises · 45 min   │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 🧘 Evening Yoga        │  │
│  │ 10 poses · 20 min      │  │
│  └───────────────────────┘  │
│                             │
│         [+ New Plan]        │  ← FAB (Floating Action Button)
│                             │
├─────────────────────────────┤
│  📥 Import                  │  ← Bottom action bar
└─────────────────────────────┘
```

**Interactions:**
- Tap plan card → Plan Detail screen
- Long-press plan card → Context menu (Duplicate, Delete, Export)
- Tap FAB → Plan Editor (new plan)
- Tap Import → File picker for `.json` import

---

### 2.2 Plan Editor

```
┌─────────────────────────────┐
│  ← Back        Save         │
├─────────────────────────────┤
│  Plan Name                  │
│  ┌───────────────────────┐  │
│  │ Morning HIIT          │  │  ← Text input
│  └───────────────────────┘  │
│                             │
│  Workout Type               │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ HIIT │ │Weight│ │ Yoga │ │  ← Type selector (single select)
│  └──────┘ └──────┘ └──────┘ │
│                             │
│  Rest Between Stages: 30s   │
│  ◄══════════●═══════════►   │  ← Slider (10s - 120s)
│                             │
│  Stages                     │
│  ┌───────────────────────┐  │
│  │ ☰ 1. Jumping Jacks    │  │  ← Draggable stage row
│  │    📷 photo · 45s  ✕  │  │
│  ├───────────────────────┤  │
│  │ ☰ 2. Push-ups         │  │
│  │    🎥 video · 30s  ✕  │  │
│  ├───────────────────────┤  │
│  │ ☰ 3. Rest             │  │
│  │    ⏱ 60s           ✕  │  │
│  └───────────────────────┘  │
│                             │
│  [+ Add Stage]              │
│                             │
└─────────────────────────────┘
```

**Interactions:**
- Drag handle (☰) → Reorder stages
- Tap stage row → Edit stage (name, duration, media)
- Tap ✕ → Delete stage (with confirmation)
- Tap media thumbnail → Camera/gallery picker
- After upload → **Media preview with Replay button** (unlocks audio on iOS)
- Save → Validate → Persist to IndexedDB → Navigate back

---

### 2.2.1 Media Preview & Audio Unlock

After uploading media for a stage, the app shows a preview overlay:

```
┌─────────────────────────────┐
│  ✕                          │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [Uploaded Media]   │  │  ← Photo or video preview
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│      Jumping Jacks          │
│                             │
│  ┌───────────────────────┐  │
│  │    ▶ Replay           │  │  ← Tap to replay (unlocks audio)
│  └───────────────────────┘  │
│                             │
│  [Replace]    [Use This]    │
│                             │
└─────────────────────────────┘
```

**Purpose:** The "Replay" button serves as the first user gesture required by iOS Safari to unlock Web Audio playback. This is a natural interaction — users want to verify their upload — so it doesn't feel like an artificial barrier.


---

### 2.3 Plan Detail

```
┌─────────────────────────────┐
│  ← Back        [⋮] Menu    │
├─────────────────────────────┤
│                             │
│  Morning HIIT               │  ← Plan name (large)
│  🏃 HIIT · 12 stages        │
│  Est. 25 minutes            │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [Start Session]    │  │  ← Primary CTA (large, prominent)
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Stages Preview             │
│  ┌───────────────────────┐  │
│  │ 1. Jumping Jacks  45s │  │
│  │ 2. Push-ups       30s │  │  ← Scrollable list
│  │ 3. Rest           60s │  │
│  │ ...                   │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│  [Edit]  [Export]  [Delete] │  ← Bottom action bar
└─────────────────────────────┘
```

**Interactions:**
- Tap "Start Session" → Active Session screen
- Tap stage row → Quick preview of stage media
- Menu (⋮) → Duplicate, Export, Delete
- Bottom actions → Edit (opens editor), Export (downloads JSON), Delete (confirm dialog)

---

### 2.4 Active Session (Full-Screen)

```
┌─────────────────────────────┐
│                             │
│         Stage 3 of 12       │  ← Progress indicator (subtle)
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │                       │  │
│  │    [Exercise Media]   │  │  ← Photo or video (loops)
│  │                       │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│       Push-ups              │  ← Stage name
│                             │
│      ┌───────────┐          │
│      │           │          │
│      │   0:23    │          │  ← Large countdown timer
│      │           │          │
│      └───────────┘          │
│                             │
│  ◄══════════●═══════════►   │  ← Progress bar
│                             │
│  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │ ⏮  │  │ ⏯  │  │ ⏭  │  │  ← Controls (skip back, pause, skip fwd)
│  └─────┘  └─────┘  └─────┘  │
│                             │
│  [Cancel Session]           │  ← Subtle text button
│                             │
└─────────────────────────────┘
```

**Rest Period Variant:**

```
┌─────────────────────────────┐
│                             │
│         REST                │  ← "REST" label (large, distinct color)
│                             │
│         0:18                │  ← Rest countdown
│                             │
│  ◄══════════●═══════════►   │
│                             │
│  Next: Mountain Climbers    │  ← Preview of next stage
│                             │
│  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │ ⏮  │  │ ⏯  │  │ ⏭  │  │
│  └─────┘  └─────┘  └─────┘  │
│                             │
└─────────────────────────────┘
```

**Interactions:**
- Tap ⏯ → Pause/resume timer
- Tap ⏭ → Skip to next stage (with audio cue)

---

### 2.5 Session Complete

```
┌─────────────────────────────┐
│                             │
│         🎉                  │
│                             │
│    Session Complete!        │
│                             │
│    Morning HIIT             │
│    12 stages completed      │
│    Total time: 25:34        │
│                             │
│  ┌───────────────────────┐  │
│  │    [Log to History]   │  │  ← Primary action
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    [Done]             │  │  ← Secondary action
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Interactions:**
- "Log to History" → Save session to history, then navigate to Home
- "Done" → Navigate to Home without logging (session still auto-logged)
- Auto-logged by default; user can delete from history later

---

### 2.6 History

```
┌─────────────────────────────┐
│  ← Back                    │
├─────────────────────────────┤
│  History                    │
│                             │
│  Today                      │
│  ┌───────────────────────┐  │
│  │ Morning HIIT          │  │
│  │ Today, 7:30 AM · 25m  │  │
│  └───────────────────────┘  │
│                             │
│  Yesterday                  │
│  ┌───────────────────────┐  │
│  │ Upper Body Strength   │  │
│  │ Yesterday, 6:00 PM · 45m│ │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Evening Yoga          │  │
│  │ Yesterday, 8:00 PM · 20m│ │
│  └───────────────────────┘  │
│                             │
│  [Clear All History]        │
│                             │
└─────────────────────────────┘
```

**Interactions:**
- Swipe left on entry → Reveal delete button
- Tap entry → View session details (read-only)
- "Clear All" → Confirm dialog → Delete all history

---

### 2.7 Settings

```
┌─────────────────────────────┐
│  ← Back                    │
├─────────────────────────────┤
│  Settings                   │
│                             │
│  Audio                      │
│  ┌───────────────────────┐  │
│  │ Volume     ◄═══●═══►  │  │
│  │ Sound Effects    [✓]  │  │  ← Toggle
│  │ Voice Countdown  [ ]  │  │  ← Toggle
│  └───────────────────────┘  │
│                             │
│  Data                       │
│  ┌───────────────────────┐  │
│  │ Import Plan      →    │  │
│  │ Export All Plans →    │  │
│  │ Clear All History →   │  │
│  │ Clear All Data   →    │  │
│  └───────────────────────┘  │

---

## 3. Component Specifications

### 3.1 Timer Display

| Property | Value |
|----------|-------|
| Font | Monospace, tabular-nums |
| Size | 48-64px (scales with viewport) |
| Color | White on dark background (session screen) |
| Format | `MM:SS` or `SS` for sub-minute |
| Animation | Subtle pulse at 10-second marks |

### 3.2 Progress Indicator

| Property | Value |
|----------|-------|
| Type | Linear bar (session) / Circular (optional) |
| Color | Accent color (e.g., green for work, blue for rest) |
| Height | 6-8px |
| Animation | Smooth fill transition |

### 3.3 Media Viewer

| Property | Value |
|----------|-------|
| Image | `object-contain`, centered, max-height 50% viewport |
| Video | Autoplay, loop, muted (no audio from video), playsinline |
| Placeholder | Gray silhouette icon when no media |
| Loading | Instant (local blob URL) |

### 3.4 Audio Controls

| Property | Value |
|----------|-------|
| Volume Slider | 0-100%, persists in settings |
| Mute | Respects device mute switch (iOS limitation) |
| Preload | All sounds loaded at app start |

---

## 4. Interaction Patterns

### 4.1 Gestures

| Gesture | Context | Action |
|---------|---------|--------|
| Tap | Plan card | Open plan detail |
| Long press | Plan card | Context menu |
| Drag | Stage row in editor | Reorder stages |
| Swipe left | History entry | Reveal delete |
| Pull down | Any list | Refresh (no-op for local data, visual feedback only) |

### 4.2 Transitions

| Transition | Animation | Duration |
|------------|-----------|----------|
| Screen push | Slide from right | 200ms |
| Screen back | Slide to right | 200ms |
| Modal open | Fade + scale up | 150ms |
| Modal close | Fade + scale down | 150ms |
| Stage change | Crossfade | 300ms |
| Rest → Stage | Flash + bell | 200ms |

### 4.3 Feedback

| Event | Feedback |
|-------|----------|
| Button tap | Subtle scale (0.95) + haptic if available |
| Timer complete | Bell sound + screen flash |
| Stage advance | Audio cue + crossfade |
| Error | Toast notification (bottom, auto-dismiss 3s) |
| Success | Brief checkmark animation |

---

## 5. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Screen Reader** | All buttons have `aria-label`, stages announced via `aria-live` |
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for large text |
| **Touch Targets** | Minimum 44×44px for all interactive elements |
| **Reduced Motion** | `prefers-reduced-motion` disables animations, keeps functionality |
| **Focus Indicators** | Visible focus rings for keyboard navigation |
| **Semantic HTML** | Proper heading hierarchy, `nav`, `main`, `button` elements |

---

## 6. Responsive Behavior

| Viewport | Layout Adjustments |
|----------|-------------------|
| **320px (iPhone SE)** | Single column, smaller timer (48px), reduced padding |
| **375px (iPhone 12/13)** | Standard layout as designed |
| **768px (iPad)** | Centered content (max-width 480px), larger media |
| **1024px+ (Desktop)** | Centered content, mouse-friendly hover states added |

---

## 7. Color & Theme

| Element | Light Mode | Dark Mode (Session) |
|---------|------------|---------------------|
| Background | `#FFFFFF` | `#1A1A2E` |
| Primary | `#4F46E5` (Indigo) | `#818CF8` |
| Success | `#10B981` (Green) | `#34D399` |
| Rest | `#3B82F6` (Blue) | `#60A5FA` |
| Text | `#1F2937` | `#F9FAFB` |
| Surface | `#F3F4F6` | `#2D2D44` |

**Note:** Active session screen always uses dark theme for better visibility during exercise.

---

## 8. Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App Title | System | 20px | 600 |
| Plan Name | System | 24px | 700 |
| Timer | Monospace | 48-64px | 700 |
| Stage Name | System | 20px | 600 |
| Body | System | 16px | 400 |
| Caption | System | 12px | 400 |

**Settings screen interactions:**
- Volume slider → Adjusts audio playback volume
- Toggles → Enable/disable sound effects or voice countdown
- Clear actions → Confirm dialogs before execution

**Session screen interactions:**
- Tap ⏮ → Go back to previous stage
- Tap "Cancel" → Confirm dialog → Return to Plan Detail
- Screen stays awake during session (Wake Lock)

---

## 9. Design System (UI Renovation)

The implementation follows this specification via a semantic token layer plus
a shared primitive library. This section documents the system as built.

### 9.1 Theming

- Semantic design tokens are CSS variables defined on `:root` (light) and
  overridden on `[data-theme="dark"]` in `src/index.css`. Tailwind maps them
  in `tailwind.config.js` (`base`, `surface`, `surface-2`, `line`, `ink`,
  `brand`, `success`, `danger`, `rest`, `scrim`, per-type accents).
- Components use **semantic classes only** (`bg-surface`, `text-ink-2`,
  `border-line`); they never hardcode palette colors. Theme switching is a
  single `data-theme` attribute flip on `<html>`.
- Preference (`light | dark | system`) lives in `localStorage` and is applied
  by an inline script in `index.html` before first paint (no theme flash).
  `src/lib/theme.ts` owns persistence and system-preference sync.
- The session player keeps an immersive dark look in **both** themes via the
  fixed `night` token family.
- Filled brand surfaces (headers, primary buttons, FAB) use the fixed
  indigo-600 (`primary-600`) with white text in both themes; the theme-aware
  `brand` token is reserved for text/icons/soft-tint accents.

### 9.2 Component library (`src/components/ui/`)

| Component | Notes |
|-----------|-------|
| `ScreenHeader` | Shared header: back button, title, action slot, brand/plain variants, safe-area padding |
| `BottomActionBar` | Sticky thumb-reach action bar with safe-area padding |
| `Button` | primary/secondary/ghost/danger, 44px+ min heights |
| `IconButton` | Icon-only button; **requires** an accessible label; 44px target |
| `Modal` | `role="dialog"`, focus trap + restore, Escape/overlay close, scroll lock, 150ms scale-fade |
| `Chip` | Selectable filter pill with `aria-pressed` |
| `Switch` | `role="switch"` toggle |
| `SegmentedControl` | Radio-group segmented selector |
| `Slider` | Label-associated, styled track/thumb |
| `Toast` | Token tones + icons, `aria-live`, slide-up, z-above modal |
| `EmptyState` | Icon + title + message + action |
| `Card`, `ConfirmDialog`, `Spinner`, `PageLayout` | Tokenized shared basics |

### 9.3 Motion

CSS keyframes only (no animation library), all disabled under
`prefers-reduced-motion`: screen mount `slide-in` (200ms), modal `scale-in`,
toast/bar `slide-up`, stage/rest transitions `stage-fade` (300ms crossfade),
urgent timer `pulse-urgent`.

### 9.4 Icons & accessibility

- Icons: `lucide-react` exclusively; no emoji/unicode glyphs as UI icons.
- Every icon-only button has an accessible name; `aria-live` region announces
  session stage transitions; global `:focus-visible` outline; 44px touch
  targets; page zoom is no longer disabled in `index.html`.

