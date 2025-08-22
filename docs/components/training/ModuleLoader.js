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
        },
        
        // Initialize default modules in database
        async initializeDefaults() {
            console.log('🔧 Initializing default training modules...');
            
            const defaultModules = [
                {
                    id: 'foundation_basics',
                    title: 'Mushroom Identification Basics',
                    category: 'foundation',
                    difficulty_level: 'beginner',
                    duration_minutes: 15,
                    published: true,
                    content: {
                        introduction: {
                            type: 'text',
                            content: 'Welcome to the fundamentals of mushroom identification. This module covers essential concepts for safely identifying fungi in the field.'
                        },
                        anatomy: {
                            type: 'interactive',
                            content: 'Learn about caps, stems, gills, and spores through interactive diagrams. Understanding mushroom anatomy is crucial for accurate identification.'
                        },
                        safety: {
                            type: 'text',
                            content: 'Critical safety information for field identification. Never eat any mushroom unless you are 100% certain of its identification.'
                        },
                        tools: {
                            type: 'list',
                            content: 'Essential tools for mushroom identification: field guide, knife, paper bags, camera, and notebook for observations.'
                        }
                    },
                    prerequisites: [],
                    unlocks: ['genus_agaricus', 'foundation_spore_printing'],
                    knowledge_checks: [
                        {
                            question: 'What is the reproductive structure of a mushroom called?',
                            options: ['Mycelium', 'Fruiting body', 'Rhizomorph', 'Hypha'],
                            correct: 1
                        },
                        {
                            question: 'Which part of the mushroom produces spores?',
                            options: ['Cap', 'Stem', 'Gills/Pores', 'Volva'],
                            correct: 2
                        }
                    ]
                },
                {
                    id: 'foundation_safety',
                    title: 'Safety First: Deadly Species',
                    category: 'foundation',
                    difficulty_level: 'beginner',
                    duration_minutes: 20,
                    published: true,
                    content: {
                        introduction: {
                            type: 'text',
                            content: 'Learn to identify and avoid deadly mushroom species found in Arizona. This knowledge could save your life.'
                        },
                        deadly_species: {
                            type: 'gallery',
                            content: 'Visual guide to Amanita phalloides (Death Cap), Amanita ocreata (Destroying Angel), and other dangerous species.'
                        },
                        lookalikes: {
                            type: 'comparison',
                            content: 'Compare deadly species with their edible lookalikes. Learn the critical differences that separate food from poison.'
                        },
                        symptoms: {
                            type: 'text',
                            content: 'Recognize symptoms of mushroom poisoning and understand when to seek immediate medical attention.'
                        }
                    },
                    prerequisites: [],
                    unlocks: ['genus_amanita', 'edible_species'],
                    knowledge_checks: [
                        {
                            question: 'Which feature is most associated with deadly Amanita species?',
                            options: ['Blue bruising', 'White spore print and volva', 'Milky latex', 'Orange color'],
                            correct: 1
                        },
                        {
                            question: 'What should you do if you suspect mushroom poisoning?',
                            options: ['Wait and see', 'Drink milk', 'Seek immediate medical attention', 'Induce vomiting'],
                            correct: 2
                        }
                    ]
                },
                {
                    id: 'foundation_spore_printing',
                    title: 'Spore Printing Techniques',
                    category: 'foundation',
                    difficulty_level: 'intermediate',
                    duration_minutes: 25,
                    published: true,
                    content: {
                        materials: {
                            type: 'list',
                            content: 'Materials needed for spore printing: white and black paper, glass or bowl, water, and 2-24 hours of patience.'
                        },
                        technique: {
                            type: 'video',
                            content: 'Step-by-step demonstration of spore printing methods for accurate mushroom identification.'
                        },
                        interpretation: {
                            type: 'interactive',
                            content: 'Learn to interpret spore color and patterns. Match spore prints to common genera.'
                        },
                        troubleshooting: {
                            type: 'text',
                            content: 'Common problems and solutions when making spore prints in different humidity conditions.'
                        }
                    },
                    prerequisites: ['foundation_basics'],
                    unlocks: ['advanced_microscopy', 'genus_coprinus'],
                    knowledge_checks: [
                        {
                            question: 'How long should you typically wait for a spore print?',
                            options: ['30 minutes', '2-4 hours', '24 hours', '1 week'],
                            correct: 1
                        },
                        {
                            question: 'Why use both white and black paper for spore prints?',
                            options: ['For decoration', 'To see light and dark spores', 'Black paper works faster', 'White paper is more accurate'],
                            correct: 1
                        }
                    ]
                },
                {
                    id: 'genus_agaricus',
                    title: 'Genus Agaricus Deep Dive',
                    category: 'genus',
                    difficulty_level: 'intermediate',
                    duration_minutes: 30,
                    published: true,
                    content: {
                        overview: {
                            type: 'text',
                            content: 'Comprehensive study of the Agaricus genus, including both edible champions and toxic species to avoid.'
                        },
                        identification: {
                            type: 'interactive',
                            content: 'Key features: free gills that start pink and turn chocolate brown, ring on stem, no volva at base.'
                        },
                        species_gallery: {
                            type: 'gallery',
                            content: 'Common Agaricus species: A. campestris (Meadow Mushroom), A. bisporus (Button Mushroom), A. xanthodermus (Yellow Stainer - toxic!).'
                        },
                        habitat: {
                            type: 'text',
                            content: 'Find Agaricus in grassy areas, gardens, and along paths. Peak season in Arizona: monsoon season and fall.'
                        },
                        cooking: {
                            type: 'text',
                            content: 'Safe preparation methods for edible Agaricus species. Always cook thoroughly and start with small amounts.'
                        }
                    },
                    prerequisites: ['foundation_basics'],
                    unlocks: ['genus_coprinus', 'edible_species'],
                    knowledge_checks: [
                        {
                            question: 'What spore color is characteristic of Agaricus?',
                            options: ['White', 'Black', 'Chocolate brown', 'Rusty brown'],
                            correct: 2
                        },
                        {
                            question: 'Which Agaricus species should be avoided due to toxicity?',
                            options: ['A. campestris', 'A. bisporus', 'A. xanthodermus', 'A. augustus'],
                            correct: 2
                        }
                    ]
                },
                {
                    id: 'regional_arizona_desert',
                    title: 'Arizona Desert Fungi',
                    category: 'regional',
                    difficulty_level: 'advanced',
                    duration_minutes: 35,
                    published: true,
                    content: {
                        introduction: {
                            type: 'text',
                            content: 'Discover unique fungal species adapted to the Sonoran Desert ecosystem. These hardy fungi have evolved fascinating survival strategies.'
                        },
                        desert_species: {
                            type: 'gallery',
                            content: 'Podaxis pistillaris (Desert Shaggy Mane), Battarrea phalloides (Desert Stalked Puffball), Tulostoma (Stalked Puffballs).'
                        },
                        seasonal_patterns: {
                            type: 'chart',
                            content: 'Monsoon season (July-September) brings the main fruiting period. Winter rains may produce a second, smaller flush.'
                        },
                        habitat_zones: {
                            type: 'interactive',
                            content: 'Explore fungal diversity from desert floor to sky islands. Elevation changes create distinct fungal communities.'
                        },
                        conservation: {
                            type: 'text',
                            content: 'Conservation considerations for rare desert fungi. Practice sustainable foraging and photography-first approach.'
                        }
                    },
                    prerequisites: ['foundation_basics', 'foundation_safety'],
                    unlocks: ['advanced_ecology'],
                    knowledge_checks: [
                        {
                            question: 'When do most Arizona desert fungi fruit?',
                            options: ['Spring', 'Monsoon season', 'Winter', 'Year-round'],
                            correct: 1
                        },
                        {
                            question: 'Which fungus is known as the Desert Shaggy Mane?',
                            options: ['Battarrea phalloides', 'Podaxis pistillaris', 'Tulostoma brumale', 'Agaricus deserticola'],
                            correct: 1
                        }
                    ]
                }
            ];
            
            try {
                let successCount = 0;
                let errorCount = 0;
                
                for (const module of defaultModules) {
                    try {
                        const saved = await this.saveModule(module);
                        if (saved) {
                            successCount++;
                            console.log(`✅ Created default module: ${module.title}`);
                        }
                    } catch (err) {
                        errorCount++;
                        console.error(`❌ Failed to create module ${module.title}:`, err);
                    }
                }
                
                // Clear cache to ensure fresh data
                this.cache.clear();
                
                console.log(`📊 Default modules initialization complete: ${successCount} created, ${errorCount} failed`);
                
                return {
                    success: successCount > 0,
                    created: successCount,
                    failed: errorCount
                };
                
            } catch (error) {
                console.error('❌ Failed to initialize default modules:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    };
    
    console.log('✅ ModuleLoader utility loaded successfully');
})();