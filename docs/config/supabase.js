// supabase-auth.js - Fixed Authentication System
// Maintains existing patterns but fixes broken functionality

(function() {
    'use strict';

    console.log('🔐 Loading Supabase Auth System v3.0...');

    // Wait for Supabase to be available
    function waitForSupabase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.supabase) {
                    clearInterval(checkInterval);
                    console.log('✅ Supabase client available');
                    resolve();
                } else if (attempts > 50) {
                    clearInterval(checkInterval);
                    reject(new Error('Supabase client not available after 5 seconds'));
                }
            }, 100);
        });
    }

    // Initialize auth system
    waitForSupabase().then(() => {
        console.log('🔐 Initializing Supabase Auth...');

        // Create auth context
        const AuthContext = React.createContext();

        // Auth Provider Component
        function AuthProvider({ children }) {
            const [user, setUser] = React.useState(null);
            const [loading, setLoading] = React.useState(true);
            
            console.log('🔐 AuthProvider initializing, loading:', loading);

            // Get current session on mount
            React.useEffect(() => {
                console.log('🔐 Getting initial session...');
                
                const getSession = async () => {
                    try {
                        const { data: { session }, error } = await window.supabase.auth.getSession();
                        console.log('🔐 Initial session:', session ? 'found' : 'none', error ? error.message : '');
                        
                        if (error) {
                            console.error('Session error:', error);
                        } else if (session?.user) {
                            setUser(session.user);
                            console.log('🔐 User set from session:', session.user.email);
                        }
                    } catch (err) {
                        console.error('🔐 Error getting session:', err);
                    } finally {
                        setLoading(false);
                        console.log('🔐 Auth loading complete');
                    }
                };

                getSession();

                // Listen for auth changes
                const { data: { subscription } } = window.supabase.auth.onAuthStateChange(
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
                    }
                );

                return () => {
                    subscription?.unsubscribe();
                };
            }, []);

            // Sign up function
            const signUp = async (email, password, username) => {
                console.log('🔐 Attempting signup for:', email);
                
                try {
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
                    }

                    return { data, error: null };
                } catch (err) {
                    console.error('🔐 Signup failed:', err);
                    return { data: null, error: err };
                }
            };

            // Sign in function
            const signIn = async (email, password) => {
                console.log('🔐 Attempting signin for:', email);
                
                try {
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

            // Sign out function
            const signOut = async () => {
                console.log('🔐 Signing out...');
                
                try {
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
        
        // Provide fallback auth system
        window.AuthProvider = ({ children }) => {
            console.warn('🔐 Using fallback auth system');
            return React.createElement(React.Fragment, null, children);
        };
        window.useAuth = () => ({
            user: null,
            loading: false,
            signUp: () => Promise.resolve({ data: null, error: new Error('Auth not available') }),
            signIn: () => Promise.resolve({ data: null, error: new Error('Auth not available') }),
            signOut: () => Promise.resolve({ error: null })
        });
    });

})();