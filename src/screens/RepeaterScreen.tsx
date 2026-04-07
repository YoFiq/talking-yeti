import { View, StyleSheet } from 'react-native'
import { YetiCharacter } from '@/components'

export const RepeaterScreen = () => {
    return (
        <View style={styles.container}>
            <YetiCharacter />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D6E2EA',
    },
})
