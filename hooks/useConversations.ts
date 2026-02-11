import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ConversationWithParticipant extends Conversation {
    other_participant: Profile | null;
}

export function useConversations() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<ConversationWithParticipant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConversations = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data: conversationsData, error: convError } = await supabase
                .from('conversations')
                .select('*')
                .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (convError) throw convError;

            const typedConversations = (conversationsData || []) as Conversation[];

            if (typedConversations.length === 0) {
                setConversations([]);
                setLoading(false);
                return;
            }

            const enrichedConversations: ConversationWithParticipant[] = await Promise.all(
                typedConversations.map(async (conv) => {
                    const otherPartId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;

                    let otherParticipant: Profile | null = null;
                    if (otherPartId) {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', otherPartId)
                            .single();
                        otherParticipant = profileData;
                    }

                    return {
                        ...conv,
                        other_participant: otherParticipant
                    };
                })
            );

            setConversations(enrichedConversations);

        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('public:conversations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                    filter: `participant_1=eq.${user.id}`,
                },
                () => {
                    fetchConversations();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                    filter: `participant_2=eq.${user.id}`,
                },
                () => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const startConversation = async (otherUserId: string) => {
        if (!user) throw new Error("Non connecté");

        const { data: conv1 } = await supabase
            .from('conversations')
            .select('id')
            .eq('participant_1', user.id)
            .eq('participant_2', otherUserId)
            .maybeSingle();

        const c1 = conv1 as { id: string } | null;
        if (c1) return c1.id;

        const { data: conv2 } = await supabase
            .from('conversations')
            .select('id')
            .eq('participant_1', otherUserId)
            .eq('participant_2', user.id)
            .maybeSingle();

        const c2 = conv2 as { id: string } | null;
        if (c2) return c2.id;

        // @ts-ignore
        const { data: newConv, error } = await supabase
            .from('conversations')
            .insert({
                participant_1: user.id,
                participant_2: otherUserId,
                last_message_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (error) throw error;
        // @ts-ignore
        const nConv = newConv as { id: string } | null;
        return nConv?.id;
    };

    return { conversations, loading, error, refetch: fetchConversations, startConversation };
}
