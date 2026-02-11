import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type Message = Database['public']['Tables']['messages']['Row'];

export function useMessages(conversationId: string) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching messages:', error);
        else setMessages(data || []);
        setLoading(false);
    };

    const sendMessage = async (text: string) => {
        if (!user || !text.trim()) return;

        try {
            // 1. Envoyer le message
            const { error: msgError } = await supabase
                .from('messages')
                // @ts-ignore
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    text: text.trim(),
                });

            if (msgError) throw msgError;

            // 2. Mettre à jour la conversation
            const { error: convError } = await supabase
                .from('conversations')
                // @ts-ignore
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

        // Charger les messages initiaux
        fetchMessages();

        // Souscription temps réel
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
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((current) => [newMessage, ...current]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    return { messages, loading, sendMessage };
}
