import { Fonts } from '@/constants/theme';
import { RestaurantWithRating } from '@/hooks/useFavorites';
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
    const getFoodTypeLabel = () => restaurant.food_types?.[0] || 'Varié';
    const getBudgetLabel = () => {
        const level = restaurant.budget_level || 50;
        if (level <= 50) return '€';
        if (level <= 100) return '€€';
        if (level <= 150) return '€€€';
        return '€€€€';
    };
    const getServiceLabel = () => restaurant.services?.[0] || 'Sur place';

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
                            source={isFavorite ? require('@/assets/icons/like_full_orange.png') : require('@/assets/icons/like_empty.png')}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {!isSimple && (
                        <View style={styles.badgesContainer}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{getServiceLabel()}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{getFoodTypeLabel()}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{getBudgetLabel()}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={[styles.name, isSimple && styles.simpleName]} numberOfLines={2}>{restaurant.name}</Text>
                    </View>

                    {!isSimple && (
                        <View style={styles.ratingRow}>
                            <Text style={styles.rating}>{restaurant.average_rating || '-'}</Text>
                            <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map((position) => {
                                    const rating = restaurant.average_rating || 0;
                                    const diff = rating - (position - 1);
                                    let iconSource;

                                    if (diff >= 1) {
                                        iconSource = require('@/assets/icons/star_full.png');
                                    } else if (diff >= 0.5) {
                                        iconSource = require('@/assets/icons/star_semi_full.png');
                                    } else {
                                        iconSource = require('@/assets/icons/star_empty.png');
                                    }

                                    return (
                                        <Image
                                            key={position}
                                            source={iconSource}
                                            style={{ width: 12, height: 12 }}
                                            contentFit="contain"
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 4,
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
