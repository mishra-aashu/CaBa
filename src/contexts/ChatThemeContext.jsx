 import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';

// Complete Chat Themes Data with enhanced visibility and proper naming
const chatThemes = {
  classic_purple: {
    name: 'Classic Purple',
    category: 'Default',
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #667eea 0%, #764ba2 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #4c6ef5 0%, #5c7cfa 100%)',
      text: '#ffffff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      text: '#1a202c'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      text: '#1a202c',
      iconColor: '#667eea'
    },
    buttons: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    }
  },
  electric_dreams: {
    name: 'Electric Dreams',
    category: 'Futuristic',
    background: `
      radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      text: '#f0f9ff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      text: '#f1f5f9'
    },
    header: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      text: '#f8fafc',
      iconColor: '#f8fafc'
    },
    input: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      text: '#f8fafc',
      iconColor: '#06b6d4'
    },
    buttons: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      text: '#f8fafc',
      iconColor: '#f8fafc'
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
      background: 'linear-gradient(135deg, #1e1e2e 0%, #0f172a 100%)',
      text: '#e2e8f0'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
      text: '#f8fafc'
    },
    header: {
      background: 'linear-gradient(135deg, #1e1e2e 0%, #0f172a 100%)',
      text: '#f1f5f9',
      iconColor: '#f1f5f9'
    },
    input: {
      background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      text: '#f9fafb',
      iconColor: '#f9fafb'
    },
    buttons: {
      background: 'linear-gradient(135deg, #1e1e2e 0%, #0f172a 100%)',
      text: '#f1f5f9',
      iconColor: '#f1f5f9'
    }
  },
  ocean_depths: {
    name: 'Ocean Depths',
    category: 'Nature',
    background: `
      radial-gradient(circle at 30% 70%, rgba(14, 165, 233, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(2, 132, 199, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #0284c7 0%, #0369a1 50%, #075985 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      text: '#e0f7ff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #075985 0%, #0369a1 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      text: '#0c4a6e',
      iconColor: '#0284c7'
    },
    buttons: {
      background: 'linear-gradient(135deg, #075985 0%, #0369a1 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    }
  },
  forest_mist: {
    name: 'Forest Mist',
    category: 'Nature',
    background: `
      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 60% 40%, rgba(74, 222, 128, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #16a34a 0%, #15803d 50%, #166534 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      text: '#f0fdf4'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#14532d',
      iconColor: '#22c55e'
    },
    buttons: {
      background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    }
  },
  sunset_glow: {
    name: 'Sunset Glow',
    category: 'Colorful',
    background: `
      radial-gradient(circle at 25% 75%, rgba(251, 146, 60, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 75% 25%, rgba(234, 88, 12, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.3) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #ea580c 0%, #c2410c 50%, #9a3412 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
      text: '#fef2e2'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      text: '#9a3412',
      iconColor: '#ea580c'
    },
    buttons: {
      background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    }
  },
  cosmic_purple: {
    name: 'Cosmic Purple',
    category: 'Elegant',
    background: `
      radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(124, 58, 237, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #7c3aed 0%, #6b21a8 50%, #581c87 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      text: '#f3e8ff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      text: '#581c87',
      iconColor: '#8b5cf6'
    },
    buttons: {
      background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    }
  },
  golden_hour: {
    name: 'Golden Hour',
    category: 'Colorful',
    background: `
      radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(217, 119, 6, 0.35) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #f59e0b 0%, #d97706 50%, #92400e 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      text: '#fef2e2'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
      text: '#fef3c7',
      iconColor: '#fef3c7'
    },
    input: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      text: '#92400e',
      iconColor: '#f59e0b'
    },
    buttons: {
      background: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
      text: '#fef3c7',
      iconColor: '#fef3c7'
    }
  },
  midnight_city: {
    name: 'Midnight City',
    category: 'Dark',
    background: `
      radial-gradient(circle at 30% 70%, rgba(30, 27, 75, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(49, 46, 129, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #1e1b4b 0%, #312e81 50%, #1e40af 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      text: '#cbd5e1'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      text: '#e2e8f0'
    },
    header: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      text: '#e2e8f0',
      iconColor: '#e2e8f0'
    },
    input: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      text: '#f1f5f9',
      iconColor: '#60a5fa'
    },
    buttons: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      text: '#e2e8f0',
      iconColor: '#e2e8f0'
    }
  },
  rose_garden: {
    name: 'Rose Garden',
    category: 'Colorful',
    background: `
      radial-gradient(circle at 25% 75%, rgba(244, 63, 94, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 75% 25%, rgba(219, 39, 119, 0.35) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #f43f5e 0%, #db2777 50%, #be185d 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      text: '#fdf2f8'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
      text: '#fce7f3',
      iconColor: '#fce7f3'
    },
    input: {
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      text: '#be185d',
      iconColor: '#ec4899'
    },
    buttons: {
      background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
      text: '#fce7f3',
      iconColor: '#fce7f3'
    }
  },
  emerald_forest: {
    name: 'Emerald Forest',
    category: 'Nature',
    background: `
      radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.35) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #10b981 0%, #059669 50%, #047857 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      text: '#ecfdf5'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
      text: '#d1fae5',
      iconColor: '#d1fae5'
    },
    input: {
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      text: '#14532d',
      iconColor: '#10b981'
    },
    buttons: {
      background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
      text: '#d1fae5',
      iconColor: '#d1fae5'
    }
  },
  nebula: {
    name: 'Nebula',
    category: 'Elegant',
    background: `
      radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.25) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #ec4899 0%, #8b5cf6 50%, #7c3aed 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      text: '#fdf2f8'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #831843 0%, #6b21a8 100%)',
      text: '#fce7f3',
      iconColor: '#fce7f3'
    },
    input: {
      background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)',
      text: '#831843',
      iconColor: '#ec4899'
    },
    buttons: {
      background: 'linear-gradient(135deg, #831843 0%, #6b21a8 100%)',
      text: '#fce7f3',
      iconColor: '#fce7f3'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    category: 'Dark',
    background: `
      radial-gradient(circle at 25% 75%, rgba(0, 0, 0, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 75% 25%, rgba(26, 26, 26, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(64, 64, 64, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #0f0f0f 0%, #1a1a1a 50%, #262626 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #000000 0%, #262626 100%)',
      text: '#d4d4d4'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
      text: '#e5e5e5'
    },
    header: {
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      text: '#e5e5e5',
      iconColor: '#e5e5e5'
    },
    input: {
      background: 'linear-gradient(135deg, #262626 0%, #404040 100%)',
      text: '#f5f5f5',
      iconColor: '#a3a3a3'
    },
    buttons: {
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      text: '#e5e5e5',
      iconColor: '#e5e5e5'
    }
  },
  telegram_blue: {
    name: 'Telegram Blue',
    category: 'Professional',
    background: `
      radial-gradient(circle at 30% 70%, rgba(0, 136, 204, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(0, 95, 153, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #0088cc 0%, #005f99 50%, #003d5b 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #003d5b 0%, #004a6f 100%)',
      text: '#b3e5fc'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #002d42 0%, #003d5b 100%)',
      text: '#b3e5fc'
    },
    header: {
      background: 'linear-gradient(135deg, #003d5b 0%, #004a6f 100%)',
      text: '#e0f7ff',
      iconColor: '#e0f7ff'
    },
    input: {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      text: '#003d5b',
      iconColor: '#0088cc'
    },
    buttons: {
      background: 'linear-gradient(135deg, #003d5b 0%, #004a6f 100%)',
      text: '#e0f7ff',
      iconColor: '#e0f7ff'
    }
  },
  spring_vibes: {
    name: 'Spring Vibes',
    category: 'Nature',
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 222, 233, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(181, 255, 252, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(236, 252, 203, 0.3) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #FFDEE9 0%, #B5FFFC 50%, #A0E7E5 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
      text: '#fdf2f8'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    },
    input: {
      background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)',
      text: '#374151',
      iconColor: '#ec4899'
    },
    buttons: {
      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      text: '#ffffff',
      iconColor: '#ffffff'
    }
  },
  autumn_leaves: {
    name: 'Autumn Leaves',
    category: 'Nature',
    background: `
      radial-gradient(circle at 25% 75%, rgba(234, 88, 12, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 75% 25%, rgba(154, 52, 18, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.25) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #ea580c 0%, #9a3412 50%, #7c2d12 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #7c2d12 0%, #92400e 100%)',
      text: '#fde68a'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #431407 0%, #7c2d12 100%)',
      text: '#fde68a'
    },
    header: {
      background: 'linear-gradient(135deg, #7c2d12 0%, #92400e 100%)',
      text: '#fed7aa',
      iconColor: '#fed7aa'
    },
    input: {
      background: 'linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%)',
      text: '#7c2d12',
      iconColor: '#ea580c'
    },
    buttons: {
      background: 'linear-gradient(135deg, #7c2d12 0%, #92400e 100%)',
      text: '#fed7aa',
      iconColor: '#fed7aa'
    }
  },
  winter_calm: {
    name: 'Winter Calm',
    category: 'Nature',
    background: `
      radial-gradient(circle at 30% 70%, rgba(137, 247, 254, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(102, 166, 255, 0.3) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #89F7FE 0%, #66A6FF 50%, #3b82f6 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      text: '#bfdbfe'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      text: '#bfdbfe'
    },
    header: {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      text: '#dbeafe',
      iconColor: '#dbeafe'
    },
    input: {
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      text: '#1e40af',
      iconColor: '#3b82f6'
    },
    buttons: {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      text: '#dbeafe',
      iconColor: '#dbeafe'
    }
  },
  desert_dunes: {
    name: 'Desert Dunes',
    category: 'Nature',
    background: `
      radial-gradient(circle at 20% 80%, rgba(253, 230, 138, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.25) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #fde68a 0%, #f59e0b 50%, #d97706 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #a16207 0%, #ca8a04 100%)',
      text: '#fde68a'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #78350f 0%, #a16207 100%)',
      text: '#fde68a'
    },
    header: {
      background: 'linear-gradient(135deg, #a16207 0%, #ca8a04 100%)',
      text: '#fef3c7',
      iconColor: '#fef3c7'
    },
    input: {
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      text: '#a16207',
      iconColor: '#f59e0b'
    },
    buttons: {
      background: 'linear-gradient(135deg, #a16207 0%, #ca8a04 100%)',
      text: '#fef3c7',
      iconColor: '#fef3c7'
    }
  },
  lavender_fields: {
    name: 'Lavender Fields',
    category: 'Nature',
    background: `
      radial-gradient(circle at 25% 75%, rgba(196, 181, 253, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 75% 25%, rgba(139, 92, 246, 0.3) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.25) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #c4b5fd 0%, #8b5cf6 50%, #7c3aed 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      text: '#ddd6fe'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)',
      text: '#ddd6fe'
    },
    header: {
      background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      text: '#ede9fe',
      iconColor: '#ede9fe'
    },
    input: {
      background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
      text: '#5b21b6',
      iconColor: '#8b5cf6'
    },
    buttons: {
      background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      text: '#ede9fe',
      iconColor: '#ede9fe'
    }
  },
  cherry_blossom: {
    name: 'Cherry Blossom',
    category: 'Nature',
    background: `
      radial-gradient(circle at 30% 70%, rgba(253, 164, 175, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(244, 63, 94, 0.3) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(251, 113, 133, 0.25) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #fda4af 0%, #f43f5e 50%, #e11d48 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
      text: '#fecdd3'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #9f1239 0%, #be185d 100%)',
      text: '#fecdd3'
    },
    header: {
      background: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
      text: '#fce7f3',
      iconColor: '#fce7f3'
    },
    input: {
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      text: '#be185d',
      iconColor: '#f43f5e'
    },
    buttons: {
      background: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
      text: '#fce7f3',
      iconColor: '#fce7f3'
    }
  },
  rainy_day: {
    name: 'Rainy Day',
    category: 'Nature',
    background: `
      radial-gradient(circle at 20% 80%, rgba(156, 163, 175, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(75, 85, 99, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(107, 114, 128, 0.25) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #9ca3af 0%, #4b5563 50%, #374151 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
      text: '#f3f4f6'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      text: '#f3f4f6'
    },
    header: {
      background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
      text: '#f9fafb',
      iconColor: '#f9fafb'
    },
    input: {
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      text: '#374151',
      iconColor: '#6b7280'
    },
    buttons: {
      background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
      text: '#f9fafb',
      iconColor: '#f9fafb'
    }
  },
  sunset_bliss: {
    name: 'Sunset Bliss',
    category: 'Colorful',
    background: `
      radial-gradient(circle at 25% 75%, rgba(251, 146, 60, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 75% 25%, rgba(239, 68, 68, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #f97316 0%, #ef4444 50%, #dc2626 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      text: '#fef2f2'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      text: '#fef2f2',
      iconColor: '#fef2f2'
    },
    input: {
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      text: '#dc2626',
      iconColor: '#f97316'
    },
    buttons: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      text: '#fef2f2',
      iconColor: '#fef2f2'
    }
  },
  mint_fresh: {
    name: 'Mint Fresh',
    category: 'Nature',
    background: `
      radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(134, 239, 172, 0.25) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #10b981 0%, #34d399 50%, #6ee7b7 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      text: '#f0fdf4'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      text: '#f0fdf4',
      iconColor: '#f0fdf4'
    },
    input: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#047857',
      iconColor: '#10b981'
    },
    buttons: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      text: '#f0fdf4',
      iconColor: '#f0fdf4'
    }
  },
  royal_elegance: {
    name: 'Royal Elegance',
    category: 'Elegant',
    background: `
      radial-gradient(circle at 30% 70%, rgba(124, 58, 237, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.5) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
      linear-gradient(calc(135deg + var(--scroll-percentage, 0) * 1.8deg), #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)
    `,
    sentMessage: {
      background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
      text: '#f3e8ff'
    },
    receivedMessage: {
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      text: '#0f172a'
    },
    header: {
      background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
      text: '#f3e8ff',
      iconColor: '#f3e8ff'
    },
    input: {
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      text: '#581c87',
      iconColor: '#8b5cf6'
    },
    buttons: {
      background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
      text: '#f3e8ff',
      iconColor: '#f3e8ff'
    }
  }
};

// Create the Chat Theme Context
const ChatThemeContext = createContext();

// Chat Theme Provider Component
export const ChatThemeProvider = ({ children }) => {
  const { supabase } = useSupabase();
  
  // State
  const [currentChatTheme, setCurrentChatTheme] = useState('classic_purple');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--scroll-percentage', scrollPercentage);
  }, [scrollPercentage]);

  // Load chat theme - completely localStorage based to avoid all database errors
  const loadChatTheme = async (chatId) => {
    if (!chatId) {
      setCurrentChatTheme('classic_purple');
      setLoading(false);
      return;
    }

    // Debounce multiple calls for same chat
    const debounceKey = `digidad_theme_debounce_${chatId}`;
    const now = Date.now();
    const lastCall = parseInt(localStorage.getItem(debounceKey) || '0');
    
    if (now - lastCall < 1000) { // 1 second debounce
      setLoading(false);
      return;
    }
    localStorage.setItem(debounceKey, now.toString());

    // Load from localStorage first and only (completely localStorage-based)
    const cachedTheme = localStorage.getItem(`digidad_chat_theme_${chatId}`);
    if (cachedTheme && chatThemes[cachedTheme]) {
      setCurrentChatTheme(cachedTheme);
    } else if (!cachedTheme) {
      setCurrentChatTheme('classic_purple');
      localStorage.setItem(`digidad_chat_theme_${chatId}`, 'classic_purple');
    }

    setLoading(false);
  };

  // Save chat theme - completely localStorage based to avoid all database errors
  const saveChatTheme = async (themeKey, chatId, setByUserId) => {
    if (!chatId) {
      return;
    }

    try {
      // Always save to localStorage (works offline and always)
      localStorage.setItem(`digidad_chat_theme_${chatId}`, themeKey);
      
      // Note: Database sync disabled to avoid permission errors
      // localStorage will handle all theme persistence
    } catch (error) {
      // Fallback to localStorage (should never fail)
      try {
        localStorage.setItem(`digidad_chat_theme_${chatId}`, themeKey);
      } catch (e) {
        // localStorage might be full or disabled
        // Theme will still work for this session
      }
    }
  };

  // Set current chat ID and load theme
  const setChatId = (chatId) => {
    setCurrentChatId(chatId);
    setLoading(true);
    loadChatTheme(chatId);
  };

  // Select and apply theme
  const selectTheme = async (themeKey, chatIdOverride) => {
    if (!chatThemes[themeKey]) return;
    const chatIdToUse = chatIdOverride || currentChatId;
    
    if (!chatIdToUse) {
      console.error('No chat ID available for theme selection');
      return;
    }

    setCurrentChatTheme(themeKey);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    await saveChatTheme(themeKey, chatIdToUse, currentUser?.id);
    applyTheme(themeKey);
  };

  // Helper function to check if element is inside homescreen/chat list
  const isInHomescreen = (element) => {
    if (!element) return false;
    
    // Check if element or any of its parents have homescreen-related classes
    let current = element;
    while (current && current !== document.body) {
      const className = current.className || '';
      // Convert className to string to handle DOMTokenList objects
      const classNameStr = typeof className === 'string' ? className :
                          (className.toString ? className.toString() : '');
      
      if (classNameStr.includes('home-container') ||
          classNameStr.includes('chat-list') ||
          classNameStr.includes('chat-item') ||
          classNameStr.includes('chat-name') ||
          classNameStr.includes('chat-time') ||
          classNameStr.includes('last-message') ||
          classNameStr.includes('chat-info') ||
          classNameStr.includes('chat-header') ||
          classNameStr.includes('main-content') ||
          classNameStr.includes('sidebar')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  };

  // Apply theme styles - COMPLETELY EXCLUDE homescreen and chat list
  const applyTheme = (themeKey) => {
    const theme = chatThemes[themeKey];
    if (!theme) return;

    const root = document.documentElement;

    // Apply CSS custom properties for chat theme (these are safe to apply globally)
    root.style.setProperty('--chat-bg-gradient', theme.background);
    root.style.setProperty('--sent-message-bg', theme.sentMessage.background);
    root.style.setProperty('--sent-message-text', theme.sentMessage.text);
    root.style.setProperty('--received-message-bg', theme.receivedMessage.background);
    root.style.setProperty('--received-message-text', theme.receivedMessage.text);
    root.style.setProperty('--chat-header-bg', theme.header.background);
    root.style.setProperty('--chat-header-text', theme.header.text);
    root.style.setProperty('--chat-header-icon-color', theme.header.iconColor);
    root.style.setProperty('--chat-input-bg', theme.input.background);
    root.style.setProperty('--chat-input-text', theme.input.text);
    root.style.setProperty('--chat-input-icon-color', theme.input.iconColor);
    root.style.setProperty('--chat-buttons-bg', theme.buttons.background);
    root.style.setProperty('--chat-buttons-text', theme.buttons.text);
    root.style.setProperty('--chat-buttons-icon-color', theme.buttons.iconColor);

    // Apply to elements ONLY if they're NOT in homescreen/chat list
    const applyToElementIfNotInHomescreen = (selector, styleProperty, styleValue) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!isInHomescreen(element)) {
          element.style[styleProperty] = styleValue;
        }
      });
    };

    // Apply styles only to elements outside homescreen
    applyToElementIfNotInHomescreen('.chat-container', 'background', theme.background);
    applyToElementIfNotInHomescreen('#messagesContainer', 'background', theme.background);
    applyToElementIfNotInHomescreen('.chat-header', 'background', theme.header.background);
    applyToElementIfNotInHomescreen('.chat-header', 'color', theme.header.text);
    applyToElementIfNotInHomescreen('.message-input-area', 'background', theme.input.background);
    applyToElementIfNotInHomescreen('.message-input-area', 'color', theme.input.text);
    applyToElementIfNotInHomescreen('.input-wrapper', 'background', theme.input.background);
    applyToElementIfNotInHomescreen('#messageInput', 'color', theme.input.text);

    // Apply to buttons and icons only if not in homescreen
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (isInHomescreen(element)) return;
      
      const className = element.className || '';
      // Convert className to string to handle DOMTokenList objects
      const classNameStr = typeof className === 'string' ? className :
                          (className.toString ? className.toString() : '');
      const tagName = element.tagName;
      
      // Only apply to chat-specific elements, never homescreen
      if ((classNameStr.includes('chat') && !classNameStr.includes('chat-list') && !classNameStr.includes('chat-item')) ||
          (tagName === 'BUTTON' && element.closest('.chat-container')) ||
          (classNameStr.includes('message') && element.closest('.chat-container'))) {
         
        if (tagName === 'BUTTON') {
          element.style.background = theme.buttons.background;
          element.style.color = theme.buttons.text;
          element.style.border = 'none';
        }
         
        if (element.tagName === 'I' || element.tagName === 'SVG') {
          const parentClass = element.parentElement?.className || '';
          // Convert parentClass to string to handle DOMTokenList objects
          const parentClassStr = typeof parentClass === 'string' ? parentClass :
                                (parentClass.toString ? parentClass.toString() : '');
          if (parentClassStr.includes('chat') && !parentClassStr.includes('chat-list')) {
            element.style.color = theme.header.iconColor;
            element.style.stroke = theme.header.iconColor;
          }
        }
      }
    });

    // Theme applied successfully (completely excludes homescreen)
  };

  // Apply theme when theme or chatId changes
  useEffect(() => {
    if (!loading && currentChatId) {
      applyTheme(currentChatTheme);
    }
  }, [currentChatTheme, currentChatId, loading]);

  // Context value
  const value = {
    chatTheme: currentChatTheme,
    chatThemes,
    selectTheme,
    setChatId,
    loading,
    currentThemeData: chatThemes[currentChatTheme] || chatThemes.classic_purple,
    setScrollPercentage,
    currentChatId
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