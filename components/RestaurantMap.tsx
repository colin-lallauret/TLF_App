import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const [fullscreen, setFullscreen] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false); // New state for interaction guard

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

    const renderMap = (isFull: boolean) => (
        <View style={styles.mapWrapper}>
            <MapView
                style={isFull ? styles.fullscreenMap : styles.map}
                initialRegion={INITIAL_REGION}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                showsUserLocation={true}
                showsMyLocationButton={true}
                scrollEnabled={isFull || isInteracting} // Only enable if full or interacting
                zoomEnabled={isFull || isInteracting}
                pitchEnabled={isFull || isInteracting}
                rotateEnabled={isFull || isInteracting}
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
                        <Callout onPress={() => {
                            if (isFull) setFullscreen(false);
                            router.push(`/restaurant/${restaurant.id}` as any);
                        }}>
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

            {/* Interaction Guard Overlay (Only on non-fullscreen) */}
            {!isFull && !isInteracting && (
                <TouchableOpacity
                    style={styles.interactionOverlay}
                    activeOpacity={1}
                    onPress={() => setIsInteracting(true)}
                >
                    <View style={styles.interactionMessage}>
                        <Ionicons name="hand-left-outline" size={24} color="#FFF" />
                        <Text style={styles.interactionText}>Toucher pour explorer</Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <>
            <View style={styles.container}>
                {renderMap(false)}
                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setFullscreen(true)}
                >
                    <Ionicons name="expand" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <Modal
                visible={fullscreen}
                animationType="slide"
                onRequestClose={() => setFullscreen(false)}
            >
                <View style={styles.fullscreenContainer}>
                    {renderMap(true)}
                    <SafeAreaView style={styles.closeButtonContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setFullscreen(false)}
                        >
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 500,
        width: '100%',
        overflow: 'hidden',
        position: 'relative', // For absolute positioning of button
        borderRadius: 20,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fullscreenMap: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    expandButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10,
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 10, // Adjusted for SafeAreaView or general top spacing
        right: 16, // Changed to right to match expand button position logic typically
        zIndex: 20,
    },
    closeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: Platform.OS === 'android' ? 40 : 0, // Extra margin for Android status bar
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
    mapWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    interactionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    interactionMessage: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    interactionText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
