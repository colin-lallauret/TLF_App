import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Fonts, Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: "TLF c'est quoi ?",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: '2',
        title: "Mangez local",
        description: "Découvrez les pépites cachées, recommandées par les locaux, loin des attrapes-touristes.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: '3',
        title: "Créez vos favoris",
        description: "Sauvegardez vos découvertes gastronomiques et remémorez-vous ces bons moments.",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800"
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const completeOnboarding = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/auth');
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            completeOnboarding();
        }
    };

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const getItemLayout = (_: any, index: number) => ({
        length: width,
        offset: width * index,
        index,
    });

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={styles.slide}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.backgroundImage}
                    contentFit="cover"
                />

                {/* Logo overlay on top */}
                <View style={[styles.logoWrapper, { top: Math.max(insets.top + 20, 60) }]}>
                    <Image
                        source={require('@/assets/icons/logo_tlf_text.svg')} // This seems to be the one matching the text
                        style={styles.logo}
                        contentFit="contain"
                    />
                </View>

                {/* Gradient to make text readable */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)', '#141414']}
                    style={styles.gradient}
                />

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={getItemLayout}
                ref={flatListRef}
                bounces={false}
            />

            <View style={[styles.bottomContainer, { bottom: Math.max(insets.bottom + 20, 40) }]}>
                {/* Dots */}
                <View style={styles.dotsContainer}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { backgroundColor: i === currentIndex ? Colors.light.primary : 'white' }
                            ]}
                        />
                    ))}
                </View>

                {/* Next Button */}
                {currentIndex === SLIDES.length - 1 ? (
                    <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
                        <Text style={styles.ctaButtonText}>Commencer</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Ionicons name="arrow-forward" size={24} color="#141414" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141414',
    },
    slide: {
        width,
        height,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '60%',
    },
    logoWrapper: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    logo: {
        width: 300,
        height: 100,
        tintColor: 'white', // Attempt to make it white if it is an SVG that allows it
    },
    textContainer: {
        position: 'absolute',
        bottom: 120,
        left: 24,
        right: 24,
    },
    title: {
        fontFamily: Fonts.bold,
        fontSize: 32,
        color: '#FFFFFF',
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 10,
    },
    description: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#FFFFFF',
        lineHeight: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 10,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    nextButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaButtonText: {
        fontFamily: Fonts.semiBold,
        color: '#FFFFFF',
        fontSize: 16,
    },
});
