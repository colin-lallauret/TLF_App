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



export function useContributorProfile(contributorId: string | null) {
    const [profile, setProfile] = useState<ContributorProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);



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
                            image_url: restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
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
