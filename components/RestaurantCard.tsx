import { Fonts } from '@/constants/theme';
import { RestaurantWithRating } from '@/hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            <View style={styles.cardContent}>
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
                        <RNImage
                            source={isFavorite ? require('@/assets/icons/liked.svg') : require('@/assets/icons/like.svg')}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
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
                                {[1, 2, 3, 4, 5].map((position) => {
                                    const rating = restaurant.average_rating || 0;
                                    const diff = rating - (position - 1);
                                    let starIcon;

                                    if (diff >= 1) {
                                        starIcon = require('@/assets/icons/star_full.svg');
                                    } else if (diff >= 0.5) {
                                        starIcon = require('@/assets/icons/star_semi_full.svg');
                                    } else {
                                        starIcon = require('@/assets/icons/star_empty.svg');
                                    }

                                    return (
                                        <RNImage
                                            key={position}
                                            source={starIcon}
                                            style={{ width: 12, height: 12 }}
                                            resizeMode="contain"
                                        />
                                    );
                                })}
                            </View>
                            <Text style={styles.reviewCount}>({restaurant.review_count || 13})</Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 250,
        backgroundColor: '#fffcf5',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 5,
    },
    cardContent: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    simpleCard: {
        width: 160,
    },
    cardPressed: {
        opacity: 0.9,
    },
    imageContainer: {
        width: '100%',
        height: 360,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
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
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: 12,
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
