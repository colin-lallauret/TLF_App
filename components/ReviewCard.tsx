import { IconSymbol } from '@/components/ui/icon-symbol';
import { ReviewWithAuthor } from '@/hooks/useRestaurantDetails';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ReviewCardProps {
    review: ReviewWithAuthor;
}

export function ReviewCard({ review }: ReviewCardProps) {
    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {review.contributor.avatar_url ? (
                        <Image
                            source={{ uri: review.contributor.avatar_url }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>
                                {getInitials(review.contributor.full_name)}
                            </Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.userName}>{review.contributor.full_name}</Text>
                        <Text style={styles.date}>{formatDate(review.created_at)}</Text>
                    </View>
                </View>
                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>{review.rating}</Text>
                    <IconSymbol name="star.fill" size={12} color="#FFFFFF" />
                </View>
            </View>

            {review.title && <Text style={styles.title}>{review.title}</Text>}
            {review.description && <Text style={styles.description}>{review.description}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E65127',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
    },
    date: {
        fontSize: 12,
        color: '#999999',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E65127',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    rating: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
});
