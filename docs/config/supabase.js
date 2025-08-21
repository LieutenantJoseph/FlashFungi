// config/supabase.js - Supabase Client Initialization
// Creates and manages the Supabase client instance

(function() {
    'use strict';

    console.log('🔐 Loading Supabase configuration...');

    // Wait for the Supabase library to be available from CDN
    function initializeSupabaseClient() {
        // Check if library is loaded
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            console.log('⏳ Waiting for Supabase library from CDN...');
            setTimeout(initializeSupabaseClient, 50);
            return;
        }

        // Check if client already exists (avoid duplicates)
        if (window.supabaseClient || (window.supabase && typeof window.supabase.auth === 'object')) {
            console.log('✅ Supabase client already exists');
            return;
        }

        // Get configuration
        const SUPABASE_URL = window.SUPABASE_URL || 'https://oxgedcncrettasrbmwsl.supabase.co';
        const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';

        try {
            // Create the client
            console.log('🔧 Creating Supabase client...');
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Replace the library reference with the client instance
            window.supabase = client;
            window.supabaseClient = client; // Also store as supabaseClient for compatibility
            
            console.log('✅ Supabase client available');
            console.log('🔐 Initializing Supabase Auth...');
            
            // Test the connection
            testSupabaseConnection();
            
            console.log('✅ Supabase Auth system loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to create Supabase client:', error);
        }
    }

    // Test Supabase connection
    async function testSupabaseConnection() {
        try {
            const { data, error } = await window.supabase.auth.getSession();
            if (error) {
                console.warn('⚠️ Supabase session check error:', error.message);
            } else {
                console.log('✅ Supabase connection verified');
            }
        } catch (err) {
            console.warn('⚠️ Could not verify Supabase connection:', err);
        }
    }

    // Start initialization immediately
    initializeSupabaseClient();

})();