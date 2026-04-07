import { useEffect, useRef, useCallback } from 'react'
import { useAudioRecorder, useAudioRecorderState, RecordingPresets } from 'expo-audio'
import {
    requestMicrophonePermission,
    setRecordingAudioMode,
    setPlaybackAudioMode,
} from '@/services/audioPermissions'
import {
    VAD_THRESHOLD_DB,
    VAD_POLL_INTERVAL_MS,
    SILENCE_TIMEOUT_MS,
    MIN_RECORDING_DURATION_MS,
} from '@/constants/audio'
import { RepeaterState } from '@/types/repeater'

interface VoiceDetectionOptions {
    machineState: RepeaterState
    onVoiceDetected: () => void
    onSilenceDetected: () => void
    onRecordingReady: (uri: string, speechOffsetMs: number) => void
    onError: (message: string) => void
}

const RECORDING_OPTIONS = {
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
}

export function useVoiceDetection({
    machineState,
    onVoiceDetected,
    onSilenceDetected,
    onRecordingReady,
    onError,
}: VoiceDetectionOptions) {
    const recorder = useAudioRecorder(RECORDING_OPTIONS)
    const recorderState = useAudioRecorderState(recorder, VAD_POLL_INTERVAL_MS)

    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const recordingStartTimeRef = useRef<number>(0)
    const voiceDetectedAtRef = useRef<number>(0)
    const isStoppingRef = useRef(false)

    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
        }
    }, [])

    const stopRecording = useCallback(async () => {
        if (isStoppingRef.current) return
        isStoppingRef.current = true

        clearSilenceTimer()

        try {
            await Promise.all([recorder.stop(), setPlaybackAudioMode()])

            const uri = recorder.uri
            console.log('[VAD] stopped. recorder.uri:', uri)

            if (uri) {
                const speechOffsetMs = voiceDetectedAtRef.current - recordingStartTimeRef.current
                onRecordingReady(uri, Math.max(0, speechOffsetMs))
            } else {
                onError('Recording produced no file')
            }
        } catch (e) {
            onError(`Stop recording failed: ${e}`)
        } finally {
            isStoppingRef.current = false
        }
    }, [recorder, clearSilenceTimer, onRecordingReady, onError])

    // Cjeck when we are in idle state
    useEffect(() => {
        if (machineState !== 'idle') return

        let cancelled = false

        async function startMonitoring() {
            const permission = await requestMicrophonePermission()

            if (permission.status !== 'granted') {
                onError(
                    permission.canAskAgain
                        ? 'Microphone permission denied'
                        : 'Please enable microphone in Settings',
                )
                return
            }

            if (cancelled) return

            try {
                await setRecordingAudioMode()
                await recorder.prepareToRecordAsync()

                if (cancelled) return

                recorder.record()
                recordingStartTimeRef.current = Date.now()
                voiceDetectedAtRef.current = 0
                isStoppingRef.current = false
            } catch (e) {
                onError(`Failed to start monitoring: ${e}`)
            }
        }

        startMonitoring()

        return () => {
            cancelled = true
        }
    }, [machineState]) // eslint-disable-line react-hooks/exhaustive-deps

    // voice detection
    useEffect(() => {
        const { metering, isRecording } = recorderState

        if (!isRecording || metering === undefined || metering === null) return

        const isSpeaking = metering > VAD_THRESHOLD_DB

        if (machineState === 'idle') {
            if (isSpeaking) {
                voiceDetectedAtRef.current = Date.now() // first sound time
                onVoiceDetected()
            }
            return
        }

        if (machineState === 'listening') {
            if (isSpeaking) {
                clearSilenceTimer()
            } else {
                if (!silenceTimerRef.current) {
                    silenceTimerRef.current = setTimeout(() => {
                        // checking first speech duration from first sound
                        const speechDuration =
                            Date.now() - voiceDetectedAtRef.current - SILENCE_TIMEOUT_MS
                        if (speechDuration < MIN_RECORDING_DURATION_MS) {
                            silenceTimerRef.current = null
                            return
                        }
                        onSilenceDetected()
                    }, SILENCE_TIMEOUT_MS)
                }
            }
        }
    }, [recorderState, machineState]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (machineState !== 'processing') return
        stopRecording()
    }, [machineState]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => {
            clearSilenceTimer()
            try {
                if (recorder.isRecording) {
                    recorder.stop().catch(() => {})
                }
            } catch {
                // recorder may already be released on unmount
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
