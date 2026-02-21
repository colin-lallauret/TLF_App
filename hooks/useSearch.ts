import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useCallback, useEffect, useState } from 'react';

type Restaurant = Pick<Database['public']['Tables']['restaurants']['Row'], 'id' | 'name' | 'city'> & { type: 'restaurant', image_url: string };
type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'username' | 'avatar_url' | 'city'> & { type: 'profile' };

export type SearchResult = Restaurant | Profile;



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
                .select('id, name, city, food_types, image_url')
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
                image_url: r.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
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
