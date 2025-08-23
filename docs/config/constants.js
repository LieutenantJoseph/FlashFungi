// Flash Fungi - Configuration Constants with New Design System
// Centralized configuration for the application

// Design System Configuration
window.FLASH_FUNGI_DESIGN = {
    // Color Palette
    colors: {
        primary: '#8B4513',      // Saddle Brown
        secondary: '#D2691E',    // Chocolate
        accent: '#FF6B35',       // Vibrant Orange
        success: '#228B22',      // Forest Green
        earth: '#A0522D',        // Sienna
        bark: '#654321',         // Dark Brown
        moss: '#8FBC8F',         // Dark Sea Green
        spore: '#F4E4C1',        // Cream
        shadow: '#3E2723',       // Deep Brown
        
        // Backgrounds
        bgPrimary: '#1A1A19',    // Almost Black
        bgSecondary: '#2D2D2A',  // Dark Gray-Brown
        bgTertiary: '#3A3A37',   // Medium Gray-Brown
        bgCard: '#2A2826',       // Card Background
        
        // Text
        textPrimary: '#F5F5DC',  // Beige
        textSecondary: '#D3D3C7', // Light gray-beige
        textMuted: '#A8A89C'      // Muted text
    },
    
    // Gradients
    gradients: {
        earth: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
        forest: 'linear-gradient(135deg, #228B22 0%, #8FBC8F 100%)',
        spore: 'linear-gradient(135deg, #F4E4C1 0%, #FFE4B5 100%)',
        dark: 'linear-gradient(180deg, #2D2D2A 0%, #1A1A19 100%)',
        accent: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)'
    },
    
    // Shadows
    shadows: {
        sm: '0 2px 8px rgba(0,0,0,0.3)',
        md: '0 4px 16px rgba(0,0,0,0.4)',
        lg: '0 8px 32px rgba(0,0,0,0.5)',
        glow: '0 0 20px rgba(210,105,30,0.3)',
        accent: '0 4px 12px rgba(255,107,53,0.3)'
    },
    
    // Border Radius
    radius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        organic: '0.75rem 1.5rem 0.75rem 1.5rem'
    },
    
    // Transitions
    transitions: {
        fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    // Spacing
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
    }
};

// Supabase Configuration
window.FLASH_FUNGI_CONFIG = {
    ...window.FLASH_FUNGI_CONFIG,
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
        VERSION: '3.1', // Updated for new design
        NAME: 'Flash Fungi',
        THEME: 'living-mycology'
    },
    TRAINING: {
        FOUNDATION_MODULES_COUNT: 5
    },
    DESIGN: window.FLASH_FUNGI_DESIGN
};

// Export configuration globally
window.SUPABASE_URL = window.FLASH_FUNGI_CONFIG.SUPABASE.URL;
window.SUPABASE_ANON_KEY = window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY;

// Helper function to get design tokens
window.getDesignToken = function(path) {
    const keys = path.split('.');
    let value = window.FLASH_FUNGI_DESIGN;
    for (const key of keys) {
        value = value[key];
        if (!value) return null;
    }
    return value;
};

// Debug: Verify configuration
console.log('🎨 Flash Fungi Design System loaded:', {
    version: window.FLASH_FUNGI_CONFIG.APP.VERSION,
    theme: window.FLASH_FUNGI_CONFIG.APP.THEME,
    colorsLoaded: !!window.FLASH_FUNGI_DESIGN.colors,
    url: window.FLASH_FUNGI_CONFIG.SUPABASE.URL,
    hasKey: !!window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY
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