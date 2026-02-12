import { useFavoritesContext } from '@/context/FavoritesContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
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
    'Vietnamien': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
};

export function useFavorites() {
    const {
        favoriteRestaurantIds,
        favoriteContributorIds,
        refreshFavorites: refreshContext
    } = useFavoritesContext();

    const [favoriteRestaurants, setFavoriteRestaurants] = useState<RestaurantWithRating[]>([]);
    const [favoriteContributors, setFavoriteContributors] = useState<(Profile & { reviews?: { count: number }[] })[]>([]);
    const [loading, setLoading] = useState(true);

    const getImageForCuisine = (foodTypes: string[] | null): string => {
        if (!foodTypes || foodTypes.length === 0) return CUISINE_IMAGES['Default'];
        for (const type of foodTypes) {
            const key = Object.keys(CUISINE_IMAGES).find(k => type.toLowerCase().includes(k.toLowerCase()));
            if (key) return CUISINE_IMAGES[key];
        }
        return CUISINE_IMAGES['Default'];
    };

    const fetchDetails = async () => {
        try {
            // Ne pas afficher le loading si on a déjà des données (évite le flash)
            if (favoriteRestaurants.length === 0 && favoriteContributors.length === 0) {
                setLoading(true);
            }

            // --- 1. Récupérer les détails des restaurants ---
            if (favoriteRestaurantIds.length > 0) {
                const { data: restaurantsData, error: fetchRestError } = await supabase
                    .from('restaurants')
                    .select('*')
                    .in('id', favoriteRestaurantIds);

                if (fetchRestError) throw fetchRestError;

                // Enrichir les restaurants
                const enrichedRestaurants: RestaurantWithRating[] = await Promise.all(
                    (restaurantsData as Restaurant[]).map(async (restaurant) => {
                        const { data: reviews } = await supabase
                            .from('reviews')
                            .select('rating')
                            .eq('restaurant_id', restaurant.id);

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

                setFavoriteRestaurants(enrichedRestaurants);
            } else {
                setFavoriteRestaurants([]);
            }

            // --- 2. Récupérer les détails des contributeurs ---
            if (favoriteContributorIds.length > 0) {
                const { data: contributors, error: fetchContribError } = await supabase
                    .from('profiles')
                    .select('*, reviews(count)')
                    .in('id', favoriteContributorIds);

                if (fetchContribError) throw fetchContribError;
                setFavoriteContributors(contributors as any || []);
            } else {
                setFavoriteContributors([]);
            }

        } catch (error) {
            console.error('Erreur récupération détails favoris:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [favoriteRestaurantIds, favoriteContributorIds]);

    return {
        favoriteRestaurants,
        favoriteContributors,
        loading,
        refreshFavorites: refreshContext // On utilise le refresh du contexte pour tout recharger
    };
}
