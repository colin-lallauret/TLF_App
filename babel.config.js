module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for expo-router
            // 'expo-router/babel', // (deprecated in newer versions, part of preset usually, but safe to omit if using preset-expo)

            // Required for react-native-reanimated
            'react-native-reanimated/plugin',
        ],
    };
};
