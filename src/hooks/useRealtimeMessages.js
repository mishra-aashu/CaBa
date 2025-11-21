import { useEffect } from 'react';
import { supabase } from '../utils/supabase';
import NotificationSound from '../utils/notificationSound';

export const useRealtimeMessages = (chatId, onMessage) => {
    useEffect(() => {
        if (!chatId) return;

        const channel = supabase
            .channel(`chat_messages_${chatId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`
            }, (payload) => {
                onMessage(payload.new);
                // Play notification sound for new messages
                NotificationSound.playMessageNotification();
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [chatId, onMessage]);
};