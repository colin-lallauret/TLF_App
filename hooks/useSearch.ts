import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useCallback, useEffect, useState } from 'react';

type Restaurant = Pick<Database['public']['Tables']['restaurants']['Row'], 'id' | 'name' | 'city'> & { type: 'restaurant', image_url: string };
type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'username' | 'avatar_url' | 'city'> & { type: 'profile' };

export type SearchResult = Restaurant | Profile;

// Mapping des images par type de cuisine (Placeholders de qualité)
const CUISINE_IMAGES: Record<string, string> = {
    'Italien': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000',
    'Japonais': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    'Français': 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000',
    'Méditerranéen': 'https://images.unsplash.com/photo-1523986395389-c8a8ddc52971?q=80&w=1000',
    'Asiatique': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
    'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000',
    'Indien': 'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=1000',
    'Mexicain': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=1000',
    'Végétarien': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000',
    'Default': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000',
};

const getImageForCuisine = (foodTypes: string[] | null): string => {
    if (!foodTypes || foodTypes.length === 0) return CUISINE_IMAGES['Default'];
    for (const type of foodTypes) {
        const key = Object.keys(CUISINE_IMAGES).find(k => k.toLowerCase() === type.trim().toLowerCase());
        if (key) return CUISINE_IMAGES[key];
    }
    return CUISINE_IMAGES['Default'];
};

export function useSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Search restaurants
            const { data: restaurantsData, error: restaurantError } = await supabase
                .from('restaurants')
                .select('id, name, city, food_types')
                .ilike('name', `%${searchQuery}%`)
                .limit(5);

            if (restaurantError) throw restaurantError;

            // Search profiles (contributors)
            const { data: profilesData, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url, city')
                .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
                .limit(5);

            if (profileError) throw profileError;

            const restaurantResults: SearchResult[] = (restaurantsData || []).map((r: any) => ({
                id: r.id,
                name: r.name,
                city: r.city,
                type: 'restaurant' as const,
                image_url: getImageForCuisine(r.food_types)
            }));

            const profileResults: SearchResult[] = (profilesData || []).map((p: any) => ({
                id: p.id,
                full_name: p.full_name,
                username: p.username,
                avatar_url: p.avatar_url,
                city: p.city,
                type: 'profile' as const
            }));

            setResults([...restaurantResults, ...profileResults]);
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                search(query);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, search]);

    return {
        query,
        setQuery,
        results,
        loading,
        error
    };
}
