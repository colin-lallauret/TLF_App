import { useFavoritesContext } from '@/context/FavoritesContext';

export function useFavoriteIds() {
    const context = useFavoritesContext();
    return {
        favoriteRestaurantIds: context.favoriteRestaurantIds,
        favoriteContributorIds: context.favoriteContributorIds,
        toggleRestaurantFavorite: context.toggleRestaurantFavorite,
        toggleContributorFavorite: context.toggleContributorFavorite,
        loading: context.loading
    };
}
