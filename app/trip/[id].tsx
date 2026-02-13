import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TripDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [trip, setTrip] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [steps, setSteps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchTripDetails();
    }, [id]);

    useEffect(() => {
        if (trip) {
            setEditedName(trip.name);
        }
    }, [trip]);

    const fetchTripDetails = async () => {
        try {
            setLoading(true);

            // Fetch trip info
            const { data: tripData, error: tripError } = await supabase
                .from('trips')
                .select('*')
                .eq('id', id)
                .single();

            if (tripError) {
                console.error('Error fetching trip:', tripError);
                return;
            }

            setTrip(tripData);

            // Fetch steps with restaurant details
            const { data: stepsData, error: stepsError } = await supabase
                .from('trip_steps')
                .select(`
                    *,
                    restaurants (*)
                `)
                .eq('trip_id', id)
                .order('step_order');

            if (stepsError) {
                console.error('Error fetching steps:', stepsError);
            } else {
                setSteps(stepsData || []);
            }

        } catch (error) {
            console.error('Error fetching trip details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleEditMode = async () => {
        if (isEditing) {
            // Save changes
            await saveTripChanges();
        }
        setIsEditing(!isEditing);
    };

    const saveTripChanges = async () => {
        if (!editedName.trim()) {
            alert("Le nom du parcours ne peut pas être vide.");
            return;
        }

        try {
            const { error } = await supabase
                .from('trips')
                .update({ name: editedName } as any)
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setTrip({ ...trip, name: editedName });

        } catch (error) {
            console.error('Error updating trip:', error);
            Alert.alert("Erreur", "Impossible de mettre à jour le parcours.");
        }
    };

    const deleteTrip = async () => {
        if (Platform.OS === 'web') {
            if (confirm("Êtes-vous sûr de vouloir supprimer ce parcours ? Cette action est irréversible.")) {
                performDelete();
            }
        } else {
            Alert.alert("Confirmation", "Êtes-vous sûr de vouloir supprimer ce parcours ? Cette action est irréversible.", [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => performDelete()
                }
            ]);
        }
    };

    const performDelete = async () => {
        try {
            setLoading(true);
            const tripId = Array.isArray(id) ? id[0] : id;

            if (!tripId) {
                alert("Erreur: ID du parcours manquant");
                return;
            }

            // 1. Delete associated steps
            const { error: stepsError } = await supabase
                .from('trip_steps')
                .delete()
                .eq('trip_id', tripId);

            if (stepsError) {
                console.error('Error deleting steps:', stepsError);
                throw stepsError;
            }

            // 2. Delete the trip itself
            const { error: tripError } = await supabase
                .from('trips')
                .delete()
                .eq('id', tripId);

            if (tripError) {
                console.error('Error deleting trip:', tripError);
                throw tripError;
            }

            // Redirect on success
            // Use replace to avoid going back to a deleted trip
            router.replace('/(tabs)/decouvrir');

        } catch (error: any) {
            console.error('Error in deleteTrip:', error);
            alert(`Erreur: ${error.message || "Impossible de supprimer le parcours."}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditStep = (step: any) => {
        // Find the meal type ID
        // The search page expects 'currentStep' as ID '1','2','3','4'
        // But we have the label 'Petit-déjeuner'. We need a reverse map or simple logic.
        const MEAL_IDS: Record<string, string> = {
            'Petit-déjeuner': '1',
            'Déjeuner': '2',
            'Pause sucrée': '3',
            'Dîner': '4'
        };
        const mealTypeId = MEAL_IDS[step.meal_type] || '1'; // Default to 1 if not found

        router.push({
            pathname: '/create-trip/search',
            params: {
                existingTripId: id as string,
                stepRowId: step.id,
                currentStep: mealTypeId,
                tripPlan: JSON.stringify([mealTypeId]), // Array of just this step
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DC4928" />
            </View>
        );
    }

    if (!trip) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Parcours introuvable.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <LinearGradient
                    colors={['#E3E0CF', '#FFFCF5']}
                    style={styles.header}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Image
                            source={require('@/assets/icons/return_arrow.png')}
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerSubtitle}>MON PARCOURS</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.editTitleInput}
                                value={editedName}
                                onChangeText={setEditedName}
                                placeholder="Nom du parcours"
                            />
                        ) : (
                            <Text style={styles.headerTitle}>{trip.name}</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
                        <Ionicons
                            name={isEditing ? "checkmark" : "pencil"}
                            size={24}
                            color="#FFF"
                        />
                    </TouchableOpacity>
                </LinearGradient>

                <View style={styles.content}>
                    <Text style={styles.dateText}>
                        Créé le {new Date(trip.created_at).toLocaleDateString()}
                    </Text>

                    {/* Timeline / Steps */}
                    <View style={styles.timeline}>
                        {steps.map((step, index) => {
                            const restaurant = step.restaurants;
                            const isLast = index === steps.length - 1;
                            const nextStep = steps[index + 1];
                            let distance = null;

                            if (!isLast && nextStep && restaurant && nextStep.restaurants && restaurant.lat && restaurant.lng && nextStep.restaurants.lat && nextStep.restaurants.lng) {
                                distance = getDistanceFromLatLonInKm(
                                    restaurant.lat,
                                    restaurant.lng,
                                    nextStep.restaurants.lat,
                                    nextStep.restaurants.lng
                                );
                            }

                            return (
                                <View key={step.id} style={styles.timelineItem}>
                                    {/* Timeline Line */}
                                    <View style={styles.timelineLeft}>
                                        <View style={styles.timelineDot} />
                                        {!isLast && (
                                            <View style={styles.timelineLine}>
                                                {distance && (
                                                    <View style={styles.distanceBadge}>
                                                        <Text style={styles.distanceText}>
                                                            {distance < 1
                                                                ? `${Math.round(distance * 1000)}m`
                                                                : `${distance.toFixed(1)}km`}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>

                                    {/* Content Card */}
                                    <View style={styles.timelineRight}>
                                        <View style={styles.stepHeader}>
                                            <MaterialCommunityIcons
                                                name={getMealIcon(step.meal_type)}
                                                size={20}
                                                color="#DC4928"
                                            />
                                            <Text style={styles.mealType}>{step.meal_type}</Text>
                                        </View>

                                        {restaurant ? (
                                            <TouchableOpacity
                                                style={[styles.restaurantCard, isEditing && styles.restaurantCardEditing]}
                                                onPress={() => isEditing ? handleEditStep(step) : router.push(`/restaurant/${restaurant.id}`)}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.cardHeader}>
                                                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                                                    <View style={styles.badgeContainer}>
                                                        <Text style={styles.badgeText}>
                                                            {Array(restaurant.budget_level || 1).fill('€').join('')}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <Text style={styles.restaurantAddress}>
                                                    {restaurant.address}, {restaurant.city}
                                                </Text>

                                                <View style={styles.tagsContainer}>
                                                    {restaurant.food_types?.slice(0, 2).map((tag: string, i: number) => (
                                                        <View key={i} style={styles.tag}>
                                                            <Text style={styles.tagText}>{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>

                                                {/* Edit Overlay */}
                                                {isEditing && (
                                                    <View style={styles.editOverlay}>
                                                        <View style={styles.editBadge}>
                                                            <Text style={styles.editBadgeText}>Remplacer</Text>
                                                            <Ionicons name="refresh" size={16} color="#FFF" />
                                                        </View>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={[styles.restaurantCard, { opacity: 0.5 }]}>
                                                <Text>Restaurant non trouvé</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Footer Delete Button */}
            {isEditing && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.deleteButton} onPress={deleteTrip}>
                        <Ionicons name="trash-outline" size={20} color="#FFF" />
                        <Text style={styles.deleteButtonText}>Supprimer le parcours</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

function getMealIcon(mealType: string) {
    switch (mealType) {
        case 'Petit-déjeuner': return 'coffee-outline';
        case 'Déjeuner': return 'weather-sunny';
        case 'Pause sucrée': return 'cookie';
        case 'Dîner': return 'weather-night';
        default: return 'silverware-fork-knife';
    }
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFCF5',
    },
    errorText: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: '#DC4928',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#DC4928',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        flex: 1,
    },
    editTitleInput: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#DC4928',
        paddingVertical: 0,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DC4928',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    dateText: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#999',
        marginBottom: 24,
    },
    timeline: {
        paddingLeft: 10,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 24,
    },
    timelineDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#DC4928',
        borderWidth: 3,
        borderColor: '#FFFCF5', // Creates a gap feeling
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        top: 20,
        bottom: -30, // Extend to next item
        width: 2,
        backgroundColor: '#E0E0E0',
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    distanceBadge: {
        backgroundColor: '#FFF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginTop: 40,
        zIndex: 10,
    },
    distanceText: {
        fontSize: 10,
        fontFamily: Fonts.medium,
        color: '#666',
    },
    timelineRight: {
        flex: 1,
        gap: 8,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mealType: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#DC4928',
    },
    restaurantCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    restaurantCardEditing: {
        borderColor: '#DC4928',
        borderWidth: 2,
        backgroundColor: '#FFF5F2',
    },
    editOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    editBadge: {
        backgroundColor: '#DC4928',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    editBadgeText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Fonts.bold,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    restaurantName: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        flex: 1,
    },
    restaurantAddress: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#666',
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: '#666',
    },
    badgeContainer: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: Fonts.bold,
        color: '#333',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFCF5',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    deleteButton: {
        backgroundColor: '#DC4928',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
});
