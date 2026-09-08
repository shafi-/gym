import { useEffect, useState } from 'react';
import type { SessionHistory } from '../../models/history.model';
import { HistoryService } from '../../services/history.service';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface HistoryPageProps {
  onBack: () => void;
}

const historyService = new HistoryService();

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-primary-600 font-medium">
          ← Back
        </button>
        <h1 className="font-semibold text-gray-900">History</h1>
        {history.length > 0 && (
          <button
            onClick={() => setConfirmClearAll(true)}
            className="text-red-500 text-sm font-medium"
          >
            Clear All
          </button>
        )}
      </header>

      <main className="p-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sessions yet. Complete a workout to see it here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{entry.planName}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(entry.completedAt)} · {formatDuration(entry.totalDuration)} · {entry.stagesCompleted} stages
                    </p>
                  </div>
                  <button
                    onClick={() => setPendingDeleteId(entry.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

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
    </div>
  );
}
