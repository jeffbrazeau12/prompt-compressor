// ============================================================
// Core data types for the Prompt Compressor application
// ============================================================

/** A single compression result with before/after metrics */
export interface CompressionResult {
  original: string;
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  reductionPercent: number;
  appliedRules: string[];
}

/** Status of a learned pattern rule */
export type RuleStatus = 'pending' | 'approved' | 'rejected';

/** Risk level for learned rules — determines if they auto-apply */
export type RuleRisk = 'safe' | 'caution' | 'risky';

/** A rule learned from user behavior over time */
export interface LearnedRule {
  id: string;
  pattern: string;           // The verbose phrase the user tends to write
  replacement: string;       // The compressed equivalent
  occurrences: number;       // How many times this pattern was seen
  status: RuleStatus;        // pending / approved / rejected
  risk: RuleRisk;            // How aggressive the compression is
  createdAt: number;         // Unix timestamp
  lastSeenAt: number;        // Unix timestamp
  category: string;          // e.g. "filler", "politeness", "verbosity"
}

/** A built-in static compression rule */
export interface StaticRule {
  id: string;
  pattern: RegExp | string;  // Regex or literal string to match
  replacement: string;       // Replacement text
  category: RuleCategory;
  description: string;
  enabled: boolean;
  risk: RuleRisk;
}

/** Categories of compression rules */
export type RuleCategory =
  | 'filler'
  | 'politeness'
  | 'redundancy'
  | 'verbosity'
  | 'hedge'
  | 'transition'
  | 'custom';

/** User-configurable settings */
export interface AppSettings {
  enableLearning: boolean;
  autoApplySafeRules: boolean;     // Only applies rules with risk='safe'
  minOccurrencesBeforeLearn: number; // How many times before suggesting a rule
  showTokenEstimates: boolean;
  theme: 'light' | 'dark' | 'system';
  customFillerPhrases: string[];   // User-added phrases to strip
  disabledBuiltinRules: string[];  // IDs of built-in rules the user turned off
}

/** Tab navigation options */
export type TabName = 'compress' | 'learned' | 'settings' | 'examples';

/** Stats tracked for the learning engine */
export interface LearningStats {
  totalCompressed: number;
  totalTokensSaved: number;
  learnedRulesApplied: number;
  sessionStart: number;
}

/** An example prompt for the examples tab */
export interface ExamplePrompt {
  id: string;
  title: string;
  category: string;
  prompt: string;
  description: string;
}
