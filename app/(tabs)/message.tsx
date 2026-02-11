import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ConversationWithParticipant, useConversations } from '@/hooks/useConversations';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function MessageScreen() {
    const { conversations, loading, refetch } = useConversations();
    const { user } = useAuth();
    const router = useRouter();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Hier';
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Messages</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>Connectez-vous</Text>
                    <Text style={styles.emptyText}>
                        Vous devez être connecté pour échanger avec les contributeurs.
                    </Text>
                    <Pressable onPress={() => router.push('/auth')} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }: { item: ConversationWithParticipant }) => {
        const otherUser = item.other_participant;
        const displayName = otherUser?.full_name || otherUser?.username || 'Utilisateur inconnu';

        return (
            <Pressable
                style={({ pressed }) => [styles.conversationItem, pressed && styles.pressed]}
                onPress={() => router.push(`/conversation/${item.id}`)}
            >
                <View style={styles.avatarContainer}>
                    {otherUser?.avatar_url ? (
                        <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>
                                {displayName.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                        <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.time}>{formatDate(item.last_message_at)}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message_text || 'Nouvelle conversation'}
                    </Text>
                </View>
            </Pressable>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
            </View>

            {conversations.length > 0 ? (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={loading}
                    onRefresh={refetch}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📬</Text>
                    <Text style={styles.emptyTitle}>Aucune conversation</Text>
                    <Text style={styles.emptyText}>
                        Échangez avec les contributeurs locaux pour obtenir des conseils personnalisés.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF0',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFDF0',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF0',
    },
    listContent: {
        padding: 20,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        alignItems: 'center',
    },
    pressed: {
        opacity: 0.7,
        backgroundColor: '#F5F5F5',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E0E0E0',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E65127',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    messageContent: {
        flex: 1,
        justifyContent: 'center',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: '#999999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
});
