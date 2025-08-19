// Flash Fungi - Main Application Entry Point
// Version 3.0 - Modular Architecture with Authentication Integration
console.log('🍄 Flash Fungi v3.0 - Modular Architecture');

// Check React availability
if (typeof React === 'undefined') {
    console.error('❌ React not available');
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React not loaded</h1></div>';
} else {
    console.log('✅ React loaded successfully');

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
const API_BASE = '/api';

// Export configuration for use by components
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.API_BASE = API_BASE;

// Debug: Verify Supabase configuration
console.log('🔍 Supabase Config:', {
    url: SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY,
    keyLength: SUPABASE_ANON_KEY.length
});

// Test Supabase connection
fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
}).then(response => {
    console.log('🔍 Supabase connection test:', response.ok ? 'SUCCESS' : 'FAILED', response.status);
}).catch(error => {
    console.error('🔍 Supabase connection error:', error);
});

const h = React.createElement;

// Loading Screen Component (shared across modules)
function LoadingScreen() {
    console.log('🔍 LoadingScreen rendering');
    return h('div', {
        style: { 
            minHeight: '100vh', 
            backgroundColor: '#f9fafb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }
    },
        h('div', { style: { textAlign: 'center' } },
            h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
            h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' } }, 
                'Flash Fungi'
            ),
            h('p', { style: { color: '#6b7280' } }, 'Loading educational content...')
        )
    );
}

// Export LoadingScreen to window for global access
window.LoadingScreen = LoadingScreen;

// Dynamic Component Loader
async function loadComponent(scriptPath) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onload = () => {
            console.log(`✅ Component loaded: ${scriptPath}`);
            resolve();
        };
        script.onerror = (error) => {
            console.error(`❌ Failed to load component: ${scriptPath}`, error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Load Required External Scripts
async function loadExternalDependencies() {
    console.log('📦 Loading external dependencies...');
    
    try {
        // Load Supabase client library
        await new Promise((resolve, reject) => {
            const supabaseScript = document.createElement('script');
            supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            supabaseScript.onload = () => {
                console.log('✅ Supabase client library loaded');
                resolve();
            };
            supabaseScript.onerror = reject;
            document.head.appendChild(supabaseScript);
        });

        // Load auth system
        await loadComponent('./supabase-auth.js');
        
        // Load other Phase 3 components
        await loadComponent('./public-profile.js');
        
// Flash Fungi - Main Application Entry Point
// Version 3.0 - Modular Architecture with Authentication Integration
console.log('🍄 Flash Fungi v3.0 - Modular Architecture');

// Check React availability
if (typeof React === 'undefined') {
    console.error('❌ React not available');
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React not loaded</h1></div>';
} else {
    console.log('✅ React loaded successfully');

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
const API_BASE = '/api';

// Export configuration for use by components
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.API_BASE = API_BASE;

// Debug: Verify Supabase configuration
console.log('🔍 Supabase Config:', {
    url: SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY,
    keyLength: SUPABASE_ANON_KEY.length
});

// Test Supabase connection
fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
}).then(response => {
    console.log('🔍 Supabase connection test:', response.ok ? 'SUCCESS' : 'FAILED', response.status);
}).catch(error => {
    console.error('🔍 Supabase connection error:', error);
});

const h = React.createElement;

// Loading Screen Component (shared across modules)
function LoadingScreen() {
    console.log('🔍 LoadingScreen rendering');
    return h('div', {
        style: { 
            minHeight: '100vh', 
            backgroundColor: '#f9fafb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }
    },
        h('div', { style: { textAlign: 'center' } },
            h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
            h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' } }, 
                'Flash Fungi'
            ),
            h('p', { style: { color: '#6b7280' } }, 'Loading educational content...')
        )
    );
}

// Export LoadingScreen to window for global access
window.LoadingScreen = LoadingScreen;

// Dynamic Component Loader
async function loadComponent(scriptPath) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onload = () => {
            console.log(`✅ Component loaded: ${scriptPath}`);
            resolve();
        };
        script.onerror = (error) => {
            console.error(`❌ Failed to load component: ${scriptPath}`, error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Load Required External Scripts
async function loadExternalDependencies() {
    console.log('📦 Loading external dependencies...');
    
    try {
        // Load Supabase client library
        await new Promise((resolve, reject) => {
            const supabaseScript = document.createElement('script');
            supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            supabaseScript.onload = () => {
                console.log('✅ Supabase client library loaded');
                resolve();
            };
            supabaseScript.onerror = reject;
            document.head.appendChild(supabaseScript);
        });

        // Load auth system
        await loadComponent('./supabase-auth.js');
        
        // Load other Phase 3 components
        await loadComponent('./public-profile.js');
        
        console.log('✅ All external dependencies loaded');
        return true;
    } catch (error) {
        console.error('❌ Failed to load external dependencies:', error);
        return false;
    }
}

// Load Core Components
async function loadCoreComponents() {
    console.log('🏗️ Loading core components...');
    
    try {
        // Load common components first
        await loadComponent('./components/common/LoadingScreen.js');
        await loadComponent('./components/common/Toast.js');
        await loadComponent('./components/common/Phase3Badge.js');
        
        // Load utility components
        await loadComponent('./components/study/utils/fuzzyMatching.js');
        
        // Load study components  
        await loadComponent('./components/study/QuickStudy.js');
        
        // Load page components
        await loadComponent('./components/home/HomePage.js');
        
        // Load the main authenticated app component
        await loadComponent('./components/auth/AuthenticatedApp.js');
        
        console.log('✅ Core components loaded');
        return true;
    } catch (error) {
        console.error('❌ Failed to load core components:', error);
        return false;
    }
}

// Main App Component with Auth Wrapper
function App() {
    const [appReady, setAppReady] = React.useState(false);
    const [loadingStage, setLoadingStage] = React.useState('Starting...');
    
    console.log('🔍 App component rendering, appReady:', appReady);
    console.log('🔍 window.AuthProvider available?', !!window.AuthProvider);
    console.log('🔍 window.useAuth available?', !!window.useAuth);
    console.log('🔍 window.supabase available?', !!window.supabase);
    
    // Load all dependencies and components
    React.useEffect(() => {
        const initializeApp = async () => {
            try {
                setLoadingStage('Loading external dependencies...');
                const depsLoaded = await loadExternalDependencies();
                
                if (!depsLoaded) {
                    throw new Error('Failed to load external dependencies');
                }
                
                setLoadingStage('Loading core components...');
                const componentsLoaded = await loadCoreComponents();
                
                if (!componentsLoaded) {
                    throw new Error('Failed to load core components');
                }
                
                setLoadingStage('Checking authentication system...');
                
                // Wait for auth system to be ready
                let checkCount = 0;
                const checkReady = () => {
                    checkCount++;
                    console.log(`🔍 Checking auth availability (attempt ${checkCount})...`);
                    console.log('  - Supabase client:', !!window.supabase);
                    console.log('  - AuthProvider:', !!window.AuthProvider);
                    console.log('  - useAuth:', !!window.useAuth);
                    console.log('  - AuthenticatedApp:', !!window.AuthenticatedApp);
                    
                    if (window.supabase && window.AuthProvider && window.useAuth && window.AuthenticatedApp) {
                        console.log('🔍 Auth system and components ready!');
                        setLoadingStage('Ready!');
                        setAppReady(true);
                    } else {
                        if (checkCount < 50) { // Max 5 seconds
                            setTimeout(checkReady, 100);
                        } else {
                            console.error('🔍 Auth system failed to load after 5 seconds');
                            console.log('🔍 Final window state:', {
                                supabase: !!window.supabase,
                                AuthProvider: !!window.AuthProvider,
                                useAuth: !!window.useAuth,
                                AuthenticatedApp: !!window.AuthenticatedApp
                            });
                            // Try to proceed anyway if we have the critical components
                            if (window.AuthProvider && window.useAuth && window.AuthenticatedApp) {
                                console.log('🔍 Critical components available, proceeding anyway...');
                                setAppReady(true);
                            } else {
                                throw new Error('Critical components failed to load');
                            }
                        }
                    }
                };
                checkReady();
                
            } catch (error) {
                console.error('❌ App initialization failed:', error);
                setLoadingStage(`Error: ${error.message}`);
            }
        };
        
        initializeApp();
    }, []);
    
    if (!appReady) {
        console.log('🔍 App not ready, showing LoadingScreen');
        return h('div', {
            style: { 
                minHeight: '100vh', 
                backgroundColor: '#f9fafb', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }
        },
            h('div', { style: { textAlign: 'center' } },
                h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
                h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' } }, 
                    'Flash Fungi'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, loadingStage),
                h('div', { 
                    style: { 
                        width: '200px', 
                        height: '4px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '2px',
                        margin: '0 auto',
                        overflow: 'hidden'
                    } 
                },
                    h('div', {
                        style: {
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#10b981',
                            borderRadius: '2px',
                            animation: 'pulse 2s infinite'
                        }
                    })
                )
            )
        );
    }
    
    console.log('🔍 App ready, rendering AuthProvider with AuthenticatedApp');
    // Render AuthenticatedApp inside AuthProvider
    return h(window.AuthProvider, null,
        h(window.AuthenticatedApp)
    );
}

// Initialize the app
console.log('🚀 Initializing Flash Fungi App with Modular Architecture...');

// Wait for DOM to be ready
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
            root.render(h(App));
        } else {
            // Fallback for older React versions
            ReactDOM.render(h(App), rootElement);
        }
        
        console.log('✅ Flash Fungi initialized successfully with modular architecture!');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;"><h1>Error initializing app</h1><p>${error.message}</p></div>`;
    }
}
}