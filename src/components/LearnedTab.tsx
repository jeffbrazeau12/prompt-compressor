// ============================================================
// LearnedTab — manages learned rules
//
// Users see pending rules first, can approve/reject each one,
// edit the replacement text, and reset all learning data.
// ============================================================

import { useState } from 'react';
import { useLearnedRules } from '../hooks/useLearnedRules';
import type { LearnedRule, RuleStatus } from '../types';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function RuleCard({
  rule,
  onApprove,
  onReject,
  onDelete,
  onUpdateReplacement,
}: {
  rule: LearnedRule;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateReplacement: (id: string, r: string) => void;
}) {
  const [editingReplacement, setEditingReplacement] = useState(false);
  const [replacementDraft, setReplacementDraft] = useState(rule.replacement);

  function saveReplacement() {
    onUpdateReplacement(rule.id, replacementDraft);
    setEditingReplacement(false);
  }

  return (
    <div className={`rule-card ${rule.status}`}>
      <div className="rule-top">
        <div className="rule-pattern">
          Strip: <em>"{rule.pattern}"</em>
          {rule.replacement && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' → '}<em style={{ color: 'var(--green)' }}>"{rule.replacement}"</em>
            </span>
          )}
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onDelete(rule.id)}
          aria-label="Delete rule"
          title="Delete this rule"
        >
          ✕
        </button>
      </div>

      <div className="rule-meta">
        <span className={`rule-badge ${rule.risk}`}>{rule.risk}</span>
        <span className={`rule-badge ${rule.status}`}>{rule.status}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          category: {rule.category}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          seen {rule.occurrences}× • {formatDate(rule.createdAt)}
        </span>
      </div>

      <div className="rule-actions">
        {rule.status === 'pending' && (
          <>
            <button
              className="btn btn-approve btn-sm"
              onClick={() => onApprove(rule.id)}
            >
              ✓ Approve
            </button>
            <button
              className="btn btn-reject btn-sm"
              onClick={() => onReject(rule.id)}
            >
              ✕ Reject
            </button>
          </>
        )}

        {rule.status === 'approved' && (
          <button
            className="btn btn-reject btn-sm"
            onClick={() => onReject(rule.id)}
          >
            Disable
          </button>
        )}

        {rule.status === 'rejected' && (
          <button
            className="btn btn-approve btn-sm"
            onClick={() => onApprove(rule.id)}
          >
            Re-enable
          </button>
        )}

        {/* Replacement editor */}
        {editingReplacement ? (
          <>
            <input
              className="replacement-input"
              value={replacementDraft}
              onChange={e => setReplacementDraft(e.target.value)}
              placeholder="Leave empty to strip phrase"
              aria-label="Replacement text"
            />
            <button className="btn btn-primary btn-sm" onClick={saveReplacement}>
              Save
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditingReplacement(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditingReplacement(true)}
          >
            Edit replacement
          </button>
        )}
      </div>
    </div>
  );
}

type FilterOption = 'all' | RuleStatus;

export function LearnedTab() {
  const {
    rules,
    pendingCount,
    handleApprove,
    handleReject,
    handleDelete,
    handleUpdateReplacement,
    handleReset,
  } = useLearnedRules();

  const [filter, setFilter] = useState<FilterOption>('all');

  const filtered = filter === 'all'
    ? rules
    : rules.filter(r => r.status === filter);

  // Sort: pending first, then by lastSeenAt desc
  const sorted = [...filtered].sort((a, b) => {
    const statusOrder = { pending: 0, approved: 1, rejected: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.lastSeenAt - a.lastSeenAt;
  });

  return (
    <div>
      <div className="learned-header">
        <div>
          <h2>
            Learned Rules
            {pendingCount > 0 && (
              <span className="nav-badge" style={{ marginLeft: 10 }}>{pendingCount}</span>
            )}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            The app watches for phrases you use repeatedly and suggests compression rules.
            Only <strong style={{ color: 'var(--green)' }}>approved</strong> rules are applied.
          </p>
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleReset}
          title="Delete all learned rules and phrase frequency data"
        >
          Reset all
        </button>
      </div>

      {/* Filter bar */}
      <div className="rule-filters">
        {(['all', 'pending', 'approved', 'rejected'] as FilterOption[]).map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${rules.length})` :
             f === 'pending' ? `Pending (${rules.filter(r => r.status === 'pending').length})` :
             f === 'approved' ? `Approved (${rules.filter(r => r.status === 'approved').length})` :
             `Rejected (${rules.filter(r => r.status === 'rejected').length})`}
          </button>
        ))}
      </div>

      {/* Rules or empty state */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧠</div>
          <p>
            {filter === 'all'
              ? 'No learned rules yet. Compress a few prompts and the app will start suggesting patterns it notices.'
              : `No ${filter} rules.`}
          </p>
        </div>
      ) : (
        <div className="rule-list">
          {sorted.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              onUpdateReplacement={handleUpdateReplacement}
            />
          ))}
        </div>
      )}

      {/* How it works info box */}
      <div className="card" style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--text)' }}>How the learning feature works</strong>
        <p style={{ marginTop: 8 }}>
          Every time you compress a prompt, the engine extracts 2–5 word phrases and tracks
          how often each appears. Once a phrase reaches the threshold set in Settings,
          it surfaces as a <span className="rule-badge pending" style={{ display: 'inline' }}>pending</span> rule
          for your review. Phrases that appear to be negations, numbers, or quoted content
          are never tracked.
        </p>
        <p style={{ marginTop: 8 }}>
          Rules rated <span className="rule-badge risky" style={{ display: 'inline' }}>risky</span> (4+ word phrases)
          are surfaced for review but never auto-applied — you must explicitly approve them.
          All data is stored only in your browser. Nothing is sent to any server.
        </p>
      </div>
    </div>
  );
}
