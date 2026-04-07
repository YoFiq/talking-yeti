import { useReducer, useCallback } from 'react'
import { RepeaterEvent, RepeaterMachineState, RepeaterTransitions } from '@/types/repeater'

const TRANSITIONS: RepeaterTransitions = {
    idle: {
        VOICE_DETECTED: 'listening',
    },
    listening: {
        SILENCE_DETECTED: 'processing',
    },
    processing: {
        PLAYBACK_STARTED: 'talking',
    },
    talking: {
        PLAYBACK_FINISHED: 'idle',
    },
    error: {
        RESET: 'idle',
    },
}

const repeaterReducer = (
    machineState: RepeaterMachineState,
    event: RepeaterEvent,
): RepeaterMachineState => {
    const { state } = machineState

    if (event.type === 'ERROR') {
        return {
            ...machineState,
            state: 'error',
            errorMessage: event.message,
        }
    }

    if (event.type === 'RESET') {
        return {
            state: 'idle',
            errorMessage: null,
        }
    }

    const nextState = TRANSITIONS[state]?.[event.type]

    if (!nextState) {
        if (__DEV__) {
            console.warn(`[RepeaterMachine] Invalid transition: ${state} + ${event.type}`)
        }
        return machineState
    }

    return {
        ...machineState,
        state: nextState,
        errorMessage: null,
    }
}

const INITIAL_STATE: RepeaterMachineState = {
    state: 'idle',
    errorMessage: null,
}

export const useRepeaterMachine = () => {
    const [machineState, dispatch] = useReducer(repeaterReducer, INITIAL_STATE)

    const send = useCallback((event: RepeaterEvent) => {
        dispatch(event)
    }, [])

    const actions = {
        onVoiceDetected: useCallback(() => send({ type: 'VOICE_DETECTED' }), [send]),
        onSilenceDetected: useCallback(() => send({ type: 'SILENCE_DETECTED' }), [send]),
        onPlaybackStarted: useCallback(() => send({ type: 'PLAYBACK_STARTED' }), [send]),
        onPlaybackFinished: useCallback(() => send({ type: 'PLAYBACK_FINISHED' }), [send]),
        onError: useCallback((message: string) => send({ type: 'ERROR', message }), [send]),
        onReset: useCallback(() => send({ type: 'RESET' }), [send]),
    }

    const is = {
        idle: machineState.state === 'idle',
        listening: machineState.state === 'listening',
        processing: machineState.state === 'processing',
        talking: machineState.state === 'talking',
        error: machineState.state === 'error',
    }

    return {
        state: machineState.state,
        errorMessage: machineState.errorMessage,
        is,
        ...actions,
    }
}
