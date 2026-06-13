// ============================================================
// Token estimation utilities
// 
// True tokenization requires the actual model's tokenizer.
// This module provides a fast, reasonably accurate estimate
// using the ~4 characters per token heuristic from OpenAI,
// with adjustments for punctuation and whitespace patterns.
// ============================================================

/**
 * Estimates the token count of a string.
 * 
 * Method: character-based with common tokenizer adjustments.
 * Accuracy: within ~10% for typical English prose.
 * 
 * @param text - The input string to estimate
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  // Split on whitespace and punctuation boundaries
  // This approximates how BPE tokenizers segment text
  const words = text.trim().split(/\s+/);

  let tokenCount = 0;

  for (const word of words) {
    if (word.length === 0) continue;

    // Short words (1-4 chars) are usually single tokens
    if (word.length <= 4) {
      tokenCount += 1;
      continue;
    }

    // Longer words often split into 2+ subword tokens
    // Rough estimate: 1 token per 3.5 characters for longer words
    tokenCount += Math.ceil(word.length / 3.5);
  }

  // Punctuation sequences each tend to be their own token
  const punctMatches = text.match(/[!?.,:;'"(){}\[\]<>|/\\@#$%^&*+=~`-]+/g);
  if (punctMatches) {
    // Some punctuation is already counted in words above,
    // so we add a fractional adjustment
    tokenCount += Math.floor(punctMatches.length * 0.5);
  }

  // Newlines and special formatting often add tokens
  const newlines = (text.match(/\n/g) || []).length;
  tokenCount += Math.floor(newlines * 0.5);

  return Math.max(1, tokenCount);
}

/**
 * Calculates percentage reduction between two token counts.
 * Returns 0 if original is 0.
 */
export function calcReduction(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round(((original - compressed) / original) * 100);
}

/**
 * Formats a token count for display (e.g., "1,234 tokens")
 */
export function formatTokenCount(count: number): string {
  return `${count.toLocaleString()} token${count === 1 ? '' : 's'}`;
}
