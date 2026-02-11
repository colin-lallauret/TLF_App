import { ReviewCard } from '@/components/ReviewCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useRestaurantDetails } from '@/hooks/useRestaurantDetails';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RestaurantDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { restaurant, loading, error } = useRestaurantDetails(id as string);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (error || !restaurant) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Impossible de charger le restaurant.</Text>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Retour</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{
                title: restaurant.name || 'Restaurant',
                headerTintColor: Colors.light.primary,
                headerBackTitle: 'Retour'
            }} />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Header Image */}
                <Image
                    source={{ uri: restaurant.image_url }}
                    style={styles.headerImage}
                    contentFit="cover"
                />

                <View style={styles.content}>
                    {/* Header Info */}
                    <View style={styles.headerInfo}>
                        <View style={styles.titleRow}>
                            <Text style={styles.name}>{restaurant.name}</Text>
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{restaurant.average_rating}</Text>
                                <IconSymbol name="star.fill" size={12} color="#FFFFFF" />
                            </View>
                        </View>

                        <Text style={styles.subtitle}>
                            {restaurant.food_types?.[0] || 'Cuisine variée'} • {Array(restaurant.budget_level || 1).fill('€').join('')} • {restaurant.city}
                        </Text>

                        <View style={styles.divider} />

                        {/* Location */}
                        <View style={styles.section}>
                            <View style={styles.row}>
                                <IconSymbol name="location.fill" size={20} color={Colors.light.primary} />
                                <Text style={styles.address}>
                                    {restaurant.address}, {restaurant.postal_code} {restaurant.city}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View style={styles.reviewsSection}>
                        <Text style={styles.sectionTitle}>
                            Avis des locaux ({restaurant.review_count})
                        </Text>

                        {restaurant.reviews && restaurant.reviews.length > 0 ? (
                            restaurant.reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))
                        ) : (
                            <View style={styles.emptyReviews}>
                                <Text style={styles.emptyText}>Pas encore d'avis pour ce restaurant.</Text>
                            </View>
                        )}
                    </View>
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
    headerImage: {
        width: '100%',
        height: 250,
    },
    content: {
        flex: 1,
        marginTop: -30,
        backgroundColor: '#FFFDF0',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    },
    headerInfo: {
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        flex: 1,
        marginRight: 10,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E65127',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    ratingText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
    },
    section: {
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    address: {
        fontSize: 16,
        color: '#333333',
        flex: 1,
        marginBottom: 10
    },
    reviewsSection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
    },
    emptyReviews: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#999999',
        fontStyle: 'italic',
    },
});
