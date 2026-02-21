import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

export interface RestaurantWithRating extends Restaurant {
    average_rating: number;
    review_count: number;
    image_url: string;
}

export function useRestaurants(limit: number = 5) {
    const [restaurants, setRestaurants] = useState<RestaurantWithRating[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Récupérer les restaurants
            const { data: restaurantsData, error: restaurantsError } = await supabase
                .from('restaurants')
                .select('*');

            if (restaurantsError) throw new Error(restaurantsError.message);
            if (!restaurantsData) {
                setRestaurants([]);
                return;
            }

            // 2. Pour chaque restaurant, récupérer ses avis pour calculer la moyenne
            // Note: Idéalement, cela devrait être fait via une vue SQL ou une fonction RPC pour la performance
            const restaurantsWithRatings: RestaurantWithRating[] = await Promise.all(
                (restaurantsData as Restaurant[]).map(async (restaurant) => {
                    const { data: reviews, error: reviewsError } = await supabase
                        .from('reviews')
                        .select('rating')
                        .eq('restaurant_id', restaurant.id);

                    if (reviewsError) {
                        console.error(`Error fetching reviews for ${restaurant.id}`, reviewsError);
                        return {
                            ...restaurant,
                            average_rating: 0,
                            review_count: 0,
                            image_url: restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
                        };
                    }

                    const count = reviews?.length || 0;
                    const total = (reviews as Review[])?.reduce((sum, r) => sum + (r.rating || 0), 0) || 0;
                    const average = count > 0 ? Number((total / count).toFixed(1)) : 0;

                    return {
                        ...restaurant,
                        average_rating: average,
                        review_count: count,
                        image_url: restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
                    };
                })
            );

            // Trier par note moyenne descendante (optionnel, ou selon besoin)
            restaurantsWithRatings.sort((a, b) => b.average_rating - a.average_rating || b.review_count - a.review_count);

            setRestaurants(restaurantsWithRatings.slice(0, limit));

        } catch (err) {
            console.error('Error in useRestaurants:', err);
            setError(err instanceof Error ? err : new Error('Unknown error fetching restaurants'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, [limit]);

    return { restaurants, loading, error, refetch: fetchRestaurants };
}
