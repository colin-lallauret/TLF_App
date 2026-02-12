import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RestaurantMapProps {
    restaurants: any[];
}

export const RestaurantMap = ({ restaurants }: RestaurantMapProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Carte indisponible sur la version web.
            </Text>
            <Text style={styles.subtext}>
                Veuillez utiliser l'application mobile pour la carte interactive.
            </Text>
            <Text style={styles.subtextCount}>
                ({restaurants.length} restaurants trouvés)
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 500,
        width: '100%',
        borderRadius: 15,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    text: {
        color: Colors.light.text,
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
    },
    subtext: {
        color: Colors.light.icon,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    subtextCount: {
        color: Colors.light.primary,
        fontSize: 12,
        marginTop: 5,
        fontWeight: 'bold',
    },
});
