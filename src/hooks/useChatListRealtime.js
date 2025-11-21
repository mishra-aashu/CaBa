import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';

export const useChatListRealtime = (currentUserId) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadChats = useCallback(async (userId) => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('chats')
                .select(`
                    *,
                    user1:users!chats_user1_id_fkey(id, name, avatar, phone, is_online),
                    user2:users!chats_user2_id_fkey(id, name, avatar, phone, is_online)
                `)
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .order('last_message_time', { ascending: false });

            if (error) throw error;

            const chatsData = data.map(chat => {
                const otherUser = chat.user1.id === userId ? chat.user2 : chat.user1;
                return {
                    ...chat,
                    otherUser,
                    unreadCount: 0
                };
            });

            setChats(chatsData);
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateChatInList = useCallback(async (chatId) => {
        // Fetch updated chat data
        const { data } = await supabase
            .from('chats')
            .select(`
                *,
                user1:users!chats_user1_id_fkey(id, name, avatar, phone, is_online),
                user2:users!chats_user2_id_fkey(id, name, avatar, phone, is_online)
            `)
            .eq('id', chatId)
            .single();

        if (data) {
            const otherUser = data.user1.id === currentUserId ? data.user2 : data.user1;
            const updatedChat = {
                ...data,
                otherUser,
                unreadCount: 0
            };

            setChats(prev => {
                const index = prev.findIndex(c => c.id === chatId);
                if (index >= 0) {
                    // Update existing
                    const updated = [...prev];
                    updated[index] = updatedChat;
                    return updated.sort((a, b) =>
                        new Date(b.last_message_time) - new Date(a.last_message_time)
                    );
                } else {
                    // Add new
                    return [updatedChat, ...prev];
                }
            });
        }
    }, [currentUserId]);

    useEffect(() => {
        if (currentUserId) {
            loadChats(currentUserId);
        }
    }, [currentUserId, loadChats]);

    useEffect(() => {
        if (!currentUserId) return;

        // Subscribe to new messages
        const messagesChannel = supabase
            .channel('chat_list_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                const message = payload.new;
                if (message.sender_id === currentUserId ||
                    message.receiver_id === currentUserId) {
                    // Update specific chat
                    await updateChatInList(message.chat_id);
                }
            })
            .subscribe();

        // Subscribe to chat updates
        const chatsChannel = supabase
            .channel('chat_list_chats')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chats'
            }, (payload) => {
                updateChatInList(payload.new.id);
            })
            .subscribe();

        return () => {
            messagesChannel.unsubscribe();
            chatsChannel.unsubscribe();
        };
    }, [currentUserId, updateChatInList]);

    return { chats, setChats, loading };
};