import React, { useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ContributorCard } from '@/components/ContributorCard';
import { useFocusEffect } from 'expo-router';

export default function FavorisScreen() {
    const { favoriteRestaurants, favoriteContributors, loading, refreshFavorites } = useFavorites();
    const { toggleRestaurantFavorite, toggleContributorFavorite } = useFavoriteIds();

    // Rafraîchir les données quand l'écran devient actif
    useFocusEffect(
        useCallback(() => {
            refreshFavorites();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refreshFavorites} tintColor={Colors.light.primary} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Mes Favoris ❤️</Text>
                <Text style={styles.subtitle}>Retrouvez vos coups de cœur</Text>
            </View>

            <View style={styles.content}>
                {/* Section Contributeurs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contributeurs ({favoriteContributors.length})</Text>
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
                            <Text style={styles.emptyText}>Aucun contributeur suivi.</Text>
                        </View>
                    )}
                </View>

                {/* Section Restaurants */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Restaurants ({favoriteRestaurants.length})</Text>
                    {favoriteRestaurants.length > 0 ? (
                        <View style={styles.cardsContainer}>
                            {favoriteRestaurants.map((restaurant) => (
                                <View key={restaurant.id} style={styles.cardWrapper}>
                                    <RestaurantCard
                                        restaurant={restaurant}
                                        isFavorite={true}
                                        onToggleFavorite={toggleRestaurantFavorite}
                                    />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun restaurant favori pour le moment.</Text>
                            <Text style={styles.emptySubText}>Explorez pour en ajouter !</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.beige,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.beige,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: Colors.light.primary,
    },
    title: {
        fontSize: 28,
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
        paddingBottom: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    cardsContainer: {
        paddingHorizontal: 20,
        gap: 16,
        alignItems: 'center', // Centre les cartes si elles ont une largeur fixe
    },
    cardWrapper: {
        marginBottom: 12,
    },
    horizontalScroll: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    emptySubText: {
        color: Colors.light.icon,
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
});
