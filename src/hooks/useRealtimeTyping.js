import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export const useTypingIndicator = (chatId, currentUserId) => {
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

    useEffect(() => {
        if (!chatId) return;

        const channel = supabase
            .channel(`typing_${chatId}`)
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.userId !== currentUserId) {
                    setIsOtherUserTyping(payload.payload.isTyping);

                    // Auto-hide after 3 seconds
                    if (payload.payload.isTyping) {
                        setTimeout(() => setIsOtherUserTyping(false), 3000);
                    }
                }
            })
            .subscribe();

        return () => channel.unsubscribe();
    }, [chatId, currentUserId]);

    const sendTypingStatus = (isTyping) => {
        const channel = supabase.channel(`typing_${chatId}`);
        channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: currentUserId, isTyping }
        });
    };

    return { isOtherUserTyping, sendTypingStatus };
};