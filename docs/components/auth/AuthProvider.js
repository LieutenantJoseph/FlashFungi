// AuthProvider.js - Enhanced Authentication Provider with Username Support
// Flash Fungi - Complete auth system with improved UX

(function() {
    'use strict';
    
    const { createContext, useContext, useState, useEffect } = React;
    
    // Authentication Context
    const AuthContext = createContext();
    
    // Authentication Provider Component
    window.AuthProvider = function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        const [session, setSession] = useState(null);
        const [loading, setLoading] = useState(true);
        const [supabaseReady, setSupabaseReady] = useState(false);
        
        // Enhanced Supabase initialization
        useEffect(() => {
            const initializeSupabase = async () => {
                // Check if Supabase is available
                if (typeof window.supabase === 'undefined') {
                    console.log('⏳ Waiting for Supabase...');
                    
                    // Create Supabase client if CDN library is available
                    const maxAttempts = 50;
                    let attempts = 0;
                    
                    const checkSupabase = () => {
                        attempts++;
                        
                        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                            console.log('✅ Supabase CDN loaded, creating client...');
                            
                            try {
                                window.supabase = window.supabase.createClient(
                                    window.SUPABASE_URL,
                                    window.SUPABASE_ANON_KEY,
                                    {
                                        auth: {
                                            autoRefreshToken: true,
                                            persistSession: true,
                                            detectSessionInUrl: true
                                        }
                                    }
                                );
                                
                                console.log('✅ Supabase client created successfully');
                                setSupabaseReady(true);
                                
                            } catch (error) {
                                console.error('❌ Error creating Supabase client:', error);
                            }
                        } else if (attempts < maxAttempts) {
                            setTimeout(checkSupabase, 100);
                        } else {
                            console.error('❌ Supabase failed to load after 5 seconds');
                        }
                    };
                    
                    checkSupabase();
                } else {
                    console.log('✅ Supabase already available');
                    setSupabaseReady(true);
                }
            };
            
            initializeSupabase();
        }, []);
        
        // Get initial session and set up auth listener
        useEffect(() => {
            if (!supabaseReady || !window.supabase) return;
            
            console.log('🔐 Setting up authentication...');
            
            // Get initial session
            const getInitialSession = async () => {
                try {
                    const { data: { session }, error } = await window.supabase.auth.getSession();
                    
                    if (error) {
                        console.error('❌ Error getting session:', error);
                    } else {
                        console.log('📱 Initial session:', session ? 'found' : 'none');
                        setSession(session);
                        setUser(session?.user || null);
                    }
                } catch (error) {
                    console.error('❌ Error in getSession:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            getInitialSession();
            
            // Listen for auth changes
            const { data: { subscription } } = window.supabase.auth.onAuthStateChange(
                async (event, session) => {
                    console.log('🔄 Auth state changed:', event, session ? 'session exists' : 'no session');
                    
                    setSession(session);
                    setUser(session?.user || null);
                    
                    // Create or update user profile for new signups
                    if (event === 'SIGNED_UP' && session?.user) {
                        await createUserProfile(session.user);
                    }
                    
                    setLoading(false);
                }
            );
            
            return () => {
                subscription?.unsubscribe();
            };
        }, [supabaseReady]);
        
        // Create user profile in database
        const createUserProfile = async (user) => {
            if (!window.supabase) return;
            
            try {
                console.log('👤 Creating user profile for:', user.email);
                
                const profileData = {
                    id: user.id,
                    email: user.email,
                    username: user.user_metadata?.username || user.user_metadata?.display_name || user.email.split('@')[0],
                    display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email.split('@')[0],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                const { data, error } = await window.supabase
                    .from('user_profiles')
                    .upsert(profileData, { 
                        onConflict: 'id',
                        ignoreDuplicates: false 
                    })
                    .select()
                    .single();
                
                if (error) {
                    console.error('❌ Error creating user profile:', error);
                } else {
                    console.log('✅ User profile created:', data);
                }
            } catch (error) {
                console.error('❌ Error in createUserProfile:', error);
            }
        };
        
        // Enhanced sign up function
        const signUp = async (email, password, metadata = {}) => {
            if (!window.supabase) {
                return { data: null, error: { message: 'Supabase not initialized' } };
            }
            
            try {
                setLoading(true);
                console.log('📝 Signing up user:', email, 'with metadata:', metadata);
                
                const { data, error } = await window.supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: metadata.username || metadata.display_name,
                            display_name: metadata.display_name || metadata.username,
                            ...metadata
                        }
                    }
                });
                
                if (error) throw error;
                
                console.log('✅ Sign up successful:', data);
                return { data, error: null };
                
            } catch (error) {
                console.error('❌ Sign up error:', error);
                return { data: null, error };
            } finally {
                setLoading(false);
            }
        };
        
        // Enhanced sign in function
        const signIn = async (email, password) => {
            if (!window.supabase) {
                return { data: null, error: { message: 'Supabase not initialized' } };
            }
            
            try {
                setLoading(true);
                console.log('🔑 Signing in user:', email);
                
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                console.log('✅ Sign in successful');
                return { data, error: null };
                
            } catch (error) {
                console.error('❌ Sign in error:', error);
                return { data: null, error };
            } finally {
                setLoading(false);
            }
        };
        
        // Sign out function
        const signOut = async () => {
            if (!window.supabase) {
                return { error: { message: 'Supabase not initialized' } };
            }
            
            try {
                setLoading(true);
                console.log('👋 Signing out user');
                
                const { error } = await window.supabase.auth.signOut();
                
                if (error) throw error;
                
                console.log('✅ Sign out successful');
                return { error: null };
                
            } catch (error) {
                console.error('❌ Sign out error:', error);
                return { error };
            } finally {
                setLoading(false);
            }
        };
        
        // Reset password function
        const resetPassword = async (email) => {
            if (!window.supabase) {
                return { data: null, error: { message: 'Supabase not initialized' } };
            }
            
            try {
                console.log('🔄 Sending password reset for:', email);
                
                const { data, error } = await window.supabase.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo: `${window.location.origin}/reset-password`
                    }
                );
                
                if (error) throw error;
                
                console.log('✅ Password reset email sent');
                return { data, error: null };
                
            } catch (error) {
                console.error('❌ Reset password error:', error);
                return { data: null, error };
            }
        };
        
        // Context value
        const value = {
            user,
            session,
            loading,
            signIn,
            signUp,
            signOut,
            resetPassword: resetPassword,
            supabaseReady
        };
        
        // Show loading while waiting for Supabase
        if (!supabaseReady) {
            return React.createElement('div', { 
                style: { 
                    minHeight: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb'
                }
            },
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { 
                        style: {
                            width: '2rem',
                            height: '2rem',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem'
                        }
                    }),
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.25rem', 
                            fontWeight: 'bold', 
                            color: '#1f2937',
                            marginBottom: '0.5rem'
                        }
                    }, '🍄 Flash Fungi'),
                    React.createElement('p', { 
                        style: { 
                            color: '#6b7280',
                            fontSize: '0.875rem'
                        }
                    }, 'Initializing authentication system...')
                )
            );
        }
        
        return React.createElement(AuthContext.Provider, { value }, children);
    };
    
    // useAuth hook
    window.useAuth = function useAuth() {
        const context = useContext(AuthContext);
        if (!context) {
            throw new Error('useAuth must be used within an AuthProvider');
        }
        return context;
    };
    
    // Auth Guard Component
    window.AuthGuard = function AuthGuard({ children, fallback = null }) {
        const { user, loading } = window.useAuth();
        
        if (loading) {
            return React.createElement(window.LoadingScreen, {
                message: 'Authenticating...'
            });
        }
        
        if (!user) {
            return fallback || React.createElement('div', { 
                style: { 
                    minHeight: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb'
                }
            },
                React.createElement('div', { 
                    style: {
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '100%',
                        margin: '1rem'
                    }
                },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: '#1f2937',
                            marginBottom: '1rem'
                        }
                    }, '🍄 Flash Fungi'),
                    React.createElement('p', { 
                        style: { 
                            color: '#6b7280',
                            marginBottom: '1.5rem'
                        }
                    }, 'Please sign in to continue learning about mushroom identification.'),
                    React.createElement(window.LoginForm)
                )
            );
        }
        
        return children;
    };
    
    console.log('✅ Enhanced AuthProvider, useAuth, AuthGuard, and LoginForm components loaded');
    
})();