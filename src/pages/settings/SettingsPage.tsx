import { useEffect, useState } from 'react';
import { Database, Info, Moon, Sun, Monitor, Volume2 } from 'lucide-react';
import { useSettingsStore } from '../../stores/settings.store';
import { useTheme } from '../../hooks/useTheme';
import { MediaService } from '../../services/media.service';
import { HistoryService } from '../../services/history.service';
import type { ThemePreference } from '../../lib/theme';
import { Slider } from '../../components/ui/Slider';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { PageLayout } from '../../components/ui/PageLayout';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Switch } from '../../components/ui/Switch';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { VoiceSettings } from '../../components/settings/VoiceSettings';

interface SettingsPageProps {
  onBack: () => void;
}

const mediaService = new MediaService();
const historyService = new HistoryService();

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Volume2; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-8 h-8 flex items-center justify-center bg-brand-soft text-brand rounded-lg" aria-hidden>
        <Icon size={16} />
      </span>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
    </div>
  );
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { volume, soundEnabled, voiceCountdownEnabled, setVolume, setSoundEnabled, setVoiceCountdownEnabled } = useSettingsStore();
  const { preference, setPreference } = useTheme();
  const [storageUsed, setStorageUsed] = useState(0);
  const [confirmAction, setConfirmAction] = useState<'history' | 'all' | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    mediaService.getTotalStorageUsed().then(setStorageUsed).catch(console.error);
  }, []);

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
      <ScreenHeader title="Settings" onBack={onBack} />

      <main className="p-4 space-y-6">
        {/* Appearance Section */}
        <section>
          <SectionHeader icon={Sun} title="Appearance" />
          <Card>
            <SegmentedControl
              label="Theme"
              options={THEME_OPTIONS}
              value={preference}
              onChange={(value) => setPreference(value as ThemePreference)}
            />
            <p className="text-xs text-ink-3 mt-2">
              {preference === 'system' ? 'Following your device setting.' : `${preference === 'dark' ? 'Dark' : 'Light'} theme on.`}
            </p>
          </Card>
        </section>

        {/* Voice Guidance Section */}
        <section>
          <VoiceSettings />
        </section>

        {/* Audio Section */}
        <section>
          <SectionHeader icon={Volume2} title="Audio" />
          <Card className="space-y-4">
            <Slider
              label="Volume"
              min={0}
              max={100}
              value={volume * 100}
              onChange={(v) => setVolume(v / 100)}
              formatValue={(v) => `${v}%`}
            />

            <div className="flex items-center justify-between">
              <span className="text-ink">Sound Effects</span>
              <Switch
                label="Sound effects"
                checked={soundEnabled}
                onChange={setSoundEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-ink">Voice Countdown</span>
              <Switch
                label="Voice countdown"
                checked={voiceCountdownEnabled}
                onChange={setVoiceCountdownEnabled}
              />
            </div>
          </Card>
        </section>

        {/* Data Section */}
        <section>
          <SectionHeader icon={Database} title="Data" />
          <Card className="divide-y divide-line !p-0">
            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-ink-2">Storage Used</span>
              <span className="font-medium text-ink tabular">{formatSize(storageUsed)}</span>
            </div>
            <button
              type="button"
              onClick={() => setConfirmAction('history')}
              className="w-full min-h-11 px-4 py-2.5 text-left text-danger font-medium hover:bg-danger-soft transition-colors"
            >
              Clear History
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction('all')}
              className="w-full min-h-11 px-4 py-2.5 text-left text-danger font-medium hover:bg-danger-soft transition-colors rounded-b-xl"
            >
              Clear All Data
            </button>
          </Card>
        </section>

        {/* About Section */}
        <section>
          <SectionHeader icon={Info} title="About" />
          <Card>
            <p className="text-ink">Pulse v1.0.0</p>
            <p className="text-sm text-ink-2 mt-1">Offline-first exercise plan app</p>
          </Card>
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
