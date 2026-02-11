import { Colors, Fonts } from '@/constants/theme';
import { Database } from '@/types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContributorCardProps {
    contributor: Profile;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
}

export function ContributorCard({ contributor, isFavorite: initialIsFavorite = false, onToggleFavorite }: ContributorCardProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handlePress = () => {
        router.push(`/contributor/${contributor.id}`);
    };

    const handleFavoritePress = (e: any) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        if (onToggleFavorite) {
            onToggleFavorite(contributor.id);
        }
    };

    // Helper to format name: First Name + LAST NAME
    const formatName = (fullName: string | null) => {
        if (!fullName) return { first: 'Anonyme', last: '' };
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return { first: parts[0], last: '' };
        const first = parts.slice(0, -1).join(' ');
        const last = parts[parts.length - 1].toUpperCase();
        return { first, last };
    };

    const { first, last } = formatName(contributor.full_name || contributor.username);

    // Placeholder data for stats if not available in profile
    const contributionCount = 13; // This would typically come from a joined query or aggregate

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
                    source={contributor.avatar_url ? { uri: contributor.avatar_url } : require('@/assets/images/react-logo.png')} // Fallback image needed? Or initials wrapper
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
                        size={20}
                        color="#Ffffff" // White outline/fill as per screenshot usually, or maybe white outline? Screenshot shows white heart outline.
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.nameContainer}>
                    <Text style={styles.firstName} numberOfLines={1}>{first}</Text>
                    {last ? <Text style={styles.lastName} numberOfLines={1}>{last}</Text> : null}
                </View>

                <View style={styles.statsContainer}>
                    <Ionicons name="restaurant-outline" size={14} color={Colors.light.primary} />
                    <Text style={styles.statsText}>{contributionCount}</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardPressed: {
        opacity: 0.9,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1, // Square image
        backgroundColor: '#F0F0F0',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    infoContainer: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    nameContainer: {
        flex: 1,
        marginRight: 4,
    },
    firstName: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: '#141414',
    },
    lastName: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: '#141414',
        marginTop: 0,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingBottom: 2, // Align with text baseline match
    },
    statsText: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: Colors.light.primary, // Red/Primary color
    },
});
