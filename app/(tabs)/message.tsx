import { Fonts } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ConversationWithParticipant, useConversations } from '@/hooks/useConversations';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MessageScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { conversations, loading, refetch } = useConversations();

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

    const formatName = (fullName: string | null) => {
        if (!fullName) return { first: 'Utilisateur', last: 'Inconnu' };
        const parts = fullName.trim().split(' ');
        if (parts.length > 1) {
            const last = parts.pop()?.toUpperCase() || '';
            const first = parts.join(' ');
            return { first, last };
        }
        return { first: fullName, last: '' };
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#E3E0CF', '#FFFCF5']}
                    style={styles.topButtons}
                >
                    <View style={{ width: 40 }} />
                </LinearGradient>
                <View style={styles.titleHeader}>
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

                {/* Fixed back button */}
                <TouchableOpacity onPress={() => router.back()} style={styles.fixedBackButton}>
                    <Ionicons name="arrow-undo-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E54628" />
            </View>
        );
    }

    const renderItem = ({ item }: { item: ConversationWithParticipant }) => {
        const otherUser = item.other_participant;
        const displayName = otherUser?.full_name || otherUser?.username || 'Utilisateur inconnu';
        const { first, last } = formatName(displayName);

        // Placeholder for unread count as it's not in the hook yet. 
        // We act as if there are no new messages for now unless we fetch it.
        const unreadCount = 0;

        return (
            <Pressable
                style={({ pressed }) => [styles.conversationItem, pressed && styles.pressed]}
                onPress={() => router.push(`/conversation/${item.id}` as any)}
            >
                <View style={styles.avatarContainer}>
                    {otherUser?.avatar_url ? (
                        <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitials}>
                                {displayName.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.messageContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.nameText}>
                            <Text style={styles.firstName}>{first} </Text>
                            <Text style={styles.lastName}>{last}</Text>
                        </Text>
                        <Text style={styles.messageText} numberOfLines={1}>{item.last_message_text || 'Nouvelle conversation'}</Text>
                    </View>

                    <View style={styles.metaContainer}>
                        <Text style={styles.timeText}>{formatDate(item.last_message_at)}</Text>
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#E3E0CF', '#FFFCF5']}
                style={styles.topButtons}
            >
                <View style={{ width: 40 }} />
                <View style={{ width: 40 }} />
            </LinearGradient>

            <View style={styles.titleHeader}>
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
                        Lancez une discussion avec un local pour commencer !
                    </Text>
                </View>
            )}

            {/* Fixed back button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.fixedBackButton}>
                <Ionicons name="arrow-undo-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
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
        paddingBottom: 10,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fixedBackButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E54628',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    titleHeader: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: 20,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    pressed: {
        opacity: 0.7,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
    },
    messageContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 16,
        color: '#1A1A1A',
        marginBottom: 4,
    },
    firstName: {
        fontFamily: Fonts.medium,
    },
    lastName: {
        fontFamily: Fonts.bold,
    },
    messageText: {
        fontSize: 14,
        color: '#4A4A4A',
        fontFamily: Fonts.regular,
    },
    metaContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: 8,
        gap: 6,
    },
    timeText: {
        fontSize: 12,
        color: '#E54628', // Red/Orange for time
        fontFamily: Fonts.medium,
    },
    badge: {
        backgroundColor: '#1E5E2F', // Dark green badge
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: Fonts.bold,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF6',
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
        fontFamily: Fonts.bold,
        color: '#1A1A1A',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: Fonts.regular,
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: '#D34C26',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
    avatarPlaceholder: {
        backgroundColor: '#D34C26',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontFamily: Fonts.bold,
        fontSize: 20,
    },
});
