import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';

export default function FavorisScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Favoris</Text>
                <Text style={styles.subtitle}>Vos adresses et contributeurs préférés</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Restaurants favoris</Text>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Vos restaurants sauvegardés apparaîtront ici
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Contributeurs favoris</Text>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Vos contributeurs suivis apparaîtront ici
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
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: Colors.light.icon,
        fontSize: 14,
        textAlign: 'center',
    },
});
