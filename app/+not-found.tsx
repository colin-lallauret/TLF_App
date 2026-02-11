import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function NotFoundScreen() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        // Si l'utilisateur est connecté, rediriger automatiquement vers l'accueil
        if (user) {
            const timer = setTimeout(() => {
                router.replace('/(tabs)/explorer');
            }, 2000); // Redirection après 2 secondes

            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleGoHome = () => {
        if (user) {
            router.replace('/(tabs)/explorer');
        } else {
            router.replace('/auth');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.emoji}>🗺️</Text>
                <Text style={styles.title}>Page introuvable</Text>
                <Text style={styles.message}>
                    {user
                        ? 'Cette page n\'existe pas. Redirection vers l\'accueil...'
                        : 'Cette page n\'existe pas.'
                    }
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleGoHome}>
                    <Text style={styles.buttonText}>
                        {user ? 'Retour à l\'accueil' : 'Se connecter'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.beige,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: Colors.light.icon,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    button: {
        backgroundColor: Colors.light.primary,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 40,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
