import { RestaurantMap } from '@/components/RestaurantMap';
import { Fonts } from '@/constants/theme';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';
import { useRestaurantDetails } from '@/hooks/useRestaurantDetails';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RestaurantDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { restaurant, loading, error } = useRestaurantDetails(id as string);
    const { favoriteRestaurantIds, toggleRestaurantFavorite } = useFavoriteIds();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const isFavorite = restaurant ? favoriteRestaurantIds.includes(restaurant.id) : false;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E54628" />
            </View>
        );
    }

    if (error || !restaurant) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Impossible de charger le restaurant.</Text>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Retour</Text>
                </Pressable>
            </View>
        );
    }

    // Mock images for carousel (in real app, would come from restaurant.images array)
    const images = [restaurant.image_url, restaurant.image_url, restaurant.image_url, restaurant.image_url];

    const getCuisineLabel = () => restaurant.food_types?.[0] || 'Varié';
    const getPriceLabel = () => `~${(restaurant.budget_level || 2) * 10}€`;
    const getDistanceLabel = () => '2 km'; // Mock distance

    const openGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`;
        Linking.openURL(url);
    };

    const openWaze = () => {
        const url = `https://waze.com/ul?ll=${restaurant.lat},${restaurant.lng}&navigate=yes`;
        Linking.openURL(url);
    };

    const openAppleMaps = () => {
        const url = `http://maps.apple.com/?ll=${restaurant.lat},${restaurant.lng}`;
        Linking.openURL(url);
    };

    const formatName = (fullName: string | null) => {
        if (!fullName) return { first: 'Utilisateur', last: '' };
        const parts = fullName.trim().split(' ');
        if (parts.length > 1) {
            const last = parts.pop()?.toUpperCase() || '';
            const first = parts.join(' ');
            return { first, last };
        }
        return { first: fullName, last: '' };
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            {/* Header (now scrolls with content) */}
            <LinearGradient
                colors={['#E3E0CF', '#FFFCF5']}
                style={styles.topButtons}
            >
                <TouchableOpacity style={styles.backButtonCircle} onPress={() => router.back()}>
                    <Ionicons name="arrow-undo-outline" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => restaurant && toggleRestaurantFavorite(restaurant.id)}
                >
                    <Image
                        source={isFavorite ? require('@/assets/icons/liked_black.svg') : require('@/assets/icons/like_black.svg')}
                        style={{ width: 28, height: 28 }}
                        contentFit="contain"
                    />
                </TouchableOpacity>
            </LinearGradient>
            {/* Image Carousel */}
            <View style={styles.carouselContainer}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                        setCurrentImageIndex(index);
                    }}
                    scrollEventThrottle={16}
                >
                    {images.map((img, index) => (
                        <Image
                            key={index}
                            source={{ uri: img }}
                            style={styles.carouselImage}
                            contentFit="cover"
                        />
                    ))}
                </ScrollView>

                {/* Pagination dots */}
                <View style={styles.paginationContainer}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentImageIndex && styles.paginationDotActive
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.content}>
                {/* Restaurant Name */}
                <Text style={styles.name}>{restaurant.name}</Text>

                {/* Badges */}
                <View style={styles.badgesContainer}>
                    <View style={styles.badge}>
                        <Ionicons name="earth" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{getCuisineLabel()}</Text>
                    </View>
                    <View style={styles.badge}>
                        <Ionicons name="cash-outline" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{getPriceLabel()}</Text>
                    </View>
                    <View style={styles.badge}>
                        <Ionicons name="location-outline" size={14} color="#FFF" />
                        <Text style={styles.badgeText}>{getDistanceLabel()}</Text>
                    </View>
                </View>

                {/* Address Section */}
                <View style={styles.addressSection}>
                    <View style={styles.addressHeader}>
                        <Ionicons name="location" size={20} color="#1A1A1A" />
                        <Text style={styles.addressTitle}>Adresse</Text>
                    </View>
                    <Text style={styles.addressText}>
                        {restaurant.address},{'\n'}
                        {restaurant.postal_code} {restaurant.city},{'\n'}
                        France
                    </Text>

                    {/* Map Icons */}
                    <View style={styles.mapIconsContainer}>
                        <TouchableOpacity style={styles.mapIcon} onPress={openGoogleMaps}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/281/281769.png' }}
                                style={styles.mapIconImage}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mapIcon} onPress={openWaze}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/732/732244.png' }}
                                style={styles.mapIconImage}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mapIcon} onPress={openAppleMaps}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/0/747.png' }}
                                style={styles.mapIconImage}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Map Section */}
                {restaurant.lat && restaurant.lng && (
                    <View style={styles.mapSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Carte interactive</Text>
                            <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
                        </View>
                        <RestaurantMap restaurants={[restaurant]} />
                    </View>
                )}

                {/* Reviews Section */}
                <View style={styles.reviewsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Les avis ({restaurant.review_count || 0})
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
                    </View>

                    {restaurant.reviews && restaurant.reviews.length > 0 ? (
                        restaurant.reviews.map((review) => {
                            const { first, last } = formatName(review.contributor.full_name);
                            return (
                                <View key={review.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.reviewerInfo}>
                                            {review.contributor.avatar_url ? (
                                                <Image
                                                    source={{ uri: review.contributor.avatar_url }}
                                                    style={styles.reviewerAvatar}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View style={styles.reviewerAvatarPlaceholder}>
                                                    <Text style={styles.reviewerAvatarText}>
                                                        {review.contributor.full_name?.charAt(0).toUpperCase() || 'U'}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={styles.reviewerDetails}>
                                                <Text style={styles.reviewerName}>
                                                    <Text style={styles.reviewerFirstName}>{first} </Text>
                                                    <Text style={styles.reviewerLastName}>{last}</Text>
                                                </Text>
                                                <Text style={styles.reviewDate}>
                                                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Rating */}
                                    <View style={styles.reviewRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={star <= review.rating ? "star" : "star-outline"}
                                                size={16}
                                                color="#E54628"
                                            />
                                        ))}
                                    </View>

                                    {/* Review Title */}
                                    {review.title && (
                                        <Text style={styles.reviewTitle}>{review.title}</Text>
                                    )}

                                    {/* Review Text */}
                                    <Text style={styles.reviewText} numberOfLines={3}>
                                        {review.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                                    </Text>

                                    {/* Message Button */}
                                    <TouchableOpacity
                                        style={styles.messageButton}
                                        onPress={() => router.push(`/contributor/${review.contributor.id}` as any)}
                                    >
                                        <Text style={styles.messageButtonText}>Envoyer un message</Text>
                                        <Ionicons name="arrow-forward-circle" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyReviews}>
                            <Text style={styles.emptyText}>Pas encore d'avis pour ce restaurant.</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF6',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF6',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF6',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 20,
        fontFamily: Fonts.regular,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#E54628',
        borderRadius: 20,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontFamily: Fonts.bold,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselContainer: {
        height: 250,
        position: 'relative',
    },
    carouselImage: {
        width: SCREEN_WIDTH,
        height: 250,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationDotActive: {
        backgroundColor: '#E54628',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    name: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
    },
    badgesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D7A3E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: Fonts.bold,
    },
    addressSection: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    addressTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    addressText: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    mapIconsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    mapIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    mapIconImage: {
        width: 32,
        height: 32,
    },
    mapSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    reviewsSection: {
        marginTop: 10,
    },
    reviewCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reviewerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    reviewerAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewerAvatarText: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: '#666',
    },
    reviewerDetails: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 16,
        marginBottom: 2,
    },
    reviewerFirstName: {
        fontFamily: Fonts.regular,
        color: '#1A1A1A',
    },
    reviewerLastName: {
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
    },
    reviewDate: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#999',
    },
    reviewRating: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,
    },
    reviewTitle: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 6,
    },
    reviewText: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D7A3E',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        gap: 8,
    },
    messageButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Fonts.bold,
    },
    emptyReviews: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#999999',
        fontFamily: Fonts.regular,
    },
});
