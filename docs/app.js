// Flash Fungi v3.0 - Central Application Orchestrator
// Main entry point for Phase 3 implementation

(function() {
    'use strict';
    
    console.log('🍄 Flash Fungi v3.0 - Phase 3 Implementation Loading...');
    
    // Component registry and version tracking
    window.FlashFungi = {
        components: {},
        utils: {},
        version: '3.0.0',
        phase: 3,
        debugMode: false
    };
    
    // Component load tracker
    window.componentLoadTracker = window.componentLoadTracker || {
        loaded: [],
        failed: [],
        track: function(name, success = true) {
            if (success) {
                this.loaded.push(name);
                console.log(`✅ ${name} loaded`);
            } else {
                this.failed.push(name);
                console.error(`❌ ${name} failed to load`);
            }
        }
    };
    
    // Global error handling
    window.addEventListener('error', (event) => {
        console.error('🚨 Global error caught:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            error: event.error
        });
    });
    
    // Unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
        console.error('🚨 Unhandled promise rejection:', event.reason);
        event.preventDefault(); // Prevent console error
    });
    
    // App initialization
    function initializeApp() {
        console.log('🚀 Initializing Flash Fungi App...');
        
        const requiredComponents = [
            'supabase',
            'AuthProvider', 
            'useAuth',
            'AuthenticatedApp',
            'HomePage'
        ];
        
        const optionalComponents = [
            'FocusedStudy',
            'MarathonMode', 
            'AchievementSystem',
            'TrainingModules',
            'GenusModules'
        ];
        
        let checkCount = 0;
        const maxChecks = 50; // 5 seconds max wait
        
        const checkReady = () => {
            checkCount++;
            
            const availableRequired = requiredComponents.filter(comp => !!window[comp]);
            const availableOptional = optionalComponents.filter(comp => !!window[comp]);
            
            console.log(`🔍 Component check (${checkCount}/${maxChecks}):`, {
                required: `${availableRequired.length}/${requiredComponents.length}`,
                optional: `${availableOptional.length}/${optionalComponents.length}`,
                missing: requiredComponents.filter(comp => !window[comp])
            });
            
            // Need at least core auth and app components
            if (availableRequired.length >= 4 || checkCount >= maxChecks) {
                clearInterval(checkInterval);
                
                if (availableRequired.length >= 4) {
                    mountApp();
                } else {
                    showErrorState();
                }
            }
        };
        
        const checkInterval = setInterval(checkReady, 100);
        
        // Start first check immediately
        checkReady();
    }
    
    // Mount React app
    function mountApp() {
        try {
            console.log('🎯 Mounting Flash Fungi React App...');
            
            const rootElement = document.getElementById('root');
            if (!rootElement) {
                throw new Error('Root element not found');
            }
            
            // Verify React and ReactDOM are available
            if (!window.React || !window.ReactDOM) {
                throw new Error('React or ReactDOM not loaded');
            }
            
            // Mount the app
            const root = ReactDOM.createRoot(rootElement);
            root.render(
                React.createElement(window.AuthProvider, null,
                    React.createElement(window.AuthenticatedApp)
                )
            );
            
            console.log('✅ Flash Fungi app mounted successfully!');
            
            // Register global utilities
            window.FlashFungi.mounted = true;
            window.FlashFungi.mountTime = Date.now();
            
        } catch (error) {
            console.error('🚨 Failed to mount app:', error);
            showErrorState(error.message);
        }
    }
    
    // Show error state if app fails to load
    function showErrorState(errorMessage = 'Unable to load application components') {
        console.error('🚨 App failed to initialize:', errorMessage);
        
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 2rem;
                    text-align: center;
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                ">
                    <div style="
                        background: white;
                        padding: 2rem;
                        border-radius: 1rem;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                        max-width: 400px;
                    ">
                        <h1 style="
                            color: #dc2626;
                            font-size: 1.5rem;
                            margin-bottom: 1rem;
                            font-weight: bold;
                        ">🍄 Flash Fungi</h1>
                        <p style="
                            color: #6b7280;
                            margin-bottom: 1rem;
                            line-height: 1.5;
                        ">${errorMessage}</p>
                        <button onclick="window.location.reload()" style="
                            padding: 0.75rem 1.5rem;
                            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                            color: white;
                            border: none;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            font-weight: 500;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='translateY(-2px)'" 
                           onmouseout="this.style.transform='translateY(0)'">
                            🔄 Retry
                        </button>
                        <details style="margin-top: 1rem; text-align: left;">
                            <summary style="cursor: pointer; color: #6b7280; font-size: 0.875rem;">
                                Debug Info
                            </summary>
                            <pre style="
                                font-size: 0.75rem;
                                color: #4b5563;
                                margin-top: 0.5rem;
                                overflow: auto;
                                max-height: 200px;
                            ">Loaded: ${window.componentLoadTracker.loaded.join(', ')}
Failed: ${window.componentLoadTracker.failed.join(', ')}</pre>
                        </details>
                    </div>
                </div>
            `;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        // DOM already loaded
        initializeApp();
    }
    
    console.log('📋 Flash Fungi app.js orchestrator loaded successfully');
    
})();