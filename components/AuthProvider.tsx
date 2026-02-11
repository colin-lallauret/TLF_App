import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const pathname = usePathname();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (loading || isNavigating) return;

        const inAuthGroup = segments[0] === 'auth';
        const inTabsGroup = segments[0] === '(tabs)';

        // Cas 1 : Utilisateur NON connecté
        if (!user) {
            // Si l'utilisateur n'est pas sur la page d'authentification, le rediriger
            if (!inAuthGroup) {
                setIsNavigating(true);
                router.replace('/auth');
                setTimeout(() => setIsNavigating(false), 100);
            }
        }
        // Cas 2 : Utilisateur CONNECTÉ
        else {
            // Si l'utilisateur est sur la page d'authentification, le rediriger vers l'app
            if (inAuthGroup) {
                setIsNavigating(true);
                router.replace('/(tabs)/explorer');
                setTimeout(() => setIsNavigating(false), 100);
            }
            // Si l'utilisateur est sur la racine '/', le rediriger vers l'app
            else if (pathname === '/') {
                setIsNavigating(true);
                router.replace('/(tabs)/explorer');
                setTimeout(() => setIsNavigating(false), 100);
            }
        }
    }, [user, loading, segments, pathname, isNavigating]);

    // Afficher le loader pendant le chargement initial
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.beige,
    },
});
