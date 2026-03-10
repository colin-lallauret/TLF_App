import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚠️ IMPORTANT: Remplacez ces valeurs par vos propres credentials Supabase
// Vous pouvez les trouver dans votre projet Supabase > Settings > API
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Adaptateur de stockage compatible SSR (Node.js) + Browser
// AsyncStorage crash sur le web pendant le SSR car `window` n'existe pas encore côté Node.
// On crée un adaptateur qui se rabat sur localStorage uniquement dans le navigateur,
// et retourne null silencieusement pendant le SSR.
const WebStorageAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
    },
};

// // Création du client Supabase avec typage
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // Sur le web : adaptateur localStorage SSR-safe
        // Sur native (iOS/Android) : AsyncStorage
        storage: Platform.OS === 'web' ? WebStorageAdapter : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // Bypasser navigator.locks sur Web évite les plantages en dev (React Strict Mode / hot reload).
        // LockFunc signature: (name, acquireTimeout, fn) => fn()
        ...(Platform.OS === 'web' && {
            lock: (name: string, acquireTimeout: number, fn: () => Promise<any>) => fn(),
        }),
    },
});
