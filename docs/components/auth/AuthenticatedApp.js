// AuthenticatedApp.js - Main Authenticated App Component (Fixed Hooks Rule Violation)
// Flash Fungi - Complete app with proper auth modal handling

(function() {
    'use strict';
    
    window.AuthenticatedApp = function AuthenticatedApp() {
        console.log('🔍 AuthenticatedApp rendering...');
        
        // Get auth context (HOOKS RULE: Called at top level)
        const authContext = window.useAuth ? window.useAuth() : null;
        const { user, loading: authLoading, signOut, session } = authContext || { user: null, loading: false, signOut: null, session: null };
        
        console.log('🔍 Auth context:', { user: user?.id || 'none', session: session ? 'exists' : 'none' });
        
        // Create token getter function that doesn't violate hooks rules
        const getAuthToken = React.useCallback(() => {
            const token = session?.access_token || authContext?.session?.access_token || '';
            console.log('🔍 getAuthToken called, token exists:', !!token);
            return token;
        }, [session, authContext]);
        
        // Get user profile hook with fixed dependencies
        const { userProgress, saveProgress, loadUserProgress } = window.useUserProfile ? 
            window.useUserProfile(user, getAuthToken) :
            { userProgress: {}, saveProgress: () => {}, loadUserProgress: () => {} };
        
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
        
        // FIXED: Close auth modal when user successfully signs in
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
                } else if (path === '/' || path === '') {
                    // Ensure we're on home view for root path
                    if (currentView === 'public-profile') {
                        setCurrentView('home');
                        setProfileUsername(null);
                    }
                }
            };
            
            handleRoute();
            window.addEventListener('popstate', handleRoute);
            
            return () => window.removeEventListener('popstate', handleRoute);
        }, [currentView]);
        
        // Load initial data
        React.useEffect(() => {
            if (authLoading) {
                setCurrentView('loading');
                return;
            }
            
            loadInitialData();
        }, [authLoading]);
        
        // Load app data
        const loadInitialData = async () => {
            console.log('🔍 Loading initial data...');
            setLoading(true);
            setError(null);
            
            try {
                if (!window.FlashFungiAPI) {
                    throw new Error('FlashFungiAPI not available');
                }
                
                const [specimenData, hintsData, refPhotosData] = await Promise.all([
                    window.FlashFungiAPI.loadSpecimens(),
                    window.FlashFungiAPI.loadSpeciesHints(),
                    window.FlashFungiAPI.loadFieldGuides()
                ]);
                
                setSpecimens(specimenData || []);
                setSpeciesHints(hintsData || {});
                setReferencePhotos(refPhotosData || {});
                
                console.log('✅ Initial data loaded successfully');
                setCurrentView('home');
                
            } catch (error) {
                console.error('❌ Error loading initial data:', error);
                setError(error.message);
                setCurrentView('home'); // Show home even if data fails
            } finally {
                setLoading(false);
            }
        };
        
        // Load specimen photos for a species
        const loadSpecimenPhotos = async (speciesName) => {
            if (specimenPhotos[speciesName]) {
                return specimenPhotos[speciesName];
            }
            
            try {
                const photos = await window.FlashFungiAPI.loadSpecimenPhotos(speciesName);
                setSpecimenPhotos(prev => ({
                    ...prev,
                    [speciesName]: photos
                }));
                return photos;
            } catch (error) {
                console.error('❌ Error loading specimen photos:', error);
                return [];
            }
        };
        
        // Navigation handlers
        const handleStudyModeSelect = (mode) => {
            console.log('🎯 Study mode selected:', mode);
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
        
        const handleModuleSelect = (module) => {
            console.log('📖 Module selected:', module.id);
            setCurrentModule(module);
            setCurrentView('module-player');
        };
        
        const handleModuleComplete = (module) => {
            console.log('🎉 Module completed:', module.id);
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
            return window.LoadingScreen ? React.createElement(window.LoadingScreen, {
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
        if (showAuthModal) {
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
                    zIndex: 1000
                },
                onClick: () => setShowAuthModal(false)
            },
                React.createElement('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '400px',
                        margin: '1rem'
                    },
                    onClick: (e) => e.stopPropagation()
                },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } },
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: '#1f2937' 
                            }
                        }, '🍄 Flash Fungi'),
                        React.createElement('button', {
                            onClick: () => setShowAuthModal(false),
                            style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#6b7280'
                            }
                        }, '×')
                    ),
                    React.createElement(window.LoginForm)
                )
            );
        }

        // Helper function to get current view component
        function getCurrentViewComponent() {
            switch (currentView) {
                case 'home':
                    return window.HomePage ? React.createElement(window.HomePage, {
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
                    return window.MarathonMode ? React.createElement(window.MarathonMode, {
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
                        userProgress,
                        user,
                        onBack: handleBackToHome,
                        onModuleSelect: handleModuleSelect
                    }) : React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                        React.createElement('h1', null, 'TrainingModules component not loaded'),
                        React.createElement('button', { onClick: handleBackToHome }, 'Back to Home')
                    );

                case 'module-player':
                    return window.ModulePlayer ? React.createElement(window.ModulePlayer, {
                        module: currentModule,
                        user,
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
                    return window.HomePage ? React.createElement(window.HomePage, {
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
                        React.createElement('h1', null, 'Components not loaded'),
                        React.createElement('button', { onClick: () => window.location.reload() }, 'Reload')
                    );
            }
        }

        // Route to appropriate component
        return getCurrentViewComponent();
    };
    
    console.log('✅ Fixed AuthenticatedApp loaded with proper hooks compliance');
    
})();