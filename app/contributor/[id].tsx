import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantMap } from '@/components/RestaurantMap';
import { TabBar } from '@/components/TabBar';
import { Fonts } from '@/constants/theme';
import { useContributorProfile } from '@/hooks/useContributorProfile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useConversations } from '@/hooks/useConversations';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';

export default function ContributorProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { profile, loading, error } = useContributorProfile(id as string);
    const { favoriteRestaurantIds, favoriteContributorIds, toggleRestaurantFavorite, toggleContributorFavorite } = useFavoriteIds();
    const { startConversation } = useConversations();
    const [contacting, setContacting] = useState(false);

    // Dérivé de l'état global
    const isFavorite = profile ? favoriteContributorIds.includes(profile.id) : false;

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
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Stack.Screen options={{
                    headerShown: false,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                    animation: 'slide_from_right',
                    fullScreenGestureEnabled: false,
                }} />

                {/* Header with gradient and favorite button (back button moved outside) */}
                <LinearGradient
                    colors={['#E3E0CF', '#FFFCF5']}
                    style={styles.topButtons}
                >
                    <View style={{ width: 40 }} />
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => profile && toggleContributorFavorite(profile.id)}
                    >
                        <Image
                            source={isFavorite ? require('@/assets/icons/like_full_orange.png') : require('@/assets/icons/like_empty_black.png')}
                            style={{ width: 28, height: 28 }}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                </LinearGradient>

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
                                <Image
                                    source={require('@/assets/icons/send_message.png')}
                                    style={{ width: 20, height: 20 }}
                                    contentFit="contain"
                                />
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
                    {profile.top_restaurants && profile.top_restaurants.length > 0 ? (
                        <View style={styles.mapContainer}>
                            <RestaurantMap restaurants={profile.top_restaurants} />
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Pas de carte disponible.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed back button */}
            <TouchableOpacity style={styles.fixedBackButton} onPress={() => router.back()}>
                <Ionicons name="arrow-undo-outline" size={24} color="#FFF" />
            </TouchableOpacity>

            <TabBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF6',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
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
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fixedBackButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
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
        backgroundColor: '#2D7A3E',
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
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between', // Align left
        gap: 4, // Added gap to match home page
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    scrollContent: {
        paddingLeft: 20,
        paddingVertical: 20,
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
    mapContainer: {
        height: 500,
        borderRadius: 16,
        overflow: 'hidden',
    },
    mapPlaceholderText: {
        color: '#999',
        fontFamily: Fonts.regular,
    },
});
