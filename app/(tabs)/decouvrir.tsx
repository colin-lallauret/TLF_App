import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DecouvrirScreen() {
    const { profile, loading } = useAuth();
    const router = useRouter();

    const isMember = profile?.subscription_end_date
        ? new Date(profile.subscription_end_date) > new Date()
        : false;

    const handleSubscribe = () => {
        // Rediriger vers la page d'abonnement ou le profil
        router.push('/(tabs)/profile');
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} scrollEnabled={isMember}>
                <View style={styles.header}>
                    <Text style={styles.title}>Découvrir</Text>
                    <Text style={styles.subtitle}>Filtrez et trouvez votre prochaine adresse</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Budget</Text>
                    <View style={styles.filterBox}>
                        <Text style={styles.placeholderText}>
                            Slider de budget (0-60€)
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Distance</Text>
                    <View style={styles.filterBox}>
                        <Text style={styles.placeholderText}>
                            Slider de distance (0-100km)
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Catégories</Text>
                    <View style={styles.filterBox}>
                        <Text style={styles.placeholderText}>
                            Boutons de catégories avec icônes
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Type de cuisine</Text>
                    <View style={styles.filterBox}>
                        <Text style={styles.placeholderText}>
                            Filtres de type de nourriture
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Préférences alimentaires</Text>
                    <View style={styles.filterBox}>
                        <Text style={styles.placeholderText}>
                            Végétarien, Vegan, Sans gluten, etc.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Overlay pour non-membres */}
            {!loading && !isMember && (
                <View style={styles.overlay}>
                    <View style={styles.alertBox}>
                        <Text style={styles.alertTitle}>Contenu exclusif</Text>
                        <Text style={styles.alertMessage}>
                            Réservé aux membres. Devenez membre pour accéder à cette fonctionnalité.
                        </Text>
                        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                            <Text style={styles.subscribeButtonText}>Choisir mon abonnement</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.beige,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: Colors.light.secondary,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginTop: 20,
        marginBottom: 12,
    },
    filterBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.secondary,
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: Colors.light.icon,
        fontSize: 14,
        textAlign: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // Background semi-transparent
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertBox: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    subscribeButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    subscribeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
