class SessionManager {
  constructor(supabase) {
    this.supabase = supabase;
    this.sessionListeners = new Set();
    this.currentUser = null;
  }

  async initialize() {
    try {
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this.currentUser = storedUser;
        this.notifyListeners();
        return storedUser;
      }
      return null;
    } catch (error) {
      console.error('Session manager initialization failed:', error);
      return null;
    }
  }

  storeUser(user) {
    if (user) {
      try {
        sessionStorage.setItem('_auth_user', JSON.stringify(user));
      } catch (error) {
        console.error('Error storing user:', error);
      }
    }
  }

  getStoredUser() {
    try {
      const stored = sessionStorage.getItem('_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error retrieving stored user:', error);
      return null;
    }
  }

  clearStoredUser() {
    try {
      sessionStorage.removeItem('_auth_user');
    } catch (error) {
      console.error('Error clearing stored user:', error);
    }
  }

  async signInWithPhonePassword(phone, password) {
    try {
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Phone number not registered' };
      }

      if (userData.password !== password) {
        return { success: false, error: 'Invalid password' };
      }

      // Sign in to Supabase auth using stored email
      const storedEmail = userData.email;
      console.log('Attempting Supabase auth sign in for phone user:', storedEmail);
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: storedEmail,
        password: password
      });

      if (authError) {
        console.error('Supabase auth sign in error:', authError);
        // Continue anyway, as the user can still use custom auth
      }

      this.currentUser = userData;
      this.storeUser(userData);
      this.notifyListeners();

      return { success: true, data: { user: userData } };
    } catch (error) {
      console.error('Phone sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUpWithPhonePassword(phone, password, name, email) {
    try {
      // Create Supabase auth user with real email
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: email,
        password: password
      });

      if (authError) {
        console.error('Supabase auth sign up error:', authError);
        // For now, continue with custom auth if Supabase auth fails
      }

      const { data: dbUser, error: dbError } = await this.supabase
        .from('users')
        .insert([{
          id: authData?.user?.id || undefined, // Use Supabase auth user id if available
          phone: phone,
          name: name,
          password: password,
          email: email, // Store real email
          is_online: true,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      this.currentUser = dbUser;
      this.storeUser(dbUser);
      this.notifyListeners();

      return { success: true, data: { user: dbUser } };
    } catch (error) {
      console.error('Phone sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      this.currentUser = null;
      this.clearStoredUser();
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  addListener(callback) {
    this.sessionListeners.add(callback);
    return () => this.sessionListeners.delete(callback);
  }

  notifyListeners() {
    this.sessionListeners.forEach(callback => {
      try {
        callback({
          user: this.currentUser,
          isAuthenticated: this.isAuthenticated()
        });
      } catch (error) {
        console.error('Session listener error:', error);
      }
    });
  }
}

export default SessionManager;
