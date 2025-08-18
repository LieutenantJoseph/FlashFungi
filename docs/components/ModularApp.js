// ModularApp.js - Main Modular Application Entry Point
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
            console.log('  - Supabase client:', !!window.supabase);
            console.log('  - AuthProvider:', !!window.AuthProvider);
            console.log('  - useAuth:', !!window.useAuth);
            
            if (window.supabase && window.AuthProvider && window.useAuth) {
                console.log('🍄 Auth system ready!');
                setAppReady(true);
            } else {
                if (checkCount < 50) { // Max 5 seconds
                    setTimeout(checkReady, 100);
                } else {
                    console.error('🍄 Auth system failed to load after 5 seconds');
                    console.log('🍄 Final window state:', {
                        supabase: !!window.supabase,
                        AuthProvider: !!window.AuthProvider,
                        useAuth: !!window.useAuth
                    });
                    // Try to proceed anyway in case there's a timing issue
                    if (window.AuthProvider && window.useAuth) {
                        console.log('🍄 Auth functions available, proceeding anyway...');
                        setAppReady(true);
                    }
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
    
    console.log('🍄 App ready, rendering AuthProvider with AuthenticatedApp');
    
    // Render app with auth provider
    if (window.AuthProvider && window.AuthenticatedApp) {
        return h(window.AuthProvider, null,
            h(window.AuthenticatedApp)
        );
    } else {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h1', { style: { color: '#ef4444' } }, 'Component Loading Error'),
            h('p', null, 'AuthProvider or AuthenticatedApp components not found'),
            h('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' } },
                'Available components: ', Object.keys(window).filter(k => k.match(/^[A-Z]/)).join(', ')
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
        
        // Report component status
        setTimeout(() => {
            if (window.componentLoadTracker) {
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
