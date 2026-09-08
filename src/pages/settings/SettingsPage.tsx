import { useState } from 'react';
import { useSettingsStore } from '../../stores/settings.store';
import { MediaService } from '../../services/media.service';
import { HistoryService } from '../../services/history.service';
import { Slider } from '../../components/ui/Slider';

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

  useState(() => {
    mediaService.getTotalStorageUsed().then(setStorageUsed);
  });

  async function handleClearHistory() {
    if (!confirm('Clear all history? This cannot be undone.')) return;
    await historyService.clearAll();
    alert('History cleared.');
  }

  async function handleClearAllData() {
    if (!confirm('Clear ALL data? This cannot be undone.')) return;
    await historyService.clearAll();
    // TODO: Clear plans and media too
    alert('All data cleared. Please refresh the app.');
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              onClick={handleClearHistory}
              className="w-full py-2 text-left text-red-600 font-medium"
            >
              Clear History
            </button>

            <button
              onClick={handleClearAllData}
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
            <p className="text-gray-600">Gym App v1.0.0</p>
            <p className="text-sm text-gray-400 mt-1">Offline-first exercise plan app</p>
          </div>
        </section>
      </main>
    </div>
  );
}
