import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';

export default function DecouvrirScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Découvrir</Text>
                <Text style={styles.subtitle}>Filtrez et trouvez votre prochaine adresse</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Budget</Text>
                <View style={styles.filterBox}>
                    <Text style={styles.placeholderText}>
                        Slider de budget (0-60€)
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Distance</Text>
                <View style={styles.filterBox}>
                    <Text style={styles.placeholderText}>
                        Slider de distance (0-100km)
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Catégories</Text>
                <View style={styles.filterBox}>
                    <Text style={styles.placeholderText}>
                        Boutons de catégories avec icônes
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Type de cuisine</Text>
                <View style={styles.filterBox}>
                    <Text style={styles.placeholderText}>
                        Filtres de type de nourriture
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Préférences alimentaires</Text>
                <View style={styles.filterBox}>
                    <Text style={styles.placeholderText}>
                        Végétarien, Vegan, Sans gluten, etc.
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
        backgroundColor: Colors.light.secondary,
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
    filterBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.secondary,
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: Colors.light.icon,
        fontSize: 14,
        textAlign: 'center',
    },
});
