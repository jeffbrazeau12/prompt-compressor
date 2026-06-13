// ============================================================
// Learning / Adaptive Engine
//
// This module watches user inputs over time and identifies
// repeated verbose phrases that could become learned rules.
//
// How it works:
//   1. Each time the user compresses a prompt, the engine
//      scans the input for multi-word phrases (2-5 words).
//   2. Phrases are counted in a frequency map stored in localStorage.
//   3. Once a phrase appears minOccurrences times, it is flagged
//      as a "pending" learned rule for user review.
//   4. The user can approve, reject, or delete pending rules.
//   5. Only APPROVED rules are applied during compression.
//   6. Risky rules (anything touching sentence structure) are
//      always left as "pending" and never auto-approved.
//
// Privacy: ALL data stays in the browser localStorage.
// No data is ever sent to a server.
// ============================================================

import type { LearnedRule, RuleRisk } from '../types';

// localStorage keys
const STORAGE_KEY_RULES = 'promptCompressor:learnedRules';
const STORAGE_KEY_PHRASES = 'promptCompressor:phraseFrequency';
const STORAGE_KEY_STATS = 'promptCompressor:stats';

/** Phrase frequency map stored in localStorage */
type PhraseMap = Record<string, { count: number; lastSeen: number }>;

// Common words that shouldn't seed learned rules on their own
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'as', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
  'this', 'that', 'these', 'those', 'what', 'which', 'who',
  'if', 'then', 'than', 'so', 'yet', 'both', 'either', 'neither',
]);

/**
 * Extracts candidate 2-5 word phrases from input text.
 * Filters out phrases that are just stop words.
 */
function extractPhrases(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);

  const phrases: string[] = [];

  for (let len = 2; len <= 5; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      // Skip phrases that are entirely stop words
      const nonStop = words.slice(i, i + len).filter(w => !STOP_WORDS.has(w));
      if (nonStop.length === 0) continue;
      // Skip very short phrases
      if (phrase.length < 8) continue;
      phrases.push(phrase);
    }
  }

  return phrases;
}

/**
 * Determines the risk level of a potential learned rule.
 * Longer replacements and structural changes are riskier.
 */
function assessRisk(phrase: string): RuleRisk {
  const words = phrase.split(/\s+/);
  // 2-word phrase with common words: safe
  if (words.length <= 2) return 'safe';
  // 3-word phrase: caution
  if (words.length <= 3) return 'caution';
  // 4+ word phrase: risky (more likely to cause false positives)
  return 'risky';
}

/**
 * Determines the category of a phrase based on content.
 */
function detectCategory(phrase: string): string {
  if (/\b(please|kindly|would you|could you|thank)\b/.test(phrase)) return 'politeness';
  if (/\b(basically|literally|actually|really|just|simply)\b/.test(phrase)) return 'filler';
  if (/\b(in order to|due to the fact|in the event)\b/.test(phrase)) return 'redundancy';
  return 'verbosity';
}

// ---- localStorage helpers ----

function loadRules(): LearnedRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RULES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRules(rules: LearnedRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  } catch (e) {
    console.warn('Could not save learned rules to localStorage:', e);
  }
}

function loadPhraseMap(): PhraseMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHRASES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePhraseMap(map: PhraseMap): void {
  try {
    localStorage.setItem(STORAGE_KEY_PHRASES, JSON.stringify(map));
  } catch (e) {
    console.warn('Could not save phrase map to localStorage:', e);
  }
}

// ---- Public API ----

/**
 * Analyzes a compressed input and updates the phrase frequency map.
 * If any phrase reaches the threshold, creates a pending learned rule.
 * 
 * @param originalText - The original user prompt
 * @param minOccurrences - How many times a phrase must appear before a rule is suggested
 */
export function analyzeAndLearn(originalText: string, minOccurrences: number): void {
  const phrases = extractPhrases(originalText);
  const phraseMap = loadPhraseMap();
  const existingRules = loadRules();
  const existingPatterns = new Set(existingRules.map(r => r.pattern));

  const now = Date.now();
  const newRules: LearnedRule[] = [];

  for (const phrase of phrases) {
    // Skip if we already have a rule for this phrase
    if (existingPatterns.has(phrase)) {
      // Still update the count and lastSeen
      if (phraseMap[phrase]) {
        phraseMap[phrase].count += 1;
        phraseMap[phrase].lastSeen = now;
      }
      continue;
    }

    // Update phrase frequency
    if (!phraseMap[phrase]) {
      phraseMap[phrase] = { count: 0, lastSeen: now };
    }
    phraseMap[phrase].count += 1;
    phraseMap[phrase].lastSeen = now;

    // Check if threshold reached
    if (phraseMap[phrase].count >= minOccurrences) {
      const risk = assessRisk(phrase);
      newRules.push({
        id: `learned-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        pattern: phrase,
        replacement: '', // Default: strip the phrase entirely
        occurrences: phraseMap[phrase].count,
        status: 'pending', // Always pending — user must approve
        risk,
        createdAt: now,
        lastSeenAt: now,
        category: detectCategory(phrase),
      });
      // Remove from phrase map so it doesn't keep triggering
      delete phraseMap[phrase];
    }
  }

  savePhraseMap(phraseMap);

  if (newRules.length > 0) {
    saveRules([...existingRules, ...newRules]);
  }
}

/** Returns all learned rules */
export function getLearnedRules(): LearnedRule[] {
  return loadRules();
}

/** Approves a learned rule by ID */
export function approveRule(id: string): void {
  const rules = loadRules().map(r =>
    r.id === id ? { ...r, status: 'approved' as const } : r
  );
  saveRules(rules);
}

/** Rejects a learned rule by ID */
export function rejectRule(id: string): void {
  const rules = loadRules().map(r =>
    r.id === id ? { ...r, status: 'rejected' as const } : r
  );
  saveRules(rules);
}

/** Deletes a learned rule by ID */
export function deleteRule(id: string): void {
  saveRules(loadRules().filter(r => r.id !== id));
}

/** Updates the replacement text for a learned rule */
export function updateRuleReplacement(id: string, replacement: string): void {
  const rules = loadRules().map(r =>
    r.id === id ? { ...r, replacement } : r
  );
  saveRules(rules);
}

/** Resets ALL learned data (rules + phrase frequency + stats) */
export function resetAllLearning(): void {
  localStorage.removeItem(STORAGE_KEY_RULES);
  localStorage.removeItem(STORAGE_KEY_PHRASES);
  localStorage.removeItem(STORAGE_KEY_STATS);
}

/** Returns only approved rules for use in compression */
export function getApprovedRules(): Array<{ pattern: string; replacement: string }> {
  return loadRules()
    .filter(r => r.status === 'approved')
    .map(r => ({ pattern: r.pattern, replacement: r.replacement }));
}

/** Returns count of pending rules (for notification badge) */
export function getPendingRuleCount(): number {
  return loadRules().filter(r => r.status === 'pending').length;
}
