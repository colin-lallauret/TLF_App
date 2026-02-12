import { Fonts } from '@/constants/theme';
import { RestaurantWithRating } from '@/hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RestaurantCardProps {
    restaurant: RestaurantWithRating;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
    variant?: 'default' | 'simple';
}

export function RestaurantCard({ restaurant, isFavorite: initialIsFavorite = false, onToggleFavorite, variant = 'default' }: RestaurantCardProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handlePress = () => {
        router.push(`/restaurant/${restaurant.id}` as any);
    };

    const handleFavoritePress = (e: any) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        if (onToggleFavorite) {
            onToggleFavorite(restaurant.id);
        }
    };

    // Helpers for badges
    const getCuisineLabel = () => restaurant.food_types?.[0] || 'Varié';
    const getPriceLabel = () => {
        const level = restaurant.budget_level || 2;
        return `~${level * 10}€`; // Mock price based on level
    };
    const getDistanceLabel = () => '2 km'; // Mock distance

    const isSimple = variant === 'simple';

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                isSimple && styles.simpleCard,
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

                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoritePress}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isSimple ? "#D34C26" : "#FFF"} // Red heart on simple card per screenshot, or maybe white? Screenshot shows RED outline/fill on simple card? No, screenshot shows RED heart on FAVORITES page.
                    // Actually screenshot shows a FILLED RED heart in top right of image for the favorites cards.
                    />
                </TouchableOpacity>

                {!isSimple && (
                    <View style={styles.badgesContainer}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{getCuisineLabel()}</Text>
                            <Ionicons name="earth" size={10} color="#FFF" style={styles.badgeIcon} />
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{getPriceLabel()}</Text>
                            <Ionicons name="cash-outline" size={10} color="#FFF" style={styles.badgeIcon} />
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{getDistanceLabel()}</Text>
                            <Ionicons name="location-outline" size={10} color="#FFF" style={styles.badgeIcon} />
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={[styles.name, isSimple && styles.simpleName]} numberOfLines={2}>{restaurant.name}</Text>
                    {!isSimple && <Ionicons name="flame" size={18} color="#FF4500" />}
                </View>

                {!isSimple && (
                    <View style={styles.ratingRow}>
                        <Text style={styles.rating}>{restaurant.average_rating || '-'}</Text>
                        <View style={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= Math.round(restaurant.average_rating || 0) ? "star" : "star-outline"}
                                    size={12}
                                    color="#FF4500"
                                />
                            ))}
                        </View>
                        <Text style={styles.reviewCount}>({restaurant.review_count || 13})</Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 250,
        backgroundColor: '#FFFCF5', // Cream background to match page
        borderRadius: 16, // Less rounded than before maybe?
        marginRight: 16,
        paddingBottom: 5,
        // No shadow/elevation in screenshot for the card itself, it seems flat on the bg
    },
    simpleCard: {
        width: 160, // Smaller width for simple cards if needed, or keep 250? Screenshot shows 2 columns maybe? No, "Locaux" is horizontal list. "Adresses" is also horizontal list? Screenshot shows partial next card.
        // Let's assume uniform width for simpler cards, maybe slightly narrower than the "featured" ones. 
        // But for "simple" variant, let's stick to a width that fits the design. Screenshot shows cards around 150-160px width relative to screen.
        // Actually, let's keep it flexible or use style override if passed, but for now specific width.
        // The original code had 250. 
        // Let's make it 160 for simple variant?
        backgroundColor: 'transparent', // On favorites page, cards seem to have no background color itself or blend in? OR white?
        // Screenshot shows simple off-white or just image and text. Text is on the background page color?
        // Wait, looking at screenshot again: The cards have a background color! It's a light beige/cream card background, slightly distinct from the main background?
        // Actually it looks like the card HAS a background '#FFF8E7' or similar (very light cream).
        // Let's stick to transparent or matching background if simple.
    },
    cardPressed: {
        opacity: 0.9,
    },
    imageContainer: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
    },
    badgesContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(50, 80, 50, 0.7)', // Dark green translucent
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: Fonts.medium,
    },
    badgeIcon: {
        marginLeft: 0,
    },
    content: {
        paddingHorizontal: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#141414',
        flex: 1,
    },
    simpleName: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: '#141414',
        flex: 1,
        lineHeight: 18,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rating: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: '#141414',
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewCount: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#666',
    },
});
