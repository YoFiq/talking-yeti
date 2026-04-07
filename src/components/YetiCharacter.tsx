import { StyleSheet, View } from 'react-native'
import { RiveView, useRiveFile, Fit, Alignment, useRive } from '@rive-app/react-native'
import { STATE_MACHINE_KEY } from '@/constants'
import { RepeaterState } from '@/types/repeater'
import { useEffect } from 'react'

interface BearCharacterProps {
    state: RepeaterState
}
export const YetiCharacter = ({ state }: BearCharacterProps) => {
    const { riveViewRef, setHybridRef } = useRive()

    const { riveFile } = useRiveFile(
        require('@/assets/rive-template/5628-11215-wave-hear-and-talk.riv'),
    )

    useEffect(() => {
        const rive = riveViewRef
        if (!rive) return

        switch (state) {
            case 'listening':
                rive.setBooleanInputValue('Hear', true)
                break
            case 'processing':
                rive.setBooleanInputValue('Hear', false)
                break
            case 'talking':
                rive.setBooleanInputValue('Talk', true)
                break
            case 'idle':
            case 'error':
                rive.setBooleanInputValue('Hear', false)
                rive.setBooleanInputValue('Talk', false)
                break
        }
    }, [state, riveViewRef])

    return (
        <View style={styles.container}>
            {riveFile ? (
                <RiveView
                    hybridRef={setHybridRef}
                    file={riveFile}
                    stateMachineName={STATE_MACHINE_KEY}
                    fit={Fit.Contain}
                    alignment={Alignment.Center}
                    style={styles.rive}
                    onError={(e) => console.warn('[Rive]', e)}
                />
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rive: {
        width: '100%',
        height: 400,
    },
})
