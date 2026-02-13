import { Fonts } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DecouvrirScreen() {
    const router = useRouter();

    const handleSearchAddress = () => {
        router.push('/search-address');
    };

    const handleCreateRoute = () => {
        // TODO: Navigation vers la création de parcours
        console.log('Créer un parcours');
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#E3E0CF', '#FFFCF5']}
                style={styles.header}
            />

            <View style={styles.content}>
                {/* Bouton Rechercher une adresse */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSearchAddress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Rechercher une adresse précisément</Text>
                </TouchableOpacity>

                {/* Bouton Créer un parcours */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleCreateRoute}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Créer un parcours</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF5',
    },
    header: {
        height: 120,
        paddingTop: 60,
    },
    content: {
        flex: 1,
        padding: 20,
        gap: 16,
    },
    button: {
        backgroundColor: '#E54628',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFCF5',
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
});
