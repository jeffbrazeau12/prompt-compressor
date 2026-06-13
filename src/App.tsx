// ============================================================
// App — root component
// Manages navigation between tabs and shared state.
// ============================================================

import { useState } from 'react';
import { CompressTab } from './components/CompressTab';
import { LearnedTab } from './components/LearnedTab';
import { SettingsTab } from './components/SettingsTab';
import { ExamplesTab } from './components/ExamplesTab';
import { useSettings } from './hooks/useSettings';
import { useLearnedRules } from './hooks/useLearnedRules';
import { useCompression } from './hooks/useCompression';
import type { TabName } from './types';
import './styles/main.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('compress');

  // Settings state (shared across tabs)
  const {
    settings,
    updateSettings,
    resetSettings,
    addCustomPhrase,
    removeCustomPhrase,
    toggleBuiltinRule,
  } = useSettings();

  // Learned rules state (for badge count)
  const { pendingCount, refresh: refreshRules } = useLearnedRules();

  // A separate compression hook just for example loading
  const { loadExample, input } = useCompression(settings);

  function handleLoadExample(prompt: string) {
    loadExample(prompt);
  }

  return (
    <div className="app">
      {/* ---- Header / Nav ---- */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">⌥</div>
            <span className="logo-text">Prompt Compressor</span>
          </div>

          <nav className="nav" aria-label="Main navigation">
            <button
              className={`nav-btn ${activeTab === 'compress' ? 'active' : ''}`}
              onClick={() => setActiveTab('compress')}
            >
              Compress
            </button>
            <button
              className={`nav-btn ${activeTab === 'learned' ? 'active' : ''}`}
              onClick={() => setActiveTab('learned')}
            >
              Learned
              {pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </button>
            <button
              className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button
              className={`nav-btn ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              Examples
            </button>
          </nav>
        </div>
      </header>

      {/* ---- Main content ---- */}
      <main className="main">
        {activeTab === 'compress' && (
          <CompressTab
            settings={settings}
            onCompressed={refreshRules}
          />
        )}

        {activeTab === 'learned' && (
          <LearnedTab />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdate={updateSettings}
            onReset={resetSettings}
            onAddPhrase={addCustomPhrase}
            onRemovePhrase={removeCustomPhrase}
            onToggleRule={toggleBuiltinRule}
          />
        )}

        {activeTab === 'examples' && (
          <ExamplesTab
            onLoadExample={handleLoadExample}
            onNavigateToCompress={() => setActiveTab('compress')}
          />
        )}
      </main>
    </div>
  );
}
