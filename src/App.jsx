import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';
import { CallProvider } from './context/CallContext';
import { Login, Signup, ForgotPassword, ResetPassword } from './components/auth';
import { Chat } from './components/chat';
import Home from './components/Home';
import Profile from './components/profile';
import Settings from './components/settings';
import News from './components/news';
import Reminders from './components/reminders';
import CreateReminder from './components/reminders/CreateReminder';
import Calls from './components/calls';
import Blocked from './components/blocked';
import UserDetails from './components/UserDetails';
import SharedProfile from './components/shared-profile';
import Intro from './components/Intro';
import CallScreen from './components/CallScreen';
import CallStatusIndicator from './components/CallStatusIndicator';
import { IncomingCallModal } from './components/IncomingCallModal';
import MessagingLoader from './components/MessagingLoader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSupabase();

  if (loading) return <MessagingLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const CallProviderWrapper = ({ children }) => {
  const { user } = useSupabase();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.name || 'User',
        email: user.email,
        phone: user.user_metadata?.phone || '',
        avatar: user.user_metadata?.avatar || null
      });
    } else {
      // Load from localStorage if user not available yet
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
  }, [user]);

  return (
    <CallProvider currentUser={currentUser}>
      {children}
    </CallProvider>
  );
};

// Home component is now imported

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const { pathname, search } = window.location;
    if (search.startsWith('?/')) {
      const path = search.slice(2).replace(/~and~/g, '&');
      window.history.replaceState(null, '', pathname + path);
    }
  }, []);

  return (
    <SupabaseProvider>
      <CallProviderWrapper>
        <BrowserRouter basename="/CaBa/">
          {showIntro ? <Intro onComplete={() => setShowIntro(false)} /> : (
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/chat/:chatId/:otherUserId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chat/new/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/call/:callId" element={<ProtectedRoute><CallScreen /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
              <Route path="/create-reminder" element={<ProtectedRoute><CreateReminder /></ProtectedRoute>} />
              <Route path="/calls" element={<ProtectedRoute><Calls /></ProtectedRoute>} />
              <Route path="/blocked" element={<ProtectedRoute><Blocked /></ProtectedRoute>} />
              <Route path="/user-details/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
              <Route path="/shared-profile/:id" element={<ProtectedRoute><SharedProfile /></ProtectedRoute>} />
            </Routes>
          )}

          {/* Global Call Components */}
          <CallStatusIndicator />
          <IncomingCallModal />
        </BrowserRouter>
      </CallProviderWrapper>
    </SupabaseProvider>
  );
}

export default App;
