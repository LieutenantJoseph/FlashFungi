// Flash Fungi - Main Application Entry Point
// Version 3.0 - Modular Architecture
console.log('🍄 Flash Fungi v3.0 - Modular Architecture');

// Check React availability
if (typeof React === 'undefined') {
    console.error('❌ React not available');
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React not loaded</h1></div>';
} else {
    console.log('✅ React loaded successfully');

// Load external dependencies
const loadDependencies = async () => {
    console.log('🔌 Loading external dependencies...');
    
    // Load Supabase client library
    const supabaseScript = document.createElement('script');
    supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    
    return new Promise((resolve, reject) => {
        supabaseScript.onload = () => {
            console.log('✅ Supabase client library loaded');
            
            // Load auth system
            const authScript = document.createElement('script');
            authScript.src = './supabase-auth.js';
            authScript.onload = () => {
                console.log('✅ Supabase auth system loaded');
                
                // Load public profile component
                const profileScript = document.createElement('script');
                profileScript.src = './public-profile.js';
                profileScript.onload = () => {
                    console.log('✅ Public profile component loaded');
                    resolve();
                };
                profileScript.onerror = reject;
                document.head.appendChild(profileScript);
            };
            authScript.onerror = reject;
            document.head.appendChild(authScript);
        };
        supabaseScript.onerror = reject;
        document.head.appendChild(supabaseScript);
    });
};

// Load modular components
const loadComponents = async () => {
    console.log('🔄 Loading modular components...');
    
    const componentFiles = [
        './config/constants.js',
        './utils/api.js',
        './components/common/LoadingScreen.js',
        './components/study/utils/fuzzyMatching.js',
        './components/auth/useUserProfile.js',
        './components/study/InteractiveSpeciesGuide.js',
        './components/study/QuickStudy.js',
        './components/training/TrainingModules.js',
        './components/training/ModulePlayer.js',
        './components/home/HomePage.js',
        './components/auth/AuthenticatedApp.js'
    ];
    
    // Load components sequentially to maintain dependencies
    for (const file of componentFiles) {
        try {
            await loadScript(file);
            console.log(`✅ Loaded: ${file}`);
        } catch (error) {
            console.error(`❌ Failed to load: ${file}`, error);
        }
    }
};

// Utility function to load scripts
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Main App Component with Auth Wrapper
function App() {
    const [appReady, setAppReady] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState('Initializing...');
    
    console.log('🔍 App component rendering, appReady:', appReady);
    
    // Initialize app dependencies
    React.useEffect(() => {
        const initializeApp = async () => {
            try {
                setLoadingMessage('Loading dependencies...');
                await loadDependencies();
                
                setLoadingMessage('Loading components...');
                await loadComponents();
                
                setLoadingMessage('Checking authentication...');
                // Wait for auth to be ready
                let checkCount = 0;
                const checkAuth = () => {
                    checkCount++;
                    console.log(`🔍 Checking auth availability (attempt ${checkCount})...`);
                    
                    if (window.supabase && window.AuthProvider && window.useAuth) {
                        console.log('🎉 Auth system ready!');
                        setAppReady(true);
                    } else if (checkCount < 50) {
                        setTimeout(checkAuth, 100);
                    } else {
                        console.error('🔥 Auth system failed to load after 5 seconds');
                        // Try to proceed anyway
                        if (window.AuthProvider && window.useAuth) {
                            console.log('🔄 Auth functions available, proceeding anyway...');
                            setAppReady(true);
                        }
                    }
                };
                checkAuth();
                
            } catch (error) {
                console.error('❌ Error initializing app:', error);
                setLoadingMessage(`Error: ${error.message}`);
            }
        };
        
        initializeApp();
    }, []);
    
    if (!appReady) {
        return window.LoadingScreen ? 
            React.createElement(window.LoadingScreen, { message: loadingMessage }) :
            React.createElement('div', 
                { style: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
                    React.createElement('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' } }, 'Flash Fungi'),
                    React.createElement('p', { style: { color: '#6b7280' } }, loadingMessage)
                )
            );
    }
    
    console.log('🎯 App ready, rendering AuthProvider with AuthenticatedApp');
    
    // Render the main authenticated app
    return React.createElement(window.AuthProvider, null,
        React.createElement(window.AuthenticatedApp)
    );
}

// Initialize the app when DOM is ready
console.log('🚀 Initializing Flash Fungi App...');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
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
            root.render(React.createElement(App));
        } else {
            // Fallback for older React versions
            ReactDOM.render(React.createElement(App), rootElement);
        }
        
        console.log('✅ Flash Fungi initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;"><h1>Error initializing app</h1><p>${error.message}</p></div>`;
    }
}

}