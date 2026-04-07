export type RepeaterState = 'idle' | 'listening' | 'processing' | 'talking' | 'error'

export type RepeaterEvent =
    | { type: 'VOICE_DETECTED' }
    | { type: 'SILENCE_DETECTED' }
    | { type: 'PLAYBACK_STARTED' }
    | { type: 'PLAYBACK_FINISHED' }
    | { type: 'ERROR'; message: string }
    | { type: 'RESET' }

export interface RepeaterMachineState {
    state: RepeaterState
    errorMessage: string | null
}

export type RepeaterTransitions = Partial<
    Record<RepeaterState, Partial<Record<RepeaterEvent['type'], RepeaterState>>>
>
