// Supabase Client Initialization
// Initializes the Supabase client with configuration from constants.js

(function() {
    'use strict';
    
    console.log('🔧 Starting Supabase initialization...');
    
    // Wait for constants and Supabase library to be available
    const initSupabase = () => {
        if (typeof window.supabase !== 'undefined' && window.supabase.auth) {
            console.log('✅ Supabase client already initialized');
            return;
        }
        
        // Check if Supabase library is loaded
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase library not loaded from CDN');
            return;
        }
        
        if (!window.FLASH_FUNGI_CONFIG) {
            console.error('❌ Flash Fungi configuration not loaded');
            return;
        }
        
        try {
            // Initialize Supabase client
            const supabaseUrl = window.FLASH_FUNGI_CONFIG.SUPABASE.URL;
            const supabaseKey = window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY;
            
            console.log('🔧 Creating Supabase client with URL:', supabaseUrl);
            
            // Use the global supabase object from the CDN
            window.supabase = supabase.createClient(supabaseUrl, supabaseKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
            
            console.log('✅ Supabase client initialized successfully');
            console.log('🔧 Supabase client object:', typeof window.supabase);
            console.log('🔧 Supabase auth available:', typeof window.supabase.auth);
            
            // Test the connection
            window.supabase.from('specimens')
                .select('count', { count: 'exact', head: true })
                .then(({ count, error }) => {
                    if (error) {
                        console.warn('⚠️ Supabase connection test failed:', error.message);
                    } else {
                        console.log(`✅ Supabase connection verified - ${count || 0} specimens available`);
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Supabase connection test error:', error);
                });
                
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
        }
    };
    
    // Try to initialize immediately, or wait for dependencies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabase);
    } else {
        // DOM is ready, try to initialize
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        const tryInit = () => {
            attempts++;
            
            if (window.FLASH_FUNGI_CONFIG && typeof supabase !== 'undefined') {
                initSupabase();
            } else if (attempts < maxAttempts) {
                // Wait a bit more for dependencies
                console.log(`⏳ Waiting for dependencies... (${attempts}/${maxAttempts})`);
                setTimeout(tryInit, 100);
            } else {
                console.error('❌ Timeout waiting for Supabase dependencies');
            }
        };
        
        tryInit();
    }
    
})();