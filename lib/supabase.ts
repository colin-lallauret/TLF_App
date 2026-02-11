import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// ⚠️ IMPORTANT: Remplacez ces valeurs par vos propres credentials Supabase
// Vous pouvez les trouver dans votre projet Supabase > Settings > API
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Création du client Supabase avec typage
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // Configuration pour React Native
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
