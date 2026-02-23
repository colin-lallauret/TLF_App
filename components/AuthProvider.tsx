import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const pathname = usePathname();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            const value = await AsyncStorage.getItem('hasSeenOnboarding');
            setHasSeenOnboarding(value === 'true');
        };
        checkOnboarding();
    }, [pathname]);

    useEffect(() => {
        if (loading || isNavigating || hasSeenOnboarding === null) return;

        const inAuthGroup = segments[0] === 'auth';
        const inTabsGroup = segments[0] === '(tabs)';

        // Cas 1 : Utilisateur NON connecté
        if (!user) {
            // Si l'utilisateur n'a pas vu l'onboarding, le rediriger
            if (!hasSeenOnboarding && pathname !== '/onboarding') {
                setIsNavigating(true);
                router.replace('/onboarding');
                setTimeout(() => setIsNavigating(false), 100);
            }
            // S'il l'a vu et n'est pas sur auth, on le redirige vers auth
            else if (hasSeenOnboarding && !inAuthGroup && pathname !== '/onboarding') {
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
            else if (pathname === '/' || pathname === '/onboarding') {
                setIsNavigating(true);
                router.replace('/(tabs)/explorer');
                setTimeout(() => setIsNavigating(false), 100);
            }
        }
    }, [user, loading, segments, pathname, isNavigating, hasSeenOnboarding]);

    // Afficher le loader pendant le chargement initial
    if (loading || hasSeenOnboarding === null) {
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
