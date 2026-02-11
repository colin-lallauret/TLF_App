import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { RestaurantWithRating } from '@/hooks/useFavorites';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface RestaurantCardProps {
    restaurant: RestaurantWithRating;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
}

export function RestaurantCard({ restaurant, isFavorite: initialIsFavorite = false, onToggleFavorite }: RestaurantCardProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handlePress = () => {
        router.push(`/restaurant/${restaurant.id}` as any);
    };

    const handleFavoritePress = (e: any) => {
        e.stopPropagation(); // Empêcher la navigation vers le détail
        setIsFavorite(!isFavorite); // Optimistic UI update
        if (onToggleFavorite) {
            onToggleFavorite(restaurant.id);
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
            onPress={handlePress}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: restaurant.image_url }}
                    style={styles.image}
                    contentFit="cover"
                />

                {onToggleFavorite && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleFavoritePress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.favoriteIconBackground}>
                            <IconSymbol
                                name={isFavorite ? "heart.fill" : "heart"}
                                size={18}
                                color={isFavorite ? "#E65127" : "#666666"}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
                    <View style={styles.ratingContainer}>
                        <IconSymbol name="star.fill" size={12} color="#FFD700" />
                        <Text style={styles.rating}>{restaurant.average_rating || '-'}</Text>
                        <Text style={styles.reviewCount}>({restaurant.review_count || 0})</Text>
                    </View>
                </View>

                <View style={styles.details}>
                    <Text style={styles.cuisine} numberOfLines={1}>
                        {restaurant.food_types?.[0] || 'Cuisine variée'}
                        {' • '}
                        {Array(Math.max(1, Math.min(3, restaurant.budget_level || 1))).fill('€').join('')}
                    </Text>
                    <View style={styles.location}>
                        <IconSymbol name="location.fill" size={10} color={Colors.light.icon} />
                        <Text style={styles.city}>{restaurant.city}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 150,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    favoriteIconBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        flex: 1,
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFDF0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E65127',
    },
    rating: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E65127',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 10,
        color: '#666666',
        marginLeft: 2,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cuisine: {
        fontSize: 12,
        color: '#666666',
        flex: 1,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    city: {
        fontSize: 12,
        color: '#666666',
    },
});
