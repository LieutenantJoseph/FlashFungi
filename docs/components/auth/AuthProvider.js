// AuthProvider - Phase 3 Authentication Provider Component (Improved Single Client)
// Provides authentication context and user management with robust CDN handling

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
        const [initError, setInitError] = useState(null);
        
        // Single Supabase client initialization with CDN fallback
        useEffect(() => {
            const initializeSupabase = async () => {
                try {
                    console.log('🔧 AuthProvider initializing Supabase client...');
                    
                    // Check if global client already exists and is working
                    if (window.supabase && window.supabase.auth) {
                        console.log('✅ Using existing global Supabase client');
                        setSupabaseReady(true);
                        return;
                    }
                    
                    // Check for required dependencies
                    if (!window.FLASH_FUNGI_CONFIG || !window.FLASH_FUNGI_CONFIG.SUPABASE) {
                        throw new Error('Flash Fungi configuration not loaded');
                    }
                    
                    const supabaseUrl = window.FLASH_FUNGI_CONFIG.SUPABASE.URL;
                    const supabaseKey = window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY;
                    
                    // Try CDN method first (better for caching and performance)
                    if (typeof supabase !== 'undefined') {
                        console.log('🔧 Creating Supabase client via CDN');
                        
                        window.supabase = supabase.createClient(supabaseUrl, supabaseKey, {
                            auth: {
                                autoRefreshToken: true,
                                persistSession: true,
                                detectSessionInUrl: true
                            }
                        });
                        
                        // Test the client to make sure it works
                        await window.supabase.from('specimens').select('count', { count: 'exact', head: true });
                        
                        console.log('✅ Supabase client created and tested via CDN');
                        setSupabaseReady(true);
                        return;
                    }
                    
                    // CDN fallback: Load Supabase ES6 modules directly
                    console.log('🔄 CDN failed, trying ES6 module fallback...');
                    
                    // Dynamic import fallback (this loads the ES module version)
                    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
                    
                    window.supabase = createClient(supabaseUrl, supabaseKey, {
                        auth: {
                            autoRefreshToken: true,
                            persistSession: true,
                            detectSessionInUrl: true
                        }
                    });
                    
                    // Test the fallback client
                    await window.supabase.from('specimens').select('count', { count: 'exact', head: true });
                    
                    console.log('✅ Supabase client created via ES6 module fallback');
                    setSupabaseReady(true);
                    
                } catch (error) {
                    console.error('❌ Failed to initialize Supabase client:', error);
                    setInitError(`Failed to load authentication system: ${error.message}`);
                    setLoading(false);
                }
            };
            
            // Add a small delay to let other scripts load
            setTimeout(initializeSupabase, 100);
        }, []);
        
        // Initialize Supabase auth once client is ready
        useEffect(() => {
            if (!supabaseReady || !window.supabase) {
                return;
            }
            
            let subscription;
            
            // Get initial session
            const getInitialSession = async () => {
                try {
                    console.log('🔧 Getting initial session...');
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
            
            // Listen for auth changes (single listener for the whole app)
            const { data } = window.supabase.auth.onAuthStateChange(
                async (event, session) => {
                    console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
                    setSession(session);
                    setUser(session?.user || null);
                    setLoading(false);
                }
            );
            
            subscription = data.subscription;
            
            return () => {
                subscription?.unsubscribe();
            };
        }, [supabaseReady]);
        
        // Auth functions (using the single global client)
        const signIn = async (email, password) => {
            if (!window.supabase) {
                return { data: null, error: { message: 'Authentication system not ready' } };
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
                return { data: null, error: { message: 'Authentication system not ready' } };
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
                return { error: { message: 'Authentication system not ready' } };
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
                return { data: null, error: { message: 'Authentication system not ready' } };
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
        
        // Show error state if initialization failed
        if (initError) {
            return React.createElement('div', { 
                className: 'min-h-screen flex items-center justify-center bg-gray-50'
            },
                React.createElement('div', { className: 'text-center max-w-md mx-auto p-6' },
                    React.createElement('div', { 
                        className: 'text-4xl mb-4'
                    }, '🍄'),
                    React.createElement('h2', { 
                        className: 'text-xl font-bold text-gray-800 mb-2'
                    }, 'Flash Fungi'),
                    React.createElement('p', { 
                        className: 'text-red-600 mb-4'
                    }, 'Connection Issue'),
                    React.createElement('p', { 
                        className: 'text-gray-600 text-sm mb-4'
                    }, initError),
                    React.createElement('div', { className: 'space-y-2' },
                        React.createElement('button', {
                            onClick: () => window.location.reload(),
                            className: 'block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                        }, 'Retry'),
                        React.createElement('p', {
                            className: 'text-xs text-gray-500'
                        }, 'If this persists, check your internet connection')
                    )
                )
            );
        }
        
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
                    }, 'Connecting to authentication system...')
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
        
        return React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', null,
                    React.createElement('input', {
                        type: 'email',
                        placeholder: 'Email',
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        required: true,
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    })
                ),
                React.createElement('div', null,
                    React.createElement('input', {
                        type: 'password',
                        placeholder: 'Password',
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true,
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    })
                ),
                
                error && React.createElement('div', { 
                    className: 'text-red-600 text-sm' 
                }, error),
                
                message && React.createElement('div', { 
                    className: 'text-green-600 text-sm' 
                }, message),
                
                React.createElement('button', {
                    type: 'submit',
                    disabled: isLoading,
                    className: 'w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50'
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
    
    console.log('✅ AuthProvider with robust CDN handling loaded');
    
})();