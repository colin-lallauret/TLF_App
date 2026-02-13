import { Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';

interface SouvenirCardProps {
    title: string;
    description: string;
    date: string;
    rating: number;
    images: string[];
}

export function SouvenirCard({ title, description, date, rating, images }: SouvenirCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageWidth, setImageWidth] = useState(0);

    const onLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setImageWidth(width);
    };

    return (
        <View style={styles.cardWrapper}>
            <View style={styles.card}>
                {/* Left Side: Image Carousel */}
                <View style={styles.imageContainer} onLayout={onLayout}>
                    {imageWidth > 0 && (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                                setCurrentImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                            style={styles.carousel}
                            contentContainerStyle={{ width: imageWidth * images.length }}
                        >
                            {images.map((img, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: img }}
                                    style={[styles.image, { width: imageWidth }]}
                                    contentFit="cover"
                                />
                            ))}
                        </ScrollView>
                    )}

                    {/* Date Badge */}
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>le {date}</Text>
                    </View>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentImageIndex ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Right Side: Content */}
                <View style={styles.contentContainer}>
                    <View>
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                        <Text style={styles.description} numberOfLines={6} ellipsizeMode="tail">
                            {description}
                        </Text>
                    </View>

                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => {
                            let iconSource;
                            if (rating >= star) {
                                iconSource = require('@/assets/icons/star_full.png');
                            } else if (rating >= star - 0.5) {
                                iconSource = require('@/assets/icons/star_semi_full.png');
                            } else {
                                iconSource = require('@/assets/icons/star_empty.png');
                            }

                            return (
                                <Image
                                    key={star}
                                    source={iconSource}
                                    style={styles.starIcon}
                                    contentFit="contain"
                                />
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 4,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFCF5',
        borderRadius: 16,
        overflow: 'hidden',
        height: 240, // Slightly taller to accommodate content
        width: '100%',
    },
    imageContainer: {
        width: '45%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#E0E0E0',
    },
    carousel: {
        flex: 1,
    },
    image: {
        height: '100%',
    },
    dateBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    dateText: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: Fonts.medium,
    },
    pagination: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: '#E65127', // Orange to match active state
    },
    inactiveDot: {
        backgroundColor: '#D9D9D9', // Grey for inactive
    },
    contentContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 22,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 8,
        lineHeight: 26,
    },
    description: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#1A1A1A',
        lineHeight: 20,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 4,
    },
    starIcon: {
        width: 16,
        height: 16,
    }
});
