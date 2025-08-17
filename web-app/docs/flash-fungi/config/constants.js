// Flash Fungi - Configuration Constants
// Centralized configuration for the application

// Supabase Configuration
window.FLASH_FUNGI_CONFIG = {
    SUPABASE: {
        URL: 'https://oxgedcncrettasrbmwsl.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg'
    },
    API: {
        BASE: '/api'
    },
    INATURALIST: {
        BASE_URL: 'https://api.inaturalist.org/v1'
    },
    APP: {
        VERSION: '3.0',
        NAME: 'Flash Fungi'
    },
    TRAINING: {
        FOUNDATION_MODULES_COUNT: 5
    }
};

// Export configuration globally
window.SUPABASE_URL = window.FLASH_FUNGI_CONFIG.SUPABASE.URL;
window.SUPABASE_ANON_KEY = window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY;

// Debug: Verify Supabase configuration
console.log('🔧 Flash Fungi Configuration loaded:', {
    url: window.FLASH_FUNGI_CONFIG.SUPABASE.URL,
    hasKey: !!window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY,
    keyLength: window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY.length,
    version: window.FLASH_FUNGI_CONFIG.APP.VERSION
});

// Test Supabase connection
fetch(`${window.FLASH_FUNGI_CONFIG.SUPABASE.URL}/rest/v1/`, {
    headers: {
        'apikey': window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY,
        'Authorization': `Bearer ${window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY}`
    }
}).then(response => {
    console.log('🔍 Supabase connection test:', response.ok ? 'SUCCESS' : 'FAILED', response.status);
}).catch(error => {
    console.error('🔍 Supabase connection error:', error);
});