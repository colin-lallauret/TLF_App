import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';

export default function MessageScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
                <Text style={styles.subtitle}>Vos conversations</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        📬
                    </Text>
                    <Text style={styles.placeholderText}>
                        Aucune conversation pour le moment
                    </Text>
                    <Text style={[styles.placeholderText, { marginTop: 10, fontSize: 12 }]}>
                        Commencez à échanger avec les contributeurs locaux
                    </Text>
                </View>

                <Text style={styles.infoText}>
                    💡 Les conversations avec indicateur de messages non lus apparaîtront ici avec une pastille verte
                </Text>
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
    placeholder: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    placeholderText: {
        color: Colors.light.icon,
        fontSize: 16,
        textAlign: 'center',
    },
    infoText: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        color: Colors.light.text,
        fontSize: 13,
        lineHeight: 20,
    },
});
