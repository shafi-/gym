# Product Requirements Document — Gym App

## 1. Product Overview

A **mobile-friendly, offline-first Progressive Web App (PWA)** that lets users create structured exercise plans and execute them with guided demonstrations, automatic timers, and audio cues. Supports multiple workout types (HIIT, strength, yoga). All data stored locally on device with optional export/import for sharing.

---

## 2. User Roles

| Role | Description |
|------|-------------|
| **Local User** | Creates/edits plans, runs sessions, views history. All data stored locally in IndexedDB. No account required. |

> **Note:** Cloud sync with user accounts is explicitly **out of scope for MVP**. See Section 9.

---

## 3. Workout Types Supported

| Type | Structure | Timer Behavior |
|------|-----------|----------------|
| **HIIT / Circuit** | Sequence of exercises with work duration + rest duration per exercise | Countdown for work → bell → countdown for rest → bell → next exercise |
| **Strength** | Exercises with sets × reps + rest between sets | Rep counter per set → rest countdown between sets → next set |
| **Yoga / Stretching** | Sequence of poses with hold duration per pose | Countdown hold timer → gentle transition cue → next pose |

---

## 4. Functional Requirements

### 4.1 Plan Management

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-PM-01 | Create a new exercise plan | User can name a plan, select workout type (HIIT/Strength/Yoga), and add ordered stages/exercises. |
| F-PM-02 | Add stage to plan | Each stage has: name, demonstration media (photo/video), duration or rep count, and optional notes. |
| F-PM-03 | Edit/reorder stages | Drag-and-drop reorder, edit fields, delete stages. Changes persist immediately. |
| F-PM-04 | Duplicate plan | One-tap clone of an existing plan as a template. |
| F-PM-05 | Delete plan | Confirmation dialog; removes plan and associated media. |
| F-PM-06 | Import/Export plan | Export plan as JSON file; import JSON to restore/share a plan. |

### 4.2 Media Handling (User-Uploaded)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-MD-01 | Upload photo/video per stage | Capture via device camera or pick from gallery. Supported formats: JPEG, PNG, WebP, MP4, WebM. |
| F-MD-02 | Media stored locally | Files stored in IndexedDB (or OPFS) for offline access. |
| F-MD-03 | Media preview | Thumbnail shown in plan editor; full media shown during session. |
| F-MD-04 | Media size limits | Max 50MB per file; client-side validation before upload. |
| F-MD-05 | Replace/delete media | User can swap or remove media from a stage. |

### 4.3 Session Execution (The Core Experience)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-SE-01 | Start a session | User selects a plan → taps "Start" → session begins at stage 1. |
| F-SE-02 | Display stage demonstration | Show the stage's photo (static) or video (auto-plays, loops) prominently. |
| F-SE-03 | Automatic countdown timer | Large, readable countdown timer for current stage's duration. Starts automatically. |
| F-SE-04 | Audio cue — stage start | Bell/chime sound plays when a new stage begins. |
| F-SE-05 | Audio cue — rest period | Distinct bell/chime plays when rest period starts and ends. |
| F-SE-06 | Audio cue — countdown | Optional voice countdown for last 3 seconds ("3, 2, 1") or beep per second. |
| F-SE-07 | Auto-advance | When timer reaches zero, automatically transition to next stage with audio cue. |
| F-SE-08 | Manual controls | Skip forward, skip backward, pause/resume timer. |
| F-SE-09 | Rest between stages | Configurable rest duration per plan (default 30s). Timer counts down rest before next stage. |
| F-SE-10 | Session completion | Summary screen showing plan name, total time, stages completed. Option to log to history. |
| F-SE-11 | Background audio | Audio cues continue playing when app is backgrounded (using Web Audio API + Media Session API). |

### 4.4 Timer Engine

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-TE-01 | Accurate timing | Uses `Date.now()` deltas, not just `setInterval`, to prevent drift when backgrounded. |
| F-TE-02 | Pause/resume | Timer pauses on pause button; resumes from exact paused time. |
| F-TE-03 | Visual progress | Circular or linear progress indicator showing elapsed vs. total time. |
| F-TE-04 | Configurable durations | Per-stage duration editable in plan creator (seconds precision). |

### 4.5 History & Analytics (Minimal)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-HA-01 | Log completed session | After session ends, save: plan name, date/time, total duration, stages completed. |
| F-HA-02 | View history list | Chronological list of past sessions with date, plan name, duration. |
| F-HA-03 | Delete history entry | Swipe or long-press to delete a history record. |
| F-HA-04 | Clear all history | Settings option to wipe all history. |

### 4.6 Offline-First Architecture

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-OF-01 | Full offline functionality | All features (plan CRUD, media, session execution, history) work without network. |
| F-OF-02 | Service Worker caching | App shell cached via SW for instant offline load. |
| F-OF-03 | Local data persistence | All data stored in IndexedDB. Survives app close, device restart. |
| F-OF-04 | No network dependency | Zero API calls required for core functionality. |

### 4.7 Audio System

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-AU-01 | Bell/chime sounds | Distinct sounds for: stage start, stage end, rest start, rest end, session complete. |
| F-AU-02 | Volume control | In-app volume slider; respects device mute switch. |
| F-AU-03 | Audio preloading | All sounds preloaded at app start for zero-latency playback. |
| F-AU-04 | No external dependencies | Audio bundled as MP3/OGG assets; no CDN reliance. |



---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | First contentful paint < 1.5s on 3G; timer updates at 10fps max to save battery. |
| **Mobile-First** | Responsive layout from 320px viewport; touch targets ≥ 44×44px; no hover-dependent UI. |
| **PWA** | Installable (manifest + service worker); works fullscreen on home screen. |
| **Accessibility** | WCAG 2.1 AA: screen reader labels, keyboard navigation, reduced-motion support. |
| **Browser Support** | Chrome, Safari, Firefox, Edge (last 2 versions). iOS Safari 14+. |
| **Storage** | Handle up to 500MB of user media without degradation. |
| **Battery** | Timer uses `requestAnimationFrame` when visible, `setInterval` throttled to 1s when backgrounded. |

---

## 6. User Flows

### 6.1 Create & Run a Plan (Happy Path)
1. Open app → Home screen with "My Plans" list
2. Tap "+" → Plan editor
3. Enter name, select type (e.g., HIIT)
4. Tap "Add Stage" → enter name, set duration (e.g., 45s), upload photo/video
5. Repeat for all stages
6. Save plan → back to Home
7. Tap plan card → Plan detail → "Start Session"
8. Stage 1: photo/video shown, bell rings, 45s countdown starts
9. Timer ends → rest bell → 30s rest countdown
10. Next stage bell → repeat
11. All stages done → completion screen → "Log to History"

### 6.2 Offline Usage
1. User opens app with no network
2. App loads from Service Worker cache instantly
3. All plans, media, history available

---

## 7. Data Model (Core Entities)

```
Plan
├── id: string (uuid)
├── name: string
├── type: "hiit" | "strength" | "yoga"
├── stages: Stage[]
├── restBetweenStages: number (seconds)
├── createdAt: timestamp
└── updatedAt: timestamp

Stage
├── id: string (uuid)
├── planId: string
├── order: number
├── name: string
├── mediaType: "image" | "video" | null
├── mediaId: string (reference to MediaStore)
├── duration: number (seconds) OR reps: number (for strength)
├── notes: string
└── restAfter: number (seconds, override plan default)

MediaStore
├── id: string (uuid)
├── blob: Blob (image/video data)
├── thumbnail: Blob
├── mimeType: string
└── size: number

SessionHistory
├── id: string (uuid)
├── planId: string
├── planName: string (denormalized)
├── startedAt: timestamp
├── completedAt: timestamp
├── totalDuration: number (seconds)
├── stagesCompleted: number
└── completed: boolean
```

---

## 8. UI Screen Inventory

| Screen | Purpose |
|--------|---------|
| Home / Dashboard | List of plans, quick-start recent, import button |
| Plan Editor | Create/edit plan, add/reorder stages, upload media |
| Plan Detail | View plan structure, start session, edit, delete, export |
| Active Session | Full-screen: media, timer, progress, controls |
| Session Complete | Summary, log to history |
| History | List of past sessions, delete entries |
| Settings | Volume, clear data, import/export |

---

## 9. Out of Scope (v1)

- Cloud sync / user accounts
- Social features (sharing plans publicly, following users)
- Pre-built exercise library (all media is user-uploaded)
- Video streaming (only local files)
- Wearable integration (Apple Watch, Garmin)
- Advanced analytics (charts, trends, PR tracking)
- Multi-language support
- Web Push notifications (audio cues only)

---

## 10. Open Questions / Risks

| # | Question | Impact |
|---|----------|--------|
| 1 | iOS Safari has limited Web Audio autoplay — how to handle first audio unlock? | Requires user gesture before audio works; needs UX for "tap to enable sound" |
| 2 | Video blob storage in IndexedDB on iOS has ~50MB limits in some versions | May need OPFS fallback for video |
| 3 | Background audio on iOS Safari is unreliable | May need Media Session API + "keep screen awake" Wake Lock as fallback |
| 4 | Export/import with media — should media be embedded in JSON (base64) or separate? | Base64 inflates size; separate files need zip-like packaging |

4. User can create/edit plans and run sessions
5. No sync or network features available (by design)

### 6.3 Import/Export a Plan
1. User opens plan detail → "Export" → downloads `.json` file
2. On another device: Home → "Import" → select `.json` file
3. Plan (including media references) is restored
