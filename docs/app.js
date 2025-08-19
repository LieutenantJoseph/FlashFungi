// app.js - Complete Flash Fungi Application Orchestrator
// Version 3.0 - Enhanced modular architecture with all original features

console.log('🍄 Flash Fungi v3.0 - Complete Application Starting...');

// Check React availability
if (typeof React === 'undefined') {
    console.error('❌ React not available');
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React not loaded</h1></div>';
} else {
    console.log('✅ React loaded successfully');

    // Component registry for tracking loaded components
    window.FlashFungi = {
        components: {},
        utils: {},
        version: '3.0.0',
        loadedComponents: new Set(),
        
        // Register component when loaded
        registerComponent: function(name) {
            this.loadedComponents.add(name);
            console.log(`✅ Component registered: ${name}`);
            return true;
        },
        
        // Check if all critical components are loaded
        checkCriticalComponents: function() {
            const critical = [
                'AuthProvider',
                'AuthenticatedApp', 
                'HomePage',
                'QuickStudy',
                'TrainingModules',
                'ModulePlayer',
                'useUserProfile',
                'FuzzyMatching',
                'InteractiveSpeciesGuide'
            ];
            
            const missing = critical.filter(component => !window[component]);
            if (missing.length > 0) {
                console.log(`⏳ Missing critical components: ${missing.join(', ')}`);
                return false;
            }
            
            console.log('✅ All critical components loaded');
            return true;
        }
    };

    // Enhanced App Component with complete error handling
    function App() {
        const [appReady, setAppReady] = React.useState(false);
        const [componentStatus, setComponentStatus] = React.useState('Initializing...');
        const [retryCount, setRetryCount] = React.useState(0);
        
        console.log('🔍 App component rendering, appReady:', appReady);
        
        // Initialize app dependencies and components
        React.useEffect(() => {
            let checkCount = 0;
            const maxAttempts = 50; // 5 seconds max
            
            const checkReady = () => {
                checkCount++;
                setComponentStatus(`Checking components (${checkCount}/${maxAttempts})...`);
                
                console.log(`🔍 Checking app readiness (attempt ${checkCount})...`);
                console.log('Available components:', Object.keys(window).filter(k => k.match(/^[A-Z]/) && typeof window[k] === 'function'));
                
                // Check for Supabase
                if (!window.supabase) {
                    setComponentStatus('Loading Supabase...');
                    if (checkCount < maxAttempts) {
                        setTimeout(checkReady, 100);
                        return;
                    }
                }
                
                // Check for AuthProvider
                if (!window.AuthProvider || !window.useAuth) {
                    setComponentStatus('Loading authentication system...');
                    if (checkCount < maxAttempts) {
                        setTimeout(checkReady, 100);
                        return;
                    }
                }
                
                // Check for main app component
                if (!window.AuthenticatedApp) {
                    setComponentStatus('Loading main application...');
                    if (checkCount < maxAttempts) {
                        setTimeout(checkReady, 100);
                        return;
                    }
                }
                
                // Check for critical study components
                if (!window.HomePage || !window.QuickStudy) {
                    setComponentStatus('Loading study components...');
                    if (checkCount < maxAttempts) {
                        setTimeout(checkReady, 100);
                        return;
                    }
                }
                
                // Check for training components
                if (!window.TrainingModules || !window.ModulePlayer) {
                    setComponentStatus('Loading training modules...');
                    if (checkCount < maxAttempts) {
                        setTimeout(checkReady, 100);
                        return;
                    }
                }
                
                // Check for utility components
                if (!window.useUserProfile || !window.FuzzyMatching) {
                    setComponentStatus('Loading utilities...');
                    if (checkCount < maxAttempts) {
                        setTimeout(checkReady, 100);
                        return;
                    }
                }
                
                // All components ready
                if (window.supabase && window.AuthProvider && window.useAuth && 
                    window.AuthenticatedApp && window.HomePage && window.QuickStudy &&
                    window.TrainingModules && window.ModulePlayer && window.useUserProfile &&
                    window.FuzzyMatching) {
                    
                    console.log('🎉 All components ready!');
                    setComponentStatus('All components loaded successfully!');
                    setAppReady(true);
                    return;
                }
                
                // Timeout handling
                if (checkCount >= maxAttempts) {
                    console.error('❌ App initialization timeout after', maxAttempts * 100, 'ms');
                    setComponentStatus('Timeout - some components failed to load');
                    
                    // Show what we have vs what we need
                    const available = Object.keys(window).filter(k => k.match(/^[A-Z]/) && typeof window[k] === 'function');
                    const needed = ['AuthProvider', 'AuthenticatedApp', 'HomePage', 'QuickStudy', 'TrainingModules', 'ModulePlayer'];
                    const missing = needed.filter(comp => !available.includes(comp));
                    
                    console.log('Available components:', available);
                    console.log('Missing components:', missing);
                    
                    // Try to proceed with what we have if basic auth is working
                    if (window.AuthProvider && window.AuthenticatedApp) {
                        console.log('🔄 Proceeding with available components...');
                        setAppReady(true);
                    }
                    return;
                }
                
                // Continue checking
                setTimeout(checkReady, 100);
            };
            
            // Start checking after a small delay
            setTimeout(checkReady, 100);
        }, [retryCount]);
        
        // Retry mechanism
        const handleRetry = () => {
            setAppReady(false);
            setRetryCount(prev => prev + 1);
            setComponentStatus('Retrying initialization...');
        };
        
        // Show loading screen
        if (!appReady) {
            return window.LoadingScreen ? 
                React.createElement(window.LoadingScreen, { message: componentStatus }) :
                React.createElement('div', { 
                    style: { 
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb'
                    }
                },
                    React.createElement('div', { style: { textAlign: 'center', maxWidth: '400px', padding: '2rem' } },
                        React.createElement('div', { 
                            style: { 
                                fontSize: '4rem', 
                                marginBottom: '1rem',
                                animation: 'pulse 2s infinite'
                            } 
                        }, '🍄'),
                        React.createElement('h1', { 
                            style: { 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                marginBottom: '0.5rem',
                                color: '#1f2937'
                            } 
                        }, 'Flash Fungi'),
                        React.createElement('p', { 
                            style: { 
                                color: '#6b7280', 
                                marginBottom: '1rem',
                                fontSize: '0.875rem'
                            } 
                        }, componentStatus),
                        
                        // Show retry button after some attempts
                        retryCount > 0 && React.createElement('button', {
                            onClick: handleRetry,
                            style: {
                                padding: '0.5rem 1rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                marginTop: '1rem'
                            }
                        }, `Retry (${retryCount})`)
                    )
                );
        }
        
        console.log('🚀 App ready, rendering with AuthProvider...');
        
        // Render the complete app
        try {
            return React.createElement(window.AuthProvider, null,
                React.createElement(window.AuthenticatedApp)
            );
        } catch (error) {
            console.error('❌ Error rendering app:', error);
            return React.createElement('div', { 
                style: { 
                    padding: '2rem', 
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                } 
            },
                React.createElement('div', null,
                    React.createElement('h1', { style: { color: '#ef4444', marginBottom: '1rem' } }, 'Application Error'),
                    React.createElement('p', { style: { marginBottom: '1rem' } }, error.message),
                    React.createElement('button', {
                        onClick: () => window.location.reload(),
                        style: {
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                        }
                    }, 'Reload Application')
                )
            );
        }
    }

    // Initialize the app when DOM is ready
    function initializeApp() {
        console.log('🔄 Initializing Flash Fungi application...');
        
        const rootElement = document.getElementById('root');
        
        if (!rootElement) {
            console.error('❌ Root element not found');
            return;
        }

        if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
            console.error('❌ React libraries not available');
            rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React libraries not loaded</h1></div>';
            return;
        }

        try {
            // Use React 18 createRoot API if available
            if (ReactDOM.createRoot) {
                console.log('✅ Using React 18 createRoot API');
                const root = ReactDOM.createRoot(rootElement);
                root.render(React.createElement(App));
            } else {
                // Fallback for older React versions
                console.log('✅ Using legacy ReactDOM.render');
                ReactDOM.render(React.createElement(App), rootElement);
            }
            
            console.log('🎉 Flash Fungi application initialized successfully!');
            
            // Register global error handlers
            window.addEventListener('error', (event) => {
                console.error('🚨 Global error caught:', event.error);
            });

            window.addEventListener('unhandledrejection', (event) => {
                console.error('🚨 Unhandled promise rejection:', event.reason);
            });
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            rootElement.innerHTML = `
                <div style="padding: 20px; text-align: center; color: red;">
                    <h1>Error initializing Flash Fungi</h1>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" style="
                        padding: 0.5rem 1rem;
                        background-color: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">Reload</button>
                </div>
            `;
        }
    }

    // Start the application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

console.log('📋 Flash Fungi app.js orchestrator loaded successfully');