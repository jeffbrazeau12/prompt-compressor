// ============================================================
// Token Counter
//
// Tracks two running totals in localStorage:
//   - Session total: resets when the user clicks "New Chat"
//   - All-time total: never resets automatically
//
// Both are updated every time a compression is run.
// ============================================================

const KEY_SESSION  = 'promptCompressor:sessionTokensSaved';
const KEY_ALLTIME  = 'promptCompressor:alltimeTokensSaved';
const KEY_SESSION_COUNT  = 'promptCompressor:sessionCompressions';
const KEY_ALLTIME_COUNT  = 'promptCompressor:alltimeCompressions';

export interface TokenTotals {
  sessionSaved:       number;  // tokens saved this session
  alltimeSaved:       number;  // tokens saved all time
  sessionCompressions: number; // compressions run this session
  alltimeCompressions: number; // compressions run all time
}

function getNum(key: string): number {
  try {
    return parseInt(localStorage.getItem(key) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function setNum(key: string, val: number): void {
  try {
    localStorage.setItem(key, String(val));
  } catch {}
}

/** Read current totals */
export function getTokenTotals(): TokenTotals {
  return {
    sessionSaved:        getNum(KEY_SESSION),
    alltimeSaved:        getNum(KEY_ALLTIME),
    sessionCompressions: getNum(KEY_SESSION_COUNT),
    alltimeCompressions: getNum(KEY_ALLTIME_COUNT),
  };
}

/** Add a compression result to both counters */
export function recordCompression(tokensSaved: number): void {
  if (tokensSaved <= 0) return;
  setNum(KEY_SESSION,       getNum(KEY_SESSION)       + tokensSaved);
  setNum(KEY_ALLTIME,       getNum(KEY_ALLTIME)        + tokensSaved);
  setNum(KEY_SESSION_COUNT, getNum(KEY_SESSION_COUNT)  + 1);
  setNum(KEY_ALLTIME_COUNT, getNum(KEY_ALLTIME_COUNT)  + 1);
}

/** Reset session counter only (for "New Chat") */
export function resetSession(): void {
  setNum(KEY_SESSION,       0);
  setNum(KEY_SESSION_COUNT, 0);
}

/** Reset all-time counter */
export function resetAlltime(): void {
  setNum(KEY_ALLTIME,       0);
  setNum(KEY_ALLTIME_COUNT, 0);
}
