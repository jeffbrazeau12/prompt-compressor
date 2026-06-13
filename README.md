# ⌥ Prompt Compressor

A browser-based tool that reduces the token length of LLM prompts while preserving meaning, intent, and critical constraints.

![Prompt Compressor Screenshot](docs/screenshot-placeholder.png)

---

## What It Does

Prompt Compressor removes words and phrases that inflate token count without adding information:

- Greeting openers ("Hello! I hope this finds you well...")
- Politeness overhead ("I would like you to...", "Please kindly...")
- Filler intensifiers ("basically", "literally", "actually", "just")
- Redundant constructions ("in order to" → "to", "due to the fact that" → "because")
- Wordy phrases ("at this point in time" → "now", "a large number of" → "many")

### What It Always Preserves

Negations, constraints, and critical tokens are **never** touched:

- Negations: `not`, `never`, `cannot`, `don't`, `shouldn't`, `must not`, etc.
- Numbers, dates, percentages, currency
- Quoted strings
- URLs

---

## Features

- **Live compression** with before/after token estimates and reduction percentage
- **Visual reduction bar** showing how much was saved
- **Adaptive learning** — tracks your writing patterns and suggests custom rules
- **Rule management** — approve, reject, edit, or delete learned rules
- **Settings panel** — toggle built-in rules on/off, add custom filler phrases
- **7 example prompts** across technical, business, legal, and creative categories
- **Fully local** — no server, no API keys, no data leaves your browser

---

## Setup

### Requirements

- Node.js 18+
- npm 8+

### Install & Run

```bash
git clone https://github.com/jeffbrazeau/prompt-compressor.git
cd prompt-compressor
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

Output is in `dist/`.

---

## Running Tests

```bash
npm test
```

Tests cover:
- Token estimation (accuracy, edge cases)
- Compression rules (filler, politeness, redundancy, verbosity)
- Negation protection (critical)
- URL and number preservation
- Learning engine CRUD (approve, reject, delete, reset)

---

## How the Learning Feature Works

The adaptive learning engine watches your input prompts over time and identifies phrases you write repeatedly.

### Step-by-Step

1. Each time you compress a prompt, the engine extracts all 2–5 word phrases from your input.
2. Phrases are counted in a frequency map stored in `localStorage`.
3. Stop words (the, a, is, are, etc.) are filtered out so only meaningful content phrases are tracked.
4. Once a phrase reaches the configured threshold (default: 3 occurrences), it surfaces as a **pending** rule.
5. You review the pending rule in the **Learned** tab and choose to approve or reject it.
6. **Only approved rules are applied during compression.** Nothing is auto-applied without your consent.

### Risk Levels

| Level | Trigger | Behavior |
|-------|---------|----------|
| `safe` | 2-word phrase | Surfaces for review |
| `caution` | 3-word phrase | Surfaces for review |
| `risky` | 4-5 word phrase | Surfaces for review, flagged visually |

All levels require explicit user approval before being applied.

### Editing Rules

You can edit the **replacement text** for any learned rule. By default the replacement is empty (the phrase is stripped). You can change it to a shorter equivalent phrase.

---

## Privacy & Local Storage

**All data is stored locally in your browser using `localStorage`. Nothing is sent to any server.**

Keys used:
- `promptCompressor:learnedRules` — learned rule objects
- `promptCompressor:phraseFrequency` — phrase frequency counters
- `promptCompressor:settings` — user preferences
- `promptCompressor:stats` — session stats

To clear all data: go to **Learned → Reset all** or clear your browser's local storage for this site.

---

## Project Structure

```
prompt-compressor/
├── src/
│   ├── components/
│   │   ├── CompressTab.tsx     # Main compression UI
│   │   ├── LearnedTab.tsx      # Learned rules management
│   │   ├── SettingsTab.tsx     # Settings panel
│   │   └── ExamplesTab.tsx     # Example prompts
│   ├── hooks/
│   │   ├── useCompression.ts   # Compression state & logic
│   │   ├── useSettings.ts      # Settings persistence
│   │   └── useLearnedRules.ts  # Learned rules CRUD
│   ├── utils/
│   │   ├── compressionEngine.ts  # Rule engine & compress()
│   │   ├── tokenEstimator.ts     # Token count estimation
│   │   ├── learningEngine.ts     # Adaptive learning
│   │   ├── settings.ts           # Settings storage
│   │   └── examplePrompts.ts     # Example data
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── styles/
│   │   └── main.css            # All styles
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── tests/
│   ├── tokenEstimator.test.ts
│   ├── compressionEngine.test.ts
│   └── learningEngine.test.ts
├── examples/
│   └── example-prompts.md
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Tech Stack

- **React 18** — UI
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Vitest** — Testing
- **Plain CSS** — Styles (no framework dependency)
- **localStorage** — Persistence

---

## Limitations & Future Improvements

### Current Limitations

- Token estimates are approximations (±10%). For exact counts, use the actual model's tokenizer.
- Compression is purely rule-based — it does not use an LLM to understand semantic meaning.
- The learning engine looks for literal repeated phrases, not semantic duplicates.

### Potential Improvements

- Use `tiktoken` (WASM build) for exact token counts per model
- Add a "diff view" to highlight exactly what was removed
- Export/import learned rules as JSON
- Per-model token targets ("compress to under 500 tokens for gpt-4o")
- Sentence-level deduplication (detect repeated ideas, not just phrases)
- Browser extension for compressing prompts in-place on ChatGPT/Claude.ai

---

## License

MIT — see [LICENSE](LICENSE)
