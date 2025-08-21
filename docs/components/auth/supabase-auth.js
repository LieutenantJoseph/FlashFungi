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