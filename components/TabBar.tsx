import { Colors, Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

interface TabBarProps {
    currentTab?: string;
}

export function TabBar({ currentTab }: TabBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const unreadCount = useUnreadMessages();

    const tabs = [
        { name: 'explorer', label: 'Explorer', icon: require('@/assets/icons/explorer.svg'), route: '/(tabs)/explorer' },
        { name: 'favoris', label: 'Favoris', icon: require('@/assets/icons/favoris.svg'), route: '/(tabs)/favoris' },
        { name: 'decouvrir', label: 'Découvrir', icon: require('@/assets/icons/decouvrir.svg'), route: '/(tabs)/decouvrir', size: 24 },
        { name: 'message', label: 'Message', icon: require('@/assets/icons/message.svg'), route: '/(tabs)/message' },
        { name: 'profile', label: 'Profil', icon: require('@/assets/icons/profil.svg'), route: '/(tabs)/profile' },
    ];

    const isTabActive = (tab: any) => {
        if (currentTab) return currentTab === tab.name;
        const routeName = tab.route.replace('/(tabs)', '');
        if (pathname === '/explorer' && routeName.includes('explorer')) return true;
        if (pathname === '/' && routeName.includes('explorer')) return true;
        return pathname.includes(routeName) && routeName !== '/';
    };

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = isTabActive(tab);
                const color = isActive ? Colors.light.primary : '#000000';
                const isMessage = tab.name === 'message';

                return (
                    <Pressable
                        key={tab.name}
                        style={styles.tab}
                        onPress={() => router.push(tab.route as any)}
                    >
                        {/* Icône avec badge pour l'onglet Message */}
                        <View style={styles.iconWrapper}>
                            <Image
                                source={tab.icon}
                                style={{ width: tab.size || 20, height: tab.size || 20 }}
                                contentFit="contain"
                                tintColor={color}
                            />
                            {/* Badge non-lu — visible uniquement sur Message */}
                            {isMessage && unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
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
        borderTopWidth: 1,
        borderTopColor: '#DDD4A0',
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
    iconWrapper: {
        position: 'relative',
    },
    label: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        marginTop: 5,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -8,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#E36B39',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        lineHeight: 12,
    },
});
