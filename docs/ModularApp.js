// ModularApp.js - Clean version with NO const h declaration
console.log('🍄 ModularApp.js loading...');

// DON'T declare const h - just use window.h directly everywhere
// This prevents ALL duplicate variable errors

function ModularApp() {
    const [appReady, setAppReady] = React.useState(false);
    
    console.log('🍄 ModularApp rendering, checking dependencies...');
    
    React.useEffect(() => {
        let attempts = 0;
        const checkDependencies = () => {
            attempts++;
            console.log(`🍄 Dependency check attempt ${attempts}`);
            
            const hasAuth = window.supabase && window.AuthProvider && window.useAuth;
            const hasHomePage = window.HomePage;
            
            if (hasAuth || hasHomePage || attempts > 20) {
                console.log('🍄 Dependencies ready or timeout reached');
                setAppReady(true);
            } else {
                setTimeout(checkDependencies, 150);
            }
        };
        
        checkDependencies();
    }, []);
    
    if (!appReady) {
        return window.LoadingScreen ? 
            window.h(window.LoadingScreen) : 
            window.h('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center'
                }
            },
                window.h('div', null,
                    window.h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
                    window.h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                    window.h('p', { style: { color: '#6b7280' } }, 'Loading modular system...')
                )
            );
    }
    
    // Try auth-enabled app first, fall back to basic HomePage
    if (window.AuthProvider && window.AuthenticatedApp) {
        console.log('🍄 Rendering with auth system');
        return window.h(window.AuthProvider, null,
            window.h(window.AuthenticatedApp)
        );
    } else if (window.HomePage) {
        console.log('🍄 Rendering basic HomePage');
        return window.h(window.HomePage, {
            specimens: [],
            user: null,
            userProgress: {},
            speciesWithHints: 0,
            onStudyModeSelect: () => console.log('Study mode selected'),
            onTrainingModuleSelect: () => console.log('Training selected'),
            onAuthRequired: () => console.log('Auth required'),
            onProfileClick: () => console.log('Profile clicked'),
            onSignOut: () => console.log('Sign out')
        });
    } else {
        return window.h('div', {
            style: { padding: '2rem', textAlign: 'center' }
        },
            window.h('h1', { style: { color: '#ef4444' } }, 'Components Not Ready'),
            window.h('p', null, 'Waiting for components to load...'),
            window.h('button', {
                onClick: () => window.location.reload(),
                style: {
                    marginTop: '1rem',
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                }
            }, 'Reload')
        );
    }
}

// Export immediately
window.ModularApp = ModularApp;
console.log('✅ ModularApp exported to window');

// Initialize when DOM ready
function initApp() {
    console.log('🚀 Initializing ModularApp...');
    const root = document.getElementById('root');
    
    if (!root) {
        console.error('❌ No root element found');
        return;
    }
    
    try {
        if (ReactDOM.createRoot) {
            const reactRoot = ReactDOM.createRoot(root);
            reactRoot.render(window.h(ModularApp));
        } else {
            ReactDOM.render(window.h(ModularApp), root);
        }
        console.log('✅ ModularApp initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize ModularApp:', error);
        root.innerHTML = `<div style="padding: 2rem; text-align: center; color: red;">
            <h1>Initialization Error</h1>
            <p>${error.message}</p>
            <button onclick="window.location.reload()">Reload</button>
        </div>`;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
