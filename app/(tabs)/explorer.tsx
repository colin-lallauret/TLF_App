import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ExplorerScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explorer</Text>
                <Text style={styles.subtitle}>Découvrez les adresses locales</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Locaux à la une</Text>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Liste horizontale des contributeurs locaux
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Adresses populaires</Text>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Liste des restaurants recommandés
                    </Text>
                </View>

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
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginTop: 20,
        marginBottom: 12,
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
