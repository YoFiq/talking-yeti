import { StyleSheet, View } from 'react-native'
import { RiveView, useRive, useRiveFile, Fit, Alignment } from '@rive-app/react-native'
import { STATE_MACHINE_KEY } from '@/constants'

export const YetiCharacter = () => {
    const { setHybridRef } = useRive()
    const { riveFile } = useRiveFile(
        require('@/assets/rive-template/5628-11215-wave-hear-and-talk.riv'),
    )

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
