import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';
import { Login, Signup, ForgotPassword, ResetPassword } from './components/auth';
import { Chat } from './components/chat';
import Home from './components/Home';
import Profile from './components/profile';
import Settings from './components/settings';
import News from './components/news';
import Reminders from './components/reminders';
import Calls from './components/calls';
import Blocked from './components/blocked';
import UserDetails from './components/UserDetails';
import SharedProfile from './components/shared-profile';
import Intro from './components/Intro';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSupabase();

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
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
      <BrowserRouter basename="/CaBa/">
        {showIntro ? <Intro onComplete={() => setShowIntro(false)} /> : (
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/home.html" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/chat" element={<Navigate to="/" replace />} />
            <Route path="/chat/:chatId/:otherUserId" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            <Route path="/calls" element={<ProtectedRoute><Calls /></ProtectedRoute>} />
            <Route path="/blocked" element={<ProtectedRoute><Blocked /></ProtectedRoute>} />
            <Route path="/user-details/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
            <Route path="/shared-profile/:id" element={<ProtectedRoute><SharedProfile /></ProtectedRoute>} />
          </Routes>
        )}
      </BrowserRouter>
    </SupabaseProvider>
  );
}

export default App;
