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
        },
        
        // Initialize default modules if needed (admin only)
        async initializeDefaults() {
            try {
                // Check if any modules exist
                const existing = await this.loadModules({ published: undefined });
                
                if (existing.length > 0) {
                    return { success: true, message: 'Modules already exist' };
                }
                
                // Create default foundation modules
                const defaultModules = [
                    {
                        id: 'foundation_basics',
                        title: 'Mushroom Identification Basics',
                        category: 'foundation',
                        difficulty_level: 'beginner',
                        duration_minutes: 15,
                        content: {
                            introduction: {
                                type: 'lesson',
                                pages: [
                                    {
                                        title: 'Welcome to Mushroom Identification',
                                        content: 'In this module, you will learn the fundamental skills needed to identify mushrooms safely and accurately. We\'ll cover the basic anatomy of mushrooms and introduce key identification features.',
                                        image: ''
                                    },
                                    {
                                        title: 'Key Parts of a Mushroom',
                                        content: 'Understanding mushroom anatomy is essential. The main parts include:\n• Cap (pileus) - The top umbrella-like structure\n• Gills or pores - Spore-bearing surface under the cap\n• Stem (stipe) - Supports the cap\n• Ring (annulus) - Remnant of partial veil on stem\n• Volva - Cup at base in some species',
                                        image: ''
                                    },
                                    {
                                        title: 'Important Features to Observe',
                                        content: 'When identifying mushrooms, always note:\n• Size and shape of cap\n• Color and texture\n• Gill attachment and spacing\n• Presence of ring or volva\n• Habitat and substrate\n• Spore print color',
                                        image: ''
                                    }
                                ]
                            },
                            quiz: {
                                type: 'quiz',
                                questions: [
                                    {
                                        question: 'What is the top part of a mushroom called?',
                                        options: ['Cap', 'Stem', 'Gill', 'Spore'],
                                        correct: 0,
                                        explanation: 'The cap (also called pileus) is the umbrella-like top structure of the mushroom.'
                                    },
                                    {
                                        question: 'Which part produces and releases spores?',
                                        options: ['Stem', 'Cap surface', 'Gills or pores', 'Ring'],
                                        correct: 2,
                                        explanation: 'Gills (or pores in some species) are the spore-bearing structures underneath the cap.'
                                    }
                                ]
                            }
                        },
                        published: true
                    },
                    {
                        id: 'foundation_safety',
                        title: 'Safety First: Deadly Species',
                        category: 'foundation',
                        difficulty_level: 'beginner',
                        duration_minutes: 20,
                        content: {
                            introduction: {
                                type: 'lesson',
                                pages: [
                                    {
                                        title: 'Never Eat Wild Mushrooms Without Expert Verification',
                                        content: 'This is the golden rule of mushroom foraging. Many edible species have toxic look-alikes that can cause serious illness or death. Even experienced foragers can make mistakes.',
                                        image: ''
                                    },
                                    {
                                        title: 'Deadly Species in Arizona',
                                        content: 'Several potentially deadly mushrooms occur in Arizona:\n• Amanita phalloides (Death Cap)\n• Amanita ocreata (Destroying Angel)\n• Galerina marginata (Deadly Galerina)\n• Some Lepiota species\n\nThese contain amatoxins that cause liver and kidney failure.',
                                        image: ''
                                    },
                                    {
                                        title: 'Warning Signs',
                                        content: 'Be especially cautious of:\n• White gills on mushrooms with a ring and/or volva\n• Small brown mushrooms growing on wood\n• Any mushroom you cannot identify with 100% certainty\n• Mushrooms that have been partially eaten by animals (they can eat things toxic to humans)',
                                        image: ''
                                    }
                                ]
                            },
                            quiz: {
                                type: 'quiz',
                                questions: [
                                    {
                                        question: 'What should you do before eating any wild mushroom?',
                                        options: [
                                            'Smell it first',
                                            'Get expert verification',
                                            'Cook it thoroughly',
                                            'Test a small amount'
                                        ],
                                        correct: 1,
                                        explanation: 'Always get expert verification before consuming any wild mushroom. No other test is reliable.'
                                    },
                                    {
                                        question: 'Which features together suggest a potentially deadly Amanita?',
                                        options: [
                                            'Brown cap and no ring',
                                            'Growing on wood',
                                            'White gills, ring, and volva',
                                            'Blue bruising'
                                        ],
                                        correct: 2,
                                        explanation: 'White gills, a ring on the stem, and a volva (cup) at the base are classic features of deadly Amanitas.'
                                    }
                                ]
                            }
                        },
                        published: true
                    },
                    {
                        id: 'foundation_spore_prints',
                        title: 'Spore Print Basics',
                        category: 'foundation',
                        difficulty_level: 'beginner',
                        duration_minutes: 15,
                        content: {
                            introduction: {
                                type: 'lesson',
                                pages: [
                                    {
                                        title: 'What is a Spore Print?',
                                        content: 'A spore print is a deposit of spores released from a mushroom cap. The color of the spore print is a crucial identification feature that helps distinguish between similar-looking species.',
                                        image: ''
                                    },
                                    {
                                        title: 'How to Make a Spore Print',
                                        content: 'Steps:\n1. Remove the stem from a fresh mushroom\n2. Place cap gill-side down on white and black paper\n3. Cover with a bowl or glass\n4. Leave for 2-24 hours\n5. Carefully lift the cap to reveal the print\n\nUse both white and black paper to see light-colored spores.',
                                        image: ''
                                    },
                                    {
                                        title: 'Common Spore Print Colors',
                                        content: 'Spore prints can be:\n• White to cream (many species)\n• Pink (Pluteus, Entoloma)\n• Brown (Agaricus, Psilocybe)\n• Purple-brown to black (Psathyrella, Coprinus)\n• Rusty brown (Gymnopilus, Cortinarius)\n• Green (Chlorophyllum molybdites)',
                                        image: ''
                                    }
                                ]
                            }
                        },
                        published: true
                    }
                ];
                
                // Create each module
                for (const module of defaultModules) {
                    const response = await fetch('/api/training-modules', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(module)
                    });
                    
                    if (!response.ok) {
                        console.error('Failed to create module:', module.id);
                    }
                }
                
                // Clear cache after initialization
                this.clearCache();
                
                return { success: true, message: 'Default modules created successfully' };
            } catch (error) {
                console.error('Error initializing default modules:', error);
                return { success: false, error: error.message };
            }
        }
    };
})();