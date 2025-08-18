// AuthProvider - Phase 3 Authentication Provider Component
// Provides authentication context and user management

(function() {
    'use strict';
    
    const { createContext, useContext, useState, useEffect } = React;
    
    // Authentication Context
    const AuthContext = createContext();
    
    // Authentication Provider Component
    window.AuthProvider = function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [session, setSession] = useState(null);
        const [supabaseReady, setSupabaseReady] = useState(false);
        
        // Wait for Supabase to be initialized
        useEffect(() => {
            const checkSupabase = () => {
                if (window.supabase && window.supabase.auth) {
                    console.log('✅ Supabase client ready for AuthProvider');
                    setSupabaseReady(true);
                    return true;
                }
                return false;
            };
            
            // Check immediately
            if (checkSupabase()) {
                return;
            }
            
            // Poll for Supabase availability
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max
            
            const pollForSupabase = () => {
                attempts++;
                
                if (checkSupabase()) {
                    return; // Success
                }
                
                if (attempts >= maxAttempts) {
                    console.error('❌ Supabase client not available after 5 seconds');
                    setLoading(false);
                    return;
                }
                
                setTimeout(pollForSupabase, 100);
            };
            
            pollForSupabase();
        }, []);
        
        // Initialize Supabase auth once client is ready
        useEffect(() => {
            if (!supabaseReady || !window.supabase) {
                return;
            }
            
            // Get initial session
            const getInitialSession = async () => {
                try {
                    const { data: { session }, error } = await window.supabase.auth.getSession();
                    
                    if (error) {
                        console.error('Error getting session:', error);
                    } else {
                        setSession(session);
                        setUser(session?.user || null);
                        console.log('✅ Initial session loaded:', session?.user?.email || 'No user');
                    }
                } catch (error) {
                    console.error('Failed to get initial session:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            getInitialSession();
            
            // Listen for auth changes
            const { data: { subscription } } = window.supabase.auth.onAuthStateChange(
                async (event, session) => {
                    console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
                    setSession(session);
                    setUser(session?.user || null);
                    setLoading(false);
                }
            );
            
            return () => {
                subscription?.unsubscribe();
            };
        }, [supabaseReady]);
        
        // Auth functions
        const signIn = async (email, password) => {
            if (!window.supabase) {
                return { data: null, error: { message: 'Supabase not initialized' } };
            }
            
            try {
                setLoading(true);
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                return { data, error: null };
            } catch (error) {
                console.error('Sign in error:', error);
                return { data: null, error };
            } finally {
                setLoading(false);
            }
        };
        
        const signUp = async (email, password, options = {}) => {
            if (!window.supabase) {
                return { data: null, error: { message: 'Supabase not initialized' } };
            }
            
            try {
                setLoading(true);
                const { data, error } = await window.supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: options.metadata || {}
                    }
                });
                
                if (error) throw error;
                
                return { data, error: null };
            } catch (error) {
                console.error('Sign up error:', error);
                return { data: null, error };
            } finally {
                setLoading(false);
            }
        };
        
        const signOut = async () => {
            if (!window.supabase) {
                return { error: { message: 'Supabase not initialized' } };
            }
            
            try {
                setLoading(true);
                const { error } = await window.supabase.auth.signOut();
                
                if (error) throw error;
                
                return { error: null };
            } catch (error) {
                console.error('Sign out error:', error);
                return { error };
            } finally {
                setLoading(false);
            }
        };
        
        const resetPassword = async (email) => {
            if (!window.supabase) {
                return { data: null, error: { message: 'Supabase not initialized' } };
            }
            
            try {
                const { data, error } = await window.supabase.auth.resetPasswordForEmail(email);
                
                if (error) throw error;
                
                return { data, error: null };
            } catch (error) {
                console.error('Reset password error:', error);
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
            resetPassword,
            supabaseReady
        };
        
        // Show loading while waiting for Supabase
        if (!supabaseReady) {
            return React.createElement('div', { 
                className: 'min-h-screen flex items-center justify-center bg-gray-50'
            },
                React.createElement('div', { className: 'text-center' },
                    React.createElement('div', { 
                        className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'
                    }),
                    React.createElement('h2', { 
                        className: 'text-xl font-bold text-gray-800 mb-2'
                    }, '🍄 Flash Fungi'),
                    React.createElement('p', { 
                        className: 'text-gray-600'
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
                className: 'min-h-screen flex items-center justify-center bg-gray-50'
            },
                React.createElement('div', { 
                    className: 'bg-white p-8 rounded-xl shadow-lg text-center max-w-md'
                },
                    React.createElement('h2', { 
                        className: 'text-2xl font-bold text-gray-800 mb-4'
                    }, '🍄 Flash Fungi'),
                    React.createElement('p', { 
                        className: 'text-gray-600 mb-6'
                    }, 'Please sign in to continue learning about mushroom identification.'),
                    React.createElement(window.LoginForm)
                )
            );
        }
        
        return children;
    };
    
    // Simple Login Form Component
    window.LoginForm = function LoginForm() {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [isSignUp, setIsSignUp] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState('');
        const [message, setMessage] = useState('');
        
        const { signIn, signUp, resetPassword } = window.useAuth();
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setMessage('');
            setIsLoading(true);
            
            try {
                if (isSignUp) {
                    const { data, error } = await signUp(email, password);
                    if (error) throw error;
                    
                    setMessage('Check your email for the confirmation link!');
                } else {
                    const { data, error } = await signIn(email, password);
                    if (error) throw error;
                    
                    // Success handled by auth state change
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        const handleResetPassword = async () => {
            if (!email) {
                setError('Please enter your email address first');
                return;
            }
            
            setError('');
            setMessage('');
            
            try {
                const { error } = await resetPassword(email);
                if (error) throw error;
                
                setMessage('Password reset email sent!');
            } catch (error) {
                setError(error.message);
            }
        };
        
        return React.createElement('div', { className: 'w-full max-w-md mx-auto' },
            React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
                React.createElement('div', null,
                    React.createElement('label', { 
                        className: 'block text-sm font-medium text-gray-700 mb-1'
                    }, 'Email'),
                    React.createElement('input', {
                        type: 'email',
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        required: true,
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        placeholder: 'your@email.com'
                    })
                ),
                
                React.createElement('div', null,
                    React.createElement('label', { 
                        className: 'block text-sm font-medium text-gray-700 mb-1'
                    }, 'Password'),
                    React.createElement('input', {
                        type: 'password',
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true,
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        placeholder: '••••••••'
                    })
                ),
                
                error && React.createElement('div', { 
                    className: 'text-red-600 text-sm bg-red-50 p-3 rounded-lg'
                }, error),
                
                message && React.createElement('div', { 
                    className: 'text-green-600 text-sm bg-green-50 p-3 rounded-lg'
                }, message),
                
                React.createElement('button', {
                    type: 'submit',
                    disabled: isLoading,
                    className: 'w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium'
                }, isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')),
                
                React.createElement('div', { className: 'text-center space-y-2' },
                    React.createElement('button', {
                        type: 'button',
                        onClick: () => setIsSignUp(!isSignUp),
                        className: 'text-blue-600 hover:text-blue-700 text-sm'
                    }, isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'),
                    
                    !isSignUp && React.createElement('button', {
                        type: 'button',
                        onClick: handleResetPassword,
                        className: 'block w-full text-gray-600 hover:text-gray-700 text-sm'
                    }, 'Forgot Password?')
                )
            )
        );
    };
    
    console.log('✅ AuthProvider, useAuth, AuthGuard, and LoginForm components loaded');
    
})();