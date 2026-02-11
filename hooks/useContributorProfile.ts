import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';
import { RestaurantWithRating } from './useRestaurants';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ContributorProfile extends Profile {
    stats: {
        reviews_count: number;
        likes_count: number;
        followers_count: number;
    };
    top_restaurants: RestaurantWithRating[];
}

// Mapping des images par type de cuisine (Réutilisé de useRestaurants pour la cohérence)
// Idéalement, ce mapping devrait être dans un fichier constant partagé
const CUISINE_IMAGES: Record<string, string> = {
    'Italien': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000',
    'Japonais': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    'Français': 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000',
    'Méditerranéen': 'https://images.unsplash.com/photo-1523986395389-c8a8ddc52971?q=80&w=1000',
    'Asiatique': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
    'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000',
    'Default': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000',
};

export function useContributorProfile(contributorId: string | null) {
    const [profile, setProfile] = useState<ContributorProfile | null>(null);
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

    const fetchProfile = async () => {
        if (!contributorId) return;

        try {
            setLoading(true);
            setError(null);

            // 1. Récupérer le profil de base
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', contributorId)
                .single();

            if (profileError || !profileData) throw profileError || new Error('Profil introuvable');

            // 2. Récupérer les stats (Nombre d'avis)
            const { count: reviewsCount, error: reviewsError } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('contributor_id', contributorId);

            if (reviewsError) throw reviewsError;

            // 3. Récupérer les stats (Nombre de likes / followers)
            const { count: followersCount, error: followersError } = await supabase
                .from('favorite_contributors')
                .select('*', { count: 'exact', head: true })
                .eq('contributor_id', contributorId);

            // 4. Récupérer TOUS les restaurants notés par ce contributeur
            const { data: topReviews, error: topReviewsError } = await supabase
                .from('reviews')
                .select(`
                    rating,
                    restaurant:restaurants (*)
                `)
                .eq('contributor_id', contributorId);

            if (topReviewsError) throw topReviewsError;

            // 5. Calculer les stats globales pour chaque restaurant
            const topRestaurants: RestaurantWithRating[] = await Promise.all(
                topReviews
                    .filter((review: any) => review.restaurant)
                    .map(async (review: any) => {
                        const restaurant = review.restaurant;

                        // Récupérer tous les avis pour ce restaurant pour calculer la moyenne globale
                        const { data: restaurantReviews } = await supabase
                            .from('reviews')
                            .select('rating')
                            .eq('restaurant_id', restaurant.id);

                        const reviews = (restaurantReviews || []) as { rating: number | null }[];
                        const count = reviews.length;
                        const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                        const average = count > 0 ? Number((total / count).toFixed(1)) : 0;

                        return {
                            ...restaurant,
                            average_rating: average, // Moyenne globale
                            review_count: count,     // Nombre total d'avis
                            image_url: getImageForCuisine(restaurant.food_types)
                        } as RestaurantWithRating;
                    })
            );

            setProfile({
                ...(profileData as Profile),
                stats: {
                    reviews_count: reviewsCount || 0,
                    likes_count: 0,
                    followers_count: followersCount || 0
                },
                top_restaurants: topRestaurants
            });

        } catch (err) {
            console.error('Error fetching contributor profile:', err);
            setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [contributorId]);

    return { profile, loading, error, refetch: fetchProfile };
}
