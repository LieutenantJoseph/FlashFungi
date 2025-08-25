// ModuleLoader.js - Enhanced with fallback for when API is unavailable
(function() {
    'use strict';
    
    // Demo modules for when API is unavailable
    const DEMO_MODULES = [
        {
            id: 'foundation_spore_prints',
            title: 'Spore Print Techniques',
            category: 'foundation',
            difficulty_level: 'beginner',
            duration_minutes: 15,
            icon: '🎨',
            description: 'Learn how to create and interpret spore prints for mushroom identification.',
            content: {
                slides: [
                    {
                        type: 'intro',
                        title: 'Spore Print Techniques',
                        content: 'Spore prints are one of the most reliable ways to identify mushrooms. In this module, you\'ll learn how to create and interpret them.',
                        image: '🎨',
                        subtitle: 'Foundation Module'
                    },
                    {
                        type: 'content',
                        title: 'What is a Spore Print?',
                        content: 'A spore print is a deposit of spores on a surface, showing the color of a mushroom\'s spores.\n\n• **Essential for ID** - Many mushrooms look similar but have different spore colors\n• **Easy to make** - Requires only paper and time\n• **Permanent record** - Can be preserved for future reference',
                        image: '🔬'
                    },
                    {
                        type: 'content',
                        title: 'Making a Spore Print',
                        content: 'Steps to create a spore print:\n\n1. **Remove the stem** - Cut the stem close to the cap\n2. **Place on paper** - Use both white and black paper\n3. **Cover with glass** - Prevents air currents\n4. **Wait 4-24 hours** - Spores will drop onto paper\n5. **Remove cap carefully** - Reveal the print',
                        image: '📋',
                        note: 'Fresh specimens work best - older mushrooms may not produce prints'
                    },
                    {
                        type: 'quiz',
                        title: 'Quick Check',
                        question: 'Why use both white and black paper for spore prints?',
                        options: [
                            'To see light-colored spores on black and dark spores on white',
                            'It looks more professional',
                            'Black paper dries faster',
                            'White paper is cheaper'
                        ],
                        correct: 0,
                        explanation: 'Correct! Using both papers ensures you can see spores of any color - white spores are invisible on white paper!'
                    },
                    {
                        type: 'complete',
                        title: 'Module Complete!',
                        content: 'Great job! You now know how to create and use spore prints for mushroom identification.',
                        achievement: 'Spore Print Expert'
                    }
                ]
            },
            published: true
        },
        {
            id: 'foundation_safety',
            title: 'Safety First',
            category: 'foundation',
            difficulty_level: 'beginner',
            duration_minutes: 20,
            icon: '⚠️',
            description: 'Essential safety guidelines for mushroom foraging and identification.',
            content: {
                slides: [
                    {
                        type: 'intro',
                        title: 'Safety First',
                        content: 'Before you begin identifying mushrooms, it\'s crucial to understand safety principles that could save your life.',
                        image: '⚠️',
                        subtitle: 'Critical Foundation Module'
                    },
                    {
                        type: 'content',
                        title: 'The Golden Rule',
                        content: '**Never eat a mushroom unless you are 100% certain of its identification!**\n\nEven experts:\n• Use multiple identification methods\n• Consult field guides and keys\n• Verify with experienced foragers\n• Start with small amounts of new species',
                        image: '🛑',
                        note: 'There is no universal test for mushroom edibility'
                    },
                    {
                        type: 'complete',
                        title: 'Module Complete!',
                        content: 'You\'ve learned essential safety principles. Always prioritize caution in mushroom identification.',
                        achievement: 'Safety Conscious'
                    }
                ]
            },
            published: true
        },
        {
            id: 'foundation_habitat',
            title: 'Understanding Habitat',
            category: 'foundation',
            difficulty_level: 'intermediate',
            duration_minutes: 25,
            icon: '🌲',
            description: 'Learn how habitat and ecology help with mushroom identification.',
            content: {
                slides: [
                    {
                        type: 'intro',
                        title: 'Understanding Habitat',
                        content: 'Where a mushroom grows is often as important as what it looks like for proper identification.',
                        image: '🌲',
                        subtitle: 'Ecological Approach'
                    },
                    {
                        type: 'complete',
                        title: 'Module Complete!',
                        content: 'You now understand how habitat helps with identification.',
                        achievement: 'Habitat Expert'
                    }
                ]
            },
            published: true
        }
    ];
    
    // Module loader utility
    window.ModuleLoader = {
        // Cache for loaded modules
        cache: new Map(),
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        apiAvailable: true, // Track if API is available
        
        // Load all modules or by category
        async loadModules(options = {}) {
            const { category, published, forceRefresh = false } = options;
            
            // Build cache key
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
                if (published !== undefined) params.append('published', published.toString());
                
                const response = await fetch(`/api/training-modules?${params}`);
                
                if (response.status === 404) {
                    // API not found, use demo modules
                    console.log('⚠️ API not available, using demo modules');
                    this.apiAvailable = false;
                    
                    let modules = DEMO_MODULES;
                    if (category) {
                        modules = modules.filter(m => m.category === category);
                    }
                    if (published !== undefined) {
                        modules = modules.filter(m => m.published === published);
                    }
                    
                    // Cache demo modules
                    this.cache.set(cacheKey, {
                        data: modules,
                        timestamp: Date.now()
                    });
                    
                    return modules;
                }
                
                if (!response.ok) {
                    throw new Error(`Failed to load modules: ${response.status}`);
                }
                
                const modules = await response.json();
                this.apiAvailable = true;
                
                // Update cache
                this.cache.set(cacheKey, {
                    data: modules,
                    timestamp: Date.now()
                });
                
                return modules;
            } catch (error) {
                console.error('Error loading modules:', error);
                
                // If fetch failed (network error), use demo modules
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    console.log('⚠️ Network error, using demo modules');
                    this.apiAvailable = false;
                    
                    let modules = DEMO_MODULES;
                    if (category) {
                        modules = modules.filter(m => m.category === category);
                    }
                    if (published !== undefined) {
                        modules = modules.filter(m => m.published === published);
                    }
                    
                    return modules;
                }
                
                // Return cached data if available, even if expired
                if (this.cache.has(cacheKey)) {
                    return this.cache.get(cacheKey).data;
                }
                
                // Last resort: return demo modules
                return DEMO_MODULES;
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
            
            // If API is known to be unavailable, use demo modules
            if (!this.apiAvailable) {
                const demoModule = DEMO_MODULES.find(m => m.id === moduleId);
                if (demoModule) {
                    this.cache.set(cacheKey, {
                        data: demoModule,
                        timestamp: Date.now()
                    });
                }
                return demoModule || null;
            }
            
            try {
                const response = await fetch(`/api/training-modules?id=${moduleId}`);
                
                if (response.status === 404) {
                    // Try demo modules
                    this.apiAvailable = false;
                    const demoModule = DEMO_MODULES.find(m => m.id === moduleId);
                    if (demoModule) {
                        this.cache.set(cacheKey, {
                            data: demoModule,
                            timestamp: Date.now()
                        });
                    }
                    return demoModule || null;
                }
                
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
                
                // Try demo modules on any error
                const demoModule = DEMO_MODULES.find(m => m.id === moduleId);
                if (demoModule) {
                    return demoModule;
                }
                
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
            this.apiAvailable = true; // Reset API availability check
        },
        
        // Get demo modules (for testing)
        getDemoModules() {
            return DEMO_MODULES;
        },
        
        // Check if using demo mode
        isUsingDemoMode() {
            return !this.apiAvailable;
        }
    };
    
    console.log('✅ ModuleLoader with fallback loaded');
    
})();