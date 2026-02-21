import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';
import { RestaurantWithRating } from './useRestaurants';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ReviewWithAuthor {
    id: string;
    rating: number;
    title: string | null;
    description: string | null;
    created_at: string;
    contributor: Profile;
}

export interface RestaurantDetails extends RestaurantWithRating {
    reviews: ReviewWithAuthor[];
}



export function useRestaurantDetails(restaurantId: string | null) {
    const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);


    const fetchRestaurantDetails = async () => {
        if (!restaurantId) return;

        try {
            setLoading(true);
            setError(null);

            // 1. Récupérer les infos du restaurant + les avis avec l'auteur
            // On peut faire ça en une seule requête jointe avec Supabase
            const { data: restaurantData, error: fetchError } = await supabase
                .from('restaurants')
                .select(`
                    *,
                    reviews (
                        id,
                        rating,
                        title,
                        description,
                        created_at,
                        contributor:profiles (*)
                    )
                `)
                .eq('id', restaurantId)
                .single();

            if (fetchError) throw fetchError;

            // @ts-ignore - Supabase types can be complex nested
            const reviews = restaurantData.reviews || [];
            // @ts-ignore - Supabase types can be complex nested
            const validReviews = reviews.filter((r: any) => r.contributor); // Garder seulement ceux avec un auteur valide

            const count = validReviews.length;
            const total = validReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
            const average = count > 0 ? Number((total / count).toFixed(1)) : 0;

            const formattedReviews: ReviewWithAuthor[] = validReviews.map((r: any) => ({
                id: r.id,
                rating: r.rating,
                title: r.title,
                description: r.description,
                created_at: r.created_at,
                contributor: r.contributor
            }));

            setRestaurant({
                ...restaurantData as any, // Cast temporaire pour simplifier
                average_rating: average,
                review_count: count,
                image_url: (restaurantData as any).image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000',
                reviews: formattedReviews
            });

        } catch (err) {
            console.error('Error fetching restaurant details:', err);
            setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurantDetails();
    }, [restaurantId]);

    return { restaurant, loading, error, refetch: fetchRestaurantDetails };
}
