import { Colors } from '@/constants/theme';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RestaurantCard } from './RestaurantCard';
import { useFocusEffect } from 'expo-router';

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
            <Text style={styles.sectionTitle}>Adresses Populaires 🍽️</Text>
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    scrollView: {
        paddingLeft: 20,
    },
    scrollContent: {
        paddingRight: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    errorText: {
        color: 'red',
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
    },
});
