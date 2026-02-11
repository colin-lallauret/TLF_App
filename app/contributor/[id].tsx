import { RestaurantCard } from '@/components/RestaurantCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useContributorProfile } from '@/hooks/useContributorProfile';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFavoriteIds } from '@/hooks/useFavoriteIds';

export default function ContributorProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { profile, loading, error } = useContributorProfile(id as string);
    const { favoriteRestaurantIds, toggleRestaurantFavorite } = useFavoriteIds();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Impossible de charger le profil.</Text>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Retour</Text>
                </Pressable>
            </View>
        );
    }

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
    };

    return (
        <>
            <Stack.Screen options={{ title: profile.full_name || 'Profil', headerTintColor: Colors.light.primary }} />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Header Profile */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {profile.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{getInitials(profile.full_name)}</Text>
                            </View>
                        )}
                        <View style={styles.badgeContainer}>
                            <IconSymbol name="star.fill" size={16} color="#FFFFFF" />
                        </View>
                    </View>

                    <Text style={styles.name}>{profile.full_name}</Text>
                    <View style={styles.locationContainer}>
                        <IconSymbol name="location.fill" size={14} color={Colors.light.icon} />
                        <Text style={styles.city}>{profile.city || 'Ville inconnue'}</Text>
                    </View>

                    <Text style={styles.bio}>{profile.bio || "Pas de biographie pour le moment."}</Text>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.stats.reviews_count}</Text>
                            <Text style={styles.statLabel}>Avis</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.stats.followers_count}</Text>
                            <Text style={styles.statLabel}>Likes</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <IconSymbol name="calendar" size={20} color={Colors.light.primary} />
                            <Text style={styles.statLabel}>Depuis {formatDate(profile.created_at)}</Text>
                        </View>
                    </View>
                </View>

                {/* Section Top Adresses */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ses Tops Adresses 🏆</Text>
                    {profile.top_restaurants && profile.top_restaurants.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            style={styles.horizontalScroll}
                        >
                            {profile.top_restaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    isFavorite={favoriteRestaurantIds.includes(restaurant.id)}
                                    onToggleFavorite={toggleRestaurantFavorite}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Pas encore de recommandation top !</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF0',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF0',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF0',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 20,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.light.primary,
        borderRadius: 20,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFFDF0',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFE0D6', // Light orange
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFDF0',
    },
    avatarInitials: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#E65127',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#E65127',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    city: {
        fontSize: 16,
        color: '#666666',
    },
    bio: {
        fontSize: 14,
        color: '#444444',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
        marginBottom: 24,
        fontStyle: 'italic',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E65127',
    },
    statLabel: {
        fontSize: 12,
        color: '#999999',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E0E0E0',
    },
    section: {
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    horizontalScroll: {
        paddingLeft: 20,
    },
    scrollContent: {
        paddingRight: 20,
    },
    emptyContainer: {
        marginHorizontal: 20,
        padding: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#999999',
        fontStyle: 'italic',
    },
});
