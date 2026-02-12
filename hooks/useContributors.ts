import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileWithStats = Profile & {
    reviews: { count: number }[];
};

interface UseContributorsReturn {
    contributors: ProfileWithStats[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook personnalisé pour récupérer les contributeurs locaux depuis Supabase
 * @param limit - Nombre maximum de contributeurs à récupérer (défaut: 10)
 * @returns Object contenant les contributeurs, l'état de chargement et les erreurs
 */
export function useContributors(limit: number = 10): UseContributorsReturn {
    const [contributors, setContributors] = useState<ProfileWithStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchContributors = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*, reviews(count)')
                .eq('is_contributor', true)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setContributors(data as any || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContributors();
    }, [limit]);

    return {
        contributors,
        loading,
        error,
        refetch: fetchContributors,
    };
}
