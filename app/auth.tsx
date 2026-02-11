import { Fonts } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                Alert.alert('Erreur de connexion', error.message);
            } else {
                router.replace('/(tabs)/explorer');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Logo + Slogan */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/icons/logo_tlf.svg')}
                            style={styles.logo}
                            contentFit="contain"
                        />
                        <View style={styles.titleContainer}>
                            <Text style={styles.brandName}>Manger</Text>
                            <Text style={styles.brandName}>avec simplicité</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.pageTitle}>Connexion</Text>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adresse e-mail</Text>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>
                                Mot de passe perdu ?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Se connecter</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF5', // Cream/Beige background from design system/mockup
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 80,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: 16,
    },
    titleContainer: {
        justifyContent: 'center',
    },
    brandName: {
        fontFamily: Fonts.bold,
        fontSize: 24,
        color: '#141414',
        lineHeight: 28,
    },
    pageTitle: {
        fontFamily: Fonts.medium,
        fontSize: 20,
        color: '#141414',
        marginBottom: 30,
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 5,
    },
    label: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#141414',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#EAE8DC', // Darker beige/grey for inputs as per mockup
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: '#141414',
        height: 56,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotPasswordText: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: '#141414',
    },
    loginButton: {
        backgroundColor: '#141414', // Black button
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.medium,
    },
});
