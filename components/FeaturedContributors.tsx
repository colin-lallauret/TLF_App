import { useContributors } from '@/hooks/useContributors';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ContributorCard } from './ContributorCard';

/**
 * Composant section "Locaux à la Une"
 * Affiche une liste horizontale scrollable des contributeurs locaux
 */
export function FeaturedContributors() {
    const { contributors, loading, error } = useContributors(100);
    const { favoriteContributorIds, toggleContributorFavorite } = useFavoriteIds();

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Locaux à la Une 🌟</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E65127" />
                    <Text style={styles.loadingText}>Chargement des contributeurs...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Locaux à la Une 🌟</Text>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>
                        Impossible de charger les contributeurs
                    </Text>
                    <Text style={styles.errorSubtext}>
                        {error.message}
                    </Text>
                </View>
            </View>
        );
    }

    if (contributors.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Locaux à la Une 🌟</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyText}>
                        Aucun contributeur pour le moment
                    </Text>
                    <Text style={styles.emptySubtext}>
                        Revenez plus tard pour découvrir nos locaux !
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Locaux à la Une 🌟</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {contributors.map((contributor) => (
                    <ContributorCard
                        key={contributor.id}
                        contributor={contributor}
                        isFavorite={favoriteContributorIds.includes(contributor.id)}
                        onToggleFavorite={toggleContributorFavorite}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E65127', // Orange
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    scrollView: {
        paddingLeft: 16,
    },
    scrollContent: {
        paddingRight: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#666666',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        gap: 8,
    },
    errorIcon: {
        fontSize: 48,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        gap: 8,
    },
    emptyIcon: {
        fontSize: 48,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
});
