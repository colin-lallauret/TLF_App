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

// Mapping des images par type de cuisine (Réutilisé pour la cohérence)
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

export function useRestaurantDetails(restaurantId: string | null) {
    const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const getImageForCuisine = (foodTypes: string[] | null): string => {
        if (!foodTypes || foodTypes.length === 0) return CUISINE_IMAGES['Default'];
        for (const type of foodTypes) {
            const key = Object.keys(CUISINE_IMAGES).find(k => k.toLowerCase() === type.trim().toLowerCase());
            if (key) return CUISINE_IMAGES[key];
        }
        return CUISINE_IMAGES['Default'];
    };

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
                image_url: getImageForCuisine((restaurantData as any).food_types),
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
