// supabase-auth.js - Supabase Auth implementation
(function() {
    'use strict';
    
    // Initialize Supabase client
    const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
    
    const { createClient } = window.supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { useState, useEffect, useContext, createContext } = React;
    const h = React.createElement;
    
    // Auth Context
    const AuthContext = createContext(null);
    
    // Auth Provider Component
    window.AuthProvider = function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        const [userProfile, setUserProfile] = useState(null);
        const [loading, setLoading] = useState(true);
        const [session, setSession] = useState(null);
        
        useEffect(() => {
            // Check for existing session
            checkSession();
            
            // Listen for auth changes
            const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
                async (event, session) => {
                    console.log('[Supabase Auth] Auth state changed:', event);
                    setSession(session);
                    
                    if (session?.user) {
                        setUser(session.user);
                        await loadUserProfile(session.user.id);
                    } else {
                        setUser(null);
                        setUserProfile(null);
                    }
                    
                    setLoading(false);
                }
            );
            
            return () => {
                subscription?.unsubscribe();
            };
        }, []);
        
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                setSession(session);
                
                if (session?.user) {
                    setUser(session.user);
                    await loadUserProfile(session.user.id);
                }
            } catch (error) {
                console.error('[Supabase Auth] Session check error:', error);
            } finally {
                setLoading(false);
            }
        };
        
        const loadUserProfile = async (userId) => {
            try {
                const { data, error } = await supabaseClient
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (error) throw error;
                setUserProfile(data);
            } catch (error) {
                console.error('[Supabase Auth] Error loading profile:', error);
            }
        };
        
        const login = async (email, password) => {
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email.toLowerCase(),
                    password: password
                });
                
                if (error) throw error;
                
                // Update last login
                if (data.user) {
                    await supabaseClient
                        .from('user_profiles')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', data.user.id);
                }
                
                return { success: true, user: data.user };
            } catch (error) {
                console.error('[Supabase Auth] Login error:', error);
                return { 
                    success: false, 
                    error: error.message || 'Login failed'
                };
            }
        };
        
        const register = async (email, password, username, displayName) => {
            try {
                // Check if username is already taken
                const { data: existingUser } = await supabaseClient
                    .from('user_profiles')
                    .select('username')
                    .eq('username', username.toLowerCase())
                    .single();
                
                if (existingUser) {
                    return {
                        success: false,
                        error: 'Username already taken'
                    };
                }
                
                // Sign up with Supabase Auth
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email.toLowerCase(),
                    password: password,
                    options: {
                        data: {
                            username: username.toLowerCase(),
                            display_name: displayName || username
                        }
                    }
                });
                
                if (error) throw error;
                
                // Update the user profile with username (the trigger creates basic profile)
                if (data.user) {
                    await supabaseClient
                        .from('user_profiles')
                        .update({
                            username: username.toLowerCase(),
                            display_name: displayName || username
                        })
                        .eq('id', data.user.id);
                }
                
                return { 
                    success: true, 
                    user: data.user,
                    message: 'Registration successful! Please check your email to verify your account.'
                };
            } catch (error) {
                console.error('[Supabase Auth] Registration error:', error);
                return { 
                    success: false, 
                    error: error.message || 'Registration failed'
                };
            }
        };
        
        const logout = async () => {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
                
                setUser(null);
                setUserProfile(null);
                setSession(null);
            } catch (error) {
                console.error('[Supabase Auth] Logout error:', error);
            }
        };
        
        const updateProfile = async (updates) => {
            if (!user) return { success: false, error: 'No user logged in' };
            
            try {
                const { data, error } = await supabaseClient
                    .from('user_profiles')
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id)
                    .select()
                    .single();
                
                if (error) throw error;
                
                setUserProfile(data);
                return { success: true };
            } catch (error) {
                console.error('[Supabase Auth] Profile update error:', error);
                return { 
                    success: false, 
                    error: error.message || 'Failed to update profile'
                };
            }
        };
        
        const resetPassword = async (email) => {
            try {
                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`
                });
                
                if (error) throw error;
                
                return { 
                    success: true, 
                    message: 'Password reset email sent. Please check your inbox.'
                };
            } catch (error) {
                console.error('[Supabase Auth] Password reset error:', error);
                return { 
                    success: false, 
                    error: error.message || 'Failed to send reset email'
                };
            }
        };
        
        const value = {
            user: userProfile || user, // Use profile if available, fallback to auth user
            loading,
            session,
            login,
            register,
            logout,
            signOut: logout, // Alias for compatibility
            updateProfile,
            resetPassword,
            isAuthenticated: !!user,
            supabaseClient // Expose client for direct access if needed
        };
        
        return h(AuthContext.Provider, { value }, children);
    };
    
    // Hook to use auth
    window.useAuth = function() {
        const context = useContext(AuthContext);
        if (!context) {
            return {
                user: null,
                loading: true,
                login: () => Promise.resolve({ success: false }),
                register: () => Promise.resolve({ success: false }),
                logout: () => {},
                signOut: () => {},
                updateProfile: () => Promise.resolve({ success: false }),
                resetPassword: () => Promise.resolve({ success: false }),
                isAuthenticated: false
            };
        }
        return context;
    };
    
    // Enhanced Auth Modal with Password Reset
    window.AuthModal = function AuthModal({ onClose }) {
        const [mode, setMode] = useState('login');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [username, setUsername] = useState('');
        const [displayName, setDisplayName] = useState('');
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');
        const [loading, setLoading] = useState(false);
        
        const { login, register, resetPassword } = window.useAuth();
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setSuccess('');
            setLoading(true);
            
            try {
                let result;
                
                if (mode === 'login') {
                    result = await login(email, password);
                } else if (mode === 'register') {
                    // Validation
                    if (!username || username.length < 3) {
                        setError('Username must be at least 3 characters');
                        setLoading(false);
                        return;
                    }
                    if (!email || !email.includes('@')) {
                        setError('Please enter a valid email');
                        setLoading(false);
                        return;
                    }
                    if (!password || password.length < 6) {
                        setError('Password must be at least 6 characters');
                        setLoading(false);
                        return;
                    }
                    
                    result = await register(email, password, username, displayName);
                } else if (mode === 'forgot') {
                    result = await resetPassword(email);
                }
                
                if (result.success) {
                    if (result.message) {
                        setSuccess(result.message);
                        if (mode === 'register' || mode === 'forgot') {
                            setTimeout(() => {
                                setMode('login');
                                setSuccess('');
                            }, 3000);
                        } else {
                            onClose();
                        }
                    } else {
                        onClose();
                    }
                } else {
                    setError(result.error || 'Operation failed');
                }
            } catch (err) {
                console.error('[AuthModal] Error:', err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };
        
        return h('div', {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            },
            onClick: onClose
        },
            h('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                },
                onClick: (e) => e.stopPropagation()
            },
                h('h2', {
                    style: {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }
                }, 
                    mode === 'login' ? '🍄 Welcome Back!' : 
                    mode === 'register' ? '🍄 Join Flash Fungi' :
                    '🔑 Reset Password'
                ),
                
                success && h('div', {
                    style: {
                        padding: '0.75rem',
                        backgroundColor: '#d1fae5',
                        border: '1px solid #10b981',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: '#065f46'
                    }
                }, success),
                
                h('form', { onSubmit: handleSubmit },
                    h('div', { style: { marginBottom: '1rem' } },
                        h('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.25rem'
                            }
                        }, 'Email'),
                        h('input', {
                            type: 'email',
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            required: true,
                            disabled: loading,
                            autoComplete: 'email',
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),
                    
                    mode === 'register' && h('div', { style: { marginBottom: '1rem' } },
                        h('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.25rem'
                            }
                        }, 'Username'),
                        h('input', {
                            type: 'text',
                            value: username,
                            onChange: (e) => setUsername(e.target.value),
                            required: true,
                            disabled: loading,
                            autoComplete: 'username',
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),
                    
                    mode === 'register' && h('div', { style: { marginBottom: '1rem' } },
                        h('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.25rem'
                            }
                        }, 'Display Name (optional)'),
                        h('input', {
                            type: 'text',
                            value: displayName,
                            onChange: (e) => setDisplayName(e.target.value),
                            placeholder: username || 'Your display name',
                            disabled: loading,
                            autoComplete: 'name',
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),
                    
                    mode !== 'forgot' && h('div', { style: { marginBottom: '1rem' } },
                        h('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.25rem'
                            }
                        }, 'Password'),
                        h('input', {
                            type: 'password',
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                            required: true,
                            disabled: loading,
                            minLength: mode === 'register' ? 6 : 1,
                            autoComplete: mode === 'register' ? 'new-password' : 'current-password',
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        }),
                        mode === 'register' && h('p', {
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                marginTop: '0.25rem'
                            }
                        }, 'Must be at least 6 characters')
                    ),
                    
                    error && h('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #ef4444',
                            borderRadius: '0.375rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: '#dc2626'
                        }
                    }, error),
                    
                    h('button', {
                        type: 'submit',
                        disabled: loading,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: loading ? '#9ca3af' : '#10b981',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '1rem'
                        }
                    }, 
                        loading ? 'Please wait...' : 
                        mode === 'login' ? 'Sign In' : 
                        mode === 'register' ? 'Create Account' :
                        'Send Reset Email'
                    )
                ),
                
                mode === 'login' && h('div', {
                    style: {
                        marginTop: '1rem',
                        textAlign: 'center'
                    }
                },
                    h('button', {
                        onClick: () => {
                            setMode('forgot');
                            setError('');
                        },
                        style: {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }
                    }, 'Forgot password?')
                ),
                
                h('div', {
                    style: {
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }
                },
                    h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                        mode === 'login' ? "Don't have an account? " : 
                        mode === 'register' ? "Already have an account? " :
                        "Remember your password? ",
                        h('button', {
                            onClick: () => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError('');
                                setSuccess('');
                                setEmail('');
                                setPassword('');
                                setUsername('');
                                setDisplayName('');
                            },
                            style: {
                                color: '#3b82f6',
                                fontWeight: '500',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }
                        }, mode === 'login' ? 'Sign Up' : 'Sign In')
                    )
                )
            )
        );
    };
    
    console.log('[Supabase Auth] Authentication system loaded');
})();