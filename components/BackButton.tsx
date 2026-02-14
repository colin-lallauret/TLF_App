import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface BackButtonProps {
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ style, onPress }) => {
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity style={[styles.backButton, style]} onPress={handlePress}>
            <Image
                source={require('@/assets/icons/return_arrow.png')}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DC4928',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
