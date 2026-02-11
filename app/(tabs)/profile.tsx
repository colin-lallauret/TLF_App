import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>👤</Text>
                </View>
                <Text style={styles.userName}>Nom d'utilisateur</Text>
                <Text style={styles.userBio}>Voyageur passionné</Text>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badge}>TLF+</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Souvenirs</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Favoris</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Visites</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Ajouter un souvenir</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Mes souvenirs</Text>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Vos souvenirs de voyage apparaîtront ici
                    </Text>
                    <Text style={[styles.placeholderText, { marginTop: 10, fontSize: 12 }]}>
                        Photos, notes et carnets de voyage
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
        paddingBottom: 30,
        backgroundColor: Colors.light.primary,
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 50,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    userBio: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    badgeContainer: {
        marginTop: 10,
    },
    badge: {
        backgroundColor: '#FFD700',
        color: Colors.light.text,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        fontWeight: 'bold',
        fontSize: 12,
    },
    content: {
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.icon,
        marginTop: 5,
    },
    addButton: {
        backgroundColor: Colors.light.secondary,
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginTop: 10,
        marginBottom: 12,
    },
    placeholder: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: Colors.light.icon,
        fontSize: 14,
        textAlign: 'center',
    },
});
