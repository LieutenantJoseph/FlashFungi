// components/auth/supabase-auth.js - Fixed Authentication with Defensive Programming
// Waits for Supabase to be ready and handles errors gracefully

(function() {
    'use strict';

    console.log('🔐 Loading Supabase Auth System v3.1...');

    // Function to check if Supabase is ready
    function isSupabaseReady() {
        return window.supabase && 
               window.supabase.auth && 
               typeof window.supabase.auth.getSession === 'function' &&
               typeof window.supabase.auth.onAuthStateChange === 'function';
    }

    // Wait for Supabase to be ready before initializing auth
    function waitForSupabase() {
        return new Promise((resolve, reject) => {
            if (isSupabaseReady()) {
                console.log('✅ Supabase already ready');
                resolve();
                return;
            }

            console.log('🔄 Waiting for Supabase to be ready...');
            let attempts = 0;
            const maxAttempts = 150; // 15 seconds max

            const checkInterval = setInterval(() => {
                attempts++;
                
                if (isSupabaseReady()) {
                    clearInterval(checkInterval);
                    console.log('✅ Supabase ready after', attempts, 'attempts');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.error('❌ Supabase not ready after 15 seconds');
                    reject(new Error('Supabase not available'));
                }
            }, 100);
        });
    }

    // Initialize auth system
    waitForSupabase().then(() => {
        console.log('🔐 Initializing Supabase Auth...');

        // Create auth context
        const AuthContext = React.createContext();

        // Auth Provider Component with error handling
        function AuthProvider({ children }) {
            const [user, setUser] = React.useState(null);
            const [loading, setLoading] = React.useState(true);
            const [error, setError] = React.useState(null);
            
            console.log('🔐 AuthProvider initializing, loading:', loading);

            // Get current session on mount
            React.useEffect(() => {
                console.log('🔐 Getting initial session...');
                
                const getSession = async () => {
                    try {
                        if (!isSupabaseReady()) {
                            throw new Error('Supabase not ready');
                        }

                        const { data: { session }, error } = await window.supabase.auth.getSession();
                        console.log('🔐 Initial session:', session ? 'found' : 'none', error ? error.message : '');
                        
                        if (error) {
                            console.error('Session error:', error);
                            setError(error.message);
                        } else if (session?.user) {
                            setUser(session.user);
                            console.log('🔐 User set from session:', session.user.email);
                        }
                    } catch (err) {
                        console.error('🔐 Error getting session:', err);
                        setError(err.message);
                    } finally {
                        setLoading(false);
                        console.log('🔐 Auth loading complete');
                    }
                };

                getSession();

                // Listen for auth changes with error handling
                let subscription = null;
                
                try {
                    if (isSupabaseReady()) {
                        const { data: { subscription: authSubscription } } = window.supabase.auth.onAuthStateChange(
                            async (event, session) => {
                                console.log('🔐 Auth state change:', event, session ? 'has session' : 'no session');
                                
                                if (session?.user) {
                                    setUser(session.user);
                                    console.log('🔐 User logged in:', session.user.email);
                                } else {
                                    setUser(null);
                                    console.log('🔐 User logged out');
                                }
                                setLoading(false);
                                setError(null); // Clear any previous errors
                            }
                        );
                        subscription = authSubscription;
                    }
                } catch (err) {
                    console.error('🔐 Error setting up auth listener:', err);
                    setError(err.message);
                    setLoading(false);
                }

                return () => {
                    if (subscription && typeof subscription.unsubscribe === 'function') {
                        subscription.unsubscribe();
                    }
                };
            }, []);

            // Sign up function with error handling
            const signUp = async (email, password, username) => {
                console.log('🔐 Attempting signup for:', email);
                
                try {
                    if (!isSupabaseReady()) {
                        throw new Error('Authentication service not available');
                    }

                    // First check if username is taken
                    const { data: existingUsers, error: checkError } = await window.supabase
                        .from('user_profiles')
                        .select('username')
                        .eq('username', username);
                        
                    if (checkError) {
                        console.error('Error checking username:', checkError);
                        throw new Error('Failed to validate username');
                    }
                    
                    if (existingUsers && existingUsers.length > 0) {
                        throw new Error('Username already taken');
                    }

                    // Create auth user
                    const { data, error } = await window.supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                username: username,
                                display_name: username
                            }
                        }
                    });

                    if (error) {
                        console.error('Signup error:', error);
                        throw error;
                    }

                    console.log('🔐 Signup successful:', data);

                    // Create user profile
                    if (data.user) {
                        try {
                            const { error: profileError } = await window.supabase
                                .from('user_profiles')
                                .insert({
                                    id: data.user.id,
                                    username: username,
                                    display_name: username,
                                    email: email,
                                    created_at: new Date().toISOString()
                                });

                            if (profileError) {
                                console.error('Profile creation error:', profileError);
                                // Don't throw here - auth user was created successfully
                            } else {
                                console.log('✅ User profile created');
                            }
                        } catch (profileErr) {
                            console.error('Profile creation exception:', profileErr);
                        }
                    }

                    return { data, error: null };
                } catch (err) {
                    console.error('🔐 Signup failed:', err);
                    return { data: null, error: err };
                }
            };

            // Sign in function with error handling
            const signIn = async (email, password) => {
                console.log('🔐 Attempting signin for:', email);
                
                try {
                    if (!isSupabaseReady()) {
                        throw new Error('Authentication service not available');
                    }

                    const { data, error } = await window.supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (error) {
                        console.error('Signin error:', error);
                        throw error;
                    }

                    console.log('🔐 Signin successful');
                    return { data, error: null };
                } catch (err) {
                    console.error('🔐 Signin failed:', err);
                    return { data: null, error: err };
                }
            };

            // Sign out function with error handling
            const signOut = async () => {
                console.log('🔐 Signing out...');
                
                try {
                    if (!isSupabaseReady()) {
                        // If Supabase isn't available, just clear local state
                        setUser(null);
                        return { error: null };
                    }

                    const { error } = await window.supabase.auth.signOut();
                    if (error) {
                        console.error('Signout error:', error);
                        throw error;
                    }
                    console.log('🔐 Signout successful');
                    return { error: null };
                } catch (err) {
                    console.error('🔐 Signout failed:', err);
                    return { error: err };
                }
            };

            const value = {
                user,
                loading,
                error,
                signUp,
                signIn,
                signOut
            };

            return React.createElement(AuthContext.Provider, { value }, children);
        }

        // Custom hook to use auth
        function useAuth() {
            const context = React.useContext(AuthContext);
            if (!context) {
                throw new Error('useAuth must be used within an AuthProvider');
            }
            return context;
        }

        // Export to window
        window.AuthProvider = AuthProvider;
        window.useAuth = useAuth;
        window.AuthContext = AuthContext;

        console.log('✅ Supabase Auth system loaded successfully');

    }).catch(error => {
        console.error('❌ Failed to initialize auth system:', error);
        
        // Provide fallback auth system that doesn't crash
        console.log('🔄 Creating fallback auth system...');
        
        const AuthContext = React.createContext();
        
        function FallbackAuthProvider({ children }) {
            const [user, setUser] = React.useState(null);
            const [loading, setLoading] = React.useState(false);
            const [error, setError] = React.useState('Authentication service unavailable');

            const fallbackAuth = {
                user,
                loading,
                error,
                signUp: () => Promise.resolve({ 
                    data: null, 
                    error: new Error('Authentication service not available') 
                }),
                signIn: () => Promise.resolve({ 
                    data: null, 
                    error: new Error('Authentication service not available') 
                }),
                signOut: () => Promise.resolve({ error: null })
            };

            return React.createElement(AuthContext.Provider, { value: fallbackAuth }, children);
        }
        
        function fallbackUseAuth() {
            const context = React.useContext(AuthContext);
            if (!context) {
                throw new Error('useAuth must be used within an AuthProvider');
            }
            return context;
        }

        window.AuthProvider = FallbackAuthProvider;
        window.useAuth = fallbackUseAuth;
        window.AuthContext = AuthContext;
        
        console.log('⚠️ Fallback auth system active');
    });

})();

// AuthModal.js - Updated with better error handling
(function() {
    'use strict';

    window.AuthModal = function AuthModal({ onClose }) {
        const [mode, setMode] = React.useState('signin'); // 'signin' or 'signup'
        const [formData, setFormData] = React.useState({
            email: '',
            password: '',
            username: '',
            confirmPassword: ''
        });
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState('');

        // Get auth with error handling
        let auth;
        try {
            auth = window.useAuth();
        } catch (err) {
            console.error('Error getting auth context:', err);
            auth = {
                signUp: () => Promise.resolve({ data: null, error: new Error('Auth not available') }),
                signIn: () => Promise.resolve({ data: null, error: new Error('Auth not available') }),
                error: 'Authentication system not available'
            };
        }

        const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            setError(''); // Clear error when user types
        };

        const validateForm = () => {
            if (!formData.email || !formData.password) {
                setError('Email and password are required');
                return false;
            }

            if (mode === 'signup') {
                if (!formData.username) {
                    setError('Username is required');
                    return false;
                }
                if (formData.username.length < 3) {
                    setError('Username must be at least 3 characters');
                    return false;
                }
                if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                    setError('Username can only contain letters, numbers, and underscores');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return false;
                }
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError('Please enter a valid email address');
                return false;
            }

            return true;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!validateForm()) return;

            setLoading(true);
            setError('');

            try {
                let result;
                
                if (mode === 'signup') {
                    result = await auth.signUp(formData.email, formData.password, formData.username);
                } else {
                    result = await auth.signIn(formData.email, formData.password);
                }

                if (result.error) {
                    setError(result.error.message || 'Authentication failed');
                } else {
                    // Success!
                    if (mode === 'signup') {
                        setError(''); // Clear any errors
                        alert('Account created successfully! Please check your email to verify your account.');
                    }
                    onClose();
                }
            } catch (err) {
                console.error('Auth error:', err);
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        // Show auth system error if present
        if (auth.error) {
            return React.createElement('div', {
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
                    zIndex: 1000,
                    padding: '1rem'
                }
            },
                React.createElement('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }
                },
                    React.createElement('h2', { style: { marginBottom: '1rem', color: '#dc2626' } }, 
                        '⚠️ Authentication Unavailable'
                    ),
                    React.createElement('p', { style: { marginBottom: '1rem', color: '#6b7280' } },
                        'The authentication system is currently unavailable. Please try again later.'
                    ),
                    React.createElement('button', {
                        onClick: onClose,
                        style: {
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                        }
                    }, 'Close')
                )
            );
        }

        // Normal auth modal (rest of the component remains the same as before)
        return React.createElement('div', {
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
                zIndex: 1000,
                padding: '1rem'
            },
            onClick: (e) => {
                if (e.target === e.currentTarget) onClose();
            }
        },
            React.createElement('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            },
                // Header
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }
                },
                    React.createElement('h2', {
                        style: {
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#374151'
                        }
                    }, mode === 'signin' ? 'Sign In' : 'Create Account'),
                    React.createElement('button', {
                        onClick: onClose,
                        style: {
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#6b7280',
                            cursor: 'pointer'
                        }
                    }, '×')
                ),

                // Form (rest remains the same as in the previous implementation)
                React.createElement('form', { onSubmit: handleSubmit },
                    // Username field (signup only)
                    mode === 'signup' && React.createElement('div', {
                        style: { marginBottom: '1rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Username'),
                        React.createElement('input', {
                            type: 'text',
                            value: formData.username,
                            onChange: (e) => handleInputChange('username', e.target.value),
                            placeholder: 'Enter username',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),

                    // Email field
                    React.createElement('div', {
                        style: { marginBottom: '1rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Email'),
                        React.createElement('input', {
                            type: 'email',
                            value: formData.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            placeholder: 'Enter email',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),

                    // Password field
                    React.createElement('div', {
                        style: { marginBottom: mode === 'signup' ? '1rem' : '1.5rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Password'),
                        React.createElement('input', {
                            type: 'password',
                            value: formData.password,
                            onChange: (e) => handleInputChange('password', e.target.value),
                            placeholder: 'Enter password',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),

                    // Confirm Password field (signup only)
                    mode === 'signup' && React.createElement('div', {
                        style: { marginBottom: '1.5rem' }
                    },
                        React.createElement('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.25rem'
                            }
                        }, 'Confirm Password'),
                        React.createElement('input', {
                            type: 'password',
                            value: formData.confirmPassword,
                            onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                            placeholder: 'Confirm password',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }
                        })
                    ),

                    // Error message
                    error && React.createElement('div', {
                        style: {
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            marginBottom: '1rem'
                        }
                    }, error),

                    // Submit button
                    React.createElement('button', {
                        type: 'submit',
                        disabled: loading,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: loading ? '#d1d5db' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '1rem'
                        }
                    }, loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account'))
                ),

                // Mode toggle
                React.createElement('div', {
                    style: {
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }
                },
                    mode === 'signin' ? "Don't have an account? " : 'Already have an account? ',
                    React.createElement('button', {
                        type: 'button',
                        onClick: () => {
                            setMode(mode === 'signin' ? 'signup' : 'signin');
                            setError('');
                            setFormData({
                                email: '',
                                password: '',
                                username: '',
                                confirmPassword: ''
                            });
                        },
                        style: {
                            background: 'none',
                            border: 'none',
                            color: '#10b981',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }
                    }, mode === 'signin' ? 'Sign up' : 'Sign in')
                )
            )
        );
    };

    console.log('✅ AuthModal component loaded with error handling');

})();