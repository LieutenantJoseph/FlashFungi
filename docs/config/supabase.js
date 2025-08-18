// Supabase Client Initialization
// Initializes the Supabase client with configuration from constants.js

(function() {
    'use strict';
    
    // Wait for constants and Supabase library to be available
    const initSupabase = () => {
        if (typeof window.supabase !== 'undefined') {
            console.log('✅ Supabase client already initialized');
            return;
        }
        
        if (typeof window.createClient === 'undefined' && typeof supabase === 'undefined') {
            console.error('❌ Supabase library not loaded');
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
            
            // Use the global createClient function from the Supabase CDN
            const createClient = window.supabase?.createClient || window.createClient;
            
            if (!createClient) {
                throw new Error('Supabase createClient function not available');
            }
            
            window.supabase = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
            
            console.log('✅ Supabase client initialized successfully');
            
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
        const tryInit = () => {
            if (window.FLASH_FUNGI_CONFIG && (window.supabase?.createClient || window.createClient)) {
                initSupabase();
            } else {
                // Wait a bit more for dependencies
                setTimeout(tryInit, 100);
            }
        };
        tryInit();
    }
    
})();