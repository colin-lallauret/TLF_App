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

            if (profileError) throw profileError;

            // 2. Récupérer les stats (Nombre d'avis)
            const { count: reviewsCount, error: reviewsError } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('contributor_id', contributorId);

            if (reviewsError) throw reviewsError;

            // 3. Récupérer les stats (Nombre de likes / followers)
            // On utilise la table favorite_contributors si elle existe et est utilisée
            const { count: followersCount, error: followersError } = await supabase
                .from('favorite_contributors')
                .select('*', { count: 'exact', head: true })
                .eq('contributor_id', contributorId);

            // Pas d'erreur fatale si ça échoue (table peut-être vide ou non utilisée)

            // 4. Récupérer les Tops Adresses (Restaurants notés >= 4 par ce contributeur)
            const { data: topReviews, error: topReviewsError } = await supabase
                .from('reviews')
                .select(`
                    rating,
                    restaurant:restaurants (*)
                `)
                .eq('contributor_id', contributorId)
                .gte('rating', 4)
                .limit(5);

            if (topReviewsError) throw topReviewsError;

            // Formater les restaurants pour correspondre à RestaurantWithRating
            const topRestaurants: RestaurantWithRating[] = topReviews
                .filter((review: any) => review.restaurant) // S'assurer que le restaurant existe
                .map((review: any) => {
                    const restaurant = review.restaurant as RestaurantWithRating; // Assertion simple pour éviter l'erreur de spread
                    return {
                        ...restaurant,
                        average_rating: review.rating, // Ici on affiche la note donnée par ce contributeur
                        review_count: 1, // Contexte individuel
                        image_url: getImageForCuisine(restaurant.food_types)
                    };
                });

            setProfile({
                ...profileData,
                stats: {
                    reviews_count: reviewsCount || 0,
                    likes_count: 0, // Pas de colonne likes sur profile, on pourrait utiliser followers
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
