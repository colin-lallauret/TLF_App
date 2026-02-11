import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConversationScreen() {
    const { id, name } = useLocalSearchParams();
    const { messages, loading, sendMessage } = useMessages(id as string);
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);

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
            <Stack.Screen options={{ title: (name as string) || 'Conversation' }} />

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                inverted
                contentContainerStyle={styles.listContent}
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
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                        style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
                    >
                        <Text style={styles.sendButtonText}>Envoyer</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF0',
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
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#E65127',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999999',
        fontStyle: 'italic',
    },
});
