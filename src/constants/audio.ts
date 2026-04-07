// Metering returns dB: -160 (silence), 0 (loud)
// -40 default dB
// here we can adjust sensitivity level for micro
export const VAD_THRESHOLD_DB = -40

// checking how often we need to check loud level
export const VAD_POLL_INTERVAL_MS = 50

// timeout when to end speech recording
export const SILENCE_TIMEOUT_MS = 1000

export const MIN_RECORDING_DURATION_MS = 300

// voice playback speed - 1 normal
export const PLAYBACK_RATE = 1.4

export const SHOULD_CORRECT_PITCH = false
