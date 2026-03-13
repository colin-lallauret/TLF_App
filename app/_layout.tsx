import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Platform, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts, Fustat_400Regular, Fustat_500Medium, Fustat_600SemiBold, Fustat_700Bold } from '@expo-google-fonts/fustat';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/components/AuthProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { FavoritesProvider } from '@/context/FavoritesContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Fustat_400Regular,
    Fustat_500Medium,
    Fustat_600SemiBold,
    Fustat_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <FavoritesProvider>
          <View style={[styles.root, Platform.OS === 'web' && styles.rootWeb, Platform.OS === 'web' && { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f0f2f5' }]}>
            <View style={[styles.container, Platform.OS === 'web' && styles.containerWeb]}>
              <Stack>
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="subscription" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
            </View>
          </View>
          <StatusBar style="auto" />
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootWeb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  containerWeb: {
    maxWidth: 480,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});
