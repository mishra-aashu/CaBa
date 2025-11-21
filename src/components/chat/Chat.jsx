import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { Phone, Video, User, Bell, BellOff, Search, Image, Palette, Clock, Settings as SettingsIcon, Trash2, Ban, ArrowDown } from 'lucide-react';
import DropdownMenu from '../common/DropdownMenu';
import Modal from '../common/Modal';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import WallpaperSelector from './WallpaperSelector';
import './Chat.css';

// DP options for avatar display
const baseUrl = import.meta.env.BASE_URL || '/';
const dpOptionsData = [
  { id: 1, path: `${baseUrl}assets/images/dp-options/00701602b0eac0390b3107b9e2a665e0.jpg` },
  { id: 2, path: `${baseUrl}assets/images/dp-options/1691130988954.jpg` },
  { id: 3, path: `${baseUrl}assets/images/dp-options/aesthetic-cartoon-funny-dp-for-instagram.webp` },
  { id: 4, path: `${baseUrl}assets/images/dp-options/boy-cartoon-dp-with-hoodie.webp` },
  { id: 5, path: `${baseUrl}assets/images/dp-options/download (1).jpg` },
  { id: 6, path: `${baseUrl}assets/images/dp-options/download.jpg` },
  { id: 7, path: `${baseUrl}assets/images/dp-options/funny-profile-picture-wd195eo9rpjy7ax1.jpg` },
  { id: 8, path: `${baseUrl}assets/images/dp-options/funny-whatsapp-dp-for-girls.webp` },
  { id: 9, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575118_y.jpg` },
  { id: 10, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575119_y.jpg` },
  { id: 11, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575120_y.jpg` },
  { id: 12, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575121_y.jpg` },
  { id: 13, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575122_y.jpg` },
  { id: 14, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575123_y.jpg` },
  { id: 15, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575124_y.jpg` },
  { id: 16, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575125_y.jpg` },
  { id: 17, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575126_y.jpg` },
  { id: 18, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575127_y.jpg` },
  { id: 19, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267708_w.jpg` },
  { id: 20, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267709_w.jpg` },
  { id: 21, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267710_w.jpg` },
  { id: 22, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267711_w.jpg` },
  { id: 23, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267712_w.jpg` },
  { id: 24, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267713_w.jpg` },
  { id: 25, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267714_w.jpg` },
  { id: 26, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267715_w.jpg` },
  { id: 27, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267716_w.jpg` },
  { id: 28, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267717_w.jpg` }
];

const Chat = () => {
  const { chatId, otherUserId } = useParams();
  const navigate = useNavigate();
  const { supabase } = useSupabase();

  // State
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);
  const [theme, setTheme] = useState('light');

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTempChat, setIsTempChat] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesSubscriptionRef = useRef(null);
  const typingSubscriptionRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    initializeChat();
    return () => {
      cleanup();
    };
  }, [chatId, otherUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load mute and temp chat preferences
  useEffect(() => {
    const mutedChats = JSON.parse(localStorage.getItem('mutedChats') || '{}');
    setIsMuted(!!mutedChats[chatId]);

    const tempChats = JSON.parse(localStorage.getItem('tempChats') || '{}');
    setIsTempChat(!!tempChats[chatId]);
  }, [chatId]);

  const initializeChat = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        console.error('No current user found');
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      await loadOtherUserInfo(otherUserId);
      await loadMessages();
      setupMessageSubscriptions();
      setupTypingSubscriptions();
      await loadWallpaper();
      loadTheme();
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const cleanup = () => {
    if (messagesSubscriptionRef.current) {
      messagesSubscriptionRef.current.unsubscribe();
    }
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current.unsubscribe();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const loadOtherUserInfo = async (userId) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setOtherUser(user);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);
      await markMessagesAsRead();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupMessageSubscriptions = () => {
    messagesSubscriptionRef.current = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, async (payload) => {
        if (payload.new.sender_id !== currentUser?.id) {
          setMessages(prev => [...prev, payload.new]);
          await markMessagesAsRead();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        setMessages(prev => prev.map(msg =>
          msg.id === payload.new.id ? payload.new : msg
        ));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe();
  };

  const setupTypingSubscriptions = () => {
    typingSubscriptionRef.current = supabase
      .channel(`typing_${chatId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const typingData = payload.payload;
        if (typingData.user_id !== currentUser?.id && typingData.chat_id === chatId) {
          setIsTyping(typingData.is_typing);
        }
      })
      .subscribe();
  };

  const loadWallpaper = async () => {
    try {
      const { data: chatWallpaper, error } = await supabase
        .from('chat_wallpapers')
        .select('wallpaper_id')
        .eq('chat_id', chatId)
        .maybeSingle();

      if (error) {
        console.log('Wallpaper tables not available');
        return;
      }

      if (chatWallpaper && chatWallpaper.wallpaper_id) {
        const { data: wallpaper, error: wallpaperError } = await supabase
          .from('wallpapers')
          .select('url')
          .eq('id', chatWallpaper.wallpaper_id)
          .single();

        if (!wallpaperError && wallpaper) {
          setWallpaper(wallpaper.url);
        }
      }
    } catch (error) {
      console.warn('Error loading wallpaper:', error);
    }
  };

  const handleWallpaperSelect = async (selectedWallpaper) => {
    try {
      if (selectedWallpaper) {
        const { error } = await supabase
          .from('chat_wallpapers')
          .upsert([{
            chat_id: chatId,
            wallpaper_id: selectedWallpaper.id,
            set_by: currentUser.id
          }], { onConflict: 'chat_id' });

        if (error) throw error;
        setWallpaper(selectedWallpaper.url);
      } else {
        const { error } = await supabase
          .from('chat_wallpapers')
          .delete()
          .eq('chat_id', chatId);

        if (error) throw error;
        setWallpaper(null);
      }
    } catch (error) {
      console.error('Error setting wallpaper:', error);
    }
  };

  const handleBlockUser = async () => {
    const confirmed = window.confirm(`Block ${otherUser.name}? They won't be able to message or call you.`);
    if (!confirmed || !currentUser) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert([{
          blocker_id: currentUser.id,
          blocked_id: otherUser.id
        }]);

      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  };

  const applyTheme = (themeName) => {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;

    // Define theme backgrounds
    const themeBackgrounds = {
      light: 'none',
      dark: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      ocean_depths: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 25%, #0ea5e9 50%, #0284c7 75%, #0ea5e9 100%)',
      forest_mist: 'linear-gradient(135deg, #22c55e 0%, #16a34a 25%, #22c55e 50%, #16a34a 75%, #22c55e 100%)',
      sunset_glow: 'linear-gradient(135deg, #fb923c 0%, #ea580c 25%, #fb923c 50%, #ea580c 75%, #fb923c 100%)',
      cosmic_purple: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 25%, #9333ea 50%, #7c3aed 75%, #9333ea 100%)',
      arctic_ice: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 25%, #38bdf8 50%, #0ea5e9 75%, #38bdf8 100%)',
      golden_hour: 'linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #f59e0b 100%)',
      midnight_city: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #1e1b4b 50%, #312e81 75%, #1e1b4b 100%)',
      rose_garden: 'linear-gradient(135deg, #f43f5e 0%, #db2777 25%, #f43f5e 50%, #db2777 75%, #f43f5e 100%)',
      emerald_forest: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #10b981 50%, #059669 75%, #10b981 100%)',
      nebula: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 25%, #3b82f6 50%, #10b981 75%, #ec4899 100%)',
      cyberpunk: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0f0f0f 100%)',
      autumn_leaves: 'linear-gradient(135deg, #ea580c 0%, #9a3412 25%, #ea580c 50%, #9a3412 75%, #ea580c 100%)',
      galaxy: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #7c3aed 50%, #ec4899 75%, #1e1b4b 100%)',
      telegram_blue: 'linear-gradient(135deg, #0088cc 0%, #005f99 25%, #0088cc 50%, #005f99 75%, #0088cc 100%)',
      spring_vibes: 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 25%, #FFDEE9 50%, #B5FFFC 75%, #FFDEE9 100%)',
      monsoon_mist: 'linear-gradient(135deg, #6190E8 0%, #A7BFE8 25%, #6190E8 50%, #A7BFE8 75%, #6190E8 100%)',
      autumn_warmth: 'linear-gradient(135deg, #FF6E7F 0%, #BFE9FF 25%, #FF6E7F 50%, #BFE9FF 75%, #FF6E7F 100%)',
      winter_calm: 'linear-gradient(135deg, #89F7FE 0%, #66A6FF 25%, #89F7FE 50%, #66A6FF 75%, #89F7FE 100%)',
      summer_festival: 'linear-gradient(135deg, #FCE38A 0%, #8EC5FC 25%, #FCE38A 50%, #8EC5FC 75%, #FCE38A 100%)',
      night_aurora: 'linear-gradient(135deg, #20002c 0%, #cbb4d4 25%, #20002c 50%, #cbb4d4 75%, #20002c 100%)',
      foggy_hills: 'linear-gradient(135deg, #f8ffae 0%, #43cea2 25%, #f8ffae 50%, #43cea2 75%, #f8ffae 100%)',
      tech_futurism: 'linear-gradient(135deg, #396afc 0%, #fbc2eb 25%, #396afc 50%, #fbc2eb 75%, #396afc 100%)',
      dark_professional: 'linear-gradient(135deg, #1e1e2e 0%, #0f172a 25%, #1e1e2e 50%, #0f172a 75%, #1e1e2e 100%)'
    };

    const background = themeBackgrounds[themeName] || 'none';
    if (background !== 'none') {
      messagesContainer.style.background = background;
      messagesContainer.style.backgroundSize = 'cover';
      messagesContainer.style.backgroundPosition = 'center';
      messagesContainer.style.backgroundRepeat = 'no-repeat';
    } else {
      messagesContainer.style.background = 'none';
    }

    // Set data-theme for CSS variables
    document.documentElement.setAttribute('data-theme', themeName === 'dark' ? 'dark' : 'light');
  };

  const sendMessage = async (content) => {
    if (!content.trim() || !currentUser) return;

    try {
      const newMessage = {
        id: crypto.randomUUID(),
        chat_id: chatId,
        sender_id: currentUser.id,
        receiver_id: otherUserId,
        content: content.trim(),
        message_type: 'text',
        is_read: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([newMessage])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setMessages(prev => [...prev, data[0]]);
      }

      await supabase
        .from('chats')
        .update({
          last_message: content.substring(0, 50),
          last_message_time: new Date().toISOString()
        })
        .eq('id', chatId);

      setReplyingTo(null);
      sendTypingStatus(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendTypingStatus = async (isTyping) => {
    if (!currentUser || !chatId) return;

    try {
      await supabase
        .channel(`typing_${chatId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            chat_id: chatId,
            user_id: currentUser.id,
            is_typing: isTyping,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  };

  const handleTyping = () => {
    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async () => {
    try {
      if (!currentUser) return;

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleMessageSelect = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const exitSelectionMode = () => {
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  const handleViewContact = () => {
    if (!otherUserId || otherUserId === 'undefined') {
      alert('User information not available');
      return;
    }
    navigate(`/user-details/${otherUserId}`);
  };

  const handleCreateReminder = () => {
    navigate(`/create-reminder?userId=${otherUserId}`);
  };

  const handleMuteToggle = async () => {
    try {
      const newMutedState = !isMuted;
      const mutedChats = JSON.parse(localStorage.getItem('mutedChats') || '{}');
      if (newMutedState) {
        mutedChats[chatId] = true;
      } else {
        delete mutedChats[chatId];
      }
      localStorage.setItem('mutedChats', JSON.stringify(mutedChats));
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleSearchMessages = () => {
    alert('Message search feature coming soon!');
  };

  const handleChangeTheme = () => {
    setShowThemeModal(true);
  };

  const handleTempChatToggle = async () => {
    try {
      const newTempChatState = !isTempChat;
      const tempChats = JSON.parse(localStorage.getItem('tempChats') || '{}');
      if (newTempChatState) {
        tempChats[chatId] = {
          enabled: true,
          duration: 24 * 60 * 60 * 1000
        };
      } else {
        delete tempChats[chatId];
      }
      localStorage.setItem('tempChats', JSON.stringify(tempChats));
      setIsTempChat(newTempChatState);
    } catch (error) {
      console.error('Error toggling temp chat:', error);
    }
  };

  const handleTempChatSettings = () => {
    alert('Temp chat settings coming soon!');
  };

  const handleClearChat = async () => {
    const confirmed = window.confirm('Clear all messages in this chat? This cannot be undone.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      if (error) throw error;

      setMessages([]);

      await supabase
        .from('chats')
        .update({
          last_message: null,
          last_message_time: new Date().toISOString()
        })
        .eq('id', chatId);
    } catch (error) {
      console.error('Error clearing chat:', error);
      alert('Failed to clear chat. Please try again.');
    }
  };

  const handleVoiceCall = () => {
    alert('Voice call feature coming soon!');
  };

  const handleVideoCall = () => {
    alert('Video call feature coming soon!');
  };

  const handleScroll = (e) => {
    const container = e.target;
    const scrolledFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(scrolledFromBottom > 300);
  };

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
    setUnreadCount(0);
  };

  if (!otherUser || !currentUser) {
    return <div className="chat-loading">Loading chat...</div>;
  }

  return (
    <div className="chat-screen">
      {/* Chat Header */}
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ←
        </button>

        <div className="chat-user-info" onClick={handleViewContact} style={{ cursor: 'pointer' }}>
          <div className="user-avatar">
            {otherUser.avatar ? (
              parseInt(otherUser.avatar) ? (
                <img src={dpOptionsData.find(dp => dp.id === parseInt(otherUser.avatar))?.path || otherUser.avatar} alt={otherUser.name} />
              ) : (
                <img src={otherUser.avatar} alt={otherUser.name} />
              )
            ) : (
              otherUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="user-details">
            <h3 className="user-name">{otherUser.name}</h3>
            <p className="user-status">
              {isTyping ? 'typing...' : otherUser.is_online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="chat-actions">
          <button className="icon-btn" onClick={handleVoiceCall} title="Voice Call">
            <Phone size={20} />
          </button>
          <button className="icon-btn" onClick={handleVideoCall} title="Video Call">
            <Video size={20} />
          </button>

          <DropdownMenu
            items={[
              {
                icon: <User size={16} />,
                label: 'View Contact',
                onClick: handleViewContact
              },
              {
                icon: <Bell size={16} />,
                label: 'Create Reminder',
                onClick: handleCreateReminder
              },
              {
                icon: isMuted ? <Bell size={16} /> : <BellOff size={16} />,
                label: isMuted ? 'Unmute Notifications' : 'Mute Notifications',
                onClick: handleMuteToggle
              },
              {
                icon: <Search size={16} />,
                label: 'Search Messages',
                onClick: handleSearchMessages
              },
              {
                icon: <Image size={16} />,
                label: 'Change Wallpaper',
                onClick: () => setShowWallpaperSelector(true)
              },
              {
                icon: <Palette size={16} />,
                label: 'Themes',
                onClick: handleChangeTheme
              },
              { divider: true },
              {
                icon: <Clock size={16} />,
                label: isTempChat ? 'Disable Temporary Chat' : 'Enable Temporary Chat',
                onClick: handleTempChatToggle
              },
              {
                icon: <SettingsIcon size={16} />,
                label: 'Temp Chat Settings',
                onClick: handleTempChatSettings,
                disabled: !isTempChat
              },
              {
                icon: <Trash2 size={16} />,
                label: 'Clear Chat',
                onClick: handleClearChat
              },
              { divider: true },
              {
                icon: <Ban size={16} />,
                label: 'Block User',
                onClick: handleBlockUser,
                danger: true
              }
            ]}
          />
        </div>
      </header>

      {/* Selection Toolbar */}
      {isSelectionMode && (
        <div className="selection-toolbar">
          <button className="selection-close-btn" onClick={exitSelectionMode}>
            ✕
          </button>
          <div className="selection-info">
            {selectedMessages.size} selected
          </div>
          <div className="selection-actions">
            <button className="selection-action-btn" title="Delete">
              🗑️
            </button>
            <button className="selection-action-btn" title="Forward">
              ➡️
            </button>
            <button className="selection-action-btn" title="Copy">
              📋
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        className="messages-container"
        style={{ backgroundImage: wallpaper ? `url(${wallpaper})` : 'none' }}
        onScroll={handleScroll}
        ref={messagesContainerRef}
      >
        <MessageList
          messages={messages}
          currentUser={currentUser}
          selectedMessages={selectedMessages}
          isSelectionMode={isSelectionMode}
          onMessageSelect={handleMessageSelect}
          onReply={handleReply}
        />

        <TypingIndicator isVisible={isTyping} />

        <div ref={messagesEndRef} />

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button className="scroll-bottom-btn" onClick={scrollToBottomSmooth}>
            <ArrowDown size={20} />
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount}</span>
            )}
          </button>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        onTyping={handleTyping}
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
      />

      {/* Wallpaper Selector */}
      <WallpaperSelector
        isVisible={showWallpaperSelector}
        onClose={() => setShowWallpaperSelector(false)}
        onWallpaperSelect={handleWallpaperSelect}
      />

      {/* Theme Selector Modal */}
      <Modal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title="Choose Theme"
        size="large"
      >
        <div className="theme-selector">
          {/* Default Themes */}
          <div className="theme-category">
            <h4>Default</h4>
            <div className="theme-grid">
              <button
                className={`theme-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => {
                  changeTheme('light');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Light</span>
              </button>
              <button
                className={`theme-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => {
                  changeTheme('dark');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Nature Themes */}
          <div className="theme-category">
            <h4>Nature</h4>
            <div className="theme-grid">
              <button
                className={`theme-item ${theme === 'ocean_depths' ? 'active' : ''}`}
                onClick={() => {
                  changeTheme('ocean_depths');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Ocean Depths</span>
              </button>
              <button
                className={`theme-item ${theme === 'forest_mist' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('forest_mist');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Forest Mist</span>
              </button>
              <button
                className={`theme-item ${theme === 'arctic_ice' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('arctic_ice');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Arctic Ice</span>
              </button>
              <button
                className={`theme-item ${theme === 'emerald_forest' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('emerald_forest');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Emerald Forest</span>
              </button>
            </div>
          </div>

          {/* Colorful Themes */}
          <div className="theme-category">
            <h4>Colorful</h4>
            <div className="theme-grid">
              <button
                className={`theme-item ${theme === 'sunset_glow' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('sunset_glow');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Sunset Glow</span>
              </button>
              <button
                className={`theme-item ${theme === 'cosmic_purple' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('cosmic_purple');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Cosmic Purple</span>
              </button>
              <button
                className={`theme-item ${theme === 'golden_hour' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('golden_hour');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Golden Hour</span>
              </button>
              <button
                className={`theme-item ${theme === 'nebula' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('nebula');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Nebula</span>
              </button>
            </div>
          </div>

          {/* Elegant Themes */}
          <div className="theme-category">
            <h4>Elegant</h4>
            <div className="theme-grid">
              <button
                className={`theme-item ${theme === 'rose_garden' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('rose_garden');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #db2777 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Rose Garden</span>
              </button>
              <button
                className={`theme-item ${theme === 'midnight_city' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('midnight_city');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Midnight City</span>
              </button>
            </div>
          </div>

          {/* Dark Themes */}
          <div className="theme-category">
            <h4>Dark</h4>
            <div className="theme-grid">
              <button
                className={`theme-item ${theme === 'dark_professional' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('dark_professional');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #1e1e2e 0%, #0f172a 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Dark Professional</span>
              </button>
              <button
                className={`theme-item ${theme === 'cyberpunk' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('cyberpunk');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Cyberpunk</span>
              </button>
            </div>
          </div>

          {/* Seasonal Themes */}
          <div className="theme-category">
            <h4>Seasonal</h4>
            <div className="theme-grid">
              <button
                className={`theme-item ${theme === 'spring_vibes' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('spring_vibes');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Spring Vibes</span>
              </button>
              <button
                className={`theme-item ${theme === 'autumn_leaves' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('autumn_leaves');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Autumn Leaves</span>
              </button>
              <button
                className={`theme-item ${theme === 'winter_calm' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('winter_calm');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #89F7FE 0%, #66A6FF 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Winter Calm</span>
              </button>
            </div>
          </div>

          {/* Inspired Themes */}
          <div className="theme-category">
            <h4>Inspired</h4>
            <div className="theme-grid">
              <button
                className={`theme-item ${theme === 'telegram_blue' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('telegram_blue');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #0088cc 0%, #005f99 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Telegram Blue</span>
              </button>
              <button
                className={`theme-item ${theme === 'galaxy' ? 'active' : ''}`}
                onClick={() => {
                  setTheme('galaxy');
                  setShowThemeModal(false);
                }}
              >
                <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
                  <div className="theme-sample sent"></div>
                  <div className="theme-sample received"></div>
                </div>
                <span>Galaxy</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Chat;