import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type FavoritesContextType = {
    favoriteRestaurantIds: string[];
    favoriteContributorIds: string[];
    toggleRestaurantFavorite: (id: string) => Promise<boolean>;
    toggleContributorFavorite: (id: string) => Promise<boolean>;
    loading: boolean;
    refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>([]);
    const [favoriteContributorIds, setFavoriteContributorIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Fonction pour charger les favoris (IDs uniquement)
    const fetchFavorites = useCallback(async () => {
        if (!user) {
            setFavoriteRestaurantIds([]);
            setFavoriteContributorIds([]);
            setLoading(false);
            return;
        }

        try {
            // Restaurants
            const { data: restData } = await supabase
                .from('favorite_restaurants')
                .select('restaurant_id')
                .eq('user_id', user.id);

            if (restData) {
                setFavoriteRestaurantIds(restData.map(r => r.restaurant_id));
            }

            // Contributeurs
            const { data: contribData } = await supabase
                .from('favorite_contributors')
                .select('contributor_id')
                .eq('follower_id', user.id);

            if (contribData) {
                setFavoriteContributorIds(contribData.map(c => c.contributor_id));
            }

        } catch (error) {
            console.error('Erreur chargement favoris:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Charger au démarrage ou quand l'user change
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleRestaurantFavorite = async (restaurantId: string) => {
        if (!user) return false;

        // Optimistic Update : On met à jour l'UI tout de suite
        const isCurrentlyFavorite = favoriteRestaurantIds.includes(restaurantId);
        let newIds = [];

        if (isCurrentlyFavorite) {
            newIds = favoriteRestaurantIds.filter(id => id !== restaurantId);
        } else {
            newIds = [...favoriteRestaurantIds, restaurantId];
        }
        setFavoriteRestaurantIds(newIds);

        try {
            if (isCurrentlyFavorite) {
                // Supprimer
                const { error } = await supabase
                    .from('favorite_restaurants')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('restaurant_id', restaurantId);

                if (error) throw error;
                return false;
            } else {
                // Ajouter
                const { error } = await supabase
                    .from('favorite_restaurants')
                    .insert({ user_id: user.id, restaurant_id: restaurantId });

                if (error) throw error;
                return true;
            }
        } catch (error) {
            // En cas d'erreur, on revient en arrière (Rollback)
            console.error('Erreur toggle restaurant:', error);
            fetchFavorites(); // On recharge la vraie source de vérité
            return isCurrentlyFavorite;
        }
    };

    const toggleContributorFavorite = async (contributorId: string) => {
        if (!user) return false;

        // Optimistic Update
        const isCurrentlyFavorite = favoriteContributorIds.includes(contributorId);
        let newIds = [];

        if (isCurrentlyFavorite) {
            newIds = favoriteContributorIds.filter(id => id !== contributorId);
        } else {
            newIds = [...favoriteContributorIds, contributorId];
        }
        setFavoriteContributorIds(newIds);

        try {
            if (isCurrentlyFavorite) {
                const { error } = await supabase
                    .from('favorite_contributors')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('contributor_id', contributorId);

                if (error) throw error;
                return false;
            } else {
                const { error } = await supabase
                    .from('favorite_contributors')
                    .insert({ follower_id: user.id, contributor_id: contributorId });

                if (error) throw error;
                return true;
            }
        } catch (error) {
            console.error('Erreur toggle contributeur:', error);
            fetchFavorites();
            return isCurrentlyFavorite;
        }
    };

    return (
        <FavoritesContext.Provider value={{
            favoriteRestaurantIds,
            favoriteContributorIds,
            toggleRestaurantFavorite,
            toggleContributorFavorite,
            loading,
            refreshFavorites: fetchFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavoritesContext() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavoritesContext must be used within a FavoritesProvider');
    }
    return context;
}
