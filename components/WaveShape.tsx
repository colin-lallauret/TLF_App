import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const WaveShape = () => {
    // Standard width 375 for calculation scaling
    return (
        <View style={styles.container}>
            <Svg
                height="100%"
                width="100%"
                viewBox="0 0 375 100"
                preserveAspectRatio="none"
            >
                <Path
                    fill="#FFFDF6" // Cream background color
                    d="M 0,100 L 0,40 L 100,40 C 140,40 140,0 187.5,0 C 235,0 235,40 275,40 L 375,40 L 375,100 Z"
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 80, // Adjust height as needed
        position: 'absolute',
        bottom: 0,
    },
});
