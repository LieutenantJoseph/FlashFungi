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
            const { category, published = true, forceRefresh = false } = options;
            
            // Build cache key
            const cacheKey = `modules_${category || 'all'}_${published}`;
            
            // Check cache
            if (!forceRefresh && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log('📦 Using cached modules');
                    return cached.data;
                }
            }
            
            try {
                // Build query parameters
                const params = new URLSearchParams();
                if (category) params.append('category', category);
                if (published !== undefined) params.append('published', published);
                
                console.log('🔄 Fetching fresh modules from database...');
                const response = await fetch(`/api/training-modules?${params}`);
                
                if (!response.ok) {
                    throw new Error('Failed to load modules');
                }
                
                const modules = await response.json();
                
                // Update cache
                this.cache.set(cacheKey, {
                    data: modules,
                    timestamp: Date.now()
                });
                
                console.log(`✅ Loaded ${modules.length} modules from database`);
                return modules;
            } catch (error) {
                console.error('Error loading modules:', error);
                throw error;
            }
        },
        
        // Load a specific module by ID
        async loadModule(id) {
            try {
                const response = await fetch(`/api/training-modules?id=${id}`);
                
                if (!response.ok) {
                    throw new Error('Failed to load module');
                }
                
                const modules = await response.json();
                return modules[0] || null;
            } catch (error) {
                console.error('Error loading module:', error);
                throw error;
            }
        },
        
        // Save a module (create or update)
        async saveModule(module) {
            try {
                const isUpdate = !!module.id;
                const endpoint = isUpdate 
                    ? `/api/training-modules?id=${module.id}`
                    : '/api/training-modules';
                
                const response = await fetch(endpoint, {
                    method: isUpdate ? 'PATCH' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(module)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to save module');
                }
                
                const result = await response.json();
                
                // Clear cache to force refresh
                this.cache.clear();
                
                return result.module || result;
            } catch (error) {
                console.error('Error saving module:', error);
                throw error;
            }
        },
        
        // Delete a module
        async deleteModule(id) {
            try {
                const response = await fetch(`/api/training-modules?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete module');
                }
                
                // Clear cache to force refresh
                this.cache.clear();
                
                return true;
            } catch (error) {
                console.error('Error deleting module:', error);
                throw error;
            }
        },
        
        // Clear cache manually
        clearCache() {
            this.cache.clear();
            console.log('📦 Module cache cleared');
        },
        
        // Get categories
        getCategories() {
            return [
                { value: 'foundation', label: 'Foundation', color: 'blue' },
                { value: 'genus', label: 'Genus-Specific', color: 'green' },
                { value: 'advanced', label: 'Advanced', color: 'purple' },
                { value: 'regional', label: 'Regional', color: 'orange' }
            ];
        },
        
        // Get difficulty levels
        getDifficultyLevels() {
            return [
                { value: 'beginner', label: 'Beginner', color: 'green' },
                { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
                { value: 'advanced', label: 'Advanced', color: 'red' }
            ];
        },
        
        // Format module for display
        formatModule(module) {
            return {
                ...module,
                categoryLabel: this.getCategories().find(c => c.value === module.category)?.label || module.category,
                difficultyLabel: this.getDifficultyLevels().find(d => d.value === module.difficulty_level)?.label || module.difficulty_level,
                sectionCount: Object.keys(module.content || {}).length,
                isComplete: module.content && Object.keys(module.content).length > 0
            };
        }
    };
    
    console.log('✅ ModuleLoader utility loaded successfully');
})();