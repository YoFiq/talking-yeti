import {
    getRecordingPermissionsAsync,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
} from 'expo-audio'

type PermissionStatus = 'granted' | 'denied' | 'undetermined'

interface PermissionResult {
    status: PermissionStatus
    canAskAgain: boolean
}

export const requestMicrophonePermission = async (): Promise<PermissionResult> => {
    const { status: currentStatus, canAskAgain } = await getRecordingPermissionsAsync()

    if (currentStatus === 'granted') {
        return { status: 'granted', canAskAgain: false }
    }

    if (!canAskAgain) {
        return { status: 'denied', canAskAgain: false }
    }

    const { status: newStatus, canAskAgain: canAskAgainAfter } =
        await requestRecordingPermissionsAsync()

    return {
        status: newStatus as PermissionStatus,
        canAskAgain: canAskAgainAfter,
    }
}

export const setRecordingAudioMode = async (): Promise<void> => {
    await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
    })
}

export const setPlaybackAudioMode = async (): Promise<void> => {
    await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
    })
}
