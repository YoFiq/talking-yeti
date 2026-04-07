import { useEffect, useRef } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { PLAYBACK_RATE, SHOULD_CORRECT_PITCH } from '@/constants/audio'

interface UseAudioPlayerOptions {
    uri?: string
    speechOffsetMs: number
    onPlaybackStarted: () => void
    onPlaybackFinished: () => void
    onError: (message: string) => void
}

export const useRepeaterAudioPlayer = ({
    uri,
    speechOffsetMs,
    onPlaybackStarted,
    onPlaybackFinished,
    onError,
}: UseAudioPlayerOptions) => {
    const player = useAudioPlayer(null)
    const hasStartedRef = useRef(false)

    useEffect(() => {
        if (!uri) return

        let cancelled = false
        hasStartedRef.current = false

        const subscription = player.addListener('playbackStatusUpdate', (status) => {
            if (cancelled) return

            if (status.didJustFinish && hasStartedRef.current) {
                hasStartedRef.current = false
                onPlaybackFinished()
            }
        })

        const load = async () => {
            try {
                player.replace({ uri })
                player.shouldCorrectPitch = SHOULD_CORRECT_PITCH
                player.setPlaybackRate(PLAYBACK_RATE)

                // ignore silence while was in idle state
                if (speechOffsetMs > 0) {
                    await player.seekTo(speechOffsetMs / 1000)
                }

                if (cancelled) return

                player.play()
                hasStartedRef.current = true
                onPlaybackStarted()
            } catch (e) {
                console.error('[Player] error:', e)
                onError(`Playback failed: ${e}`)
            }
        }

        load()

        return () => {
            cancelled = true
            subscription.remove()
        }
    }, [uri]) // eslint-disable-line react-hooks/exhaustive-deps
}
