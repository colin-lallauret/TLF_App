import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useSouvenirs } from '@/hooks/useSouvenirs';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AddSouvenirScreen() {
    const { profile } = useAuth();
    const router = useRouter();
    const { searchRestaurants, addSouvenir, uploading } = useSouvenirs();

    // États du formulaire
    const [step, setStep] = useState(1); // 1: Choix Resto, 2: Détails
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(5);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const [searching, setSearching] = useState(false);

    const isMember = profile?.subscription_end_date
        ? new Date(profile.subscription_end_date) > new Date()
        : false;

    const handleSubscribe = () => {
        router.push('/(tabs)/profile');
    };

    // Recherche de restaurants (debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                const results = await searchRestaurants(searchQuery);
                setSearchResults(results);
                setSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectRestaurant = (resto: any) => {
        setSelectedRestaurant(resto);
        setStep(2);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à votre caméra.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Erreur', 'Veuillez donner un titre à votre souvenir.');
            return;
        }

        try {
            await addSouvenir({
                title,
                description,
                rating,
                restaurant_id: selectedRestaurant.id,
                date,
                photos
            });
            Alert.alert('Succès', 'Votre souvenir a été ajouté !');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', "Une erreur est survenue lors de l'enregistrement.");
        }
    };

    const renderRestaurantItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.restaurantItem} onPress={() => handleSelectRestaurant(item)} disabled={!isMember}>
            <Ionicons name="restaurant-outline" size={24} color={Colors.light.primary} />
            <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantCity}>{item.city}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Ajouter un souvenir', headerBackTitle: 'Retour' }} />

            {step === 1 ? (
                <View style={styles.stepContainer}>
                    <Text style={styles.label}>Quel restaurant avez-vous visité ?</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un restaurant..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        editable={isMember}
                    />
                    {searching && <ActivityIndicator style={{ marginTop: 20 }} color={Colors.light.primary} />}
                    <FlatList
                        data={searchResults}
                        renderItem={renderRestaurantItem}
                        keyExtractor={(item) => item.id}
                        style={styles.resultsList}
                        ListEmptyComponent={
                            searchQuery.length >= 2 && !searching ? (
                                <Text style={styles.emptyText}>Aucun restaurant trouvé.</Text>
                            ) : null
                        }
                    />
                </View>
            ) : (
                <ScrollView style={styles.stepContainer}>
                    <View style={styles.selectedRestaurant}>
                        <Ionicons name="restaurant" size={20} color="#fff" />
                        <Text style={styles.selectedRestaurantText}>{selectedRestaurant.name}</Text>
                        <TouchableOpacity onPress={() => setStep(1)}>
                            <Text style={styles.changeText}>Changer</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Titre du souvenir</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Dîner romantique..."
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Note ({rating}/5)</Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Image
                                    source={star <= rating ? require('@/assets/icons/star_full.png') : require('@/assets/icons/star_empty.png')}
                                    style={{ width: 26, height: 26 }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Racontez votre expérience..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>Date</Text>
                    {Platform.OS === 'ios' ? (
                        <View style={styles.datePickerContainer}>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    const currentDate = selectedDate || date;
                                    setDate(currentDate);
                                }}
                                maximumDate={new Date()}
                            />
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                                <Text>{date.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) {
                                            setDate(selectedDate);
                                        }
                                    }}
                                    maximumDate={new Date()}
                                />
                            )}
                        </>
                    )}

                    <Text style={styles.label}>Photos</Text>
                    <View style={styles.photosContainer}>
                        {photos.map((uri, index) => (
                            <Image key={index} source={{ uri }} style={styles.photoThumb} />
                        ))}
                        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                            <Ionicons name="images-outline" size={24} color={Colors.light.primary} />
                            <Text style={styles.addPhotoText}>Galerie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={24} color={Colors.light.primary} />
                            <Text style={styles.addPhotoText}>Caméra</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, uploading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Enregistrer le souvenir</Text>
                        )}
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {!isMember && (
                <View style={styles.overlay}>
                    <View style={styles.alertBox}>
                        <Text style={styles.alertTitle}>Module Souvenirs</Text>
                        <Text style={styles.alertMessage}>
                            L'enregistrement de souvenirs est réservé aux membres. Devenez membre pour accéder à cette fonctionnalité.
                        </Text>
                        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                            <Text style={styles.subscribeButtonText}>Choisir mon abonnement</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffcf5',
    },
    stepContainer: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
        marginTop: 10,
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 10,
    },
    resultsList: {
        flex: 1,
    },
    restaurantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    restaurantInfo: {
        flex: 1,
        marginLeft: 15,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    restaurantCity: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
    },
    selectedRestaurant: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    selectedRestaurantText: {
        flex: 1,
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    changeText: {
        color: '#fff',
        textDecorationLine: 'underline',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    dateButton: {
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 30,
    },
    photoThumb: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    addPhotoButton: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotoText: {
        fontSize: 10,
        color: Colors.light.primary,
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: Colors.light.primary,
        padding: 16,
        borderRadius: 25,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    datePickerContainer: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 2000,
    },
    alertBox: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    subscribeButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    subscribeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
