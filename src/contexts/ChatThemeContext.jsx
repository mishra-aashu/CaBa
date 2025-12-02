import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';

// Chat Themes Data
const chatThemes = {
  classic: {
    name: 'Classic',
    category: 'Default',
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #667eea 0%, #764ba2 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      text: '#212529'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      text: '#212529'
    }
  },
  dark_professional: {
    name: 'Dark Professional',
    category: 'Dark',
    background: `
      radial-gradient(circle at 25% 25%, rgba(30, 30, 46, 0.8) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(15, 23, 42, 0.6) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #1e1e2e 0%, #0f172a 50%, #1e1e2e 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
      text: '#f9fafb'
    },
    header: {
      background: 'linear-gradient(135deg, #1e1e2e 0%, #0f172a 100%)',
      text: '#f1f5f9'
    },
    input: {
      background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      text: '#f9fafb'
    }
  },
  ocean_depths: {
    name: 'Ocean Depths',
    category: 'Nature',
    background: `
      radial-gradient(circle at 30% 70%, rgba(14, 165, 233, 0.2) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(2, 132, 199, 0.25) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #0ea5e9 0%, #0284c7 25%, #0ea5e9 50%, #0284c7 75%, #0ea5e9 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      text: '#0c4a6e'
    },
    header: {
      background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
      text: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      text: '#0c4a6e'
    }
  },
  forest_mist: {
    name: 'Forest Mist',
    category: 'Nature',
    background: `
      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.2) 0%, transparent 45%),
      radial-gradient(circle at 60% 40%, rgba(74, 222, 128, 0.1) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #22c55e 0%, #16a34a 25%, #22c55e 50%, #16a34a 75%, #22c55e 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#14532d'
    },
    header: {
      background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
      text: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
      text: '#14532d'
    }
  },
  sunset_glow: {
    name: 'Sunset Glow',
    category: 'Colorful',
    background: `
      radial-gradient(circle at 25% 75%, rgba(251, 146, 60, 0.25) 0%, transparent 40%),
      radial-gradient(circle at 75% 25%, rgba(234, 88, 12, 0.3) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #fb923c 0%, #ea580c 25%, #fb923c 50%, #ea580c 75%, #fb923c 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      text: '#9a3412'
    },
    header: {
      background: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
      text: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
      text: '#9a3412'
    }
  },
  cosmic_purple: {
    name: 'Cosmic Purple',
    category: 'Elegant',
    background: `
      radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.25) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(124, 58, 237, 0.3) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #9333ea 0%, #7c3aed 25%, #9333ea 50%, #7c3aed 75%, #9333ea 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      text: '#581c87'
    },
    header: {
      background: 'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)',
      text: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
      text: '#581c87'
    }
  },
  ruby_radiance: {
    name: 'Ruby Radiance',
    category: 'Elegant',
    background: `
      radial-gradient(circle at 20% 80%, rgba(225, 29, 72, 0.2) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(253, 29, 29, 0.25) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(255, 50, 50, 0.15) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #e11d48 0%, #fd1d1d 25%, #e11d48 50%, #fd1d1d 75%, #e11d48 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #9f1239 0%, #881337 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      text: '#9f1239'
    },
    header: {
      background: 'linear-gradient(135deg, #9f1239 0%, #881337 100%)',
      text: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
      text: '#9f1239'
    }
  }
};

// Create the Chat Theme Context
const ChatThemeContext = createContext();

// Chat Theme Provider Component
export const ChatThemeProvider = ({ children }) => {
  const { supabase } = useSupabase();
  const [chatTheme, setChatTheme] = useState(() => {
    // Initialize from localStorage immediately
    return localStorage.getItem('digidad_chat_theme') || 'classic';
  });
  const [loading, setLoading] = useState(true);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  // Load user's theme preference from Supabase
  useEffect(() => {
    loadUserTheme();
  }, [supabase]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--scroll-percentage', scrollPercentage);
  }, [scrollPercentage]);

  const loadUserTheme = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.id) {
        // Load from localStorage cache
        const cachedTheme = localStorage.getItem('digidad_chat_theme') || 'classic';
        setChatTheme(cachedTheme);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_themes')
        .select('theme_id')
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error loading theme:', error);
        // Fall back to cached theme
        const cachedTheme = localStorage.getItem('digidad_chat_theme') || 'classic';
        setChatTheme(cachedTheme);
      } else if (data && data.length > 0) {
        setChatTheme(data[0].theme_id);
        localStorage.setItem('digidad_chat_theme', data[0].theme_id);
      } else {
        // No theme set, use default
        setChatTheme('classic');
        localStorage.setItem('digidad_chat_theme', 'classic');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      const cachedTheme = localStorage.getItem('digidad_chat_theme') || 'classic';
      setChatTheme(cachedTheme);
    } finally {
      setLoading(false);
    }
  };

  // Save theme preference to Supabase
  const saveThemePreference = async (themeKey) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.id) {
        // Offline mode - just save to localStorage
        localStorage.setItem('digidad_chat_theme', themeKey);
        return;
      }

      // First, remove existing theme preference
      await supabase
        .from('user_themes')
        .delete()
        .eq('user_id', currentUser.id);

      // Insert new theme preference
      const { error } = await supabase
        .from('user_themes')
        .insert([{
          user_id: currentUser.id,
          theme_id: themeKey
        }]);

      if (error) throw error;

      // Update local cache
      localStorage.setItem('digidad_chat_theme', themeKey);

    } catch (error) {
      console.error('Error saving theme preference:', error);
      // Always save locally as fallback
      localStorage.setItem('digidad_chat_theme', themeKey);
    }
  };

  // Select and apply theme
  const selectTheme = async (themeKey) => {
    if (!chatThemes[themeKey]) return;

    setChatTheme(themeKey);
    await saveThemePreference(themeKey);
    applyTheme(themeKey);
  };

  // Apply theme styles
  const applyTheme = (themeKey) => {
    const theme = chatThemes[themeKey];
    if (!theme) return;

    const root = document.documentElement;

    // Apply CSS custom properties for chat theme
    root.style.setProperty('--chat-bg-gradient', theme.background);
    root.style.setProperty('--sent-message-bg', theme.sentMessage.background);
    root.style.setProperty('--sent-message-text', theme.sentMessage.text);
    root.style.setProperty('--received-message-bg', theme.receivedMessage.background);
    root.style.setProperty('--received-message-text', theme.receivedMessage.text);
    root.style.setProperty('--chat-header-bg', theme.header.background);
    root.style.setProperty('--chat-header-text', theme.header.text);
    root.style.setProperty('--chat-input-bg', theme.input.background);
    root.style.setProperty('--chat-input-text', theme.input.text);

    // Apply background to messages container
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.style.background = theme.background;
    }

    // Apply header background
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
      chatHeader.style.background = theme.header.background;
      chatHeader.style.color = theme.header.text;
    }

    // Apply input area background
    const messageInputArea = document.querySelector('.message-input-area');
    if (messageInputArea) {
      messageInputArea.style.background = theme.input.background;
      messageInputArea.style.color = theme.input.text;
    }

    // Update input wrapper background
    const inputWrapper = document.querySelector('.input-wrapper');
    if (inputWrapper) {
      inputWrapper.style.background = theme.input.background;
    }

    // Update message input text color
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
      messageInput.style.color = theme.input.text;
    }
  };

  // Apply theme when chatTheme changes
  useEffect(() => {
    if (!loading) {
      applyTheme(chatTheme);
    }
  }, [chatTheme, loading]);

  // Context value
  const value = {
    chatTheme,
    chatThemes,
    selectTheme,
    loading,
    currentThemeData: chatThemes[chatTheme] || chatThemes.classic,
    setScrollPercentage
  };

  return (
    <ChatThemeContext.Provider value={value}>
      {children}
    </ChatThemeContext.Provider>
  );
};

// Custom hook to use the Chat Theme Context
export const useChatTheme = () => {
  const context = useContext(ChatThemeContext);
  if (!context) {
    throw new Error('useChatTheme must be used within a ChatThemeProvider');
  }
  return context;
};

export default ChatThemeContext;