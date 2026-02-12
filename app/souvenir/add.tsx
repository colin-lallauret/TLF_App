import { Colors } from '@/constants/theme'; // Assurez-vous que ce chemin est correct
import { useSouvenirs } from '@/hooks/useSouvenirs';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir @expo/vector-icons
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AddSouvenirScreen() {
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
    const [photos, setPhotos] = useState<string[]>([]);
    const [searching, setSearching] = useState(false);

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
        // Demander la permission
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
        <TouchableOpacity style={styles.restaurantItem} onPress={() => handleSelectRestaurant(item)}>
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
                                    source={star <= rating ? require('@/assets/icons/star_full.svg') : require('@/assets/icons/star_empty.svg')}
                                    style={{ width: 32, height: 32 }}
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
                    {/* Simple Date Select for MVP */}
                    <TouchableOpacity style={styles.dateButton} onPress={() => Alert.alert('Info', 'Sélecteur de date simplifié pour la démo (Aujourd\'hui)')}>
                        <Text>{date.toLocaleDateString()}</Text>
                    </TouchableOpacity>

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
});
