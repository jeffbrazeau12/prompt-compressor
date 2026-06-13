// ============================================================
// CompressTab — main compression interface
// Left panel: input, Right panel: results
// ============================================================

import { useState } from 'react';
import type { CompressionResult, AppSettings } from '../types';
import { useCompression } from '../hooks/useCompression';
import { formatTokenCount } from '../utils/tokenEstimator';

interface Props {
  settings: AppSettings;
  onCompressed: () => void; // Callback to refresh learned rules badge
}

export function CompressTab({ settings, onCompressed }: Props) {
  const {
    input, setInput,
    result, isCompressing, error,
    handleCompress, handleClear,
  } = useCompression(settings);

  const [copied, setCopied] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    // Cmd/Ctrl+Enter to compress
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCompress();
      onCompressed();
    }
  }

  async function handleCopy() {
    if (!result?.compressed) return;
    try {
      await navigator.clipboard.writeText(result.compressed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = result.compressed;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  function doCompress() {
    handleCompress();
    onCompressed();
  }

  return (
    <div className="compress-layout">
      {/* ---- Input panel ---- */}
      <div className="compress-input-panel">
        <div className="panel-label">Original Prompt</div>

        <textarea
          className="prompt-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your prompt here…&#10;&#10;Try something like: &quot;Hello! I was just wondering if you could basically help me understand how transformers work, if that's okay?&quot;"
          aria-label="Prompt input"
        />

        <div className="input-actions">
          <button
            className="btn btn-primary"
            onClick={doCompress}
            disabled={isCompressing || !input.trim()}
          >
            {isCompressing ? '⏳ Compressing…' : '⌥ Compress'}
          </button>

          {input && (
            <button className="btn btn-secondary" onClick={handleClear}>
              Clear
            </button>
          )}

          <span className="char-count">
            {input.length > 0 && `${input.length} chars`}
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          Press <kbd style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>⌘ Enter</kbd> to compress
        </div>

        {error && (
          <div className="error-banner" role="alert">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ---- Results panel ---- */}
      <div className="results-panel">
        <div className="panel-label">Result</div>

        {result ? (
          <>
            {/* Token metrics */}
            {settings.showTokenEstimates && (
              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-value muted">
                    {result.originalTokens.toLocaleString()}
                  </div>
                  <div className="metric-label">Original tokens</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value blue">
                    {result.compressedTokens.toLocaleString()}
                  </div>
                  <div className="metric-label">Compressed tokens</div>
                </div>
                <div className="metric-card">
                  <div className={`metric-value ${result.reductionPercent > 0 ? 'green' : 'muted'}`}>
                    {result.reductionPercent > 0 ? `-${result.reductionPercent}%` : '0%'}
                  </div>
                  <div className="metric-label">Reduction</div>
                </div>
              </div>
            )}

            {/* Signature reduction bar */}
            <div>
              <div
                className="reduction-arc"
                role="progressbar"
                aria-valuenow={result.reductionPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${result.reductionPercent}% token reduction`}
              >
                <div
                  className="reduction-arc-fill"
                  style={{ width: `${Math.min(result.reductionPercent, 100)}%` }}
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: 4 }}>
                {result.originalTokens > result.compressedTokens
                  ? `Saved ~${(result.originalTokens - result.compressedTokens).toLocaleString()} tokens`
                  : 'No tokens saved — prompt may already be concise'}
              </div>
            </div>

            {/* Compressed output */}
            <div className="output-section">
              <div className="output-header">
                <span className="panel-label">Compressed output</span>
                <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                  {copied ? <span className="copy-feedback">✓ Copied</span> : '⎘ Copy'}
                </button>
              </div>
              <div className="compressed-text" aria-label="Compressed prompt">
                {result.compressed}
              </div>
            </div>

            {/* Applied rules */}
            {result.appliedRules.length > 0 && (
              <div>
                <div className="panel-label" style={{ marginBottom: 6 }}>
                  Rules applied ({result.appliedRules.length})
                </div>
                <div className="applied-rules">
                  {result.appliedRules.slice(0, 8).map(rule => (
                    <span key={rule} className="rule-chip">
                      {rule.startsWith('custom:') ? `custom: ${rule.slice(7)}` :
                       rule.startsWith('learned:') ? `learned: ${rule.slice(8)}` :
                       rule}
                    </span>
                  ))}
                  {result.appliedRules.length > 8 && (
                    <span className="rule-chip">+{result.appliedRules.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon">⌥</div>
              <p>Enter a prompt and click Compress to see results here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
