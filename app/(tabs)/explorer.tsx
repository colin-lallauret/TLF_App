import { FeaturedContributors } from '@/components/FeaturedContributors';
import { FeaturedRestaurants } from '@/components/FeaturedRestaurants';
import { Colors } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExplorerScreen() {
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
                <View style={[styles.placeholder, styles.mapPlaceholder]}>
                    <Text style={styles.placeholderText}>
                        Carte avec marqueurs personnalisés
                    </Text>
                </View>
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
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
        textAlign: 'center',
    },
});
