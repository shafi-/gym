import { useState, useEffect } from 'react';
import { voiceService } from '../../services/voice.service';
import { useSettingsStore } from '../../stores/settings.store';

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

  const handleStop = () => {
    voiceService.stop();
  };

  if (!voiceService.isSupported()) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">🎙️</span>
          <h2 className="text-lg font-semibold text-gray-700">Voice Guidance</h2>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Voice guidance is not supported in this browser.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">🎙️</span>
        <h2 className="text-lg font-semibold text-gray-700">Voice Guidance</h2>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
        <label className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Voice Announcements</span>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
            className="w-5 h-5 accent-purple-600"
          />
        </label>

        {voiceEnabled && (
          <>
            {/* Preview / Test Button */}
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-purple-700 mb-2 font-medium">Preview Voice</p>
              <div className="flex gap-2">
                <button
                  onClick={handlePreview}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>▶</span> Play Sample
                </button>
                <button
                  onClick={handleStop}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Stop
                </button>
              </div>
              <p className="text-xs text-purple-500 mt-2">
                Sample: "{previewText}"
              </p>
            </div>

            {/* Voice Selection */}
            {voices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speech Rate: {voiceRate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
            {/* Announcement Toggles */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Announcements</p>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Stage names</span>
                  <input
                    type="checkbox"
                    checked={announceStageName}
                    onChange={(e) => setAnnounceStageName(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Start/Stop cues</span>
                  <input
                    type="checkbox"
                    checked={announceStartStop}
                    onChange={(e) => setAnnounceStartStop(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Rest periods</span>
                  <input
                    type="checkbox"
                    checked={announceRest}
                    onChange={(e) => setAnnounceRest(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Countdown (3-2-1)</span>
                  <input
                    type="checkbox"
                    checked={announceCountdown}
                    onChange={(e) => setAnnounceCountdown(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                </label>
              </div>
            </div>

            {/* Pre-stage Warning */}
            <div className="border-t border-gray-100 pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-stage Warning
              </label>
              <select
                value={preStageWarningSeconds}
                onChange={(e) => setPreStageWarningSeconds(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value={0}>Off</option>
                <option value={3}>3 seconds before</option>
                <option value={5}>5 seconds before</option>
                <option value={10}>10 seconds before</option>
              </select>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
