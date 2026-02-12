import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface TabBarProps {
    currentTab?: string; // Optional: which tab should be highlighted (if any)
}

export function TabBar({ currentTab }: TabBarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { name: 'explorer', label: 'Explorer', icon: require('@/assets/icons/explorer.svg'), route: '/(tabs)/explorer' },
        { name: 'favoris', label: 'Favoris', icon: require('@/assets/icons/favoris.svg'), route: '/(tabs)/favoris' },
        { name: 'decouvrir', label: 'Découvrir', icon: require('@/assets/icons/decouvrir.svg'), route: '/(tabs)/decouvrir', size: 32 },
        { name: 'message', label: 'Message', icon: require('@/assets/icons/message.svg'), route: '/(tabs)/message' },
        { name: 'profile', label: 'Profil', icon: require('@/assets/icons/profil.svg'), route: '/(tabs)/profile' },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = currentTab === tab.name;
                const color = isActive ? Colors.light.primary : '#000000';

                return (
                    <Pressable
                        key={tab.name}
                        style={styles.tab}
                        onPress={() => router.push(tab.route as any)}
                    >
                        <Image
                            source={tab.icon}
                            style={{
                                width: tab.size || 28,
                                height: tab.size || 28,
                            }}
                            contentFit="contain"
                            tintColor={color}
                        />
                        <Text style={[styles.label, { color }]}>{tab.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFCF5',
        borderTopWidth: 0,
        elevation: 0,
        height: Platform.OS === 'ios' ? 90 : 70,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        paddingTop: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    label: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        marginTop: 5,
    },
});
