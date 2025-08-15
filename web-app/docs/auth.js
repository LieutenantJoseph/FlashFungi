// auth.js - Fixed client-side authentication system for Flash Fungi
// This file should be placed at: web-app/docs/auth.js

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
                                console.log('[Auth] Session restored for:', users[0].username);
                            } else {
                                localStorage.removeItem('flashFungiSession');
                                console.log('[Auth] Session invalid, cleared');
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Auth] Error checking session:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            checkSession();
        }, []);
        
        const login = async (username, password) => {
            try {
                console.log('[Auth] Attempting login for:', username);
                
                // Call the API endpoint for login
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'login',
                        username: username.toLowerCase(),
                        password: password
                    })
                });
                
                const result = await response.json();
                console.log('[Auth] Login response:', result);
                
                if (response.ok && result.success) {
                    const user = result.user;
                    setUser(user);
                    
                    // Save session
                    localStorage.setItem('flashFungiSession', JSON.stringify({
                        user: user,
                        timestamp: Date.now()
                    }));
                    
                    // Update last login
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
                        console.warn('[Auth] Could not update last login:', error);
                    }
                    
                    return { success: true, user };
                } else {
                    return { 
                        success: false, 
                        error: result.error || 'Invalid username or password' 
                    };
                }
            } catch (error) {
                console.error('[Auth] Login error:', error);
                return { 
                    success: false, 
                    error: 'Network error. Please check your connection and try again.' 
                };
            }
        };
        
        const register = async (username, email, password, displayName) => {
            try {
                console.log('[Auth] Attempting registration for:', username);
                
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
                        password: password,
                        displayName: displayName || username
                    })
                });
                
                const result = await response.json();
                console.log('[Auth] Registration response:', result);
                
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
                    // Handle specific error messages
                    let errorMessage = result.error || 'Registration failed';
                    
                    if (result.details) {
                        if (result.details.includes('permission') || result.details.includes('denied')) {
                            errorMessage = 'Registration is temporarily unavailable. Please try again later or contact support.';
                        } else if (result.details.includes('duplicate key')) {
                            errorMessage = 'This username or email is already registered.';
                        }
                    }
                    
                    return { 
                        success: false, 
                        error: errorMessage
                    };
                }
            } catch (error) {
                console.error('[Auth] Registration error:', error);
                return { 
                    success: false, 
                    error: 'Network error. Please check your connection and try again.' 
                };
            }
        };
        
        const logout = async () => {
            console.log('[Auth] Logging out user');
            setUser(null);
            localStorage.removeItem('flashFungiSession');
        };
        
        const updateProfile = async (updates) => {
            if (user) {
                try {
                    console.log('[Auth] Updating profile for:', user.username);
                    
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
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        const updatedUser = { ...user, ...updates };
                        setUser(updatedUser);
                        
                        // Update session storage
                        const session = JSON.parse(localStorage.getItem('flashFungiSession') || '{}');
                        session.user = updatedUser;
                        localStorage.setItem('flashFungiSession', JSON.stringify(session));
                        
                        return { success: true };
                    } else {
                        return { 
                            success: false, 
                            error: result.error || 'Failed to update profile' 
                        };
                    }
                } catch (error) {
                    console.error('[Auth] Profile update error:', error);
                    return { 
                        success: false, 
                        error: 'Network error. Please try again.' 
                    };
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
            
            console.log(`[AuthModal] Submitting ${mode} form`);
            
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
                
                console.log(`[AuthModal] ${mode} result:`, result);
                
                if (result.success) {
                    console.log(`[AuthModal] ${mode} successful, closing modal`);
                    onClose();
                } else {
                    console.error(`[AuthModal] ${mode} failed:`, result.error);
                    setError(result.error || 'Operation failed');
                }
            } catch (err) {
                console.error(`[AuthModal] Unexpected error during ${mode}:`, err);
                setError('An unexpected error occurred. Please try again.');
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
                
                // Note about the demo
                h('div', {
                    style: {
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        color: '#92400e'
                    }
                }, 
                    h('p', { style: { marginBottom: '0.5rem' } }, 
                        '⚠️ Note: This is a demo application.'
                    ),
                    h('p', null,
                        'If registration fails due to database permissions, you can test with these demo accounts:'
                    ),
                    h('ul', { style: { marginTop: '0.5rem', paddingLeft: '1.5rem' } },
                        h('li', null, 'Username: demo_user / Password: any'),
                        h('li', null, 'Username: test_student / Password: any')
                    )
                )
            )
        );
    };
    
    console.log('[Auth] Client-side auth system loaded');
})();