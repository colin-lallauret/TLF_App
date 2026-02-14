import { BackButton } from '@/components/BackButton';
import { ContributorCard } from '@/components/ContributorCard';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Fonts } from '@/constants/theme';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';
import { useFavorites } from '@/hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function FavorisScreen() {
    const { favoriteRestaurants, favoriteContributors, loading, refreshFavorites } = useFavorites();
    const { toggleRestaurantFavorite, toggleContributorFavorite } = useFavoriteIds();
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            refreshFavorites();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D34C26" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refreshFavorites} tintColor="#D34C26" />
                }
            >
                <LinearGradient
                    colors={['#E3E0CF', '#FFFCF5']}
                    style={styles.header}
                >
                    <Text style={styles.title}>Mes favoris</Text>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Section Contributeurs */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Locaux</Text>
                            <Ionicons name="chevron-forward" size={16} color="#141414" />
                        </View>

                        {favoriteContributors.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                {favoriteContributors.map((contributor) => (
                                    <ContributorCard
                                        key={contributor.id}
                                        contributor={contributor}
                                        isFavorite={true}
                                        onToggleFavorite={toggleContributorFavorite}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Aucun local favori</Text>
                            </View>
                        )}
                    </View>

                    {/* Section Restaurants */}
                    <View style={[styles.section, { marginBottom: 40 }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Adresses</Text>
                            <Ionicons name="chevron-forward" size={16} color="#141414" />
                        </View>

                        {favoriteRestaurants.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                {favoriteRestaurants.map((restaurant) => (
                                    <RestaurantCard
                                        key={restaurant.id}
                                        restaurant={restaurant}
                                        isFavorite={true}
                                        onToggleFavorite={toggleRestaurantFavorite}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Aucune adresse favorite</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Fixed back button */}
            <BackButton style={styles.fixedBackButton} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFCF5',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 110,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    fixedBackButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1000,
    },
    title: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    content: {
        paddingBottom: 20,
    },
    section: {
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    horizontalScroll: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
        gap: 20,
    },
    emptyContainer: {
        padding: 20,
        marginHorizontal: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        fontFamily: Fonts.medium,
    },
});
