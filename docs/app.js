// app.js - Clean Flash Fungi App Initialization
// Eliminates initialization conflicts and ensures proper event handler binding

(function() {
    'use strict';
    
    console.log('🍄 Flash Fungi v3.1 - Clean Initialization');
    
    // Configuration from constants.js (fallback if not loaded)
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.log('⚠️ Using fallback configuration - constants.js may not have loaded');
        window.SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
        window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
    } else {
        console.log('✅ Configuration loaded from constants.js');
    }
    
    // HomePage component will be loaded from /components/home/HomePage.js
    
    // Simple initialization function
    function initializeFlashFungi() {
        console.log('🚀 Starting Flash Fungi initialization...');
        
        // Initialize Supabase
        if (typeof window.supabase?.createClient !== 'function') {
            console.error('❌ Supabase not available');
            return;
        }
        
        // Create Supabase client
        window.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
        
        // Wait for all components to load
        const checkComponents = () => {
            const requiredComponents = [
                // Auth system (critical)
                'AuthProvider', 'useAuth', 'AuthenticatedApp', 'useUserProfile',
                
                // Main components (critical)
                'HomePage', 'LoadingScreen', 'Toast',
                
                // Study components (critical)
                'SharedFlashcard', 'QuickStudy', 'FocusedStudy', 'MarathonMode', 'InteractiveSpeciesGuide',
                
                // Training components (critical)
                'TrainingModules', 'ModulePlayer', 'GenusModules',
                
                // Profile and other components
                'ProfilePage', 'AchievementSystem', 'Phase3Badge',
                
                // UI components  
                'PlaceholderAssets'
            ];
            
            // Check utils (critical)
            const requiredUtils = [
                'FlashFungiAPI'  // From api.js
            ];
            
            const missingComponents = requiredComponents.filter(comp => !window[comp]);
            const missingUtils = requiredUtils.filter(util => !window[util]);
            const missing = [...missingComponents, ...missingUtils];
            
            if (missing.length === 0) {
                console.log('✅ All components and utils loaded, mounting app...');
                mountApp();
            } else {
                console.log('⏳ Waiting for components/utils:', missing);
                setTimeout(checkComponents, 100);
            }
        };
        
        // Start checking for components
        checkComponents();
    }
    
    // Mount the React app
    function mountApp() {
        const rootElement = document.getElementById('root');
        
        if (!rootElement) {
            console.error('❌ Root element not found');
            return;
        }
        
        try {
            console.log('🎯 Mounting React app...');
            
            // Clear loading state
            rootElement.innerHTML = '';
            
            // Create React root and render app
            if (ReactDOM.createRoot) {
                // React 18+
                const root = ReactDOM.createRoot(rootElement);
                root.render(
                    window.h(window.AuthProvider, null,
                        window.h(window.AuthenticatedApp)
                    )
                );
            } else {
                // Fallback for older React
                ReactDOM.render(
                    window.h(window.AuthProvider, null,
                        window.h(window.AuthenticatedApp)
                    ),
                    rootElement
                );
            }
            
            console.log('✅ Flash Fungi app mounted successfully!');
            
        } catch (error) {
            console.error('❌ Error mounting app:', error);
            rootElement.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: red;">
                    <h1>App Initialization Error</h1>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFlashFungi);
    } else {
        initializeFlashFungi();
    }
    
})();