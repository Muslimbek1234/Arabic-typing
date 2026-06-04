// LocalStorage Wrapper for Session Persistence
// Handles saving/loading typing history, skill level, and progression stages

export const HISTORY_KEY = 'arabic_typing_history_v4';
export const SKILL_KEY = 'arabic_typing_skill';
export const PROGRESS_KEY = 'arabic_typing_progress_v3'; // v3: 32 letters + exit test
export const ATTEMPTS_KEY = 'arabic_typing_stage_attempts';

const MAX_HISTORY_ITEMS = 50;

// Total letter stages (keyboard layout order: 32 letters)
export const TOTAL_LETTER_STAGES = 32;
export const EXIT_TEST_STAGE = 33;
// Total stages across all levels: 33 (L1) + 3 (L2) + 3 (L3) = 39
export const TOTAL_ALL_STAGES = 39;

export interface SessionRecord {
  id: number;
  date: string;
  wpm: number;
  accuracy: number;
  errors: number;
  level: number;
  stage?: number;
  isTest?: boolean;
  duration: number;
  feedback?: string;
}

export interface ProgressState {
  unlockedLevel: number; // 1 (Letters), 2 (Words), 3 (Texts)
  unlockedStage: number; // Level 1: 1-32 (Letters), 33 (Exit Test). Level 2: 1-3. Level 3: 1-3.
}

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Save a new session record to history
 * Prepends to the array and caps at MAX_HISTORY_ITEMS
 */
export function saveSession(session: Omit<SessionRecord, 'id'>): void {
  if (!isBrowser()) return;

  try {
    const history = getHistory();

    const nextId =
      history.length > 0
        ? Math.max(...history.map((r) => r.id)) + 1
        : 1;

    const newRecord: SessionRecord = {
      id: nextId,
      ...session,
    };

    const updated = [newRecord, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Retrieve all session history records
 */
export function getHistory(): SessionRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as SessionRecord[];
  } catch (error) {
    console.error('Failed to read history:', error);
    return [];
  }
}

/**
 * Get current skill level
 */
export function getSkillLevel(): number {
  if (!isBrowser()) return 1;

  try {
    const raw = localStorage.getItem(SKILL_KEY);
    if (!raw) return 1;

    const level = parseInt(raw, 10);
    if (isNaN(level)) return 1;

    return Math.max(1, Math.min(10, level));
  } catch {
    return 1;
  }
}

/**
 * Set skill level (clamped between 1 and 10)
 */
export function setSkillLevel(level: number): void {
  if (!isBrowser()) return;

  try {
    const clamped = Math.max(1, Math.min(10, Math.round(level)));
    localStorage.setItem(SKILL_KEY, String(clamped));
  } catch (error) {
    console.error('Failed to save skill level:', error);
  }
}

/**
 * Get progress state (locked/unlocked stages)
 */
export function getProgressState(): ProgressState {
  if (!isBrowser()) return { unlockedLevel: 1, unlockedStage: 1 };

  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { unlockedLevel: 1, unlockedStage: 1 };

    const parsed = JSON.parse(raw);
    return {
      unlockedLevel: parsed.unlockedLevel ?? 1,
      unlockedStage: parsed.unlockedStage ?? 1,
    };
  } catch {
    return { unlockedLevel: 1, unlockedStage: 1 };
  }
}

/**
 * Unlocks the next stage or level based on current completion
 */
export function completeStage(level: number, stage: number): ProgressState {
  const current = getProgressState();
  let nextLevel = current.unlockedLevel;
  let nextStage = current.unlockedStage;

  if (level === current.unlockedLevel && stage === current.unlockedStage) {
    if (level === 1) {
      if (stage < TOTAL_LETTER_STAGES) {
        // Still learning letters (1-31 -> next letter)
        nextStage = stage + 1;
      } else if (stage === TOTAL_LETTER_STAGES) {
        // All 32 letters done, unlock Exit Test (stage 33)
        nextStage = EXIT_TEST_STAGE;
      } else if (stage === EXIT_TEST_STAGE) {
        // Exit Test completed! Unlock Level 2, Stage 1
        nextLevel = 2;
        nextStage = 1;
      }
    } else if (level === 2) {
      if (stage < 3) {
        nextStage = stage + 1;
      } else if (stage === 3) {
        // Level 2 Completed! Unlock Level 3, Stage 1
        nextLevel = 3;
        nextStage = 1;
      }
    } else if (level === 3) {
      if (stage < 3) {
        nextStage = stage + 1;
      } else {
        // All levels completed!
      }
    }

    if (isBrowser()) {
      try {
        const nextState = { unlockedLevel: nextLevel, unlockedStage: nextStage };
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextState));
        return nextState;
      } catch (error) {
        console.error('Failed to save progress state:', error);
      }
    }
  }

  return current;
}

/**
 * Reset all progress and history
 */
export function resetProgress(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SKILL_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to reset progress:', error);
  }
}

/**
 * Clear all session history
 */
export function clearHistory(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

// === Stage Attempt Tracking (for 10-failure reset rule) ===

function getAttemptsKey(level: number, stage: number): string {
  return `${level}_${stage}`;
}

/**
 * Get number of consecutive failed attempts for a specific stage
 */
export function getStageAttempts(level: number, stage: number): number {
  if (!isBrowser()) return 0;
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return data[getAttemptsKey(level, stage)] || 0;
  } catch {
    return 0;
  }
}

/**
 * Increment failed attempts for a stage. Returns the new count.
 */
export function incrementStageAttempts(level: number, stage: number): number {
  if (!isBrowser()) return 0;
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const key = getAttemptsKey(level, stage);
    const newCount = (data[key] || 0) + 1;
    data[key] = newCount;
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
    return newCount;
  } catch {
    return 0;
  }
}

/**
 * Reset attempts counter for a specific stage (called on success)
 */
export function resetStageAttempts(level: number, stage: number): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    delete data[getAttemptsKey(level, stage)];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * Clear all attempt counters (called on full reset)
 */
export function clearAllAttempts(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}
