/**
 * Unified Authentication Service
 * Handles both Google OAuth and Phone/Password login
 * Prevents conflicts between different auth methods
 */

import { supabase } from '../utils/supabase.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authType = null;
    this.listeners = [];
  }

  // Initialize auth state
  async initialize() {
    try {
      // Check for existing session
      const savedUser = localStorage.getItem('currentUser');
      const authToken = localStorage.getItem('authToken');
      const authType = localStorage.getItem('authType');

      if (savedUser && authToken && authType) {
        const userData = JSON.parse(savedUser);
        if (userData.id === authToken) {
          this.currentUser = userData;
          this.authType = authType;
          this.notifyListeners();
          return userData;
        }
      }

      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await this.handleSupabaseUser(session.user);
        return userData;
      }

      return null;
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.clearSession();
      return null;
    }
  }

  // Handle Supabase OAuth user
  async handleSupabaseUser(supabaseUser) {
    try {
      // Check if user exists in database
      let { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', supabaseUser.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Create user if doesn't exist
      if (!dbUser) {
        const newUser = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
          email: supabaseUser.email,
          phone: supabaseUser.user_metadata?.phone || '',
          avatar: supabaseUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          is_online: true,
          last_seen: new Date().toISOString()
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (createError) throw createError;
        dbUser = createdUser;
      }

      const userData = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone || '',
        avatar: dbUser.avatar,
        authType: 'google'
      };

      this.setSession(userData, 'google');
      return userData;
    } catch (error) {
      console.error('Error handling Supabase user:', error);
      throw error;
    }
  }

  // Phone/Password login
  async loginWithPhone(phone, password) {
    try {
      // Normalize phone
      const normalizedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
      
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .single();

      if (error || !user) {
        throw new Error('Phone number not registered');
      }

      if (!user.password) {
        throw new Error('Account setup incomplete');
      }

      // Verify password (simple comparison - use bcrypt in production)
      if (password !== user.password) {
        throw new Error('Invalid password');
      }

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        avatar: user.avatar,
        authType: 'phone'
      };

      // Update online status
      await supabase
        .from('users')
        .update({
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);

      this.setSession(userData, 'phone');
      return userData;
    } catch (error) {
      console.error('Phone login error:', error);
      throw error;
    }
  }

  // Google OAuth login
  async loginWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Set session
  setSession(userData, authType) {
    this.currentUser = userData;
    this.authType = authType;
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('authToken', userData.id);
    localStorage.setItem('authType', authType);
    
    this.notifyListeners();
  }

  // Clear session
  clearSession() {
    this.currentUser = null;
    this.authType = null;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authType');
    localStorage.removeItem('sessionPermanent');
    
    this.notifyListeners();
  }

  // Logout
  async logout() {
    try {
      // Update offline status if user exists
      if (this.currentUser) {
        await supabase
          .from('users')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('id', this.currentUser.id);
      }

      // Sign out from Supabase if Google auth
      if (this.authType === 'google') {
        await supabase.auth.signOut();
      }

      this.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      this.clearSession(); // Clear anyway
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Add auth state listener
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentUser, this.authType);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;