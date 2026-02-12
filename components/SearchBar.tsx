import { Colors, Fonts } from '@/constants/theme';
import { SearchResult, useSearch } from '@/hooks/useSearch';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export function SearchBar() {
    const router = useRouter();
    const { query, setQuery, results, loading } = useSearch();

    const handleResultPress = (item: SearchResult) => {
        if (item.type === 'restaurant') {
            router.push(`/restaurant/${item.id}` as any);
        } else {
            router.push(`/contributor/${item.id}` as any);
        }
        setQuery(''); // Clear search after selection
    };

    const renderItem = ({ item }: { item: SearchResult }) => {
        const isRestaurant = item.type === 'restaurant';
        const imageSource = isRestaurant
            ? item.image_url
            : (item as any).avatar_url;

        const title = isRestaurant
            ? item.name
            : ((item as any).full_name || (item as any).username);

        const subtitle = item.city;

        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleResultPress(item)}
            >
                <Image
                    source={imageSource ? { uri: imageSource } : require('@/assets/images/react-logo.png')} // Fallback if needed, but ideally localized placeholder
                    style={[styles.resultImage, !isRestaurant && styles.avatarImage]}
                    contentFit="cover"
                />
                <View style={styles.resultTextContainer}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.resultSubtitle} numberOfLines={1}>
                        {isRestaurant ? 'Restaurant' : 'Local'} • {subtitle}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.icon} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                {query.length === 0 && (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="search" size={20} color={Colors.light.icon} style={styles.placeholderIcon} />
                        <Text style={styles.placeholderText}>Rechercher un restaurant, un local...</Text>
                    </View>
                )}
                <TextInput
                    style={styles.input}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlign="center"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.light.primary} />
                        ) : (
                            <Ionicons name="close-circle" size={20} color={Colors.light.icon} />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Results List */}
            {query.length > 0 && results.length > 0 && (
                <View style={styles.resultsContainer}>
                    <FlatList
                        data={results}
                        keyExtractor={(item) => `${item.type}-${item.id}`}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        style={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {/* No Results State */}
            {query.length > 0 && !loading && results.length === 0 && (
                <View style={[styles.resultsContainer, styles.noResults]}>
                    <Text style={styles.noResultsText}>Aucun résultat trouvé pour "{query}"</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        zIndex: 100,
        paddingHorizontal: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fffcf5',
        borderRadius: 30,
        height: 60,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        position: 'relative',
    },
    placeholderContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
        pointerEvents: 'none',
    },
    placeholderIcon: {
        marginRight: 8,
    },
    placeholderText: {
        fontSize: 14,
        color: Colors.light.icon,
        fontFamily: Fonts.medium,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#141414',
        fontFamily: Fonts.medium,
        height: '100%',
        textAlign: 'center',
        zIndex: 1,
    },
    inputActive: {
        textAlign: 'center', // Or 'left' if preferred when typing
    },
    clearButton: {
        padding: 4,
        zIndex: 2,
    },
    resultsContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        maxHeight: 300,
    },
    list: {
        maxHeight: 280,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
    },
    resultImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: Colors.light.background,
        marginRight: 12,
    },
    avatarImage: {
        borderRadius: 20,
    },
    resultTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    resultTitle: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: Colors.light.text,
    },
    resultSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: Colors.light.icon,
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 16,
    },
    noResults: {
        padding: 20,
        alignItems: 'center',
    },
    noResultsText: {
        fontFamily: Fonts.medium,
        color: Colors.light.icon,
        fontSize: 14,
    },
});
