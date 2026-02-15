import { BackButton } from '@/components/BackButton';
import { SearchRestaurantCard } from '@/components/SearchRestaurantCard';
import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Slider } from '@miblanchard/react-native-slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mappings for filters
const MEAL_TYPES: Record<string, string> = { '1': 'Petit-déjeuner', '2': 'Déjeuner', '3': 'Pause sucrée', '4': 'Dîner' };
const CUISINES: Record<string, string> = { '1': 'Italien', '2': 'Japonais', '3': 'Indien', '4': 'Libanais' };
const SERVICES: Record<string, string> = { '1': 'Sur place', '2': 'À emporter', '3': 'Livraison', '4': 'Click & Collect' };
const AMBIANCES: Record<string, string> = { '1': 'Romantique', '2': 'Familial', '3': 'Conviviale', '4': 'Animé', '5': 'Calme' };
const DIETS: Record<string, string> = { '1': 'Végan', '2': 'Végétarien', '3': 'Sans gluten', '4': 'Halal', '5': 'Casher' };



type Restaurant = Database['public']['Tables']['restaurants']['Row'] & { image_url?: string | null, reviews?: { rating: number | null }[] | null };

export default function TripSearchScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Trip context
    const currentStepId = params.currentStep as string;
    const tripPlanJson = params.tripPlan as string;
    const tripPlan: string[] = tripPlanJson ? JSON.parse(tripPlanJson) : [];

    // Store selected restaurants for each step: { stepId: restaurantId }
    const tripSelectionJson = params.tripSelection as string;
    const tripSelection: Record<string, string> = tripSelectionJson ? JSON.parse(tripSelectionJson) : {};

    // Modif context
    const existingTripId = params.existingTripId as string;
    const stepRowId = params.stepRowId as string;

    const stepLabel = MEAL_TYPES[currentStepId] || 'Étape inconnue';
    const stepIndex = tripPlan.indexOf(currentStepId);
    const totalSteps = tripPlan.length;

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [locations, setLocations] = useState<string[]>([]);
    const [budgetRange, setBudgetRange] = useState([0, 60]);
    const [radiusRange, setRadiusRange] = useState([0, 20]);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [selectedAmbiance, setSelectedAmbiance] = useState<string[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
    const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([currentStepId]);

    // Sync selectedMealTypes when step changes
    useEffect(() => {
        setSelectedMealTypes([currentStepId]);
    }, [currentStepId]);

    const [results, setResults] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);

    const [headerHeight, setHeaderHeight] = useState(0);
    const [resultsY, setResultsY] = useState(0);
    const scrollRef = React.useRef<ScrollView>(null);

    // Fetch restaurants
    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            try {
                let query = supabase.from('restaurants').select('*, reviews(rating)');

                if (searchQuery) {
                    query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
                }
                if (locations.length > 0) {
                    query = query.in('city', locations);
                }
                if (selectedCuisines.length > 0) {
                    const cuisines = selectedCuisines.map(id => CUISINES[id]).filter(Boolean);
                    query = query.overlaps('food_types', cuisines);
                }

                // Always filter by the required meal type for this step
                // use "currentStepId" directly to ensure we filter for THIS meal
                if (MEAL_TYPES[currentStepId]) {
                    query = query.contains('meal_types', [MEAL_TYPES[currentStepId]]);
                }

                if (selectedServices.length > 0) {
                    const services = selectedServices.map(id => SERVICES[id]).filter(Boolean);
                    query = query.overlaps('services', services);
                }
                if (selectedAmbiance.length > 0) {
                    const ambiances = selectedAmbiance.map(id => AMBIANCES[id]).filter(Boolean);
                    query = query.overlaps('atmospheres', ambiances);
                }
                if (selectedDiets.length > 0) {
                    const diets = selectedDiets.map(id => DIETS[id]).filter(Boolean);
                    query = query.overlaps('dietary_prefs', diets);
                }

                if (budgetRange[1] < 20) query = query.lte('budget_level', 1);
                else if (budgetRange[1] < 40) query = query.lte('budget_level', 2);
                else if (budgetRange[1] < 70) query = query.lte('budget_level', 3);

                const { data, error } = await query;
                if (error) console.error('Error fetching restaurants:', error);
                else setResults(data || []);

            } catch (err) {
                console.error('Error in fetch:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRestaurants();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, locations, budgetRange, selectedCuisines, selectedServices, selectedAmbiance, selectedDiets, currentStepId]);


    // Toggle functions
    const addLocation = () => { if (!locations.includes('Toulon')) setLocations([...locations, 'Toulon']); };
    const removeLocation = (loc: string) => setLocations(locations.filter(l => l !== loc));
    const toggleCuisine = (id: string) => setSelectedCuisines((prev: string[]) => prev.includes(id) ? prev.filter((c: string) => c !== id) : [...prev, id]);
    const toggleAmbiance = (id: string) => setSelectedAmbiance((prev: string[]) => prev.includes(id) ? prev.filter((c: string) => c !== id) : [...prev, id]);
    const toggleService = (id: string) => setSelectedServices((prev: string[]) => prev.includes(id) ? prev.filter((c: string) => c !== id) : [...prev, id]);
    const toggleDiet = (id: string) => setSelectedDiets((prev: string[]) => prev.includes(id) ? prev.filter((c: string) => c !== id) : [...prev, id]);

    // NO toggleMealType - it's fixed for the trip step

    const handleSelectRestaurant = (restaurantId: string) => {
        // Add selection
        const newSelection = { ...tripSelection, [currentStepId]: restaurantId };

        // Determine next step
        const nextStepIndex = stepIndex + 1;

        if (existingTripId && stepRowId) {
            // UPDATE MODE: Update single step
            updateTripStep(restaurantId);
        } else if (nextStepIndex < tripPlan.length) {
            // ... (existing logic) ...
            // Go to next step
            const nextStepId = tripPlan[nextStepIndex];
            router.push({
                pathname: '/create-trip/search',
                params: {
                    currentStep: nextStepId,
                    tripPlan: JSON.stringify(tripPlan),
                    tripSelection: JSON.stringify(newSelection),
                    tripName: params.tripName as string
                }
            });
        } else {
            // Finish - Save to Database
            saveTrip(newSelection);
        }
    };

    const updateTripStep = async (restaurantId: string) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('trip_steps')
                .update({ restaurant_id: restaurantId } as any)
                .eq('id', stepRowId);

            if (error) throw error;
            router.replace(`/trip/${existingTripId}`);
        } catch (error) {
            console.error('Error updating step:', error);
            alert("Erreur lors de la modification de l'étape.");
        } finally {
            setLoading(false);
        }
    };

    const saveTrip = async (finalSelection: Record<string, string>) => {
        // ... (rest of function) ...
        setLoading(true);
        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Vous devez être connecté pour sauvegarder un parcours.');
                return;
            }

            // 2. Create Trip
            const tripName = params.tripName as string || 'Mon Parcours Gourmand';
            const { data: tripData, error: tripError } = await supabase
                .from('trips')
                .insert({
                    user_id: user.id,
                    name: tripName,
                    status: 'published'
                } as any)
                .select()
                .single();

            if (tripError || !tripData) {
                console.error('Error creating trip:', tripError);
                throw tripError;
            }

            // 3. Create Trip Steps
            // Convert selection object to array for insertion
            // tripPlan is ordered [step1, step2, step3...]
            const stepsToInsert = tripPlan.map((stepId, index) => ({
                trip_id: (tripData as any).id,
                restaurant_id: finalSelection[stepId],
                step_order: index + 1,
                meal_type: MEAL_TYPES[stepId]
            }));

            const { error: stepsError } = await supabase
                .from('trip_steps')
                .insert(stepsToInsert as any);

            if (stepsError) {
                console.error('Error creating steps:', stepsError);
                throw stepsError;
            }

            // Success
            // Redirect directly to the new trip page
            router.replace(`/trip/${(tripData as any).id}`);

        } catch (error) {
            console.error('Error saving trip:', error);
            alert('Une erreur est survenue lors de la sauvegarde du parcours.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Fixed Back Button */}
            <BackButton style={styles.fixedBackButton} />

            <ScrollView
                ref={scrollRef}
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header */}
                <LinearGradient
                    colors={['#E3E0CF', '#FFFCF5']}
                    style={styles.header}
                    onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
                >
                    <View style={{ width: 40 }} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Étape {stepIndex + 1}/{totalSteps}</Text>
                        <Text style={styles.headerSubtitle}>{stepLabel}</Text>
                    </View>
                </LinearGradient>

                <View style={styles.content}>

                    {/* Location Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Région / Département / Ville</Text>
                        <View style={styles.filterOptions}>
                            {locations.map((location) => (
                                <TouchableOpacity key={location} style={[styles.chip, styles.chipActive]} onPress={() => removeLocation(location)}>
                                    <Text style={[styles.chipText, styles.chipTextActive]}>{location}</Text>
                                    <Ionicons name="close" size={20} color="#FFF" />
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={[styles.chip, styles.chipAdd]} onPress={addLocation}>
                                <Ionicons name="add" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Filters Section */}
                    <View style={styles.filtersSection}>

                        {/* Meal Type - DISABLED/READONLY */}


                        {/* Budget Filter */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Budget</Text>
                            <View style={styles.sliderContainer}>
                                <Slider
                                    value={budgetRange}
                                    onValueChange={(val) => setBudgetRange(val as number[])}
                                    minimumValue={0}
                                    maximumValue={200}
                                    step={1}
                                    containerStyle={{
                                        width: 300,
                                        height: 40,
                                    }}
                                    trackStyle={{
                                        height: 5,
                                        borderRadius: 2.5,
                                    }}
                                    minimumTrackTintColor="#DC4928"
                                    maximumTrackTintColor="#E0E0E0"
                                    thumbStyle={{
                                        height: 24,
                                        width: 24,
                                        borderRadius: 12,
                                        backgroundColor: '#DC4928',
                                    }}
                                    thumbTouchSize={{
                                        width: 40,
                                        height: 40,
                                    }}
                                />
                                <View style={styles.sliderLabels}>
                                    <Text style={styles.sliderLabelText}>{budgetRange[0]}€</Text>
                                    <Text style={styles.sliderLabelText}>{budgetRange[1]}€</Text>
                                </View>
                            </View>
                        </View>

                        {/* Cuisine Filter */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Types de plats</Text>
                            <FlatList
                                horizontal showsHorizontalScrollIndicator={false}
                                data={[
                                    { id: '1', name: 'Italien', icon: 'pizza' },
                                    { id: '2', name: 'Japonais', icon: 'rice' },
                                    { id: '3', name: 'Indien', icon: 'bowl-mix' },
                                    { id: '4', name: 'Libanais', icon: 'food-apple' },
                                ]}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ gap: 12 }}
                                extraData={selectedCuisines}
                                renderItem={({ item }) => {
                                    const isSelected = selectedCuisines.includes(item.id);
                                    return (
                                        <TouchableOpacity
                                            style={[styles.cuisineCard, isSelected && styles.cuisineCardSelected]}
                                            onPress={() => toggleCuisine(item.id)}
                                        >
                                            <MaterialCommunityIcons name={item.icon as any} size={32} color={isSelected ? '#FFF' : '#CCC'} />
                                            <Text style={[styles.cuisineCardText, isSelected && styles.cuisineCardTextSelected]}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        {/* Distance Filter */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Distance</Text>
                            <View style={styles.sliderContainer}>
                                <Slider
                                    value={radiusRange}
                                    onValueChange={(val) => setRadiusRange(val as number[])}
                                    minimumValue={0}
                                    maximumValue={50}
                                    step={1}
                                    containerStyle={{
                                        width: 300,
                                        height: 40,
                                    }}
                                    trackStyle={{
                                        height: 5,
                                        borderRadius: 2.5,
                                    }}
                                    minimumTrackTintColor="#DC4928"
                                    maximumTrackTintColor="#E0E0E0"
                                    thumbStyle={{
                                        height: 24,
                                        width: 24,
                                        borderRadius: 12,
                                        backgroundColor: '#DC4928',
                                    }}
                                    thumbTouchSize={{
                                        width: 40,
                                        height: 40,
                                    }}
                                />
                                <View style={styles.sliderLabels}>
                                    <Text style={styles.sliderLabelText}>{radiusRange[0]} km</Text>
                                    <Text style={styles.sliderLabelText}>{radiusRange[1]} km</Text>
                                </View>
                            </View>
                        </View>

                        {/* Diets */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Régimes & pref</Text>
                            <FlatList
                                horizontal showsHorizontalScrollIndicator={false}
                                data={[
                                    { id: '1', name: 'Végan', icon: 'sprout' },
                                    { id: '2', name: 'Végétarien', icon: 'leaf' },
                                    { id: '3', name: 'Sans gluten', icon: 'corn' },
                                    { id: '4', name: 'Halal', icon: 'food-halal' },
                                    { id: '5', name: 'Casher', icon: 'food' },
                                ]}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ gap: 12 }}
                                extraData={selectedDiets}
                                renderItem={({ item }) => {
                                    const isSelected = selectedDiets.includes(item.id);
                                    return (
                                        <TouchableOpacity
                                            style={[styles.cuisineCard, isSelected && styles.cuisineCardSelected]}
                                            onPress={() => toggleDiet(item.id)}
                                        >
                                            <MaterialCommunityIcons name={item.icon as any} size={32} color={isSelected ? '#FFF' : '#CCC'} />
                                            <Text style={[styles.cuisineCardText, isSelected && styles.cuisineCardTextSelected]}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        {/* Services */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Types de services</Text>
                            <FlatList
                                horizontal showsHorizontalScrollIndicator={false}
                                data={[
                                    { id: '1', name: 'Sur place', icon: 'silverware-fork-knife' },
                                    { id: '2', name: 'À emporter', icon: 'shopping' },
                                    { id: '3', name: 'Livraison', icon: 'moped' },
                                    { id: '4', name: 'Click & Collect', icon: 'store' },
                                ]}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ gap: 12 }}
                                extraData={selectedServices}
                                renderItem={({ item }) => {
                                    const isSelected = selectedServices.includes(item.id);
                                    return (
                                        <TouchableOpacity
                                            style={[styles.cuisineCard, isSelected && styles.cuisineCardSelected]}
                                            onPress={() => toggleService(item.id)}
                                        >
                                            <MaterialCommunityIcons name={item.icon as any} size={32} color={isSelected ? '#FFF' : '#CCC'} />
                                            <Text style={[styles.cuisineCardText, isSelected && styles.cuisineCardTextSelected]}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        {/* Ambiance */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Expérience & ambiance</Text>
                            <FlatList
                                horizontal showsHorizontalScrollIndicator={false}
                                data={[
                                    { id: '1', name: 'Romantique', icon: 'heart' },
                                    { id: '2', name: 'Familial', icon: 'account-group' },
                                    { id: '3', name: 'Conviviale', icon: 'glass-cocktail' },
                                    { id: '4', name: 'Animé', icon: 'party-popper' },
                                    { id: '5', name: 'Calme', icon: 'leaf' },
                                ]}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ gap: 12 }}
                                extraData={selectedAmbiance}
                                renderItem={({ item }) => {
                                    const isSelected = selectedAmbiance.includes(item.id);
                                    return (
                                        <TouchableOpacity
                                            style={[styles.cuisineCard, isSelected && styles.cuisineCardSelected]}
                                            onPress={() => toggleAmbiance(item.id)}
                                        >
                                            <MaterialCommunityIcons name={item.icon as any} size={32} color={isSelected ? '#FFF' : '#CCC'} />
                                            <Text style={[styles.cuisineCardText, isSelected && styles.cuisineCardTextSelected]}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                    </View>

                    {/* Results List */}
                    <View
                        style={styles.resultsContainer}
                        onLayout={(event) => {
                            setResultsY(event.nativeEvent.layout.y);
                        }}
                    >
                        <Text style={styles.sectionTitle}>
                            {loading ? 'Chargement...' : `${results.length} résultat(s)`}
                        </Text>

                        {results.length > 0 ? (
                            results.map((restaurant) => (
                                <SearchRestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    onPress={() => handleSelectRestaurant(restaurant.id)}
                                />
                            ))
                        ) : (
                            !loading && (
                                <View style={styles.resultsPlaceholder}>
                                    <Ionicons name="restaurant-outline" size={48} color="#CCC" />
                                    <Text style={styles.placeholderText}>
                                        Aucun résultat pour cette étape.
                                    </Text>
                                </View>
                            )
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Result Button */}
            {results.length > 0 && (
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => {
                        scrollRef.current?.scrollTo({ y: resultsY + headerHeight, animated: true });
                    }}
                    activeOpacity={0.9}
                >
                    <Text style={styles.floatingButtonText}>
                        Voir les choix ({results.length})
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF5',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },

    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: '#666',
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    content: {
        padding: 20,
    },
    placeholderContainer: {
        alignItems: 'center',
        gap: 16,
    },
    placeholderText: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: '#999',
        marginTop: 12,
        textAlign: 'center',
    },

    // Chip Styles
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 8,
    },
    chipActive: {
        backgroundColor: '#DC4928',
        borderColor: '#DC4928',
    },
    chipAdd: {
        backgroundColor: '#FFF',
        borderColor: '#E0E0E0',
        paddingHorizontal: 12,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipText: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: '#666',
    },
    chipTextActive: {
        color: '#FFF',
    },

    // Slider Styles
    sliderContainer: {
        alignItems: 'flex-start',
        paddingLeft: 10,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 300, // Match slider length
        marginTop: 10,
    },
    sliderLabelText: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: '#1A1A1A',
    },

    // Cuisine Card Styles
    cuisineCard: {
        width: 100,
        height: 100,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cuisineCardText: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: '#666',
        textAlign: 'center',
    },
    cuisineCardSelected: {
        backgroundColor: '#DC4928',
        borderColor: '#DC4928',
    },
    cuisineCardTextSelected: {
        color: '#FFF',
    },

    // Results Styles
    resultsContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 16,
    },
    resultsPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    // Floating Button
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#DC4928',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fixedBackButton: {
        position: 'absolute',
        top: 60, // Match header paddingTop
        left: 20, // Match header paddingHorizontal
        zIndex: 100,
        elevation: 10,
    },
    floatingButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: Fonts.bold,
    },

    // Filters
    filtersSection: {
        marginBottom: 24,
    },
    filterGroup: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 8,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
});
