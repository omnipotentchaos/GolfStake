'use client';

/**
 * Authentication Context
 * Provides auth state (user, session, loading) throughout the app.
 * Handles signup, login, logout, and session persistence via Supabase Auth.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from profiles table
  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }

  useEffect(() => {
    // Get initial session safely
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    }).catch(err => {
      console.warn('Session access restricted by browser:', err);
    }).finally(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id); // Removed await to prevent spinner hanging
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign up with email and password
   * Creates auth user and profile record
   */
  async function signUp({ email, password, fullName, phone, country }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName,
          phone: phone || null,
          country: country || null
        },
      },
    });
    if (error) throw error;

    // We still try to upsert from client as a fallback, but we ignore RLS errors 
    // because the database trigger (handle_new_user) will handle it securely.
    if (data.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone || null,
        country: country || null,
        role: 'user',
      });
      if (profileError && profileError.code !== '42501') { 
        // Ignore 42501 (RLS denied) because the trigger handles it, log other errors
        console.error('Profile creation fallback error:', profileError);
      }
    }

    return data;
  }

  /**
   * Sign in with email and password
   */
  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  /**
   * Sign out current user
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isSubscribed: false, // Will be computed from subscription data
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
