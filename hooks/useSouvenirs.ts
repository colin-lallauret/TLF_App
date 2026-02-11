import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy'; // Fix for SDK 52+ deprecation
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useSouvenirs() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);

    const searchRestaurants = useCallback(async (query: string) => {
        if (!query || query.length < 2) return [];

        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('id, name, city')
                .ilike('name', `%${query}%`)
                .limit(10);

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error searching restaurants:', e);
            return [];
        }
    }, []);

    const savePhotosLocally = useCallback(async (uris: string[]) => {
        // Sur le web, le système de fichiers n'est pas accessible de la même manière
        if (Platform.OS === 'web') {
            return uris;
        }

        try {
            const souvenirDir = FileSystem.documentDirectory + 'souvenirs/';
            const dirInfo = await FileSystem.getInfoAsync(souvenirDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(souvenirDir, { intermediates: true });
            }

            const savedUris = await Promise.all(uris.map(async (uri) => {
                const filename = uri.split('/').pop() || `photo_${Date.now()}.jpg`;
                const newPath = souvenirDir + filename;
                await FileSystem.copyAsync({
                    from: uri,
                    to: newPath
                });
                return newPath;
            }));

            return savedUris;
        } catch (e) {
            console.error('Error saving photos locally:', e);
            // En cas d'erreur (ex: permission), on retourne les URIs originales pour ne pas bloquer
            return uris;
        }
    }, []);

    const addSouvenir = useCallback(async (data: {
        title: string;
        description: string;
        rating: number;
        restaurant_id: string;
        date: Date;
        photos: string[];
    }) => {
        if (!user) throw new Error('User not logged in');
        setUploading(true);
        try {
            // 1. Hub : Sauvegarde locale des photos (si possible)
            const localPhotos = await savePhotosLocally(data.photos);

            // 2. DB : Insertion du souvenir
            // @ts-ignore
            const { error } = await supabase.from('souvenirs').insert({
                traveler_id: user.id,
                title: data.title,
                description: data.description,
                rating: data.rating,
                restaurant_id: data.restaurant_id,
                date: data.date.toISOString(),
                photos_urls: localPhotos // Stockage des chemins locaux (FileSystem)
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding souvenir:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    }, [user, savePhotosLocally]);

    const fetchMySouvenirs = useCallback(async () => {
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from('souvenirs')
                .select(`
                    *,
                    restaurants (
                        name,
                        city
                    )
                `)
                .eq('traveler_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching souvenirs:', e);
            return [];
        }
    }, [user]);

    return { searchRestaurants, addSouvenir, fetchMySouvenirs, uploading };
}
