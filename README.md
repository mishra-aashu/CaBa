# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## File Structure

```
react-chat-app/
├── .env
├── .gitignore
├── calling-system-schema.sql
├── database-schema.sql
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── vite.config.js
├── .github/
├── CaBa/
├── public/
│   ├── 404.html
│   ├── supabase-config.js
│   ├── turn-config.js
│   ├── vite.svg
│   ├── webrtc-calling.js
│   └── assets/
│       ├── audio/
│       │   └── (various .mp3 files)
│       └── images/
│           └── dp-options/
│               └── (various images and dp-options.json)
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── security.js
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── ActiveCallScreen.jsx
│   │   ├── CallButton.jsx
│   │   ├── CallHistory.jsx
│   │   ├── CallScreen.jsx
│   │   ├── CallStatusIndicator.jsx
│   │   ├── Home.jsx
│   │   ├── Home.jsx.corrupted
│   │   ├── IncomingCallModal.jsx
│   │   ├── IncomingCallProvider.jsx
│   │   ├── Intro.jsx
│   │   ├── MessagingLoader.jsx
│   │   ├── UserDetails.css
│   │   ├── UserDetails.jsx
│   │   ├── auth/
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── index.js
│   │   │   ├── Login.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── Signup.jsx
│   │   ├── blocked/
│   │   │   ├── Blocked.css
│   │   │   ├── Blocked.jsx
│   │   │   └── index.js
│   │   ├── calls/
│   │   │   ├── CallInterface.jsx
│   │   │   ├── Calls.css
│   │   │   ├── Calls.jsx
│   │   │   ├── IncomingCall.jsx
│   │   │   └── index.js
│   │   ├── chat/
│   │   │   ├── AttachmentMenu.jsx
│   │   │   ├── Chat.css
│   │   │   ├── Chat.jsx
│   │   │   ├── Chat.jsx.backup
│   │   │   ├── index.js
│   │   │   ├── MediaMessage.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageItem.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── WallpaperSelector.jsx
│   │   ├── common/
│   │   │   ├── DropdownMenu.css
│   │   │   ├── DropdownMenu.jsx
│   │   │   ├── EmojiPicker.css
│   │   │   ├── EmojiPicker.jsx
│   │   │   ├── Modal.css
│   │   │   └── Modal.jsx
│   │   ├── media/
│   │   │   ├── AvatarUpload.jsx
│   │   │   ├── index.js
│   │   │   ├── MediaCleanup.jsx
│   │   │   ├── MediaUpload.jsx
│   │   │   ├── MediaViewer.jsx
│   │   │   ├── P2PTransfer.jsx
│   │   │   ├── StorageFallback.jsx
│   │   │   ├── TURNConfig.jsx
│   │   │   └── WebRTCCalling.jsx
│   │   ├── news/
│   │   │   ├── index.js
│   │   │   ├── News.css
│   │   │   └── News.jsx
│   │   ├── profile/
│   │   │   ├── index.js
│   │   │   └── Profile.jsx
│   │   ├── reminders/
│   │   │   ├── CreateReminder.css
│   │   │   ├── CreateReminder.jsx
│   │   │   ├── index.js
│   │   │   ├── Reminders.css
│   │   │   ├── Reminders.jsx
│   │   │   ├── ReminderSettings.css
│   │   │   └── ReminderSettings.jsx
│   │   ├── settings/
│   │   │   ├── index.js
│   │   │   └── Settings.jsx
│   │   ├── shared-profile/
│   │   │   ├── index.js
│   │   │   ├── SharedProfile.css
│   │   │   └── SharedProfile.jsx
│   │   └── user-details/
│   │       ├── index.js
│   │       ├── UserDetails.css
│   │       └── UserDetails.jsx
│   ├── config/
│   │   └── supabase.js
│   ├── context/
│   │   └── CallContext.jsx
│   ├── contexts/
│   │   ├── ChatThemeContext.jsx
│   │   ├── SupabaseContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useCallHistory.js
│   │   ├── useChatListRealtime.js
│   │   ├── useMessageStatusUpdates.js
│   │   ├── useRealtimeMessages.js
│   │   ├── useRealtimeTyping.js
│   │   └── media/
│   │       ├── index.js
│   │       ├── useAvatarUpload.js
│   │       ├── useMediaCleanup.js
│   │       ├── useMediaDownload.js
│   │       ├── useMediaUpload.js
│   │       ├── useMediaViewer.js
│   │       ├── useP2PTransfer.js
│   │       ├── useStorageFallback.js
│   │       ├── useTURNConfig.js
│   │       └── useWebRTCCalling.js
│   ├── services/
│   │   ├── callService.js
│   │   └── webrtcService.js
│   ├── styles/
│   │   ├── admin.css
│   │   ├── auth.css
│   │   ├── calls.css
│   │   ├── chat.css
│   │   ├── global.css
│   │   ├── home.css
│   │   ├── intro.css
│   │   ├── news-style.css
│   │   ├── news.css
│   │   ├── profile.css
│   │   ├── reminders.css
│   │   └── settings.css
│   └── utils/
│       ├── cacheManager.js
│       ├── callUtils.js
│       ├── notificationSound.js
│       └── supabase.js
```
