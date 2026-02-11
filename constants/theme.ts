/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// TravelLocalFood Brand Colors
const brandBlack = '#141414';
const brandOrange = '#DC4928';
const brandCream = '#FFFCEB';
const brandGreen = '#00661D';

export const Colors = {
  light: {
    text: brandBlack,
    background: brandCream,
    tint: brandOrange,
    icon: '#666666',
    tabIconDefault: '#999999',
    tabIconSelected: brandOrange,
    primary: brandOrange,
    secondary: brandGreen,
    beige: brandCream,
    // Semantic colors
    success: brandGreen,
    error: '#D32F2F',
    warning: '#FBC02D',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718', // Ou brandBlack si on veut un dark mode très contrasté
    tint: brandOrange,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: brandOrange,
    primary: brandOrange,
    secondary: brandGreen,
    beige: brandBlack, // En dark mode, le beige devient noir/sombre
  },
};

export const Fonts = {
  regular: 'Fustat_400Regular',
  medium: 'Fustat_500Medium',
  semiBold: 'Fustat_600SemiBold',
  bold: 'Fustat_700Bold',
};
