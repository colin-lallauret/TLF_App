import { FeaturedContributors } from '@/components/FeaturedContributors';
import { FeaturedRestaurants } from '@/components/FeaturedRestaurants';
import { RestaurantMap } from '@/components/RestaurantMap';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explorer</Text>
                <Text style={styles.subtitle}>Découvrez les adresses locales</Text>
            </View>

            <View style={styles.content}>
                {/* Section Locaux à la Une */}
                <FeaturedContributors />

                {/* Section Adresses Populaires */}
                <FeaturedRestaurants />

                <Text style={styles.sectionTitle}>Carte interactive</Text>
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
        backgroundColor: Colors.light.beige,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: Colors.light.primary,
    },
    title: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
        marginTop: 20,
        marginBottom: 12,
        paddingHorizontal: 20,
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
        height: 350,
        marginHorizontal: 20,
        marginBottom: 20,
    },
});
