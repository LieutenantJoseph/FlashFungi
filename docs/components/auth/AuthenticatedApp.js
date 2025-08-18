// AuthenticatedApp.js - Main Authenticated App Component (Fixed)
const h = window.h; // Use global h variable

// Main Authenticated App Component
function AuthenticatedApp() {
    console.log('🔍 AuthenticatedApp rendering...');
    
    // Get auth context
    const authContext = window.useAuth ? window.useAuth() : null;
    const { user, loading: authLoading, signOut } = authContext || { user: null, loading: false, signOut: null };
    
    // Get user profile hook
    const { userProgress, saveProgress } = window.useUserProfile ? window.useUserProfile(user, () => '') : { userProgress: {}, saveProgress: () => {} };
    
    const [currentView, setCurrentView] = React.useState('loading');
    const [specimens, setSpecimens] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    
    // Load initial data
    React.useEffect(() => {
        const loadData = async () => {
            try {
                console.log('🔍 Loading specimens...');
                
                // Use global constants
                const url = window.SUPABASE_URL || 'https://oxgedcncrettasrbmwsl.supabase.co';
                const key = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
                
                const response = await fetch(`${url}/rest/v1/specimens?select=*&order=created_at.desc&limit=50`, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('🔍 Loaded specimens:', data.length);
                    setSpecimens(data);
                } else {
                    console.warn('🔍 Failed to load specimens:', response.status);
                }
                
                setCurrentView('home');
            } catch (err) {
                console.error('🔍 Error loading data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        // Add a small delay to let auth system initialize
        setTimeout(loadData, 1000);
    }, []);

    // Event handlers
    const handleStudyModeSelect = (mode) => {
        setCurrentView(`study-${mode}`);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
    };

    const handleAuthRequired = () => {
        alert('Sign in functionality coming soon!');
    };

    const handleSignOut = async () => {
        if (signOut) {
            await signOut();
        }
        setCurrentView('home');
    };

    // Show loading
    if (loading || currentView === 'loading') {
        return window.LoadingScreen ? 
            h(window.LoadingScreen) : 
            h('div', { 
                style: { 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '100vh' 
                } 
            },
                h('div', { style: { textAlign: 'center' } },
                    h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
                    h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                    h('p', { style: { color: '#6b7280' } }, 'Loading...')
                )
            );
    }

    // Show error
    if (error) {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h1', { style: { color: '#ef4444', marginBottom: '1rem' } }, 'Error'),
            h('p', { style: { marginBottom: '1rem' } }, error),
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

    // Route to components
    switch (currentView) {
        case 'home':
            return window.HomePage ? h(window.HomePage, {
                specimens,
                user,
                userProgress,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: () => {},
                onAuthRequired: handleAuthRequired,
                onProfileClick: () => {},
                onSignOut: handleSignOut
            }) : h('div', { style: { padding: '2rem', textAlign: 'center' } },
                h('h1', null, 'HomePage component not loaded'),
                h('p', null, 'Check console for component loading errors'),
                h('button', { onClick: handleBackToHome }, 'Retry')
            );

        case 'study-quick':
            return window.QuickStudy ? h(window.QuickStudy, {
                specimens,
                user,
                onBack: handleBackToHome
            }) : h('div', { style: { padding: '2rem', textAlign: 'center' } },
                h('h1', null, 'QuickStudy component not loaded'),
                h('button', { onClick: handleBackToHome }, 'Back to Home')
            );

        default:
            return window.HomePage ? h(window.HomePage, {
                specimens,
                user,
                userProgress,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: () => {},
                onAuthRequired: handleAuthRequired,
                onProfileClick: () => {},
                onSignOut: handleSignOut
            }) : h('div', { style: { padding: '2rem', textAlign: 'center' } },
                h('h1', null, 'Components not loaded'),
                h('button', { onClick: () => window.location.reload() }, 'Reload')
            );
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthenticatedApp };
} else {
    window.AuthenticatedApp = AuthenticatedApp;
}