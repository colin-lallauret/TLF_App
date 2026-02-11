import { Database } from '@/types/database.types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContributorCardProps {
    contributor: Profile;
}

/**
 * Composant carte pour afficher un contributeur local
 * Affiche l'avatar, le nom, la ville et la bio du contributeur
 */
export function ContributorCard({ contributor }: ContributorCardProps) {
    const router = useRouter();

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
        // Navigation vers le profil du contributeur (à implémenter plus tard)
        console.log('Navigation vers profil:', contributor.id);
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
            onPress={handlePress}
        >
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
        backgroundColor: '#FFFDF0', // Beige crème
        borderRadius: 20,
        padding: 12,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 8,
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
        backgroundColor: '#E65127', // Orange
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFDF0',
    },
    infoContainer: {
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
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
        color: '#666666',
        flex: 1,
        textAlign: 'center',
    },
    bio: {
        fontSize: 11,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 14,
        marginTop: 4,
    },
});
