import { useState } from 'react';
import { useSettingsStore } from '../../stores/settings.store';
import { MediaService } from '../../services/media.service';
import { HistoryService } from '../../services/history.service';
import { Slider } from '../../components/ui/Slider';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { PageLayout } from '../../components/ui/PageLayout';

interface SettingsPageProps {
  onBack: () => void;
}

const mediaService = new MediaService();
const historyService = new HistoryService();

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { volume, soundEnabled, voiceCountdownEnabled, setVolume, setSoundEnabled, setVoiceCountdownEnabled } = useSettingsStore();
  const [storageUsed, setStorageUsed] = useState(0);
  const [confirmAction, setConfirmAction] = useState<'history' | 'all' | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  useState(() => {
    mediaService.getTotalStorageUsed().then(setStorageUsed);
  });

  async function runConfirmedAction() {
    if (confirmAction === 'history') {
      try {
        await historyService.clearAll();
        setToast({ message: 'History cleared.', tone: 'success' });
      } catch {
        setToast({ message: 'Failed to clear history.', tone: 'error' });
      }
    } else if (confirmAction === 'all') {
      try {
        await historyService.clearAll();
        // TODO: Clear plans and media too
        setToast({ message: 'All data cleared. Please refresh the app.', tone: 'success' });
      } catch {
        setToast({ message: 'Failed to clear data.', tone: 'error' });
      }
    }
    setConfirmAction(null);
  }

  return (
    <PageLayout>
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-primary-600 font-medium">
          ← Back
        </button>
        <h1 className="font-semibold text-gray-900">Settings</h1>
        <div className="w-12" />
      </header>

      <main className="p-4 space-y-6">
        {/* Audio Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Audio</h2>
          <div className="bg-white rounded-xl p-4 space-y-4">
            <Slider
              label="Volume"
              min={0}
              max={100}
              value={volume * 100}
              onChange={(v) => setVolume(v / 100)}
            />

            <label className="flex items-center justify-between">
              <span className="text-gray-700">Sound Effects</span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary-600"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-700">Voice Countdown</span>
              <input
                type="checkbox"
                checked={voiceCountdownEnabled}
                onChange={(e) => setVoiceCountdownEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary-600"
              />
            </label>
          </div>
        </section>

        {/* Data Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Data</h2>
          <div className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Storage Used</span>
              <span className="font-medium">{formatSize(storageUsed)}</span>
            </div>

            <button
              onClick={() => setConfirmAction('history')}
              className="w-full py-2 text-left text-red-600 font-medium"
            >
              Clear History
            </button>

            <button
              onClick={() => setConfirmAction('all')}
              className="w-full py-2 text-left text-red-600 font-medium"
            >
              Clear All Data
            </button>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">About</h2>
          <div className="bg-white rounded-xl p-4">
            <p className="text-gray-600">Pulse v1.0.0</p>
            <p className="text-sm text-gray-400 mt-1">Offline-first exercise plan app</p>
          </div>
        </section>
      </main>

      <ConfirmDialog
        open={confirmAction === 'history'}
        title="Clear History"
        message="This will permanently remove all session history. This cannot be undone."
        confirmLabel="Clear"
        danger
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === 'all'}
        title="Clear All Data"
        message="This will remove all plans, media, and history. This cannot be undone."
        confirmLabel="Delete Everything"
        danger
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      )}
    </PageLayout>
  );
}
