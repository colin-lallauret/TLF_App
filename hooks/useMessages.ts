import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type Message = Database['public']['Tables']['messages']['Row'];

export function useMessages(conversationId: string) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Marquer les messages reçus comme lus ─────────────────────────────────
    const markMessagesAsRead = async () => {
        if (!user || !conversationId) return;
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('is_read', false)
            .neq('sender_id', user.id);
    };

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data || []);
        }
        setLoading(false);

        // Marquer comme lus après chargement
        await markMessagesAsRead();
    };

    const sendMessage = async (text: string) => {
        if (!user || !text.trim()) return;

        try {
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    text: text.trim(),
                });

            if (msgError) throw msgError;

            const { error: convError } = await supabase
                .from('conversations')
                // @ts-ignore — last_message_* pas dans les types conversations
                .update({
                    last_message_text: text.trim(),
                    last_message_at: new Date().toISOString()
                })
                .eq('id', conversationId);

            if (convError) throw convError;

        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!conversationId) return;

        fetchMessages();

        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                async (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((current) => [newMessage, ...current]);

                    // Marquer immédiatement comme lu si c'est un message reçu
                    if (newMessage.sender_id !== user?.id) {
                        await supabase
                            .from('messages')
                            .update({ is_read: true })
                            .eq('id', newMessage.id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    return { messages, loading, sendMessage, markMessagesAsRead };
}
