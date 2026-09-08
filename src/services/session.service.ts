import type { Plan, Stage } from '../models/plan.model';

export type SessionState = 'idle' | 'stage-active' | 'rest-period' | 'completed';

export interface SessionProgress {
  state: SessionState;
  currentStageIndex: number;
  totalStages: number;
  currentStage: Stage | null;
  timeRemaining: number;
  totalStageTime: number;
  isPaused: boolean;
}

export class SessionService {
  private plan: Plan | null = null;
  private state: SessionState = 'idle';
  private currentStageIndex: number = 0;
  private timeRemaining: number = 0;
  private totalStageTime: number = 0;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private animationFrameId: number | null = null;
  private sessionStartTime: number = 0;
  private stagesCompleted: number = 0;

  private onTickCallback: ((progress: SessionProgress) => void) | null = null;
  private onStateChangeCallback: ((progress: SessionProgress) => void) | null = null;
  private onCompleteCallback: ((plan: Plan, duration: number, stagesCompleted: number) => void) | null = null;

  onTick(callback: (progress: SessionProgress) => void) {
    this.onTickCallback = callback;
  }

  onStateChange(callback: (progress: SessionProgress) => void) {
    this.onStateChangeCallback = callback;
  }

  onComplete(callback: (plan: Plan, duration: number, stagesCompleted: number) => void) {
    this.onCompleteCallback = callback;
  }

  start(plan: Plan): void {
    this.plan = plan;
    this.currentStageIndex = 0;
    this.state = 'stage-active';
    this.isPaused = false;
    this.sessionStartTime = Date.now();
    this.stagesCompleted = 0;
    this.startStage();
  }

  private startStage(): void {
    if (!this.plan) return;
    const stage = this.plan.stages[this.currentStageIndex];
    if (!stage) { this.completeSession(); return; }

    this.state = 'stage-active';
    this.totalStageTime = stage.duration ?? 0;
    this.timeRemaining = this.totalStageTime;
    this.startTime = Date.now();
    this.isPaused = false;
    this.notifyStateChange();
    this.tick();
  }

  private startRest(): void {
    if (!this.plan) return;
    const currentStage = this.plan.stages[this.currentStageIndex];
    const restDuration = currentStage?.restAfter ?? this.plan.restBetweenStages;

    if (this.currentStageIndex >= this.plan.stages.length - 1) {
      this.completeSession();
      return;
    }

    this.state = 'rest-period';
    this.totalStageTime = restDuration;
    this.timeRemaining = restDuration;
    this.startTime = Date.now();
    this.isPaused = false;
    this.notifyStateChange();
    this.tick();
  }

  pause(): void {
    if (this.isPaused || this.state === 'idle' || this.state === 'completed') return;
    this.isPaused = true;
    this.pausedAt = Date.now();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.notifyTick();
  }

  resume(): void {
    if (!this.isPaused || this.state === 'idle' || this.state === 'completed') return;
    this.isPaused = false;
    this.startTime += Date.now() - this.pausedAt;
    this.tick();
  }

  skipNext(): void {
    if (this.state === 'idle' || this.state === 'completed') return;
    this.stagesCompleted = Math.max(this.stagesCompleted, this.currentStageIndex + 1);
    this.currentStageIndex++;
    if (!this.plan || this.currentStageIndex >= this.plan.stages.length) {
      this.completeSession();
    } else {
      this.startStage();
    }
  }

  skipPrevious(): void {
    if (this.state === 'idle' || this.state === 'completed') return;
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      this.startStage();
    }
  }

  stop(): void {
    this.state = 'idle';
    this.plan = null;
    this.isPaused = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.notifyTick();
  }

  private tick(): void {
    if (this.isPaused || this.state === 'idle' || this.state === 'completed') return;
    const elapsed = (Date.now() - this.startTime) / 1000;
    this.timeRemaining = Math.max(0, this.totalStageTime - elapsed);
    this.notifyTick();

    if (this.timeRemaining <= 0) { this.onStageComplete(); return; }

    if (document.visibilityState === 'visible') {
      this.animationFrameId = requestAnimationFrame(() => this.tick());
    } else {
      this.animationFrameId = requestAnimationFrame(() => setTimeout(() => this.tick(), 1000));
    }
  }

  private onStageComplete(): void {
    if (!this.plan) return;
    if (this.state === 'stage-active') {
      this.stagesCompleted = Math.max(this.stagesCompleted, this.currentStageIndex + 1);
      this.startRest();
    } else if (this.state === 'rest-period') {
      this.currentStageIndex++;
      if (this.currentStageIndex >= this.plan.stages.length) {
        this.completeSession();
      } else {
        this.startStage();
      }
    }
  }

  private completeSession(): void {
    if (!this.plan) return;
    this.state = 'completed';
    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.onCompleteCallback?.(this.plan, duration, this.stagesCompleted);
    this.notifyTick();
  }

  getProgress(): SessionProgress {
    return {
      state: this.state,
      currentStageIndex: this.currentStageIndex,
      totalStages: this.plan?.stages.length ?? 0,
      currentStage: this.plan?.stages[this.currentStageIndex] ?? null,
      timeRemaining: Math.ceil(this.timeRemaining),
      totalStageTime: this.totalStageTime,
      isPaused: this.isPaused,
    };
  }

  private notifyTick(): void { this.onTickCallback?.(this.getProgress()); }
  private notifyStateChange(): void { this.onStateChangeCallback?.(this.getProgress()); }
}
