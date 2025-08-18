// AuthenticatedApp.js - Main Authenticated App Component with Full Routing

function AuthenticatedApp() {
    console.log('🔍 AuthenticatedApp rendering...');
    
    // Get auth context
    const authContext = window.useAuth ? window.useAuth() : null;
    const { user, loading: authLoading, signOut } = authContext || { user: null, loading: false, signOut: null };
    
    // Get user profile hook
    const { userProgress, saveProgress, loadUserProgress } = window.useUserProfile ? window.useUserProfile(user, () => '') : { userProgress: {}, saveProgress: () => {}, loadUserProgress: () => {} };
    
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
        const loadData = async () => {
            try {
                console.log('🔍 Starting data load...');
                
                // Use global constants
                const url = window.SUPABASE_URL || 'https://oxgedcncrettasrbmwsl.supabase.co';
                const key = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
                
                // Load specimens
                console.log('🔍 Fetching specimens...');
                const specimensResponse = await fetch(`${url}/rest/v1/specimens?select=*&order=created_at.desc`, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`
                    }
                });
                
                if (specimensResponse.ok) {
                    const specimensData = await specimensResponse.json();
                    console.log('🔍 Specimens loaded:', specimensData.length);
                    setSpecimens(specimensData);
                }

                // Load species hints
                console.log('🔍 Fetching species hints...');
                const hintsResponse = await fetch(`${url}/rest/v1/species_hints?select=*`, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`
                    }
                });

                if (hintsResponse.ok) {
                    const hintsData = await hintsResponse.json();
                    console.log('🔍 Hints loaded:', hintsData.length);
                    const hintsMap = {};
                    hintsData.forEach(hint => {
                        hintsMap[hint.species_name] = hint;
                    });
                    setSpeciesHints(hintsMap);
                }

                // Load field guides (for reference photos)
                console.log('🔍 Fetching field guides...');
                const guidesResponse = await fetch(`${url}/rest/v1/field_guides?select=*`, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`
                    }
                });

                if (guidesResponse.ok) {
                    const guidesData = await guidesResponse.json();
                    console.log('🔍 Guides loaded:', guidesData.length);
                    const photosMap = {};
                    guidesData.forEach(guide => {
                        if (guide.reference_photos && guide.reference_photos.length > 0) {
                            photosMap[guide.species_name] = guide.reference_photos;
                        }
                    });
                    setReferencePhotos(photosMap);
                }
                
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

        // Add a small delay to let auth system initialize
        setTimeout(loadData, 1000);
    }, []);

    // Load specimen photos on demand
    const loadSpecimenPhotos = React.useCallback(async (inaturalistId) => {
        if (specimenPhotos[inaturalistId]) {
            return specimenPhotos[inaturalistId];
        }

        try {
            const response = await fetch(`https://api.inaturalist.org/v1/observations/${inaturalistId}`);
            const data = await response.json();
            
            if (data.results && data.results[0] && data.results[0].photos) {
                const photos = data.results[0].photos.map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    medium_url: photo.url.replace('square', 'medium'),
                    large_url: photo.url.replace('square', 'large')
                }));
                
                setSpecimenPhotos(prev => ({
                    ...prev,
                    [inaturalistId]: photos
                }));
                
                return photos;
            }
        } catch (error) {
            console.error(`Error loading photos for ${inaturalistId}:`, error);
        }
        
        return [];
    }, [specimenPhotos]);

    // Event handlers
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

    // Show loading
    if (loading || currentView === 'loading') {
        return window.LoadingScreen ? 
            window.h(window.LoadingScreen) : 
            window.h('div', { 
                style: { 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '100vh' 
                } 
            },
                window.h('div', { style: { textAlign: 'center' } },
                    window.h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
                    window.h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                    window.h('p', { style: { color: '#6b7280' } }, 'Loading educational content...')
                )
            );
    }

    // Show error
    if (error) {
        return window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
            window.h('h1', { style: { color: '#ef4444', marginBottom: '1rem' } }, 'Error'),
            window.h('p', { style: { marginBottom: '1rem' } }, error),
            window.h('button', { 
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
        return window.h('div', null,
            // Render current view in background
            getCurrentViewComponent(),
            window.h(window.AuthModal, {
                onClose: () => setShowAuthModal(false)
            })
        );
    }

    // Helper function to get current view component
    function getCurrentViewComponent() {
        switch (currentView) {
            case 'home':
                return window.HomePage ? window.h(window.HomePage, {
                    specimens,
                    user,
                    userProgress,
                    speciesWithHints: Object.keys(speciesHints).length,
                    onStudyModeSelect: handleStudyModeSelect,
                    onTrainingModuleSelect: handleTrainingModuleSelect,
                    onAuthRequired: handleAuthRequired,
                    onProfileClick: handleProfileClick,
                    onSignOut: handleSignOut
                }) : window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
                    window.h('h1', null, 'HomePage component not loaded')
                );

            case 'profile':
                return window.ProfilePage ? window.h(window.ProfilePage, {
                    user,
                    userProgress,
                    onBack: handleBackToHome
                }) : handleBackToHome();

            case 'study-quick':
                return window.QuickStudy ? window.h(window.QuickStudy, {
                    specimens,
                    speciesHints,
                    referencePhotos,
                    specimenPhotos,
                    user,
                    saveProgress,
                    loadSpecimenPhotos,
                    onBack: handleBackToHome
                }) : window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
                    window.h('h1', null, 'QuickStudy component not loaded'),
                    window.h('button', { onClick: handleBackToHome }, 'Back to Home')
                );

            case 'study-focused':
                return window.FocusedStudy ? window.h(window.FocusedStudy, {
                    specimens,
                    speciesHints,
                    referencePhotos,
                    specimenPhotos,
                    user,
                    saveProgress,
                    loadSpecimenPhotos,
                    onBack: handleBackToHome
                }) : window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
                    window.h('h1', null, 'FocusedStudy component not loaded'),
                    window.h('button', { onClick: handleBackToHome }, 'Back to Home')
                );

            case 'study-marathon':
                return window.MarathonMode ? window.h(window.MarathonMode, {
                    specimens,
                    speciesHints,
                    referencePhotos,
                    specimenPhotos,
                    user,
                    saveProgress,
                    loadSpecimenPhotos,
                    onBack: handleBackToHome
                }) : window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
                    window.h('h1', null, 'MarathonMode component not loaded'),
                    window.h('button', { onClick: handleBackToHome }, 'Back to Home')
                );

            case 'training-modules':
                return window.TrainingModules ? window.h(window.TrainingModules, {
                    userProgress,
                    user,
                    onBack: handleBackToHome,
                    onModuleSelect: handleModuleSelect
                }) : window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
                    window.h('h1', null, 'TrainingModules component not loaded'),
                    window.h('button', { onClick: handleBackToHome }, 'Back to Home')
                );

            case 'module-player':
                return window.ModulePlayer ? window.h(window.ModulePlayer, {
                    module: currentModule,
                    user,
                    saveProgress,
                    onComplete: handleModuleComplete,
                    onBack: () => setCurrentView('training-modules')
                }) : window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
                    window.h('h1', null, 'ModulePlayer component not loaded'),
                    window.h('button', { onClick: () => setCurrentView('training-modules') }, 'Back to Training')
                );

            case 'public-profile':
                if (profileUsername && window.PublicProfile) {
                    return window.h(window.PublicProfile, {
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
                return window.HomePage ? window.h(window.HomePage, {
                    specimens,
                    user,
                    userProgress,
                    speciesWithHints: Object.keys(speciesHints).length,
                    onStudyModeSelect: handleStudyModeSelect,
                    onTrainingModuleSelect: handleTrainingModuleSelect,
                    onAuthRequired: handleAuthRequired,
                    onProfileClick: handleProfileClick,
                    onSignOut: handleSignOut
                }) : window.h('div', { style: { padding: '2rem', textAlign: 'center' } },
                    window.h('h1', null, 'Components not loaded'),
                    window.h('button', { onClick: () => window.location.reload() }, 'Reload')
                );
        }
    }

    // Route to appropriate component
    return getCurrentViewComponent();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthenticatedApp };
} else {
    window.AuthenticatedApp = AuthenticatedApp;
    console.log('✅ AuthenticatedApp loaded with full routing support');
}