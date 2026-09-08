# Technical Architecture — Gym App

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PWA Shell                                 │
│        (Cached by Service Worker for offline-first load)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                        Pages                                │   │
│  │              (Organize containers per route)                │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │                      Containers                             │   │
│  │    (Data fetching, orchestration, business logic flow)      │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │                      Components                             │   │
│  │           (Pure presentation — props in, DOM out)           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Service Layer                          │   │
│  │         (Business logic, data transformation)               │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │                    Repository Layer                         │   │
│  │      (Data access — extends BaseRepository for storage)     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │                      IndexedDB (Dexie)                      │   │
│  │              (Plans, Media, History stores)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    Service Worker Layer                             │
│            (App shell caching, offline fallback)                    │
└─────────────────────────────────────────────────────────────────────┘
```


---

## 2. Layered Architecture (Clean Separation)

### 2.1 Directory Structure

```
src/
├── app/                          # App entry, providers, router
│   ├── App.tsx
│   ├── providers.tsx
│   └── router.tsx
│
├── pages/                        # Route-level page compositions
│   ├── home/
│   │   └── HomePage.tsx
│   ├── plan-editor/
│   │   └── PlanEditorPage.tsx
│   ├── plan-detail/
│   │   └── PlanDetailPage.tsx
│   ├── session/
│   │   └── SessionPage.tsx
│   ├── history/
│   │   └── HistoryPage.tsx
│   └── settings/
│       └── SettingsPage.tsx
│
├── containers/                   # Data orchestration layer
│   ├── home/
│   │   └── PlanListContainer.tsx
│   ├── plan-editor/
│   │   └── PlanEditorContainer.tsx
│   ├── plan-detail/
│   │   └── PlanDetailContainer.tsx
│   ├── session/
│   │   └── SessionContainer.tsx
│   ├── history/
│   │   └── HistoryContainer.tsx
│   └── settings/
│       └── SettingsContainer.tsx
│
├── components/                   # Pure presentation components
│   ├── ui/                       # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Slider.tsx
│   │   └── Spinner.tsx
│   ├── plan/                     # Plan-related components
│   │   ├── PlanCard.tsx
│   │   ├── StageRow.tsx
│   │   ├── StageEditor.tsx
│   │   └── MediaUploader.tsx
│   ├── session/                  # Session-related components
│   │   ├── TimerDisplay.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── MediaViewer.tsx
│   │   └── SessionControls.tsx
│   └── history/                  # History-related components
│       └── HistoryList.tsx
│
├── services/                     # Business logic layer
│   ├── plan.service.ts
│   ├── media.service.ts
│   ├── session.service.ts
│   ├── history.service.ts
│   └── audio.service.ts
│
├── repositories/                 # Data access layer
│   ├── base.repository.ts        # Centralized storage setup
│   ├── plan.repository.ts
│   ├── media.repository.ts
│   └── history.repository.ts
│
├── models/                       # TypeScript interfaces/types
│   ├── plan.model.ts
│   ├── media.model.ts
│   └── history.model.ts
│
├── hooks/                        # Shared custom hooks
│   ├── useTimer.ts
│   ├── useAudio.ts
│   └── useWakeLock.ts
│
├── stores/                       # Zustand stores (UI state only)
│   ├── session.store.ts
│   └── settings.store.ts
│
├── lib/                          # Third-party configurations
│   ├── db.ts                     # Dexie database instance
│   └── audio.ts                  # Audio context setup
│
└── assets/                       # Static assets
    ├── audio/
    └── icons/
```

### 2.2 Layer Responsibilities

| Layer | Responsibility | Knows About |
|-------|----------------|-------------|
| **Pages** | Compose containers into page layouts | Containers, Router |
| **Containers** | Fetch data, orchestrate components, handle user actions | Services, Components, Stores |
| **Components** | Pure rendering from props, emit events via callbacks | Nothing (props only) |
| **Services** | Business logic, data transformation, orchestrate repositories | Repositories, Models |
| **Repositories** | CRUD operations on storage, extend BaseRepository | Dexie, Models |
| **BaseRepository** | Centralized storage setup, common query patterns | Dexie |

**Key Principle:** The app is fully self-contained. No server required for any core functionality. All data persists locally.


### 2.3 Data Flow

```
User Action
    │
    ▼
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌────────────┐
│  Page    │────▶│ Container │────▶│ Service  │────▶│ Repository │
│          │     │           │     │          │     │            │
│ (renders │◀────│ (manages  │◀────│ (business│◀────│ (data      │
│  layout) │     │  state)   │     │  logic)  │     │  access)   │
└──────────┘     └───────────┘     └──────────┘     └─────┬──────┘
                                                         │
                                                   ┌─────▼──────┐
                                                   │   Dexie /  │
                                                   │ IndexedDB  │
                                                   └────────────┘
```

### 2.4 Base Repository Pattern

```typescript
// repositories/base.repository.ts
import { db } from '../lib/db';

export abstract class BaseRepository<T extends { id: string }> {
  protected table: Table<T, string>;

  constructor(table: Table<T, string>) {
    this.table = table;
  }

  async findById(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }

  async findAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async create(entity: T): Promise<T> {
    await this.table.add(entity);
    return entity;
  }

  async update(entity: T): Promise<T> {
    await this.table.put(entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  async clear(): Promise<void> {
    await this.table.clear();
  }

  async count(): Promise<number> {
    return this.table.count();
  }
}
```

```typescript
// repositories/plan.repository.ts
import { db } from '../lib/db';
import { Plan } from '../models/plan.model';
import { BaseRepository } from './base.repository';

export class PlanRepository extends BaseRepository<Plan> {
  constructor() {
    super(db.plans);

### 2.5 Service Layer Pattern

```typescript
// services/plan.service.ts
import { PlanRepository } from '../repositories/plan.repository';
import { MediaRepository } from '../repositories/media.repository';
import { Plan } from '../models/plan.model';

export class PlanService {
  private planRepo = new PlanRepository();
  private mediaRepo = new MediaRepository();

  async getAllPlans(): Promise<Plan[]> {
    return this.planRepo.findAll();
  }

  async getPlanById(id: string): Promise<Plan | undefined> {
    return this.planRepo.findById(id);
  }

  async createPlan(data: CreatePlanDTO): Promise<Plan> {
    const plan: Plan = {
      id: crypto.randomUUID(),
      name: data.name,
      type: data.type,
      stages: data.stages.map((stage, index) => ({
        ...stage,
        id: crypto.uuid(),
        order: index,
      })),
      restBetweenStages: data.restBetweenStages ?? 30,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return this.planRepo.create(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.planRepo.findById(id);
    if (!plan) return;

    // Cascade delete: remove associated media
    for (const stage of plan.stages) {
      if (stage.mediaId) {
        await this.mediaRepo.delete(stage.mediaId);
      }
    }
    await this.planRepo.delete(id);
  }

  async duplicatePlan(id: string): Promise<Plan> {
    const original = await this.planRepo.findById(id);
    if (!original) throw new Error('Plan not found');

    const clone: Plan = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return this.planRepo.create(clone);
  }
}
```

### 2.6 Container Pattern

```typescript
// containers/home/PlanListContainer.tsx
import { useEffect, useState } from 'react';
import { PlanCard } from '../../components/plan/PlanCard';
import { PlanService } from '../../services/plan.service';
import { Plan } from '../../models/plan.model';

const planService = new PlanService();

export function PlanListContainer() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    const data = await planService.getAllPlans();
    setPlans(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await planService.deletePlan(id);
    await loadPlans();
  }

  async function handleDuplicate(id: string) {
    await planService.duplicatePlan(id);
    await loadPlans();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onDelete={() => handleDelete(plan.id)}
          onDuplicate={() => handleDuplicate(plan.id)}
        />
      ))}
    </div>
  );
}
```

### 2.7 Component Pattern (Pure Presentation)

```typescript
// components/plan/PlanCard.tsx
import { Plan } from '../../models/plan.model';

interface PlanCardProps {
  plan: Plan;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function PlanCard({ plan, onDelete, onDuplicate }: PlanCardProps) {
  const totalDuration = plan.stages.reduce(
    (sum, stage) => sum + (stage.duration ?? 0),
    0
  );

  return (
    <Card>
      <h3>{plan.name}</h3>
      <span>{plan.type}</span>
      <span>{plan.stages.length} stages</span>
      <span>{formatDuration(totalDuration)}</span>
      <Button onClick={onDuplicate}>Duplicate</Button>
      <Button onClick={onDelete}>Delete</Button>
    </Card>
  );
}
```


---

## 3. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React 18+ with Vite | Fast HMR, small bundle, excellent PWA plugin ecosystem |
| **State Management** | Zustand (UI state only) | Lightweight, minimal boilerplate — used only for ephemeral UI state (session progress, settings) |
| **Database** | IndexedDB via Dexie.js | Structured queries, blob storage, transactions, mature library |
| **PWA** | vite-plugin-pwa | Auto-generates service worker + manifest, Workbox integration |
| **Audio** | Web Audio API | Low-latency audio playback, no external dependencies |
| **Media Capture** | MediaDevices API + File API | Camera access, gallery selection, no external dependencies |
| **File Storage** | OPFS (Origin Private File System) fallback | For large video blobs that exceed iOS IndexedDB limits |
| **Styling** | Tailwind CSS | Mobile-first utilities, responsive design, small CSS footprint |
| **Drag & Drop** | @dnd-kit | Accessible, touch-friendly reordering for stages |
| **Testing** | Vitest + Playwright | Fast unit tests for timer logic, E2E for session flows |
| **Type Safety** | TypeScript | Catch data model errors at compile time |

---

## 4. Data Layer Design

### 4.1 IndexedDB Schema (Dexie)

```typescript
import Dexie, { Table } from 'dexie';

class GymDatabase extends Dexie {
  plans!: Table<Plan, string>;
  media!: Table<MediaRecord, string>;
  history!: Table<SessionHistory, string>;

  constructor() {
    super('GymAppDB');
    this.version(1).stores({
      plans: 'id, name, type, createdAt, updatedAt',
      media: 'id, mimeType, size',
      history: 'id, planId, startedAt, completedAt',
    });
  }
}

export const db = new GymDatabase();
```

### 4.2 Entity Definitions

```typescript
interface Plan {
  id: string;
  name: string;
  type: 'hiit' | 'strength' | 'yoga';
  stages: Stage[];
  restBetweenStages: number; // seconds
  createdAt: number;
  updatedAt: number;
}

interface Stage {
  id: string;
  planId: string;
  order: number;
  name: string;
  mediaType: 'image' | 'video' | null;
  mediaId: string | null;
  duration: number | null; // seconds (HIIT/Yoga)
  reps: number | null; // (Strength)
  notes: string;
  restAfter: number | null; // seconds, overrides plan default
}

interface MediaRecord {
  id: string;
  blob: Blob;
  thumbnail: Blob;
  mimeType: string;
  size: number;
}

interface SessionHistory {
  id: string;
  planId: string;
  planName: string;
  startedAt: number;
  completedAt: number;
  totalDuration: number; // seconds
  stagesCompleted: number;
  completed: boolean;
}
```

### 4.3 Media Storage Strategy

| Storage | Use Case | Limit |
|---------|----------|-------|
| **IndexedDB** | Images < 50MB, thumbnails, small videos | Primary storage |
| **OPFS** | Videos > 50MB or when IndexedDB fails on iOS | Fallback storage |

**Decision logic:**
1. Attempt to store blob in IndexedDB
2. If `QuotaExceededError` or iOS-specific failure → fallback to OPFS
3. Store a reference flag (`storageLocation: 'indexeddb' | 'opfs'`) in the MediaRecord

---

## 5. Offline-First Architecture

### 5.1 Service Worker Strategy

| Asset Type | Caching Strategy | Behavior |
|------------|-----------------|----------|
| App Shell (HTML, JS, CSS) | **Cache First** | Serve from cache, fallback to network |
| Audio Assets | **Cache First** | Pre-cached at install, always available offline |
| User Media | **Not cached by SW** | Served directly from IndexedDB/OPFS |
| API Calls | N/A | No API calls in MVP |

### 5.2 Service Worker Lifecycle

```
Install → Cache app shell + audio assets
       ↓
Activate → Clean old caches
       ↓
Fetch → Serve from cache, offline fallback
```

### 5.3 Data Persistence Guarantee

- All writes go to IndexedDB immediately (synchronous-feeling via async/await)
- Zustand store mirrors IndexedDB state for fast UI reads
- No write is considered complete until IndexedDB transaction commits
- App shows no loading spinners for local data — reads are instant

---

## 6. Timer Engine Design

### 6.1 Accurate Timing Strategy

```typescript
class TimerEngine {
  private startTime: number = 0;
  private pausedAt: number = 0;
  private totalDuration: number = 0;
  private isRunning: boolean = false;

  start(durationMs: number) {
    this.totalDuration = durationMs;
    this.startTime = Date.now();
    this.isRunning = true;
    this.tick();
  }

  private tick() {
    if (!this.isRunning) return;

    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.totalDuration - elapsed);

    this.onTick(remaining);

    if (remaining <= 0) {
      this.onComplete();
      return;
    }

    // Use rAF when visible, throttle to 1s when hidden
    if (document.visibilityState === 'visible') {
      requestAnimationFrame(() => this.tick());
    } else {
      setTimeout(() => this.tick(), 1000);
    }
  }

  pause() {
    this.pausedAt = Date.now();
    this.isRunning = false;
  }

  resume() {
    // Adjust startTime to account for paused duration
    this.startTime += Date.now() - this.pausedAt;
    this.isRunning = true;
    this.tick();
  }
}
```

### 6.2 Background Behavior

| State | Timer Behavior | Audio Behavior |
|-------|---------------|----------------|
| App visible | `requestAnimationFrame` for smooth updates | Normal playback |
| App backgrounded | `setTimeout` at 1s intervals (battery saving) | Continues via Web Audio API |
| Screen locked | `setTimeout` at 1s intervals | Continues (with Wake Lock request) |

### 6.3 Wake Lock Integration

```typescript
// Prevent screen from sleeping during active session
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock released');
      });
    } catch (err) {
      // Wake Lock not available — rely on audio to keep user engaged
    }
  }
}
```

---

## 7. Audio System Design

### 7.1 Audio Asset Inventory

| Sound ID | Purpose | File |
|----------|---------|------|
| `stage-start` | New stage begins | `stage-start.mp3` |
| `stage-end` | Stage timer completes | `stage-end.mp3` |
| `rest-start` | Rest period begins | `rest-start.mp3` |
| `rest-end` | Rest period ends | `rest-end.mp3` |
| `session-complete` | Entire session done | `session-complete.mp3` |
| `countdown-beep` | Last 3 seconds | `beep.mp3` |

### 7.2 Audio Preloading Strategy

```typescript
// On app initialization
const audioAssets = {
  stageStart: new Audio('/audio/stage-start.mp3'),
  stageEnd: new Audio('/audio/stage-end.mp3'),
  restStart: new Audio('/audio/rest-start.mp3'),
  restEnd: new Audio('/audio/rest-end.mp3'),
  sessionComplete: new Audio('/audio/session-complete.mp3'),
  countdownBeep: new Audio('/audio/beep.mp3'),
};

// Preload all assets
Object.values(audioAssets).forEach(audio => {
  audio.preload = 'auto';
  audio.load();
});
```

### 7.3 iOS Audio Unlock Pattern

iOS Safari requires a user gesture to initialize audio playback. The app leverages the natural **media preview/replay** interaction as the unlock trigger:

**Flow:**
1. User uploads a photo/video for a stage
2. App shows a preview of the uploaded media with a "Replay" button
3. User taps "Replay" to review their upload — this is the first user gesture
4. This gesture unlocks the Web Audio context for the entire session

```typescript
let audioUnlocked = false;

async function unlockAudio() {
  if (audioUnlocked) return;

  // Resume the AudioContext on user gesture
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  // Play a silent buffer to fully unlock playback
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);

  audioUnlocked = true;
}

// Called when user taps "Replay" on media preview
mediaReplayButton.addEventListener('click', unlockAudio);
```

**Fallback:** If no media is uploaded, the "Start Session" button itself serves as the unlock gesture.

### 7.4 Media Session API (Background Controls)

```typescript
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Gym Session',
    artist: 'Gym App',
    album: currentPlanName,
  });

  navigator.mediaSession.setActionHandler('play', () => timerEngine.resume());
  navigator.mediaSession.setActionHandler('pause', () => timerEngine.pause());
  navigator.mediaSession.setActionHandler('nexttrack', () => skipNext());
  navigator.mediaSession.setActionHandler('previoustrack', () => skipPrevious());
}
```

---

## 8. Session Execution State Machine

```
┌──────────┐
│  IDLE    │ ← Session not started
└────┬─────┘
     │ User taps "Start"
     ▼
┌──────────┐
│ STAGE    │ ── Timer counting down for current stage
│ ACTIVE   │ ── Media displayed
└────┬─────┘
     │ Timer reaches 0
     ▼
┌──────────┐
│  REST    │ ── Rest timer counting down
│  PERIOD  │ ── "Rest" indicator shown
└────┬─────┘
     │ Rest timer reaches 0
     ▼
┌──────────┐     No more stages
│  NEXT    │──────────────────►┌────────────┐
│  STAGE   │                   │  SESSION   │
└────┬─────┘                   │ COMPLETE   │
     │                         └────────────┘
     └──────────────────────────────┘
     (Loop back to STAGE ACTIVE)
```

**Transitions:**
- `STAGE_ACTIVE → REST_PERIOD`: Stage timer completes
- `REST_PERIOD → STAGE_ACTIVE`: Rest timer completes, advance to next stage
- `REST_PERIOD → SESSION_COMPLETE`: No more stages after rest
- `STAGE_ACTIVE → SESSION_COMPLETE`: Last stage completes (no rest after final)
- Any state → `IDLE`: User cancels session

---

## 9. Import/Export Architecture

### 9.1 Export Format

```json
{
  "version": "1.0",
  "exportedAt": 1700000000000,
  "plan": {
    "name": "Morning HIIT",
    "type": "hiit",
    "restBetweenStages": 30,
    "stages": [
      {
        "name": "Jumping Jacks",
        "order": 0,
        "duration": 45,
        "media": {
          "type": "image/jpeg",
          "data": "<base64-encoded-data>"
        }
      }
    ]
  }
}
```

### 9.2 Export Strategy

**MVP Decision:** Base64 embed in JSON for simplicity. Revisit with ZIP approach if file sizes become problematic.

### 9.3 Import Validation

```typescript
function validateImport(data: unknown): data is ExportedPlan {
  // Check version compatibility
  // Validate required fields
  // Validate media data integrity
  // Return typed result or throw ValidationError
}
```

---

## 10. Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 2.5s | Lighthouse |
| Timer drift (60s stage) | < 500ms | Manual test |
| Audio latency | < 50ms | Manual test |
| App shell cache size | < 2MB | Build output |
| Initial JS bundle | < 150KB gzipped | Build output |

---

## 11. Security Considerations

| Concern | Mitigation |
|---------|------------|
| XSS via plan names/notes | React's built-in escaping, no `dangerouslySetInnerHTML` |
| Malformed import files | Strict schema validation before processing |
| Storage exhaustion | 500MB soft limit with user-facing warnings |
| No auth needed | All data local, no PII transmitted |
