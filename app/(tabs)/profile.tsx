import { ConfirmDialog } from '@/components/ConfirmDialog';
import { WaveShape } from '@/components/WaveShape';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useSouvenirs } from '@/hooks/useSouvenirs';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const { fetchMySouvenirs } = useSouvenirs();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [mySouvenirs, setMySouvenirs] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<'date' | 'note'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchMySouvenirs().then(setMySouvenirs);
            }
        }, [user, fetchMySouvenirs])
    );

    const handleLogout = () => {
        setShowLogoutDialog(true);
    };

    const confirmLogout = async () => {
        setShowLogoutDialog(false);
        await signOut();
        router.replace('/auth');
    };

    const cancelLogout = () => {
        setShowLogoutDialog(false);
    };

    const isPremium = profile?.subscription_end_date &&
        new Date(profile.subscription_end_date) > new Date();

    // Format name: First name + LAST NAME
    const formatName = (fullName: string | null) => {
        if (!fullName) return 'Utilisateur';
        const parts = fullName.trim().split(' ');
        if (parts.length > 1) {
            const last = parts.pop()?.toUpperCase() || '';
            const first = parts.join(' ');
            return `${first} ${last}`;
        }
        return fullName;
    };

    const toggleFilter = (type: 'date' | 'note') => {
        if (filterType === type) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setFilterType(type);
            setSortOrder('desc');
        }
    };

    const sortedSouvenirs = React.useMemo(() => {
        return [...mySouvenirs].sort((a, b) => {
            if (filterType === 'date') {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const noteA = a.rating || 0;
                const noteB = b.rating || 0;
                return sortOrder === 'asc' ? noteA - noteB : noteB - noteA;
            }
        });
    }, [mySouvenirs, filterType, sortOrder]);

    const handleBadgePress = () => {
        if (!isPremium) {
            Alert.alert("Statut", "Vous n'êtes pas encore membre TLF+.");
            return;
        }

        const endDate = new Date(profile?.subscription_end_date || '');
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const formattedDate = endDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        Alert.alert(
            "Abonnement TLF+",
            `Il vous reste ${daysRemaining} jours.\nFin le ${formattedDate} (inclus).`,
            [{ text: "OK" }]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header with background image */}
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' }}
                style={styles.headerBackground}
                imageStyle={styles.headerBackgroundImage}
            >
                <View style={styles.headerOverlay} />

                {/* Settings icon */}
                <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
                    <Image
                        source={require('@/assets/icons/settings.png')}
                        style={{ width: 28, height: 28 }}
                        contentFit="contain"
                    />
                </TouchableOpacity>

                {/* Wave shape (SVG) */}
                <WaveShape />
            </ImageBackground>

            {/* Avatar and name section */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {profile?.full_name?.charAt(0).toUpperCase() || '👤'}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.userName}>
                    <Text style={{ fontFamily: Fonts.regular, fontWeight: 'normal' }}>
                        {profile?.full_name?.split(' ').slice(0, -1).join(' ') || profile?.full_name?.split(' ')[0] || ''}
                    </Text>
                    {' '}
                    <Text style={{ fontFamily: Fonts.bold, fontWeight: 'bold', fontSize: 22 }}>
                        {profile?.full_name?.split(' ').slice(-1)[0]?.toUpperCase() || ''}
                    </Text>
                </Text>

                <TouchableOpacity
                    style={[styles.badgeContainer, { backgroundColor: isPremium ? '#00661D' : '#888' }]}
                    onPress={handleBadgePress}
                    activeOpacity={isPremium ? 0.7 : 1}
                >
                    {isPremium && (
                        <Image
                            source={require('@/assets/icons/logo_tlf_creme.png')}
                            style={{ width: 14, height: 14, marginRight: 4 }}
                            contentFit="contain"
                        />
                    )}
                    <Text style={styles.badge}>{isPremium ? 'Membre' : 'Devenir membre'}</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Add souvenir button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/souvenir/add' as any)}
                >
                    <Text style={styles.addButtonIcon}>+</Text>
                    <View style={styles.addButtonTextContainer}>
                        <Text style={styles.addButtonTitle}>Ajouter un souvenir</Text>
                        <Text style={styles.addButtonSubtitle}>
                            Simplement tes photos, une phrase, une note et ce sera pour te souvenir à jamais de ce fameux restaurant.
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Mes souvenirs section */}
                <View style={styles.souvenirsSectionHeader}>
                    <Text style={styles.sectionTitle}>Mes souvenirs</Text>
                    <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
                </View>

                {/* Filter buttons */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === 'date' && styles.filterButtonActive]}
                        onPress={() => toggleFilter('date')}
                    >
                        <Image
                            source={filterType === 'date'
                                ? (sortOrder === 'asc' ? require('@/assets/icons/filter_up.png') : require('@/assets/icons/filter_down.png'))
                                : require('@/assets/icons/filter_down.png')}
                            style={{ width: 16, height: 16, opacity: filterType === 'date' ? 1 : 0.5 }}
                            contentFit="contain"
                        />
                        <Text style={styles.filterButtonText}>Date</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === 'note' && styles.filterButtonActive]}
                        onPress={() => toggleFilter('note')}
                    >
                        <Image
                            source={filterType === 'note'
                                ? (sortOrder === 'asc' ? require('@/assets/icons/filter_up.png') : require('@/assets/icons/filter_down.png'))
                                : require('@/assets/icons/filter_down.png')}
                            style={{ width: 16, height: 16, opacity: filterType === 'note' ? 1 : 0.5 }}
                            contentFit="contain"
                        />
                        <Text style={styles.filterButtonText}>Note</Text>
                    </TouchableOpacity>
                </View>

                {/* Souvenirs list */}
                {sortedSouvenirs.length === 0 ? (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>
                            Vos souvenirs apparaîtront ici
                        </Text>
                        <Text style={[styles.placeholderText, { marginTop: 10, fontSize: 12 }]}>
                            Photos, notes et descriptions
                        </Text>
                    </View>
                ) : (
                    <View style={styles.souvenirsList}>
                        {sortedSouvenirs.map((souvenir, index) => (
                            <View key={souvenir.id || index} style={styles.souvenirCard}>
                                {souvenir.photos_urls && souvenir.photos_urls[0] && (
                                    <Image source={{ uri: souvenir.photos_urls[0] }} style={styles.souvenirImage} contentFit="cover" />
                                )}
                                <View style={styles.souvenirContent}>
                                    <Text style={styles.souvenirTitle} numberOfLines={1}>Titre</Text>
                                    <Text style={styles.souvenirDescription} numberOfLines={4}>
                                        {souvenir.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tristique, erat quis elementum consectetur, diam ante tempor enim, ut vehicula felis ex sed enim. Maecenas rutrum lorem leo.'}
                                    </Text>
                                    <View style={styles.souvenirRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={star <= (souvenir.rating || 4) ? "star" : "star-outline"}
                                                size={16}
                                                color="#E54628"
                                            />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <ConfirmDialog
                visible={showLogoutDialog}
                title="Déconnexion"
                message="Êtes-vous sûr de vouloir vous déconnecter ?"
                confirmText="Déconnexion"
                cancelText="Annuler"
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF6', // Cream background
    },
    headerBackground: {
        height: 200,
        position: 'relative',
    },
    headerBackgroundImage: {
        opacity: 0.6,
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(230, 81, 39, 0.65)', // Strong Orange Overlay
    },
    settingsButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'transparent', // Transparent background
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    profileSection: {
        alignItems: 'center',
        marginTop: -60,
        paddingBottom: 20,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 6,
        borderColor: '#FFFDF6',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FFF',
    },
    avatarText: {
        fontSize: 50,
        fontFamily: Fonts.bold,
        color: '#666',
    },
    userName: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D7A3E', // Green badge
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badge: {
        color: '#fffcf5',
        fontFamily: Fonts.bold,
        fontSize: 12,
    },
    content: {
        padding: 20,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#E54628',
        borderStyle: 'dashed',
    },
    addButtonIcon: {
        fontSize: 24,
        color: '#E54628',
        fontFamily: Fonts.bold,
        marginRight: 12,
    },
    addButtonTextContainer: {
        flex: 1,
    },
    addButtonTitle: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#E54628',
        marginBottom: 4,
    },
    addButtonSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#666',
        lineHeight: 16,
    },
    souvenirsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    filterButtonActive: {
        // backgroundColor: '#F0F0F0', // Removed background for active state too
    },
    filterButtonText: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: '#1A1A1A',
    },
    placeholder: {
        backgroundColor: '#fffcf5',
        borderRadius: 20,
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    placeholderText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: Fonts.regular,
    },
    souvenirsList: {
        gap: 16,
        marginBottom: 20,
    },
    souvenirCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    souvenirImage: {
        width: 120,
        height: 140,
        backgroundColor: '#E0E0E0',
    },
    souvenirContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    souvenirTitle: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 6,
    },
    souvenirDescription: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#666',
        lineHeight: 16,
        marginBottom: 8,
    },
    souvenirRating: {
        flexDirection: 'row',
        gap: 4,
    },
});
