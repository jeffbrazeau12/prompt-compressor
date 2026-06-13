// ============================================================
// SettingsTab — customize compression behavior
// ============================================================

import { useState } from 'react';
import { BUILTIN_RULES, getRulesByCategory } from '../utils/compressionEngine';
import type { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => void;
  onReset: () => void;
  onAddPhrase: (phrase: string) => void;
  onRemovePhrase: (phrase: string) => void;
  onToggleRule: (ruleId: string) => void;
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

export function SettingsTab({
  settings,
  onUpdate,
  onReset,
  onAddPhrase,
  onRemovePhrase,
  onToggleRule,
}: Props) {
  const [newPhrase, setNewPhrase] = useState('');
  const rulesByCategory = getRulesByCategory();

  function handleAddPhrase(e: React.FormEvent) {
    e.preventDefault();
    if (newPhrase.trim()) {
      onAddPhrase(newPhrase);
      setNewPhrase('');
    }
  }

  const categoryLabels: Record<string, string> = {
    filler:      'Filler words & empty intensifiers',
    politeness:  'Politeness phrases',
    redundancy:  'Redundant constructions',
    verbosity:   'Wordy phrases',
    hedge:       'Hedge phrases',
    transition:  'Filler transitions',
  };

  return (
    <div>
      <div className="page-title">
        <h1>Settings</h1>
        <p>Customize how the compressor behaves.</p>
      </div>

      <div className="settings-sections">

        {/* ---- General ---- */}
        <div className="settings-section card">
          <h3>General</h3>

          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Show token estimates</div>
              <div className="setting-desc">Display estimated token counts in results</div>
            </div>
            <Toggle
              id="setting-tokens"
              checked={settings.showTokenEstimates}
              onChange={v => onUpdate({ showTokenEstimates: v })}
            />
          </div>
        </div>

        {/* ---- Learning ---- */}
        <div className="settings-section card">
          <h3>Adaptive Learning</h3>

          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Enable learning</div>
              <div className="setting-desc">Track phrase frequency and suggest new compression rules</div>
            </div>
            <Toggle
              id="setting-learning"
              checked={settings.enableLearning}
              onChange={v => onUpdate({ enableLearning: v })}
            />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Occurrences before suggestion</div>
              <div className="setting-desc">
                How many times a phrase must appear before a rule is suggested (1–10)
              </div>
            </div>
            <input
              type="number"
              className="setting-number"
              min={1}
              max={10}
              value={settings.minOccurrencesBeforeLearn}
              onChange={e => onUpdate({ minOccurrencesBeforeLearn: Math.min(10, Math.max(1, Number(e.target.value))) })}
              disabled={!settings.enableLearning}
              aria-label="Minimum occurrences"
            />
          </div>
        </div>

        {/* ---- Custom filler phrases ---- */}
        <div className="settings-section card">
          <h3>Custom Filler Phrases</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            Add your own phrases to strip from every prompt.
            These are always applied regardless of built-in rules.
          </p>

          {settings.customFillerPhrases.length > 0 && (
            <div className="phrase-list">
              {settings.customFillerPhrases.map(phrase => (
                <span key={phrase} className="phrase-tag">
                  {phrase}
                  <button
                    onClick={() => onRemovePhrase(phrase)}
                    aria-label={`Remove phrase: ${phrase}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <form className="add-phrase-row" onSubmit={handleAddPhrase}>
            <input
              className="add-phrase-input"
              value={newPhrase}
              onChange={e => setNewPhrase(e.target.value)}
              placeholder="e.g. as per my last email"
              aria-label="New filler phrase"
            />
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={!newPhrase.trim()}
            >
              Add
            </button>
          </form>
        </div>

        {/* ---- Built-in rules ---- */}
        <div className="settings-section card">
          <h3>Built-in Compression Rules</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Toggle individual rules on or off. Disabled rules are never applied.
          </p>

          {Array.from(rulesByCategory.entries()).map(([category, rules]) => (
            <div key={category} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}>
                {categoryLabels[category] || category}
              </div>
              <div className="rule-toggle-list">
                {rules.map(rule => {
                  const isEnabled = !settings.disabledBuiltinRules.includes(rule.id);
                  return (
                    <div key={rule.id} className="rule-toggle-row">
                      <div className="setting-info">
                        <div className="setting-label">{rule.description}</div>
                        <div className="setting-desc">
                          <span className={`rule-badge ${rule.risk}`}>{rule.risk}</span>
                        </div>
                      </div>
                      <Toggle
                        id={`rule-${rule.id}`}
                        checked={isEnabled}
                        onChange={() => onToggleRule(rule.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ---- Reset ---- */}
        <div className="settings-section card">
          <h3>Reset</h3>
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Reset all settings to defaults</div>
              <div className="setting-desc">Restores all rules and preferences. Does not delete learned rules.</div>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm('Reset all settings to defaults?')) onReset();
              }}
            >
              Reset
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
