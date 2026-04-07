import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'

interface ErrorScreenProps {
    message: string
    onRetry: () => void
}

const isPermissionError = (message: string) =>
    message.toLowerCase().includes('permission') || message.toLowerCase().includes('settings')

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
    const isPermission = isPermissionError(message)

    function handleAction() {
        if (isPermission) {
            Linking.openSettings()
        } else {
            onRetry()
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{isPermission ? '🎙️' : '⚠️'}</Text>

            <Text style={styles.title}>
                {isPermission ? 'Microphone Access Required' : 'Something went wrong'}
            </Text>

            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity style={styles.button} onPress={handleAction} activeOpacity={0.8}>
                <Text style={styles.buttonText}>
                    {isPermission ? 'Open Settings' : 'Try Again'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E6F4FE',
        paddingHorizontal: 32,
        gap: 16,
    },
    icon: {
        fontSize: 64,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        marginTop: 8,
        backgroundColor: '#208AEF',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})
