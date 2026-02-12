import { RestaurantCard } from '@/components/RestaurantCard';
import { Fonts } from '@/constants/theme';
import { useContributorProfile } from '@/hooks/useContributorProfile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useConversations } from '@/hooks/useConversations';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';

export default function ContributorProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { profile, loading, error } = useContributorProfile(id as string);
    const { favoriteRestaurantIds, toggleRestaurantFavorite } = useFavoriteIds();
    const { startConversation } = useConversations();
    const [contacting, setContacting] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const handleContact = async () => {
        if (!profile) return;
        setContacting(true);
        try {
            const convId = await startConversation(profile.id);
            if (convId) {
                router.push({
                    pathname: `/conversation/${convId}`,
                    params: { name: profile.full_name || profile.username || 'Conversation' } as any
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setContacting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E54628" />
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

    const formatName = (fullName: string | null) => {
        if (!fullName) return 'Utilisateur';
        const parts = fullName.trim().split(' ');
        if (parts.length > 1) {
            const last = parts.pop()?.toUpperCase() || '';
            const first = parts.join(' ');
            return `${first} ${last}`;
        }
        return fullName;
    };

    const formatMemberSince = (dateString: string) => {
        const date = new Date(dateString);
        return date.getFullYear().toString();
    };

    return (
        <>
            <Stack.Screen options={{
                headerShown: false
            }} />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Header with back and favorite buttons */}
                <View style={styles.topButtons}>
                    <TouchableOpacity style={styles.backButtonCircle} onPress={() => router.back()}>
                        <Ionicons name="arrow-undo-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => setIsFavorite(!isFavorite)}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={28}
                            color={isFavorite ? "#E54628" : "#999"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Profile Header */}
                <View style={styles.header}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {profile.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{getInitials(profile.full_name)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Name */}
                    <Text style={styles.name}>{formatName(profile.full_name)}</Text>

                    {/* Bio */}
                    {profile.bio && (
                        <Text style={styles.bio}>{profile.bio}</Text>
                    )}

                    {/* Location */}
                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={18} color="#1A1A1A" />
                        <Text style={styles.city}>{profile.city || 'Toulon'}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.stats.reviews_count || 122}</Text>
                            <Text style={styles.statLabel}>Adresses</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.stats.followers_count || 67}</Text>
                            <Text style={styles.statLabel}>Likes</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{formatMemberSince(profile.created_at)}</Text>
                            <Text style={styles.statLabel}>Membre depuis</Text>
                        </View>
                    </View>

                    {/* Contact Button */}
                    <TouchableOpacity
                        style={[styles.contactButton, contacting && styles.contactButtonDisabled]}
                        onPress={handleContact}
                        disabled={contacting}
                    >
                        {contacting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.contactButtonText}>Envoyer un message</Text>
                                <Ionicons name="arrow-forward-circle" size={20} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Section Top Adresses */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Mes tops adresses ({profile.top_restaurants?.length || 0})
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
                    </View>
                    {profile.top_restaurants && profile.top_restaurants.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
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

                {/* Carte Interactive Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Carte interactive</Text>
                        <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
                    </View>
                    {/* Map would go here */}
                    <View style={styles.mapPlaceholder}>
                        <Text style={styles.mapPlaceholderText}>Carte interactive</Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF6', // Cream background
    },
    contentContainer: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF6',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF6',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 20,
        fontFamily: Fonts.regular,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#E54628',
        borderRadius: 20,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontFamily: Fonts.bold,
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 40,
        fontFamily: Fonts.bold,
        color: '#666',
    },
    name: {
        fontSize: 22,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    bio: {
        fontSize: 13,
        fontFamily: Fonts.regular,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 20,
    },
    city: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#1A1A1A',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#666',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D7A3E', // Green
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
        width: '90%',
    },
    contactButtonDisabled: {
        backgroundColor: '#A0C4A8',
    },
    contactButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Fonts.bold,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    scrollContent: {
        gap: 16,
    },
    emptyContainer: {
        padding: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#999999',
        fontFamily: Fonts.regular,
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapPlaceholderText: {
        color: '#999',
        fontFamily: Fonts.regular,
    },
});
