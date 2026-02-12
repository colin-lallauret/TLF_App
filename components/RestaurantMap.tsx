import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

// Toulon coordinates
const INITIAL_REGION = {
    latitude: 43.124228,
    longitude: 5.928,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

interface RestaurantMapProps {
    restaurants: any[];
}

export const RestaurantMap = ({ restaurants }: RestaurantMapProps) => {
    const router = useRouter();

    // Vérifier si on a des restaus avec coordonnées
    const markers = restaurants.filter(r => r.lat && r.lng);

    // Sur le web, afficher un message personnalisé
    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <View style={styles.webFallback}>
                    <Text style={styles.webFallbackTitle}>Carte indisponible sur la version web.</Text>
                    <Text style={styles.webFallbackSubtitle}>
                        Veuillez utiliser l'application mobile pour la carte interactive.
                    </Text>
                    <Text style={styles.webFallbackCount}>({markers.length} restaurants trouvés)</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={INITIAL_REGION}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {markers.map((restaurant) => (
                    <Marker
                        key={restaurant.id}
                        coordinate={{
                            latitude: restaurant.lat,
                            longitude: restaurant.lng,
                        }}
                        title={restaurant.name}
                        description={restaurant.city}
                    >
                        <Callout onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                                <Text style={styles.calloutType}>
                                    {restaurant.food_types?.[0] || 'Restaurant'}
                                </Text>
                                <Text style={styles.calloutLink}>Voir la fiche</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 500,
        width: '100%',
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    callout: {
        minWidth: 150,
        padding: 5,
        alignItems: 'center',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
        color: '#333',
    },
    calloutType: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    calloutLink: {
        color: Colors.light.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    webFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
    },
    webFallbackTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    webFallbackSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    webFallbackCount: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 16,
    },
});
