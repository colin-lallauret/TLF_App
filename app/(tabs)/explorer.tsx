import { FeaturedContributors } from '@/components/FeaturedContributors';
import { FeaturedRestaurants } from '@/components/FeaturedRestaurants';
import { RestaurantMap } from '@/components/RestaurantMap';
import { SearchBar } from '@/components/SearchBar';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExplorerScreen() {
    const [mapRestaurants, setMapRestaurants] = useState<any[]>([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const { data } = await supabase
                    .from('restaurants')
                    .select('id, name, lat, lng, city, food_types')
                    .not('lat', 'is', null)
                    .not('lng', 'is', null)
                    .limit(50);

                if (data) setMapRestaurants(data);
            } catch (error) {
                console.error('Error fetching map restaurants:', error);
            }
        };
        fetchRestaurants();
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <LinearGradient
                colors={['#E3E0CF', '#FFFCF5']}
                style={styles.header}
            >
                <View style={styles.searchContainer}>
                    <SearchBar />
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {/* Section Locaux à la Une */}
                <FeaturedContributors />

                {/* Section Adresses Populaires */}
                <FeaturedRestaurants />

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Carte interactive</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.light.text} />
                </View>

                {mapRestaurants.length > 0 ? (
                    <View style={styles.mapContainer}>
                        <RestaurantMap restaurants={mapRestaurants} />
                    </View>
                ) : (
                    <View style={[styles.placeholder, styles.mapPlaceholder]}>
                        <Text style={styles.placeholderText}>
                            Chargement de la carte...
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF5', // Cream background
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        paddingTop: 60,
        // backgroundColor removed to let gradient show
        zIndex: 10,
        paddingBottom: 10,
    },
    searchContainer: {
        marginTop: 0,
    },
    content: {
        paddingBottom: 20,
        zIndex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        gap: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
    },
    placeholder: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
        marginHorizontal: 20,
    },
    mapPlaceholder: {
        height: 300,
    },
    placeholderText: {
        color: Colors.light.icon,
        fontSize: 14,
        fontFamily: Fonts.medium,
        textAlign: 'center',
    },
    mapContainer: {
        height: 300,
        marginBottom: 20,
        overflow: 'hidden',
        borderRadius: 20, // Added border radius
    },
});
