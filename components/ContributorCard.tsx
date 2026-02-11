import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { Database } from '@/types/database.types';
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

/**
 * Composant carte pour afficher un contributeur local
 * Affiche l'avatar, le nom, la ville et la bio du contributeur
 */
export function ContributorCard({ contributor, isFavorite: initialIsFavorite = false, onToggleFavorite }: ContributorCardProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    // Fonction pour obtenir les initiales du nom
    const getInitials = (name: string | null): string => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Tronquer la bio à 60 caractères
    const truncateBio = (bio: string | null): string => {
        if (!bio) return 'Contributeur local passionné';
        return bio.length > 60 ? `${bio.substring(0, 60)}...` : bio;
    };

    const handlePress = () => {
        // Navigation vers le profil du contributeur
        router.push(`/contributor/${contributor.id}`);
    };

    const handleFavoritePress = (e: any) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        if (onToggleFavorite) {
            onToggleFavorite(contributor.id);
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
            {onToggleFavorite && (
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoritePress}
                    activeOpacity={0.7}
                >
                    <View style={styles.favoriteIconBackground}>
                        <IconSymbol
                            name={isFavorite ? "heart.fill" : "heart"}
                            size={14}
                            color={isFavorite ? Colors.light.primary : Colors.light.icon}
                        />
                    </View>
                </TouchableOpacity>
            )}

            {/* Avatar */}
            <View style={styles.avatarContainer}>
                {contributor.avatar_url ? (
                    <Image
                        source={{ uri: contributor.avatar_url }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitials}>
                            {getInitials(contributor.full_name)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Informations */}
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>
                    {contributor.full_name || contributor.username || 'Anonyme'}
                </Text>

                {contributor.city && (
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.city} numberOfLines={1}>
                            {contributor.city}
                        </Text>
                    </View>
                )}

                <Text style={styles.bio} numberOfLines={2}>
                    {truncateBio(contributor.bio)}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 160,
        backgroundColor: Colors.light.background, // Beige crème
        borderRadius: 20,
        padding: 12,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    favoriteIconBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0E0E0',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.light.primary, // Orange
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 28,
        fontFamily: Fonts.bold,
        color: Colors.light.background,
    },
    infoContainer: {
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        textAlign: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    locationIcon: {
        fontSize: 12,
    },
    city: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: Colors.light.icon,
        flex: 1,
        textAlign: 'center',
    },
    bio: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: Colors.light.icon,
        textAlign: 'center',
        lineHeight: 14,
        marginTop: 4,
    },
});
