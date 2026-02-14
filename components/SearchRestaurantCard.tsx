import { getImageForCuisine } from '@/constants/CuisineImages';
import { Fonts } from '@/constants/theme';
import { Database } from '@/types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Restaurant = Database['public']['Tables']['restaurants']['Row'] & { image_url?: string | null, reviews?: { rating: number | null }[] | null };

import { StyleProp, ViewStyle } from 'react-native';

interface SearchRestaurantCardProps {
    restaurant: Restaurant;
    onPress: () => void;
    actionIcon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export function SearchRestaurantCard({ restaurant, onPress, actionIcon, style, children }: SearchRestaurantCardProps) {
    return (
        <TouchableOpacity
            style={[styles.resultCard, style]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: restaurant.image_url || getImageForCuisine(restaurant.food_types) }}
                style={styles.resultImage}
                contentFit="cover"
                transition={200}
            />
            <View style={styles.resultContent}>
                <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>{restaurant.name}</Text>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>
                            {Array(restaurant.budget_level || 1).fill('€').join('')}
                        </Text>
                    </View>
                </View>
                <Text style={styles.resultAddress}>{restaurant.address}, {restaurant.city}</Text>

                <View style={styles.tagsContainer}>
                    {restaurant.food_types?.slice(0, 2).map((tag, index) => (
                        <View key={index} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                    ))}
                    {restaurant.meal_types?.slice(0, 1).map((tag, index) => (
                        <View key={`meal-${index}`} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                    ))}
                </View>
                {(restaurant.reviews && restaurant.reviews.length > 0) && (
                    <View style={styles.ratingContainer}>
                        <RNImage
                            source={require('@/assets/icons/star_full.png')}
                            style={{ width: 16, height: 16 }}
                            resizeMode="contain"
                        />
                        <Text style={styles.ratingText}>
                            {(restaurant.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / restaurant.reviews.length).toFixed(1)} ({restaurant.reviews.length})
                        </Text>
                    </View>
                )}
            </View>
            {actionIcon !== null && (
                <View style={styles.arrowContainer}>
                    {actionIcon || <Ionicons name="add-circle" size={32} color="#DC4928" />}
                </View>
            )}
            {children}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    resultCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden', // Ensure image respects border radius
    },
    resultImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#F0F0F0',
    },
    resultContent: {
        padding: 12,
        gap: 4,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    resultTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        flex: 1,
        marginRight: 8,
    },
    resultAddress: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#666',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: '#666',
    },
    arrowContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FFF',
        borderRadius: 20, // Circular background for visibility
        padding: 4, // Small padding around icon
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeContainer: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start', // Prevent stretching
    },
    badgeText: {
        fontSize: 12,
        fontFamily: Fonts.bold,
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: '#333',
    },
});
