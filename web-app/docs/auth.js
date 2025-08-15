// auth.js - Basic authentication system for Flash Fungi
// Updated to use API endpoints instead of direct Supabase calls
(function() {
    'use strict';
    
    const { useState, useEffect, useContext, createContext } = React;
    const h = React.createElement;
    
    // Auth Context
    const AuthContext = createContext(null);
    
    // Auth Provider Component
    window.AuthProvider = function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        
        useEffect(() => {
            // Check for existing session
            const checkSession = async () => {
                try {
                    // Check localStorage for session
                    const savedSession = localStorage.getItem('flashFungiSession');
                    if (savedSession) {
                        const session = JSON.parse(savedSession);
                        
                        // Verify session is still valid (check if user exists in DB)
                        const response = await fetch(
                            `${window.SUPABASE_URL}/rest/v1/user_profiles?id=eq.${session.user.id}`,
                            {
                                headers: {
                                    'apikey': window.SUPABASE_ANON_KEY,
                                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                                }
                            }
                        );
                        
                        if (response.ok) {
                            const users = await response.json();
                            if (users.length > 0) {
                                setUser(users[0]);
                            } else {
                                localStorage.removeItem('flashFungiSession');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking session:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            checkSession();
        }, []);
        
        const login = async (username, password) => {
            try {
                // For demo purposes, we'll check if user exists and accept any password
                // In production, you should implement proper password hashing
                const response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_profiles?username=eq.${username}`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (response.ok) {
                    const users = await response.json();
                    if (users.length > 0) {
                        const user = users[0];
                        
                        // Simple password check (in production, use proper hashing)
                        if (password) {
                            setUser(user);
                            
                            // Save session
                            localStorage.setItem('flashFungiSession', JSON.stringify({
                                user: user,
                                timestamp: Date.now()
                            }));
                            
                            // Update last login (using service key via API)
                            try {
                                await fetch('/api/auth', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        action: 'update_login',
                                        userId: user.id
                                    })
                                });
                            } catch (error) {
                                console.warn('Could not update last login:', error);
                            }
                            
                            return { success: true, user };
                        }
                    }
                }
                
                return { success: false, error: 'Invalid username or password' };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error: 'Login failed' };
            }
        };
        
        const register = async (username, email, password, displayName) => {
            try {
                // Use the API endpoint for registration
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'register',
                        username: username.toLowerCase(),
                        email: email,
                        password: password, // In production, hash this client-side first
                        displayName: displayName || username
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    const newUser = result.user;
                    setUser(newUser);
                    
                    // Save session
                    localStorage.setItem('flashFungiSession', JSON.stringify({
                        user: newUser,
                        timestamp: Date.now()
                    }));
                    
                    return { success: true, user: newUser };
                } else {
                    return { 
                        success: false, 
                        error: result.error || 'Registration failed' 
                    };
                }
            } catch (error) {
                console.error('Registration error:', error);
                return { success: false, error: 'Registration failed. Please try again.' };
            }
        };
        
        const logout = async () => {
            setUser(null);
            localStorage.removeItem('flashFungiSession');
        };
        
        const updateProfile = async (updates) => {
            if (user) {
                try {
                    // Update via API endpoint
                    const response = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'update_profile',
                            userId: user.id,
                            updates: updates
                        })
                    });
                    
                    if (response.ok) {
                        const updatedUser = { ...user, ...updates };
                        setUser(updatedUser);
                        
                        // Update session storage
                        const session = JSON.parse(localStorage.getItem('flashFungiSession') || '{}');
                        session.user = updatedUser;
                        localStorage.setItem('flashFungiSession', JSON.stringify(session));
                        
                        return { success: true };
                    }
                } catch (error) {
                    console.error('Profile update error:', error);
                    return { success: false, error: 'Failed to update profile' };
                }
            }
            return { success: false, error: 'No user logged in' };
        };
        
        const value = {
            user,
            loading,
            login,
            register,
            logout,
            signOut: logout, // Alias for compatibility
            updateProfile,
            isAuthenticated: !!user
        };
        
        return h(AuthContext.Provider, { value }, children);
    };
    
    // Hook to use auth
    window.useAuth = function() {
        const context = useContext(AuthContext);
        if (!context) {
            // Return a fallback for components that use auth before provider is ready
            return {
                user: null,
                loading: true,
                login: () => Promise.resolve({ success: false }),
                register: () => Promise.resolve({ success: false }),
                logout: () => {},
                signOut: () => {},
                updateProfile: () => Promise.resolve({ success: false }),
                isAuthenticated: false
            };
        }
        return context;
    };
    
    // Login/Register Component
    window.AuthModal = function AuthModal({ onClose }) {
        const [mode, setMode] = useState('login');
        const [username, setUsername] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [displayName, setDisplayName] = useState('');
        const [error, setError] = useState('');
        const [loading, setLoading] = useState(false);
        
        const { login, register } = window.useAuth();
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            
            try {
                let result;
                if (mode === 'login') {
                    result = await login(username, password);
                } else {
                    // Basic validation
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
                    
                    result = await register(username, email, password, displayName);
                }
                
                if (result.success) {
                    onClose();
                } else {
                    setError(result.error || 'Operation failed');
                }
            } catch (err) {
                setError('An unexpected error occurred. Please try again.');
                console.error('Auth error:', err);
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
                }, mode === 'login' ? '🍄 Welcome Back!' : '🍄 Join Flash Fungi'),
                
                h('form', { onSubmit: handleSubmit },
                    h('div', { style: { marginBottom: '1rem' } },
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
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
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
                        }, 'Email'),
                        h('input', {
                            type: 'email',
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            required: true,
                            disabled: loading,
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
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
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
                            }
                        })
                    ),
                    
                    h('div', { style: { marginBottom: '1rem' } },
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
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
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
                    }, loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account'))
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
                        mode === 'login' ? "Don't have an account? " : "Already have an account? ",
                        h('button', {
                            onClick: () => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError('');
                                setUsername('');
                                setEmail('');
                                setPassword('');
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
                ),
                
                // Demo account info for login mode only
                mode === 'login' && h('div', {
                    style: {
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #3b82f6',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        color: '#1e40af'
                    }
                }, '💡 Demo: Use any existing username with any password to test')
            )
        );
    };
})();