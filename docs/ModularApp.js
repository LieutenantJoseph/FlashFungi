// ModularApp.js - Main Modular Application Entry Point (Root Level)
// Moved to docs root to avoid vercel routing issues

// Use shared h variable
const h = window.h || React.createElement;

// Main App Component with Auth Wrapper
function ModularApp() {
    const [appReady, setAppReady] = React.useState(false);
    
    console.log('🍄 ModularApp component rendering, appReady:', appReady);
    console.log('🍄 window.AuthProvider available?', !!window.AuthProvider);
    console.log('🍄 window.useAuth available?', !!window.useAuth);
    console.log('🍄 window.supabase available?', !!window.supabase);
    
    // Wait for auth to be loaded
    React.useEffect(() => {
        let checkCount = 0;
        const checkReady = () => {
            checkCount++;
            console.log(`🍄 Checking auth availability (attempt ${checkCount})...`);
            
            if (window.supabase && window.AuthProvider && window.useAuth) {
                console.log('🍄 Auth system ready!');
                setAppReady(true);
            } else {
                if (checkCount < 30) { // Max 3 seconds
                    setTimeout(checkReady, 100);
                } else {
                    console.error('🍄 Auth system failed to load after 3 seconds');
                    // Proceed anyway - maybe auth isn't needed immediately
                    setAppReady(true);
                }
            }
        };
        checkReady();
    }, []);
    
    if (!appReady) {
        console.log('🍄 App not ready, showing LoadingScreen');
        return window.LoadingScreen ? h(window.LoadingScreen) : h('div', { 
            style: { 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh' 
            } 
        },
            h('div', { style: { textAlign: 'center' } },
                h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
                h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'Flash Fungi'),
                h('p', { style: { color: '#6b7280' } }, 'Loading modular components...')
            )
        );
    }
    
    console.log('🍄 App ready, checking for AuthProvider and AuthenticatedApp');
    
    // Render app with auth provider if available, otherwise render HomePage directly
    if (window.AuthProvider && window.AuthenticatedApp) {
        return h(window.AuthProvider, null,
            h(window.AuthenticatedApp)
        );
    } else if (window.HomePage) {
        // Fallback to HomePage if auth components aren't ready
        console.log('🍄 Falling back to HomePage directly');
        return h(window.HomePage, {
            specimens: [],
            user: null,
            userProgress: {},
            speciesWithHints: 0,
            onStudyModeSelect: () => console.log('Study mode selected'),
            onTrainingModuleSelect: () => console.log('Training module selected'), 
            onAuthRequired: () => console.log('Auth required'),
            onProfileClick: () => console.log('Profile clicked'),
            onSignOut: () => console.log('Sign out')
        });
    } else {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h1', { style: { color: '#ef4444' } }, 'Component Loading Error'),
            h('p', null, 'Required components not found'),
            h('div', { style: { marginTop: '1rem' } },
                h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                    'Available components: ', Object.keys(window).filter(k => k.match(/^[A-Z]/)).join(', ')
                ),
                h('button', {
                    onClick: () => window.componentLoadTracker?.report(),
                    style: {
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                    }
                }, 'Show Component Status')
            )
        );
    }
}

// Initialize the modular app
console.log('🚀 Initializing Flash Fungi Modular App...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModularApp);
} else {
    initializeModularApp();
}

function initializeModularApp() {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        console.error('❌ Root element not found');
        return;
    }

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('❌ React not available');
        rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React libraries not loaded</h1></div>';
        return;
    }

    try {
        // Use React 18 createRoot API
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(h(ModularApp));
        } else {
            // Fallback for older React versions
            ReactDOM.render(h(ModularApp), rootElement);
        }
        
        console.log('✅ Flash Fungi Modular App initialized successfully!');
        
        // Report component status after initialization
        setTimeout(() => {
            if (window.componentLoadTracker) {
                console.log('📊 Final Component Report:');
                window.componentLoadTracker.report();
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error initializing modular app:', error);
        rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;"><h1>Error initializing modular app</h1><p>${error.message}</p></div>`;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModularApp };
} else {
    window.ModularApp = ModularApp;
}
