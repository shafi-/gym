import { useEffect, useMemo, useState } from 'react';
import { History, Trash2 } from 'lucide-react';
import type { SessionHistory } from '../../models/history.model';
import { HistoryService } from '../../services/history.service';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageLayout } from '../../components/ui/PageLayout';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomActionBar } from '../../components/ui/BottomActionBar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { IconButton } from '../../components/ui/IconButton';

interface HistoryPageProps {
  onBack: () => void;
}

const historyService = new HistoryService();

const DAY_MS = 86_400_000;

function dayLabel(timestamp: number): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (timestamp >= startOfToday) return 'Today';
  if (timestamp >= startOfToday - DAY_MS) return 'Yesterday';
  const date = new Date(timestamp);
  const opts: Intl.DateTimeFormatOptions =
    date.getFullYear() === now.getFullYear()
      ? { weekday: 'short', month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString(undefined, opts);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);
      const data = await historyService.getAllHistory();
      setHistory(data.sort((a, b) => b.completedAt - a.completedAt));
    } catch (err) {
      setError('Failed to load history.');
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }

  // Group sorted entries into consecutive calendar-day sections.
  const groups = useMemo(() => {
    const result: { label: string; entries: SessionHistory[] }[] = [];
    for (const entry of history) {
      const label = dayLabel(entry.completedAt);
      const last = result[result.length - 1];
      if (last && last.label === label) {
        last.entries.push(entry);
      } else {
        result.push({ label, entries: [entry] });
      }
    }
    return result;
  }, [history]);

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    try {
      await historyService.deleteEntry(pendingDeleteId);
      await loadHistory();
    } catch (err) {
      setError('Failed to delete entry.');
    } finally {
      setPendingDeleteId(null);
    }
  }

  async function handleConfirmClearAll() {
    try {
      await historyService.clearAll();
      setHistory([]);
    } catch (err) {
      setError('Failed to clear history.');
    } finally {
      setConfirmClearAll(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <PageLayout>
      <ScreenHeader title="History" onBack={onBack} />

      <main className="p-4">
        {error && (
          <div className="p-3 bg-danger-soft text-danger rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <EmptyState
            icon={History}
            title="No sessions yet"
            message="Complete a workout to see it here!"
          />
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-3 mb-2">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.entries.map((entry) => (
                  <Card key={entry.id} className="!p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-ink truncate">{entry.planName}</h3>
                      <p className="text-sm text-ink-2 tabular">
                        {formatTime(entry.completedAt)} · {formatDuration(entry.totalDuration)} ·{' '}
                        {entry.stagesCompleted} stages
                      </p>
                    </div>
                    <IconButton
                      label={`Delete ${entry.planName} session`}
                      variant="danger"
                      onClick={() => setPendingDeleteId(entry.id)}
                    >
                      <Trash2 size={17} />
                    </IconButton>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {history.length > 0 && (
        <BottomActionBar>
          <Button variant="secondary" size="lg" className="w-full text-danger" onClick={() => setConfirmClearAll(true)}>
            Clear All History
          </Button>
        </BottomActionBar>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete Session"
        message="Are you sure you want to delete this session record?"
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear All History"
        message="This will permanently remove all session history. This cannot be undone."
        confirmLabel="Clear All"
        danger
        onConfirm={handleConfirmClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </PageLayout>
  );
}
