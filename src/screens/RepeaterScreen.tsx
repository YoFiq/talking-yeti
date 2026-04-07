import { useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRepeaterMachine, useVoiceDetection, useRepeaterAudioPlayer } from '@/hooks'
import { YetiCharacter } from '@/components'
import { ErrorScreen } from '@/screens/ErrorScreen'

export function RepeaterScreen() {
    const recordingUriRef = useRef<string | null>(null)
    const speechOffsetMsRef = useRef<number>(0)
    const machine = useRepeaterMachine()

    useVoiceDetection({
        machineState: machine.state,
        onVoiceDetected: machine.onVoiceDetected,
        onSilenceDetected: machine.onSilenceDetected,
        onRecordingReady: (uri, speechOffsetMs) => {
            console.log('[Screen] recording ready, uri:', uri, 'offset:', speechOffsetMs, 'ms')
            recordingUriRef.current = uri
            speechOffsetMsRef.current = speechOffsetMs
            machine.onPlaybackStarted()
        },
        onError: machine.onError,
    })

    useRepeaterAudioPlayer({
        uri: machine.is.talking ? (recordingUriRef.current ?? undefined) : undefined,
        speechOffsetMs: speechOffsetMsRef.current,
        onPlaybackStarted: () => {},
        onPlaybackFinished: machine.onPlaybackFinished,
        onError: machine.onError,
    })

    return (
        <View style={styles.container}>
            <YetiCharacter state={machine.state} />
            {machine.is.error && (
                <ErrorScreen
                    message={machine.errorMessage ?? 'Unknown error'}
                    onRetry={machine.onReset}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D6E2EA',
    },
})
