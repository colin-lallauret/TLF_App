import { Colors, Fonts } from '@/constants/theme';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RestaurantCard } from './RestaurantCard';

export function FeaturedRestaurants() {
    const { restaurants, loading, error } = useRestaurants(100);
    const { favoriteRestaurantIds, toggleRestaurantFavorite } = useFavoriteIds();

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Adresses Populaires 🍽️</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Adresses Populaires 🍽️</Text>
                <Text style={styles.errorText}>Impossible de charger les restaurants</Text>
            </View>
        );
    }

    if (restaurants.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Adresses Populaires 🍽️</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Aucun restaurant pour le moment.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Les meilleures adresses</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {restaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        isFavorite={favoriteRestaurantIds.includes(restaurant.id)}
                        onToggleFavorite={toggleRestaurantFavorite}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
    },
    scrollView: {
        paddingLeft: 20,
    },
    scrollContent: {
        paddingRight: 20,
        gap: 16, // Add gap between cards
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    errorText: {
        color: Colors.light.error,
        fontFamily: Fonts.medium,
        textAlign: 'center',
        padding: 20,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginHorizontal: 20,
    },
    emptyText: {
        color: Colors.light.icon,
        fontFamily: Fonts.medium,
    },
});
