# Assets

## Audio Files

Audio files are generated programmatically as WAV files in `public/audio/`:

- `stage-start.wav` - Bell sound for stage start
- `stage-end.wav` - Chime sound for stage end
- `rest-start.wav` - Lower bell for rest period start
- `rest-end.wav` - Chime for rest period end
- `session-complete.wav` - Celebration arpeggio
- `beep.wav` - Short beep for countdown

To regenerate: `node /tmp/generate-audio.js`

## PWA Icons

SVG icons are used for the PWA manifest:

- `favicon.svg` - Browser tab icon
- `pwa-192x192.svg` - 192x192 PWA icon
- `pwa-512x512.svg` - 512x512 PWA icon
