import { TabBar } from '@/components/TabBar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const Icon = ({ source, color, size = 20 }: { source: any; color: string; size?: number }) => (
    <Image
      source={source}
      style={{ width: size, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );

  return (
    <Tabs
      tabBar={() => <TabBar />}
      screenOptions={{
        tabBarActiveTintColor: '#DC4928',
        tabBarInactiveTintColor: '#000000',
        headerShown: false,
        // tabBarButton: HapticTab, // No longer needed as TabBar handles press
        // TabBarStyle is handled by custom TabBar
      }}>
      <Tabs.Screen
        name="explorer"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => <Icon source={require('@/assets/icons/explorer.svg')} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favoris"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color }) => <Icon source={require('@/assets/icons/favoris.svg')} color={color} />,
        }}
      />
      <Tabs.Screen
        name="decouvrir"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color }) => <Icon source={require('@/assets/icons/decouvrir.svg')} color={color} size={24} />, // slightly larger icon usually
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: 'Message',
          tabBarIcon: ({ color }) => <Icon source={require('@/assets/icons/message.svg')} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Icon source={require('@/assets/icons/profil.svg')} color={color} />,
        }}
      />

      {/* Hidden tabs */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
