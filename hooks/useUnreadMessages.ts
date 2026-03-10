import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

/**
 * Retourne le nombre total de messages non lus.
 * Recalcule automatiquement :
 *  - Au montage
 *  - En Realtime (INSERT nouveau message, UPDATE is_read)
 *  - Quand l'app repasse en foreground
 */
export function useUnreadMessages() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const isMounted = useRef(true);

    const fetchUnread = async (userId: string) => {
        const { data: convos } = await supabase
            .from('conversations')
            .select('id')
            .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

        if (!convos || convos.length === 0) {
            if (isMounted.current) setUnreadCount(0);
            return;
        }

        const convoIds = convos.map((c: any) => c.id);

        const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .in('conversation_id', convoIds)
            .eq('is_read', false)
            .neq('sender_id', userId);

        if (isMounted.current) setUnreadCount(count ?? 0);
    };

    useEffect(() => {
        isMounted.current = true;

        if (!user) {
            setUnreadCount(0);
            return;
        }

        // ── Chargement initial ────────────────────────────────────────────────
        fetchUnread(user.id);

        // ── Recalcul quand l'app revient au premier plan ──────────────────────
        const appStateSub = AppState.addEventListener('change', (state) => {
            if (state === 'active') fetchUnread(user.id);
        });

        // ── Realtime ──────────────────────────────────────────────────────────
        const channel = supabase
            .channel(`unread-badge-${user.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload: any) => {
                    // Incrémenter uniquement pour les messages reçus
                    if (payload.new.sender_id !== user.id) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages' },
                () => {
                    // Un message a été marqué lu → recalcul complet
                    fetchUnread(user.id);
                }
            )
            .subscribe();

        return () => {
            isMounted.current = false;
            appStateSub.remove();
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    return unreadCount;
}
