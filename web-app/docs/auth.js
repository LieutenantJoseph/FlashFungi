// auth.js - Basic authentication system for Flash Fungi
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
                // Check if user exists
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
                        // For demo, we'll accept any password or check against a simple hash
                        if (password) {
                            setUser(user);
                            
                            // Save session
                            localStorage.setItem('flashFungiSession', JSON.stringify({
                                user: user,
                                timestamp: Date.now()
                            }));
                            
                            // Update last login
                            await fetch(
                                `${window.SUPABASE_URL}/rest/v1/user_profiles?id=eq.${user.id}`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'apikey': window.SUPABASE_ANON_KEY,
                                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        last_login: new Date().toISOString()
                                    })
                                }
                            );
                            
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
                // Check if username already exists
                const checkResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_profiles?username=eq.${username}`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (checkResponse.ok) {
                    const existing = await checkResponse.json();
                    if (existing.length > 0) {
                        return { success: false, error: 'Username already taken' };
                    }
                }
                
                // Create new user
                const newUser = {
                    id: crypto.randomUUID ? crypto.randomUUID() : 
                        'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now(),
                    username: username.toLowerCase(),
                    email: email,
                    display_name: displayName || username,
                    bio: '',
                    avatar_url: null,
                    privacy_settings: {
                        show_stats: true,
                        show_achievements: true,
                        allow_messages: false
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                };
                
                const createResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_profiles`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(newUser)
                    }
                );
                
                if (createResponse.ok) {
                    const createdUser = await createResponse.json();
                    setUser(createdUser[0]);
                    
                    // Save session
                    localStorage.setItem('flashFungiSession', JSON.stringify({
                        user: createdUser[0],
                        timestamp: Date.now()
                    }));
                    
                    return { success: true, user: createdUser[0] };
                } else {
                    const errorText = await createResponse.text();
                    console.error('Registration failed:', errorText);
                    return { success: false, error: 'Registration failed' };
                }
            } catch (error) {
                console.error('Registration error:', error);
                return { success: false, error: 'Registration failed' };
            }
        };
        
        const logout = async () => {
            setUser(null);
            localStorage.removeItem('flashFungiSession');
        };
        
        const updateProfile = (updates) => {
            if (user) {
                setUser(prev => ({ ...prev, ...updates }));
                
                // Update session storage
                const session = JSON.parse(localStorage.getItem('flashFungiSession') || '{}');
                session.user = { ...session.user, ...updates };
                localStorage.setItem('flashFungiSession', JSON.stringify(session));
            }
        };
        
        const value = {
            user,
            loading,
            login,
            register,
            logout,
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
                updateProfile: () => {},
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
                    result = await register(username, email, password, displayName);
                }
                
                if (result.success) {
                    onClose();
                } else {
                    setError(result.error || 'Operation failed');
                }
            } catch (err) {
                setError('An error occurred');
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
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '1rem'
                            }
                        })
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
                
                // Demo account info
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
                }, '💡 Demo: Use any username with any password to test')
            )
        );
    };
})();