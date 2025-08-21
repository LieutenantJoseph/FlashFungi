// app.js - Fixed Flash Fungi App Initialization
// Properly waits for Supabase client to be initialized

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
    
    // Simple initialization function
    function initializeFlashFungi() {
        console.log('🚀 Starting Flash Fungi initialization...');
        
        // Wait for Supabase client to be ready
        waitForSupabaseClient();
    }
    
    // Wait for Supabase client to be initialized (by config/supabase.js)
    function waitForSupabaseClient() {
        // Check if Supabase client is ready (has auth object)
        if (window.supabase && typeof window.supabase.auth === 'object') {
            console.log('✅ Supabase client is ready');
            waitForComponents();
            return;
        }
        
        console.log('⏳ Waiting for Supabase client...');
        setTimeout(waitForSupabaseClient, 100);
    }
    
    // Wait for all components to load
    function waitForComponents() {
        const checkComponents = () => {
            const requiredComponents = [
                // Auth system (critical for app to function)
                'AuthProvider', 'useAuth', 'AuthenticatedApp', 'useUserProfile',
                
                // Core UI components (critical)
                'HomePage', 'LoadingScreen',
                
                // Auth components
                'AuthModal',
                
                // Study components (core functionality)
                'SharedFlashcard', 'QuickStudy', 'FocusedStudy', 'MarathonMode', 'InteractiveSpeciesGuide',
                
                // Training components (core functionality)
                'TrainingModules', 'ModulePlayer',
                
                // Profile (core functionality)
                'ProfilePage'
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