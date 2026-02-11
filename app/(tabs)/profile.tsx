import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSouvenirs } from '@/hooks/useSouvenirs';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const { fetchMySouvenirs } = useSouvenirs();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [mySouvenirs, setMySouvenirs] = useState<any[]>([]);

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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {profile?.full_name?.charAt(0).toUpperCase() || '👤'}
                    </Text>
                </View>
                <Text style={styles.userName}>
                    {profile?.full_name || 'Utilisateur'}
                </Text>
                <Text style={styles.userBio}>
                    {profile?.bio || (profile?.is_contributor ? 'Contributeur local' : 'Voyageur passionné')}
                </Text>
                {profile?.city && (
                    <Text style={styles.userCity}>📍 {profile.city}</Text>
                )}
                {isPremium && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badge}>TLF+</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{mySouvenirs.length}</Text>
                        <Text style={styles.statLabel}>Souvenirs</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Favoris</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Visites</Text>
                    </View>
                </View>

                {!profile?.is_contributor && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/souvenir/add' as any)}
                    >
                        <Text style={styles.addButtonText}>+ Ajouter un souvenir</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                </View>

                {profile?.username && (
                    <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
                        <Text style={styles.infoValue}>@{profile.username}</Text>
                    </View>
                )}

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Type de compte</Text>
                    <Text style={styles.infoValue}>
                        {profile?.is_contributor ? '🏆 Contributeur Local' : '✈️ Voyageur'}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Mes souvenirs</Text>

                {mySouvenirs.length === 0 ? (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>
                            Vos souvenirs de voyage apparaîtront ici
                        </Text>
                        <Text style={[styles.placeholderText, { marginTop: 10, fontSize: 12 }]}>
                            Photos, notes et carnets de voyage
                        </Text>
                    </View>
                ) : (
                    <View style={styles.souvenirsList}>
                        {mySouvenirs.map((souvenir, index) => (
                            <View key={souvenir.id || index} style={styles.souvenirCard}>
                                {souvenir.photos_urls && souvenir.photos_urls[0] && (
                                    <Image source={{ uri: souvenir.photos_urls[0] }} style={styles.souvenirImage} />
                                )}
                                <View style={styles.souvenirContent}>
                                    <View style={styles.souvenirHeader}>
                                        <Text style={styles.souvenirTitle} numberOfLines={1}>{souvenir.title}</Text>
                                        <View style={styles.ratingBadge}>
                                            <Ionicons name="star" size={12} color="#fff" />
                                            <Text style={styles.ratingText}>{souvenir.rating}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.souvenirRestaurant}>
                                        <Ionicons name="restaurant-outline" size={14} color="#666" /> {souvenir.restaurants?.name || 'Restaurant inconnu'}
                                    </Text>
                                    <Text style={styles.souvenirDate}>
                                        {new Date(souvenir.date).toLocaleDateString()}
                                    </Text>
                                    {souvenir.description && (
                                        <Text style={styles.souvenirDescription} numberOfLines={2}>
                                            {souvenir.description}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Se déconnecter</Text>
                </TouchableOpacity>
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
        backgroundColor: Colors.light.beige,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 30,
        backgroundColor: Colors.light.primary,
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 50,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    userBio: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    userCity: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 5,
    },
    badgeContainer: {
        marginTop: 10,
    },
    badge: {
        backgroundColor: '#FFD700',
        color: Colors.light.text,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        fontWeight: 'bold',
        fontSize: 12,
    },
    content: {
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.icon,
        marginTop: 5,
    },
    addButton: {
        backgroundColor: Colors.light.secondary,
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.light.icon,
        marginBottom: 4,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 16,
        color: Colors.light.text,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginTop: 10,
        marginBottom: 12,
    },
    placeholder: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    placeholderText: {
        color: Colors.light.icon,
        fontSize: 14,
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF4444',
        marginTop: 10,
        marginBottom: 40,
    },
    logoutButtonText: {
        color: '#FF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    souvenirsList: {
        gap: 16,
        marginBottom: 20,
    },
    souvenirCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    souvenirImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#eee',
    },
    souvenirContent: {
        padding: 15,
    },
    souvenirHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    souvenirTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    souvenirRestaurant: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    souvenirDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    souvenirDescription: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
});
