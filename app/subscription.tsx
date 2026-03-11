import { BackButton } from '@/components/BackButton';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Plans d'abonnement ────────────────────────────────────────────────────────
const PLANS = [
    {
        id: 'daily',
        label: 'Journalier',
        price: '1,99 €',
        duration: 1,   // jours
        unit: 'jour',
        description: 'Parfait pour essayer',
        badge: null,
    },
    {
        id: 'weekend',
        label: 'Week-end',
        price: '3,50 €',
        duration: 2,
        unit: '2 jours',
        description: "Idéal pour vos escapades",
        badge: null,
    },
    {
        id: 'weekly',
        label: 'Semaine',
        price: '6,99 €',
        duration: 7,
        unit: 'semaine',
        description: 'La formule voyage',
        badge: 'Populaire',
    },
    {
        id: 'monthly',
        label: 'Mensuel',
        price: '14,99 €',
        duration: 30,
        unit: 'mois',
        description: 'Meilleur rapport qualité/prix',
        badge: 'Meilleur deal',
    },
] as const;

export default function SubscriptionScreen() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

    const handlePay = async (plan: typeof PLANS[number]) => {
        if (!user) return;
        setLoadingPlanId(plan.id);

        try {
            // Calculer la nouvelle date de fin d'abonnement
            const now = new Date();
            now.setDate(now.getDate() + plan.duration);
            const newEndDate = now.toISOString();

            // Mise à jour sans passer par les types stricts (subscription_end_date)
            const profilesTable = supabase.from('profiles') as any;
            const { error } = await profilesTable
                .update({ subscription_end_date: newEndDate })
                .eq('id', user.id);

            if (error) throw error;

            // Recharger le profil en mémoire pour retirer l'overlay immédiatement
            await refreshProfile();

            Alert.alert(
                '🎉 Bienvenue dans TLF+ !',
                `Votre abonnement ${plan.label} est actif jusqu'au ${now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
                [{ text: 'Commencer', onPress: () => router.back() }]
            );
        } catch (err) {
            console.error(err);
            Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoadingPlanId(null);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header gradient */}
            <LinearGradient colors={['#E3E0CF', '#FFFCF5']} style={styles.header}>
                <BackButton style={styles.backBtn} />
                <View style={styles.headerTextBlock}>
                    <Text style={styles.headerTitle}>Devenez membre</Text>
                    <Text style={styles.headerSubtitle}>TLF+</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Description */}
                <View style={styles.descriptionBlock}>
                    <Text style={styles.descriptionTitle}>Accès illimité à toutes les fonctionnalités</Text>
                    <View style={styles.featuresList}>
                        {[
                            'Messagerie privée avec les contributeurs',
                            'Accès aux parcours exclusifs',
                            'Recommandations personnalisées',
                            'Sans publicité',
                        ].map((feat) => (
                            <View key={feat} style={styles.featureRow}>
                                <Ionicons name="checkmark-circle" size={18} color={Colors.light.secondary} />
                                <Text style={styles.featureText}>{feat}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Plans */}
                <View style={styles.plansContainer}>
                    {PLANS.map((plan) => {
                        const isLoading = loadingPlanId === plan.id;
                        return (
                            <View key={plan.id} style={styles.planCard}>
                                {/* Badge */}
                                {plan.badge && (
                                    <View style={styles.planBadge}>
                                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                                    </View>
                                )}

                                <View style={styles.planInfo}>
                                    <View>
                                        <Text style={styles.planLabel}>{plan.label}</Text>
                                        <Text style={styles.planDescription}>{plan.description}</Text>
                                        <Text style={styles.planUnit}>Valable {plan.unit}</Text>
                                    </View>
                                    <View style={styles.planRight}>
                                        <Text style={styles.planPrice}>{plan.price}</Text>
                                        <TouchableOpacity
                                            style={[styles.payButton, isLoading && styles.payButtonLoading]}
                                            onPress={() => handlePay(plan)}
                                            disabled={loadingPlanId !== null}
                                            activeOpacity={0.8}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.payButtonText}>Payer</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <Text style={styles.legalText}>
                    Paiement simulé — aucune transaction réelle n'est effectuée.{'\n'}
                    L'abonnement est activé instantanément pour la durée choisie.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF6',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 54 : 40,
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {},
    headerTextBlock: {
        flex: 1,
    },
    headerTitle: {
        fontFamily: Fonts.semiBold,
        fontSize: 14,
        color: '#6B6B6B',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontFamily: Fonts.bold,
        fontSize: 28,
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    scroll: {
        padding: 20,
        paddingBottom: 40,
    },
    descriptionBlock: {
        backgroundColor: '#F0F9F4',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#C8ECD8',
    },
    descriptionTitle: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: '#1A1A1A',
        marginBottom: 14,
    },
    featuresList: {
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#444',
        flex: 1,
    },
    plansContainer: {
        gap: 14,
        marginBottom: 24,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E8E3D0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
        overflow: 'visible',
    },
    planBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        zIndex: 1,
    },
    planBadgeText: {
        fontFamily: Fonts.bold,
        fontSize: 11,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    planInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    planLabel: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: '#1A1A1A',
        marginBottom: 2,
    },
    planDescription: {
        fontFamily: Fonts.regular,
        fontSize: 13,
        color: '#9A9A8A',
        marginBottom: 2,
    },
    planUnit: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: '#6B6B6B',
    },
    planRight: {
        alignItems: 'flex-end',
        gap: 10,
    },
    planPrice: {
        fontFamily: Fonts.bold,
        fontSize: 22,
        color: '#1A1A1A',
    },
    payButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 30,
        minWidth: 80,
        alignItems: 'center',
    },
    payButtonLoading: {
        opacity: 0.7,
    },
    payButtonText: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: '#FFFFFF',
    },
    legalText: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: '#BBB',
        textAlign: 'center',
        lineHeight: 16,
    },
});
