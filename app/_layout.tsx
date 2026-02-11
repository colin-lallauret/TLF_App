import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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
          <Stack>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
