import { useState, useEffect } from 'react';
import { Bell, Mic, Play, Square } from 'lucide-react';
import { voiceService } from '../../services/voice.service';
import { audioService } from '../../services/audio.service';
import { useSettingsStore } from '../../stores/settings.store';
import { Card } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { inputClass, labelClass } from '../ui/InputStyles';

export function VoiceSettings() {
  const {
    voiceEnabled,
    voiceRate,
    announceStageName,
    announceStartStop,
    announceRest,
    announceCountdown,
    preStageWarningSeconds,
    setVoiceEnabled,
    setVoiceRate,
    setAnnounceStageName,
    setAnnounceStartStop,
    setAnnounceRest,
    setAnnounceCountdown,
    setPreStageWarningSeconds,
  } = useSettingsStore();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [previewText] = useState('Push-ups. Go!');

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = voiceService.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].voiceURI);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  const handlePreview = async () => {
    voiceService.setRate(voiceRate);
    if (selectedVoice) {
      voiceService.setVoice(selectedVoice);
    }
    await voiceService.speak(previewText, 'high');
  };

  const handleBeepPreview = () => {
    audioService.unlock().then(() => {
      audioService.playBeep();
    });
  };

  const handleStop = () => {
    voiceService.stop();
  };

  if (!voiceService.isSupported()) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 flex items-center justify-center bg-brand-soft text-brand rounded-lg" aria-hidden>
            <Mic size={16} />
          </span>
          <h2 className="text-base font-semibold text-ink">Voice Guidance</h2>
        </div>
        <Card>
          <p className="text-ink-2 text-sm">Voice guidance is not supported in this browser.</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 flex items-center justify-center bg-brand-soft text-brand rounded-lg" aria-hidden>
          <Mic size={16} />
        </span>
        <h2 className="text-base font-semibold text-ink">Voice Guidance</h2>
      </div>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-ink font-medium">Voice Announcements</span>
          <Switch label="Voice announcements" checked={voiceEnabled} onChange={setVoiceEnabled} />
        </div>

        {voiceEnabled && (
          <>
            {/* Preview / Test Button */}
            <div className="bg-surface-2 rounded-xl p-3">
              <p className="text-sm text-ink-2 mb-2 font-medium">Preview &amp; Test</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handlePreview} className="flex-1 min-w-[120px]">
                  <Play size={14} aria-hidden />
                  Voice Sample
                </Button>
                <Button size="sm" variant="secondary" onClick={handleBeepPreview} className="flex-1 min-w-[120px]">
                  <Bell size={14} aria-hidden />
                  Beep Test
                </Button>
                <Button size="sm" variant="ghost" onClick={handleStop} aria-label="Stop audio preview">
                  <Square size={13} aria-hidden />
                </Button>
              </div>
              <p className="text-xs text-ink-3 mt-2">
                Voice: "{previewText}" | Beep: timer tick sound
              </p>
            </div>

            {/* Voice Selection */}
            {voices.length > 0 && (
              <div>
                <label htmlFor="voice-select" className={labelClass}>
                  Voice
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className={`${inputClass} text-sm`}
                >
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speech Rate */}
            <Slider
              label="Speech Rate"
              min={0.5}
              max={2}
              step={0.1}
              value={voiceRate}
              onChange={setVoiceRate}
              formatValue={(v) => `${v.toFixed(1)}x`}
            />

            {/* Announcement Toggles */}
            <div className="border-t border-line pt-3">
              <p className="text-sm font-medium text-ink mb-2">Announcements</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-2">Stage names</span>
                  <Switch label="Announce stage names" checked={announceStageName} onChange={setAnnounceStageName} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-2">Start/Stop cues</span>
                  <Switch label="Announce start and stop cues" checked={announceStartStop} onChange={setAnnounceStartStop} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-2">Rest periods</span>
                  <Switch label="Announce rest periods" checked={announceRest} onChange={setAnnounceRest} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-2">Countdown (3-2-1)</span>
                  <Switch label="Announce countdown" checked={announceCountdown} onChange={setAnnounceCountdown} />
                </div>
              </div>
            </div>

            {/* Pre-stage Warning */}
            <div className="border-t border-line pt-3">
              <label htmlFor="pre-stage-warning" className={labelClass}>
                Pre-stage Warning
              </label>
              <select
                id="pre-stage-warning"
                value={preStageWarningSeconds}
                onChange={(e) => setPreStageWarningSeconds(parseInt(e.target.value))}
                className={`${inputClass} text-sm`}
              >
                <option value={0}>Off</option>
                <option value={3}>3 seconds before</option>
                <option value={5}>5 seconds before</option>
                <option value={10}>10 seconds before</option>
              </select>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
