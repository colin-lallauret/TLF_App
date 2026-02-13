import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ConversationScreen() {
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const { messages, loading, sendMessage } = useMessages(id as string);
    const { user, profile, loading: authLoading } = useAuth(); // Récupérer profile et loading
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [otherParticipant, setOtherParticipant] = useState<any>(null);

    const isMember = profile?.subscription_end_date
        ? new Date(profile.subscription_end_date) > new Date()
        : false;

    const handleSubscribe = () => {
        router.push('/(tabs)/profile');
    };

    // Fetch conversation details to get other participant info
    useEffect(() => {
        const fetchConversationDetails = async () => {
            if (!id || !user) return;

            console.log('Fetching conversation details for:', id);
            console.log('Current user ID:', user.id);

            // First, get the conversation
            const { data: conversation, error: convError } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', id)
                .single();

            console.log('Conversation:', conversation);
            console.log('Conversation error:', convError);

            if (conversation && !convError) {
                // Determine which participant is the other user
                const otherUserId = (conversation as any).participant_1 === user.id
                    ? (conversation as any).participant_2
                    : (conversation as any).participant_1;

                console.log('Other user ID:', otherUserId);

                // Then fetch the other participant's profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', otherUserId)
                    .single();

                console.log('Other participant profile:', profile);
                console.log('Profile error:', profileError);

                if (profile && !profileError) {
                    setOtherParticipant(profile);
                }
            }
        };

        fetchConversationDetails();
    }, [id, user]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        setSending(true);
        try {
            await sendMessage(inputText);
            setInputText('');
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.sender_id === user?.id;
        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.otherMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    isMe ? styles.myMessageText : styles.otherMessageText
                ]}>
                    {item.text}
                </Text>
                <Text style={[
                    styles.messageTime,
                    isMe ? styles.myMessageTime : styles.otherMessageTime
                ]}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            {/* Header with back button, profile picture and name */}
            <LinearGradient
                colors={['#E3E0CF', '#FFFCF5']}
                style={styles.topButtons}
            >

                <TouchableOpacity style={styles.backButtonCircle} onPress={() => router.back()}>
                    <Ionicons name="arrow-undo-outline" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    {otherParticipant?.avatar_url ? (
                        <Image
                            source={{ uri: otherParticipant.avatar_url }}
                            style={styles.headerAvatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitials}>
                                {otherParticipant ? (otherParticipant.full_name || otherParticipant.username || 'U').substring(0, 2).toUpperCase() : '...'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerName} numberOfLines={1}>
                            {otherParticipant ? (otherParticipant.full_name || otherParticipant.username || 'Utilisateur') : 'Chargement...'}
                        </Text>
                    </View>
                </View>

                <View style={{ width: 40 }} />
            </LinearGradient>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    inverted
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={isMember} // Désactiver le scroll
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Commencez la discussion ! 👋</Text>
                            </View>
                        ) : null
                    }
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Écrivez un message..."
                            multiline
                            editable={isMember} // Désactiver l'input
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim() || sending || !isMember} // Désactiver le bouton
                            style={[styles.sendButton, (!inputText.trim() || sending || !isMember) && styles.sendButtonDisabled]}
                        >
                            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                {/* Overlay pour non-membres (uniquement après chargement auth) */}
                {!authLoading && !isMember && (
                    <View style={styles.overlay}>
                        <View style={styles.alertBox}>
                            <Text style={styles.alertTitle}>Messagerie privée</Text>
                            <Text style={styles.alertMessage}>
                                L'échange avec les contributeurs est réservé aux membres.
                            </Text>
                            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                                <Text style={styles.subscribeButtonText}>Choisir mon abonnement</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF6',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 110,
        paddingBottom: 20,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
    },
    avatarPlaceholder: {
        backgroundColor: '#E54628',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    headerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    listContent: {
        padding: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#E65127',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: '#000000',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
    },
    myMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherMessageTime: {
        color: '#999999',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        alignItems: 'center', // Centers input and button vertically
    },
    input: {
        flex: 1,
        backgroundColor: '#F2F2F7', // iOS style grey
        borderRadius: 22.5, // Match send button radius
        paddingHorizontal: 16,
        paddingVertical: 12, // Equal padding top/bottom for vertical center
        minHeight: 45, // Match send button height
        maxHeight: 120, // Slightly taller max height
        fontSize: 16,
        marginRight: 12,
        color: '#000000',
    },
    sendButton: {
        backgroundColor: '#E65127',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom removed to align centers perfectly with alignItems: 'center'
    },
    sendButtonDisabled: {
        backgroundColor: '#E5E5EA', // iOS disabled grey
    },
    // Removed old sendButtonText style as it's no longer used
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999999',
        fontStyle: 'italic',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 2000,
    },
    alertBox: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    subscribeButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    subscribeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
