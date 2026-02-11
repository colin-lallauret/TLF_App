import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { RestaurantWithRating } from '@/hooks/useRestaurants';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RestaurantCardProps {
    restaurant: RestaurantWithRating;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const handlePress = () => {
        console.log('Navigate to restaurant:', restaurant.id);
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
            onPress={handlePress}
        >
            <Image
                source={{ uri: restaurant.image_url }}
                style={styles.image}
                contentFit="cover"
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
                    <View style={styles.ratingContainer}>
                        <IconSymbol name="star.fill" size={12} color="#FFD700" />
                        <Text style={styles.rating}>{restaurant.average_rating || '-'}</Text>
                        <Text style={styles.reviewCount}>({restaurant.review_count})</Text>
                    </View>
                </View>

                <View style={styles.details}>
                    <Text style={styles.cuisine} numberOfLines={1}>
                        {restaurant.food_types?.[0] || 'Cuisine variée'}
                        {' • '}
                        {Array(restaurant.budget_level || 1).fill('€').join('')}
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
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#E0E0E0',
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
