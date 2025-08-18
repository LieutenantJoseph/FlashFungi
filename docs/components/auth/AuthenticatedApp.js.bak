// Flash Fungi - Authenticated App Component
// Main application router and state management

window.AuthenticatedApp = function AuthenticatedApp() {
    console.log('🔍 AuthenticatedApp rendering...');
    
    const h = React.createElement;
    
    // We're inside AuthProvider now, so this should work
    const authContext = window.useAuth();
    console.log('🔍 Auth context from hook:', authContext);
    
    const { user, loading: authLoading, signOut } = authContext || { user: null, loading: false, signOut: null };
    console.log('🔍 Auth data:', { user, authLoading });
    
    const { userProgress, saveProgress, loadUserProgress } = window.useUserProfile(user, () => '');
    
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
    const [authCheckComplete, setAuthCheckComplete] = React.useState(false);
    
    console.log('🔍 Component state:', { currentView, loading, authLoading, authCheckComplete });
    
    // WORKAROUND: Force auth check to complete after 2 seconds
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            console.log('🔍 Force completing auth check after 2 seconds');
            setAuthCheckComplete(true);
        }, 2000);
        
        return () => clearTimeout(timeout);
    }, []);
    
    // Mark auth as complete when authLoading becomes false
    React.useEffect(() => {
        if (!authLoading) {
            console.log('🔍 Auth loading complete');
            setAuthCheckComplete(true);
        }
    }, [authLoading]);
    
    // Handle URL routing for public profiles
    React.useEffect(() => {
        const handleRoute = () => {
            const path = window.location.pathname;
            const match = path.match(/^\/profile\/(.+)$/);
            
            if (match) {
                const username = match[1];
                setProfileUsername(username);
                setCurrentView('public-profile');
            }
        };
        
        handleRoute();
        window.addEventListener('popstate', handleRoute);
        
        return () => window.removeEventListener('popstate', handleRoute);
    }, []);
    
    // Load initial data
    React.useEffect(() => {
        console.log('🔍 Data loading useEffect triggered, authCheckComplete:', authCheckComplete);
        
        const loadData = async () => {
            console.log('🔍 Starting data load...');
            try {
                // Load specimens
                const specimensData = await window.FlashFungiAPI.loadSpecimens();
                setSpecimens(specimensData);

                // Load species hints
                const hintsData = await window.FlashFungiAPI.loadSpeciesHints();
                setSpeciesHints(hintsData);

                // Load field guides (for reference photos)
                const photosData = await window.FlashFungiAPI.loadFieldGuides();
                setReferencePhotos(photosData);

                console.log('🔍 Setting currentView to home...');
                setCurrentView('home');
            } catch (err) {
                console.error('🔍 Error loading data:', err);
                setError('Failed to load application data');
            } finally {
                console.log('🔍 Setting loading to false...');
                setLoading(false);
            }
        };

        if (authCheckComplete) {
            console.log('🔍 Auth check complete, starting data load...');
            loadData();
        } else {
            console.log('🔍 Auth check not complete, waiting...');
        }
    }, [authCheckComplete]);

    // Load specimen photos on demand
    const loadSpecimenPhotos = React.useCallback(async (inaturalistId) => {
        if (specimenPhotos[inaturalistId]) {
            return specimenPhotos[inaturalistId];
        }

        try {
            const photos = await window.FlashFungiAPI.loadSpecimenPhotos(inaturalistId);
            setSpecimenPhotos(prev => ({
                ...prev,
                [inaturalistId]: photos
            }));
            return photos;
        } catch (error) {
            console.error(`❌ Error loading photos for ${inaturalistId}:`, error);
            return [];
        }
    }, [specimenPhotos]);

    const handleStudyModeSelect = (mode) => {
        setCurrentView(`study-${mode}`);
    };

    const handleTrainingModuleSelect = (category) => {
        if (category === 'foundation') {
            setCurrentView('training-modules');
        }
    };

    const handleModuleSelect = (module) => {
        setCurrentModule(module);
        setCurrentView('module-player');
    };

    const handleModuleComplete = async (module) => {
        console.log(`Module ${module.id} completed!`);
        await loadUserProgress(); // Refresh progress
        setCurrentView('training-modules');
        setCurrentModule(null);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
        setCurrentModule(null);
    };

    const handleAuthRequired = () => {
        setShowAuthModal(true);
    };

    const handleProfileClick = () => {
        if (window.ProfilePage) {
            setCurrentView('profile');
        }
    };

    const handleSignOut = async () => {
        if (signOut) {
            await signOut();
            setCurrentView('home');
        }
    };
    
    // Don't wait for auth loading if we've already checked
    // This prevents infinite loading when auth hook is broken
    const shouldShowLoading = !authCheckComplete || loading || currentView === 'loading';
    
    // Show loading while waiting for initial setup
    if (shouldShowLoading) {
        console.log('🔍 Showing LoadingScreen - authCheckComplete:', authCheckComplete, 'loading:', loading, 'currentView:', currentView);
        return h(window.LoadingScreen);
    }
    
    // Show public profile if viewing one
    if (currentView === 'public-profile' && profileUsername && window.PublicProfile) {
        return h(window.PublicProfile, {
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

    // Error state
    if (error) {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h1', { style: { color: '#ef4444' } }, 'Error'),
            h('p', null, error),
            h('button', { 
                onClick: () => window.location.reload(),
                style: {
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                }
            }, 'Retry')
        );
    }

    // Show auth modal over current content
    if (showAuthModal && window.AuthModal) {
        return h('div', null,
            currentView === 'home' && h(window.HomePage, {
                specimens,
                user,
                userProgress,
                speciesWithHints: Object.keys(speciesHints).length,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: handleTrainingModuleSelect,
                onAuthRequired: handleAuthRequired,
                onProfileClick: handleProfileClick,
                onSignOut: handleSignOut
            }),
            h(window.AuthModal, {
                onClose: () => setShowAuthModal(false)
            })
        );
    }

    // Route to appropriate component
    switch (currentView) {
        case 'home':
            return h(window.HomePage, {
                specimens,
                user,
                userProgress,
                speciesWithHints: Object.keys(speciesHints).length,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: handleTrainingModuleSelect,
                onAuthRequired: handleAuthRequired,
                onProfileClick: handleProfileClick,
                onSignOut: handleSignOut
            });

        case 'profile':
            return window.ProfilePage ? h(window.ProfilePage, {
                user,
                userProgress,
                onBack: handleBackToHome
            }) : handleBackToHome();

        case 'study-quick':
            return h(window.QuickStudy, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            });

        case 'study-focused':
            return window.FocusedStudy ? h(window.FocusedStudy, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            }) : handleBackToHome();

        case 'study-marathon':
            return window.MarathonMode ? h(window.MarathonMode, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            }) : handleBackToHome();

        case 'training-modules':
            return h(window.TrainingModules, {
                userProgress,
                user,
                onBack: handleBackToHome,
                onModuleSelect: handleModuleSelect
            });

        case 'module-player':
            return h(window.ModulePlayer, {
                module: currentModule,
                user,
                saveProgress,
                onComplete: handleModuleComplete,
                onBack: () => setCurrentView('training-modules')
            });

        default:
            return h(window.HomePage, {
                specimens,
                user,
                userProgress,
                speciesWithHints: Object.keys(speciesHints).length,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: handleTrainingModuleSelect,
                onAuthRequired: handleAuthRequired,
                onProfileClick: handleProfileClick,
                onSignOut: handleSignOut
            });
    }
};

console.log('✅ AuthenticatedApp component loaded');