import { Colors, Fonts } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TripMapProps {
    steps: any[];
}

export const TripMap = ({ steps }: TripMapProps) => {
    // Filter steps that have valid restaurant coordinates
    const validSteps = steps.filter(step =>
        step.restaurants && step.restaurants.lat && step.restaurants.lng
    );

    if (validSteps.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Carte du parcours</Text>
            <View style={styles.webFallback}>
                <Text style={styles.webFallbackTitle}>Carte indisponible sur le web</Text>
                <Text style={styles.webFallbackSubtitle}>
                    Consultez l'application mobile pour visualiser le parcours interactif de ces {validSteps.length} étapes.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 20,
        width: '100%',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        marginBottom: 10,
        color: Colors.light.text,
    },
    webFallback: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    webFallbackTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    webFallbackSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
