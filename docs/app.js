// app.js - Flash Fungi Main Application
// Consolidated app initialization and logic with ModuleLoader integration

(function() {
    'use strict';
    
    console.log('🍄 Flash Fungi v3.2 - Consolidated App');
    
    // ============================================
    // INITIALIZATION SECTION
    // ============================================
    
    // Configuration from constants.js (fallback if not loaded)
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.log('⚠️ Using fallback configuration - constants.js may not have loaded');
        window.SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
        window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
    } else {
        console.log('✅ Configuration loaded from constants.js');
    }
    
    // ============================================
    // MAIN APP COMPONENT
    // ============================================
    
    window.AuthenticatedApp = function AuthenticatedApp() {
        console.log('🔐 AuthenticatedApp rendering...');
        
        // Get auth context
        const authContext = window.useAuth ? window.useAuth() : null;
        const { user, loading: authLoading, signOut, session } = authContext || { user: null, loading: false, signOut: null, session: null };
        
        console.log('🔐 Auth context:', { user: user?.id || 'none', session: session ? 'exists' : 'none' });
        
        // Create token getter function
        const getAuthToken = React.useCallback(() => {
            const token = session?.access_token || authContext?.session?.access_token || '';
            console.log('🔑 getAuthToken called, token exists:', !!token);
            return token;
        }, [session, authContext]);
        
        // Get user profile hook
        const { userProgress, saveProgress, loadUserProgress } = window.useUserProfile ? 
            window.useUserProfile(user, getAuthToken) :
            { userProgress: {}, saveProgress: () => {}, loadUserProgress: () => {} };
        
        // State management
        const [currentView, setCurrentView] = React.useState('loading');
        const [showAuthModal, setShowAuthModal] = React.useState(false);
        const [profileUsername, setProfileUsername] = React.useState(null);
        const [specimens, setSpecimens] = React.useState([]);
        const [speciesHints, setSpeciesHints] = React.useState({});
        const [referencePhotos, setReferencePhotos] = React.useState({});
        const [specimenPhotos, setSpecimenPhotos] = React.useState({});
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState(null);
        const [currentModule, setCurrentModule] = React.useState(null);
        const [trainingModules, setTrainingModules] = React.useState([]);
        const [modulesLoading, setModulesLoading] = React.useState(false);
        
        // Close auth modal when user successfully signs in
        React.useEffect(() => {
            if (user && showAuthModal) {
                console.log('✅ User signed in, closing auth modal');
                setShowAuthModal(false);
            }
        }, [user, showAuthModal]);
        
        // Handle URL routing for public profiles
        React.useEffect(() => {
            const handleRoute = () => {
                const path = window.location.pathname;
                const match = path.match(/^\/profile\/(.+)$/);
                
                if (match) {
                    const username = match[1];
                    setProfileUsername(username);
                    setCurrentView('public-profile');
                } else if (path === '/') {
                    if (currentView === 'loading') {
                        setCurrentView('home');
                    }
                }
            };
            
            handleRoute();
            window.addEventListener('popstate', handleRoute);
            
            return () => {
                window.removeEventListener('popstate', handleRoute);
            };
        }, []);
        
        // Load initial data
        React.useEffect(() => {
            console.log('📊 Loading initial data...');
            
            const loadData = async () => {
                try {
                    setLoading(true);
                    
                    // Load specimens and hints
                    const [specimensData, hintsData, guidesData] = await Promise.all([
                        window.FlashFungiAPI?.loadSpecimens({}) || Promise.resolve([]),
                        window.FlashFungiAPI?.loadSpeciesHints() || Promise.resolve({}),
                        window.FlashFungiAPI?.loadFieldGuides() || Promise.resolve([])
                    ]);
                    
                    setSpecimens(specimensData);
                    setSpeciesHints(hintsData);
                    
                    console.log('✅ Initial data loaded successfully');
                } catch (err) {
                    console.error('❌ Error loading data:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                    if (currentView === 'loading') {
                        setCurrentView('home');
                    }
                }
            };
            
            loadData();
        }, []);
        
        // Load training modules from database
        const loadTrainingModules = React.useCallback(async (category = null) => {
            console.log('📚 Loading training modules from database...');
            setModulesLoading(true);
            
            try {
                // Always use ModuleLoader to load from database
                if (!window.ModuleLoader) {
                    throw new Error('ModuleLoader is not available');
                }
                
                const modules = await window.ModuleLoader.loadModules({ 
                    category: category,
                    published: true 
                });
                
                setTrainingModules(modules);
                console.log('✅ Loaded', modules.length, 'modules from database');
                
                // If no modules found, provide helpful feedback
                if (modules.length === 0) {
                    console.log('ℹ️ No published modules found in database');
                }
                
            } catch (err) {
                console.error('❌ Error loading training modules:', err);
                
                // Set empty array on error - no static fallback
                setTrainingModules([]);
                
                // Log specific error for debugging
                if (err.message === 'ModuleLoader is not available') {
                    console.error('⚠️ ModuleLoader component not loaded. Please check that ModuleLoader.js is included before app.js');
                } else {
                    console.error('⚠️ Failed to fetch modules from database:', err.message);
                }
            } finally {
                setModulesLoading(false);
            }
        }, []);
        
        // Load modules when training view is selected
        React.useEffect(() => {
            if (currentView === 'training-modules' && trainingModules.length === 0) {
                loadTrainingModules();
            }
        }, [currentView, trainingModules.length, loadTrainingModules]);
        
        // Load photos for a specimen
        const loadSpecimenPhotos = React.useCallback(async (specimenId) => {
            if (specimenPhotos[specimenId]) {
                return specimenPhotos[specimenId];
            }
            
            try {
                const photos = await window.FlashFungiAPI?.loadSpecimenPhotos(specimenId) || [];
                setSpecimenPhotos(prev => ({
                    ...prev,
                    [specimenId]: photos
                }));
                return photos;
            } catch (err) {
                console.error('Error loading specimen photos:', err);
                return [];
            }
        }, [specimenPhotos]);
        
        // Event handlers
        const handleStudyModeSelect = (mode) => {
            console.log('📚 Study mode selected:', mode);
            switch (mode) {
                case 'quick':
                    setCurrentView('study-quick');
                    break;
                case 'focused':
                    setCurrentView('study-focused');
                    break;
                case 'marathon':
                    setCurrentView('study-marathon');
                    break;
                default:
                    console.warn('Unknown study mode:', mode);
            }
        };
        
        const handleTrainingModuleSelect = () => {
            console.log('📚 Training modules selected');
            setCurrentView('training-modules');
        };
        
        const handleModuleSelect = async (module) => {
            console.log('📖 Module selected:', module.id);
            
            // Always use ModuleLoader to load full module content
            try {
                const fullModule = await window.ModuleLoader.loadModule(module.id);
                setCurrentModule(fullModule || module);
            } catch (err) {
                console.error('Error loading module content:', err);
                // Fall back to the basic module data if full load fails
                setCurrentModule(module);
            }
            
            setCurrentView('module-player');
        };
        
        const handleModuleComplete = (module) => {
            console.log('🎉 Module completed:', module.id);
            
            // Refresh user progress to show updated completion status
            if (loadUserProgress) {
                loadUserProgress();
            }
            
            setCurrentView('training-modules');
            setCurrentModule(null);
        };
        
        const handleAuthRequired = () => {
            console.log('🔐 Authentication required');
            setShowAuthModal(true);
        };
        
        const handleProfileClick = () => {
            console.log('👤 Profile clicked');
            setCurrentView('profile');
        };
        
        const handleSignOut = () => {
            console.log('👋 Signing out...');
            if (signOut) {
                signOut();
            }
            setCurrentView('home');
        };
        
        const handleBackToHome = () => {
            console.log('🏠 Returning to home');
            setCurrentView('home');
            setCurrentModule(null);
        };
        
        // Show loading screen during auth or data loading
        if (authLoading || (loading && currentView === 'loading')) {
            return window.LoadingScreen ? 
                React.createElement(window.LoadingScreen, {
                    message: authLoading ? 'Authenticating...' : 'Loading application data...'
                }) : React.createElement('div', { 
                    style: { 
                        minHeight: '100vh', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    } 
                }, 'Loading...');
        }
        
        // Auth Modal
        if (showAuthModal && window.AuthModal) {
            return React.createElement(window.AuthModal, {
                onClose: () => setShowAuthModal(false)
            });
        }

        // Helper function to get current view component
        function getCurrentViewComponent() {
            switch (currentView) {
                case 'home':
                    return window.HomePage ? 
                        React.createElement(window.HomePage, {
                            specimens,
                            user,
                            userProgress,
                            speciesWithHints: Object.keys(speciesHints).length,
                            onStudyModeSelect: handleStudyModeSelect,
                            onTrainingModuleSelect: handleTrainingModuleSelect,
                            onAuthRequired: handleAuthRequired,
                            onProfileClick: handleProfileClick,
                            onSignOut: handleSignOut
                        }) : React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                            React.createElement('h1', null, 'HomePage component not loaded')
                        );

                case 'profile':
                    return window.ProfilePage ? React.createElement(window.ProfilePage, {
                        user,
                        userProgress,
                        onBack: handleBackToHome
                    }) : handleBackToHome();

                case 'study-quick':
                    return window.QuickStudy ? React.createElement(window.QuickStudy, {
                        specimens,
                        speciesHints,
                        referencePhotos,
                        specimenPhotos,
                        user,
                        saveProgress,
                        loadSpecimenPhotos,
                        onBack: handleBackToHome
                    }) : React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                        React.createElement('h1', null, 'QuickStudy component not loaded'),
                        React.createElement('button', { onClick: handleBackToHome }, 'Back to Home')
                    );

                case 'study-focused':
                    return window.FocusedStudy ? React.createElement(window.FocusedStudy, {
                        specimens,
                        speciesHints,
                        referencePhotos,
                        specimenPhotos,
                        user,
                        saveProgress,
                        loadSpecimenPhotos,
                        onBack: handleBackToHome
                    }) : React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                        React.createElement('h1', null, 'FocusedStudy component not loaded'),
                        React.createElement('button', { onClick: handleBackToHome }, 'Back to Home')
                    );

                case 'study-marathon':
                    return window.MarathonMode ? 
                        React.createElement(window.MarathonMode, {
                            specimens,
                            speciesHints,
                            referencePhotos,
                            specimenPhotos,
                            user,
                            saveProgress,
                            loadSpecimenPhotos,
                            onBack: handleBackToHome
                        }) : React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                            React.createElement('h1', null, 'MarathonMode component not loaded'),
                            React.createElement('button', { onClick: handleBackToHome }, 'Back to Home')
                        );

                case 'training-modules':
                    return window.TrainingModules ? React.createElement(window.TrainingModules, {
                        modules: trainingModules,
                        modulesLoading: modulesLoading,
                        userProgress,
                        user,
                        onBack: handleBackToHome,
                        onModuleSelect: handleModuleSelect,
                        onRefresh: () => loadTrainingModules()
                    }) : React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                        React.createElement('h1', null, 'TrainingModules component not loaded'),
                        React.createElement('button', { onClick: handleBackToHome }, 'Back to Home')
                    );

                case 'module-player':
                    return window.ModulePlayer ?
                        React.createElement(window.ModulePlayer, {
                            module: currentModule,
                            user,
                            userProgress,  // ADD THIS LINE
                            saveProgress,
                            onComplete: handleModuleComplete,
                            onBack: () => setCurrentView('training-modules')
                        }) : React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                            React.createElement('h1', null, 'ModulePlayer component not loaded'),
                            React.createElement('button', { onClick: () => setCurrentView('training-modules') }, 'Back to Training')
                        );

                case 'public-profile':
                    if (profileUsername && window.PublicProfile) {
                        return React.createElement(window.PublicProfile, {
                            username: profileUsername,
                            onBack: () => {
                                window.history.pushState({}, '', '/');
                                setCurrentView('home');
                                setProfileUsername(null);
                            },
                            onClose: () => {
                                if (user && user.username === profileUsername) {
                                    setCurrentView('profile');
                                }
                            }
                        });
                    }
                    return handleBackToHome();

                default:
                    return window.HomePage ?
                        React.createElement(window.HomePage, {
                            specimens: specimenData,
                            user: user,
                            userProgress: userProgress,
                            modules: modules, // NOW PASSING MODULES TO HOMEPAGE
                            speciesWithHints: Object.keys(speciesHints).length,
                            onStudyModeSelect: handleStudyModeSelect,
                            onTrainingModuleSelect: handleTrainingModuleSelect,
                            onAuthRequired: handleAuthRequired,
                            onProfileClick: handleProfileClick,
                            onSignOut: handleSignOut
                        }) :
                        React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                            React.createElement('h1', null, 'HomePage component not loaded'),
                            React.createElement('p', null, 'Please check the console for errors.')
                        );
            }
        }

        // Route to appropriate component
        return getCurrentViewComponent();
    };
    
    // ============================================
    // INITIALIZATION FUNCTIONS
    // ============================================
    
    function initializeFlashFungi() {
        console.log('🚀 Starting Flash Fungi initialization...');
        waitForSupabaseClient();
    }
    
    // Wait for Supabase client to be initialized
    function waitForSupabaseClient() {
        if (window.supabase && typeof window.supabase.auth === 'object') {
            console.log('✅ Supabase client is ready');
            waitForComponents();
            return;
        }
        
        console.log('⏳ Waiting for Supabase client...');
        setTimeout(waitForSupabaseClient, 100);
    }
    
    // Wait for all components to load
    function waitForComponents() {
        const checkComponents = () => {
            const requiredComponents = [
                // Auth system
                'AuthProvider', 'useAuth', 'AuthenticatedApp', 'useUserProfile',
                
                // Core UI components
                'HomePage', 'LoadingScreen',
                
                // Auth components
                'AuthModal',
                
                // Study components
                'SharedFlashcard', 'QuickStudy', 'FocusedStudy', 'MarathonMode', 'InteractiveSpeciesGuide',
                
                // Training components - ModuleLoader is now REQUIRED
                'ModuleLoader', 'ModulePlayer',
                
                // Profile
                'ProfilePage'
            ];
            
            // Check utils
            const requiredUtils = [
                'FlashFungiAPI'
            ];
            
            const missingComponents = requiredComponents.filter(comp => !window[comp]);
            const missingUtils = requiredUtils.filter(util => !window[util]);
            const missing = [...missingComponents, ...missingUtils];
            
            // Remove the optional warning for ModuleLoader - it's now required
            
            if (missing.length === 0) {
                console.log('✅ All required components and utils loaded, mounting app...');
                mountApp();
            } else {
                console.log('⏳ Waiting for components/utils:', missing);
                setTimeout(checkComponents, 100);
            }
        };
        
        checkComponents();
    }
    
    // Mount the React app
    function mountApp() {
        const rootElement = document.getElementById('root');
        
        if (!rootElement) {
            console.error('❌ Root element not found');
            return;
        }
        
        try {
            console.log('🎯 Mounting React app...');
            
            // Clear loading state
            rootElement.innerHTML = '';
            
            // Create React root and render app
            if (ReactDOM.createRoot) {
                // React 18+
                const root = ReactDOM.createRoot(rootElement);
                root.render(
                    window.h(window.AuthProvider, null,
                        window.h(window.AuthenticatedApp)
                    )
                );
            } else {
                // Fallback for older React
                ReactDOM.render(
                    window.h(window.AuthProvider, null,
                        window.h(window.AuthenticatedApp)
                    ),
                    rootElement
                );
            }
            
            console.log('✅ Flash Fungi app mounted successfully!');
            
        } catch (error) {
            console.error('❌ Error mounting app:', error);
            rootElement.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: red;">
                    <h1>App Initialization Error</h1>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFlashFungi);
    } else {
        initializeFlashFungi();
    }
    
    console.log('✅ Flash Fungi v3.2 - Consolidated app.js with ModuleLoader integration');
    
})();