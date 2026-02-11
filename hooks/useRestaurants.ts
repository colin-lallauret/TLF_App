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

export function useRestaurants(limit: number = 5) {
    const [restaurants, setRestaurants] = useState<RestaurantWithRating[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const getImageForCuisine = (foodTypes: string[] | null): string => {
        if (!foodTypes || foodTypes.length === 0) return CUISINE_IMAGES['Default'];

        // Chercher la première correspondance
        for (const type of foodTypes) {
            // Nettoyer le type (enlever les espaces, minuscules pour comparaison sommaire si besoin)
            // Ici on fait une correspondance exacte ou partielle simple
            const key = Object.keys(CUISINE_IMAGES).find(k => k.toLowerCase() === type.trim().toLowerCase());
            if (key) return CUISINE_IMAGES[key];
        }

        return CUISINE_IMAGES['Default'];
    };

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Récupérer les restaurants
            const { data: restaurantsData, error: restaurantsError } = await supabase
                .from('restaurants')
                .select('*')
                .limit(limit);

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
                            image_url: getImageForCuisine(restaurant.food_types)
                        };
                    }

                    const count = reviews?.length || 0;
                    const total = (reviews as Review[])?.reduce((sum, r) => sum + (r.rating || 0), 0) || 0;
                    const average = count > 0 ? Number((total / count).toFixed(1)) : 0;

                    return {
                        ...restaurant,
                        average_rating: average,
                        review_count: count,
                        image_url: getImageForCuisine(restaurant.food_types)
                    };
                })
            );

            // Trier par note moyenne descendante (optionnel, ou selon besoin)
            restaurantsWithRatings.sort((a, b) => b.average_rating - a.average_rating);

            setRestaurants(restaurantsWithRatings);

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
