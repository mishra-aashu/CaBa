import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useMessageStatusUpdates = (chatId, onStatusUpdate) => {
    useEffect(() => {
        if (!chatId) return;

        const channel = supabase
            .channel(`message_status_${chatId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`
            }, (payload) => {
                onStatusUpdate(payload.new);
            })
            .subscribe();

        return () => channel.unsubscribe();
    }, [chatId, onStatusUpdate]);
};