# Talking Yeti

A "repeat after me" mobile app for Android and iOS, inspired by Talking Tom. The Yeti character listens to your voice, then plays it back at a higher pitch while animating in sync.

Also, you can find example videos in `examples/` folder

## How it works

1. The app detects your voice automatically — no buttons needed
2. Once silence is detected, recording stops
3. The recorded audio plays back at 1.5x speed (chipmunk effect)
4. The Yeti character animates in sync with each audio state

## Tech stack

- **Expo** (managed workflow + `expo-dev-client` for native modules)
- **expo-audio** — recording and playback
- **@rive-app/react-native** — character animation
- **expo-router** — file-based navigation
- **TypeScript**

## Why expo-audio

`expo-audio` is the modern replacement for `expo-av`. It was chosen for three specific reasons:

**1. Built-in metering**
The recorder exposes a `metering` value (dBFS) on every status poll when `isMeteringEnabled: true` is set. This is used to implement voice activity detection (VAD) without any external library — the app polls the microphone level every 50ms and uses two thresholds with a hysteresis band to detect speech onset and trailing silence reliably.

**2. Pitch effect via playback rate**
`AudioPlayer.setPlaybackRate(1.5)` combined with `shouldCorrectPitch = false` plays the audio 1.5x faster without time-stretching, which proportionally raises the pitch. This is the same technique Talking Tom uses and requires no DSP library or backend.

**3. Clean hook-based API**
`useAudioRecorder` and `useAudioPlayer` manage native resource lifecycle automatically (prepare, record, stop, dispose). This keeps the audio logic self-contained in hooks without manual cleanup boilerplate.

## Why @rive-app/react-native

`@rive-app/react-native` (v0.4.x, Nitro-based) was chosen over other animation options — Lottie, Reanimated, or plain image sequences — for the following reasons:

**1. State Machine**
The `.riv` file ships with a State Machine that owns all animation transitions internally. The app only fires boolean inputs (`Hear`, `Talk`) — the Rive runtime handles blending, easing, and transition timing. This eliminates the need to coordinate animation frame timing from JavaScript.

**2. Single source of truth for animation**
The designer controls all animation states in the Rive editor. The code only maps app states (`idle`, `listening`, `processing`, `talking`) to State Machine inputs. If the animation needs to change, the `.riv` file is updated without touching application code.

**3. Performance**
Rive renders on the native thread via a C++ runtime. Animations run at full frame rate independent of the JS thread, so audio processing (metering polls, recording lifecycle) does not affect animation smoothness.

**4. Nitro bridge (v0.4.x)**
The v0.4.x release uses `react-native-nitro-modules` instead of the old JSI bridge. State Machine inputs (`triggerInput`, `setBooleanInputValue`) are synchronous native calls with no serialization overhead, which is important for keeping animation state in sync with audio events that happen on tight intervals.

## Architecture

```
src/
  services/
    audioConfig.ts          # VAD thresholds, recording options, pitch settings
  hooks/
    useAudioPermission.ts   # Microphone permission + audio session setup
    useVoiceDetector.ts     # VAD + recorder lifecycle (core audio logic)
    useYetiPlayer.ts        # Playback with pitch effect
    useYetiStateMachine.ts  # Rive State Machine bridge
  components/
    YetiCharacter.tsx       # Rive view, maps state to SM inputs
  screens/
    RepeaterScreen.tsx      # Orchestrator: owns AppState, wires all hooks
```

Audio flow:

```
Microphone
  → AudioRecorder (metering every 50ms)
  → VAD: voice > -35dBFS → start LISTENING
  → silence < -45dBFS for 800ms → PROCESSING → stop()
  → recorder.uri → AudioPlayer
  → setPlaybackRate(1.5) + shouldCorrectPitch=false
  → play() → TALKING → didJustFinish → IDLE
```
