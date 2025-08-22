// ModuleLoader.js - Utility for loading training modules from database
// Use this in both admin portal and main app

(function() {
    'use strict';
    
    // Module loader utility
    window.ModuleLoader = {
        // Cache for loaded modules
        cache: new Map(),
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        
        // Load all modules or by category
        async loadModules(options = {}) {
            const { category, published, forceRefresh = false } = options;
            
            // Build cache key - handle undefined published state
            const pubKey = published === undefined ? 'all' : published;
            const cacheKey = `modules_${category || 'all'}_${pubKey}`;
            
            // Check cache
            if (!forceRefresh && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            try {
                // Build query parameters
                const params = new URLSearchParams();
                if (category) params.append('category', category);
                // Only append published if it's explicitly true or false, not undefined
                if (published !== undefined) params.append('published', published.toString());
                
                const response = await fetch(`/api/training-modules?${params}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to load modules: ${response.status}`);
                }
                
                const modules = await response.json();
                
                // Update cache
                this.cache.set(cacheKey, {
                    data: modules,
                    timestamp: Date.now()
                });
                
                return modules;
            } catch (error) {
                console.error('Error loading modules:', error);
                
                // Return cached data if available, even if expired
                if (this.cache.has(cacheKey)) {
                    return this.cache.get(cacheKey).data;
                }
                
                // Return empty array as fallback
                return [];
            }
        },
        
        // Load a specific module by ID
        async loadModule(moduleId, forceRefresh = false) {
            const cacheKey = `module_${moduleId}`;
            
            // Check cache
            if (!forceRefresh && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            try {
                const response = await fetch(`/api/training-modules?id=${moduleId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to load module');
                }
                
                const modules = await response.json();
                const module = modules[0] || null;
                
                // Update cache
                if (module) {
                    this.cache.set(cacheKey, {
                        data: module,
                        timestamp: Date.now()
                    });
                }
                
                return module;
            } catch (error) {
                console.error('Error loading module:', error);
                
                // Return cached data if available
                if (this.cache.has(cacheKey)) {
                    return this.cache.get(cacheKey).data;
                }
                
                return null;
            }
        },
        
        // Clear cache
        clearCache() {
            this.cache.clear();
        }
    };
})();