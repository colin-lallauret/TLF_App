import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DecouvrirScreen() {
    const router = useRouter();
    const [trips, setTrips] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchTrips();
        }, [])
    );

    const handleSearchAddress = () => {
        router.push('/search-address');
    };

    const handleCreateRoute = () => {
        router.push('/create-trip');
    };

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setTrips([]);
                return;
            }

            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching trips:', error);
            } else {
                setTrips(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#E3E0CF', '#FFFCF5']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Découvrir</Text>
            </LinearGradient>

            <View style={styles.content}>
                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSearchAddress}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Rechercher une adresse</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleCreateRoute}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Créer un parcours</Text>
                    </TouchableOpacity>
                </View>

                {/* Mes Parcours Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mes Parcours</Text>

                    {loading ? (
                        <Text style={styles.emptyText}>Chargement...</Text>
                    ) : trips.length > 0 ? (
                        trips.map((trip) => (
                            <TouchableOpacity
                                key={trip.id}
                                style={styles.tripCard}
                                onPress={() => router.push(`/trip/${trip.id}`)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.tripIcon}>
                                    <Ionicons name="map-outline" size={24} color="#DC4928" />
                                </View>
                                <View style={styles.tripInfo}>
                                    <Text style={styles.tripName}>{trip.name}</Text>
                                    <Text style={styles.tripDate}>
                                        Créé le {new Date(trip.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CCC" />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Vous n'avez pas encore créé de parcours.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF5',
    },
    header: {
        height: 120,
        paddingTop: 60,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    content: {
        flex: 1,
        padding: 20,
        gap: 24,
    },
    actionsContainer: {
        gap: 16,
    },
    button: {
        backgroundColor: '#DC4928',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFCF5',
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
    section: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    tripCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tripIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF0ED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tripInfo: {
        flex: 1,
    },
    tripName: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 4,
    },
    tripDate: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#999',
    },
});
