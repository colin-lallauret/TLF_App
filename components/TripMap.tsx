import { Colors, Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

interface TripMapProps {
    steps: any[];
}

const { width, height } = Dimensions.get('window');

export const TripMap = ({ steps }: TripMapProps) => {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);

    // Filter steps that have valid restaurant coordinates
    const validSteps = steps.filter(step =>
        step.restaurants && step.restaurants.lat && step.restaurants.lng
    );

    // Coordinates for Polyline
    const coordinates = validSteps.map(step => ({
        latitude: step.restaurants.lat,
        longitude: step.restaurants.lng,
    }));

    // Fit map to markers on load
    useEffect(() => {
        if (validSteps.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [steps, fullscreen]);

    if (validSteps.length === 0) return null;

    const renderMap = (isFull: boolean) => (
        <View style={styles.mapWrapper}>
            <MapView
                ref={isFull ? undefined : mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: validSteps[0].restaurants.lat,
                    longitude: validSteps[0].restaurants.lng,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                showsUserLocation={true}
                showsMyLocationButton={true}
                scrollEnabled={isFull || isInteracting}
                zoomEnabled={isFull || isInteracting}
                rotateEnabled={isFull || isInteracting}
                pitchEnabled={isFull || isInteracting}
            >
                <Polyline
                    coordinates={coordinates}
                    strokeColor={Colors.light.primary}
                    strokeWidth={3}
                    lineDashPattern={[1]}
                />

                {validSteps.map((step, index) => (
                    <Marker
                        key={step.id}
                        coordinate={{
                            latitude: step.restaurants.lat,
                            longitude: step.restaurants.lng,
                        }}
                        title={`${index + 1}. ${step.restaurants.name}`}
                        description={step.meal_type}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.markerBubble}>
                                <Text style={styles.markerText}>{index + 1}</Text>
                            </View>
                            <View style={styles.markerArrow} />
                        </View>

                        <Callout onPress={() => {
                            if (isFull) setFullscreen(false);
                            router.push(`/restaurant/${step.restaurants.id}` as any);
                        }}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{index + 1}. {step.restaurants.name}</Text>
                                <Text style={styles.calloutType}>{step.meal_type}</Text>
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

            {!isFull && (
                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setFullscreen(true)}
                >
                    <Ionicons name="expand" size={20} color="#000" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>Carte du parcours</Text>
                {renderMap(false)}
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
        marginTop: 20,
        marginBottom: 20,
        height: 500, // Updated height
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    title: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        marginBottom: 10,
        color: Colors.light.text,
        paddingHorizontal: 10,
    },
    mapWrapper: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerBubble: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    markerText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    markerArrow: {
        backgroundColor: Colors.light.primary,
        width: 10,
        height: 10,
        transform: [{ rotate: '45deg' }],
        marginTop: -5,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#FFF',
        zIndex: -1,
    },
    expandButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 10,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 10,
        right: 16,
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
        marginTop: Platform.OS === 'android' ? 40 : 0,
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
