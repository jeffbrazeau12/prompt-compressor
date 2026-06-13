// ============================================================
// ExamplesTab — showcase example prompts
// User can load any example directly into the compressor.
// ============================================================

import { EXAMPLE_PROMPTS } from '../utils/examplePrompts';

interface Props {
  onLoadExample: (prompt: string) => void;
  onNavigateToCompress: () => void;
}

export function ExamplesTab({ onLoadExample, onNavigateToCompress }: Props) {
  function handleLoad(prompt: string) {
    onLoadExample(prompt);
    onNavigateToCompress();
  }

  return (
    <div>
      <div className="page-title">
        <h1>Example Prompts</h1>
        <p>Click "Try this" to load any example into the compressor.</p>
      </div>

      <div className="examples-grid">
        {EXAMPLE_PROMPTS.map(example => (
          <div key={example.id} className="example-card">
            <div className="example-category">{example.category}</div>
            <div className="example-title">{example.title}</div>
            <div className="example-desc">{example.description}</div>
            <div className="example-preview">{example.prompt}</div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleLoad(example.prompt)}
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
            >
              Try this →
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--text)' }}>What gets compressed?</strong>
        <p style={{ marginTop: 8 }}>
          The compressor targets phrases that add length without adding meaning: greetings,
          politeness openers, filler intensifiers, redundant word pairs, and wordy constructions.
        </p>
        <p style={{ marginTop: 8 }}>
          It explicitly <strong style={{ color: 'var(--red)' }}>protects</strong> negations
          ("not", "never", "cannot", "don't"), numbers, dates, quoted strings, and URLs.
          These are never stripped or altered.
        </p>
      </div>
    </div>
  );
}
