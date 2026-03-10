import { BackButton } from '@/components/BackButton';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const MEAL_OPTIONS = [
    { id: '1', name: 'Petit-déjeuner', icon: 'coffee-outline' },
    { id: '2', name: 'Déjeuner', icon: 'weather-sunny' },
    { id: '3', name: 'Pause sucrée', icon: 'cookie' },
    { id: '4', name: 'Dîner', icon: 'weather-night' },
];

export default function CreateTripScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [tripName, setTripName] = useState('');

    const isMember = profile?.subscription_end_date
        ? new Date(profile.subscription_end_date) > new Date()
        : false;

    const handleSubscribe = () => {
        router.push('/(tabs)/profile');
    };

    const toggleMeal = (id: string) => {
        setSelectedMeals(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        if (selectedMeals.length === 0) {
            // Optional: alert user to select at least one
            return;
        }

        // Sort selected meals by ID to ensure correct chronological order (1 -> 4)
        const sortedMeals = [...selectedMeals].sort();
        const firstStepId = sortedMeals[0];

        // Navigate to the search page for the first step
        // We pass the full list of selected meals so subsequent steps know what to do
        router.push({
            pathname: '/create-trip/search',
            params: {
                currentStep: firstStepId,
                tripPlan: JSON.stringify(sortedMeals),
                tripName: tripName.trim() || `Parcours n°${Math.floor(Math.random() * 1000)}` // Default name if empty
            }
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={['#E3E0CF', '#FFFCF5']}
                style={styles.header}
            >
                <BackButton />
                <Text style={styles.headerTitle}>Composez votre parcours</Text>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.instruction}>
                    Sélectionnez les étapes de votre parcours culinaire :
                </Text>

                {/* Trip Name Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nom du parcours (optionnel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Soirée romantique, Matinée détente..."
                        value={tripName}
                        onChangeText={setTripName}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.optionsContainer}>
                    {MEAL_OPTIONS.map((meal) => {
                        const isSelected = selectedMeals.includes(meal.id);
                        return (
                            <TouchableOpacity
                                key={meal.id}
                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                onPress={() => toggleMeal(meal.id)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name={meal.icon as any}
                                    size={32}
                                    color={isSelected ? '#FFF' : '#CCC'}
                                />
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {meal.name}
                                </Text>
                                {isSelected && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.nextButton, selectedMeals.length === 0 && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={selectedMeals.length === 0}
                >
                    <Text style={styles.nextButtonText}>Suivant</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Overlay pour non-membres */}
            {!isMember && (
                <View style={styles.overlay}>
                    <View style={styles.alertBox}>
                        <Text style={styles.alertTitle}>Créer un parcours</Text>
                        <Text style={styles.alertMessage}>
                            La création de parcours est réservée aux membres.
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
        backgroundColor: '#FFFCF5',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 2000,
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
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 16,
        fontFamily: Fonts.regular,
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
        fontFamily: Fonts.bold,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    headerTitle: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    instruction: {
        fontSize: 18,
        fontFamily: Fonts.medium,
        color: '#1A1A1A',
        marginBottom: 24,
    },
    optionsContainer: {
        gap: 16,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: '#1A1A1A',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    optionCardSelected: {
        backgroundColor: '#DC4928',
        borderColor: '#DC4928',
    },
    optionText: {
        fontSize: 18,
        fontFamily: Fonts.medium,
        color: '#666',
        flex: 1,
    },
    optionTextSelected: {
        color: '#FFF',
    },
    checkIcon: {
        marginLeft: 'auto',
    },
    nextButton: {
        backgroundColor: '#DC4928',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 'auto',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    nextButtonDisabled: {
        backgroundColor: '#CCC',
        elevation: 0,
        shadowOpacity: 0,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: Fonts.bold,
    },
});
