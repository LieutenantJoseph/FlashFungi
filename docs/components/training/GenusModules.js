// Genus-specific training modules - Content frameworks for admin population
(function() {
    'use strict';
    
    // Framework structure for genus modules - content to be populated via admin portal
    const genusModules = {
        'genus_agaricus': {
            id: 'genus_agaricus',
            title: 'Genus Agaricus Mastery',
            duration_minutes: 25,
            difficulty_level: 'intermediate',
            genus_name: 'Agaricus',
            family_name: 'Agaricaceae',
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Welcome to Agaricus',
                            content: '[ADMIN_CONTENT] Overview of Agaricus genus including commercial importance and field characteristics',
                            image_placeholder: 'agaricus_overview.jpg',
                            key_points: [
                                '[ADMIN_CONTENT] Key identifying feature 1',
                                '[ADMIN_CONTENT] Key identifying feature 2', 
                                '[ADMIN_CONTENT] Key identifying feature 3'
                            ]
                        },
                        {
                            title: 'Key Identifying Features',
                            content: '[ADMIN_CONTENT] Detailed morphological characteristics specific to Agaricus',
                            image_placeholder: 'agaricus_features.jpg',
                            key_points: [
                                '[ADMIN_CONTENT] Gill characteristics',
                                '[ADMIN_CONTENT] Spore print details',
                                '[ADMIN_CONTENT] Stem and ring features'
                            ]
                        },
                        {
                            title: 'Arizona Species',
                            content: '[ADMIN_CONTENT] Common Agaricus species found in Arizona ecosystems',
                            image_placeholder: 'agaricus_arizona.jpg',
                            species_list: [
                                '[ADMIN_CONTENT] Species 1 with habitat',
                                '[ADMIN_CONTENT] Species 2 with habitat',
                                '[ADMIN_CONTENT] Species 3 with habitat'
                            ]
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    title: 'Agaricus Morphology',
                    description: '[ADMIN_CONTENT] Interactive diagram description',
                    svg_data: '[ADMIN_SVG] Interactive SVG diagram data',
                    clickable_parts: [
                        {
                            id: 'cap',
                            label: 'Cap',
                            description: '[ADMIN_CONTENT] Cap characteristics for Agaricus'
                        },
                        {
                            id: 'gills',
                            label: 'Gills',
                            description: '[ADMIN_CONTENT] Gill attachment and color progression'
                        },
                        {
                            id: 'stem',
                            label: 'Stem',
                            description: '[ADMIN_CONTENT] Stem structure and ring details'
                        },
                        {
                            id: 'spores',
                            label: 'Spores',
                            description: '[ADMIN_CONTENT] Spore print color and microscopic features'
                        }
                    ],
                    placeholder: true
                },
                comparison: {
                    type: 'quiz',
                    title: 'Agaricus vs. Similar Genera',
                    questions: [
                        {
                            question: '[ADMIN_CONTENT] Distinguishing feature question 1',
                            options: [
                                '[ADMIN_CONTENT] Option A',
                                '[ADMIN_CONTENT] Option B',
                                '[ADMIN_CONTENT] Option C',
                                '[ADMIN_CONTENT] Option D'
                            ],
                            correct: 0, // Admin configurable
                            explanation: '[ADMIN_CONTENT] Detailed explanation'
                        },
                        {
                            question: '[ADMIN_CONTENT] Distinguishing feature question 2',
                            options: [
                                '[ADMIN_CONTENT] Option A',
                                '[ADMIN_CONTENT] Option B',
                                '[ADMIN_CONTENT] Option C',
                                '[ADMIN_CONTENT] Option D'
                            ],
                            correct: 1, // Admin configurable
                            explanation: '[ADMIN_CONTENT] Detailed explanation'
                        }
                    ]
                },
                field_practice: {
                    type: 'simulation',
                    title: 'Field Identification Practice',
                    instructions: '[ADMIN_CONTENT] Instructions for field simulation',
                    specimens: [], // Will be populated with actual specimens from database
                    specimen_filters: {
                        genus: 'Agaricus',
                        quality_score_min: 0.7
                    }
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: '[ADMIN_CONTENT] Assessment question 1',
                            options: [
                                '[ADMIN_CONTENT] Option A',
                                '[ADMIN_CONTENT] Option B',
                                '[ADMIN_CONTENT] Option C',
                                '[ADMIN_CONTENT] Option D'
                            ],
                            correct: 0 // Admin configurable
                        },
                        // Additional questions will be added via admin portal
                    ]
                }
            }
        },
        
        'genus_boletus': {
            id: 'genus_boletus',
            title: 'Genus Boletus Mastery',
            duration_minutes: 25,
            difficulty_level: 'intermediate',
            genus_name: 'Boletus',
            family_name: 'Boletaceae',
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Welcome to Boletus',
                            content: '[ADMIN_CONTENT] Overview of Boletus genus and pore-bearing mushrooms',
                            image_placeholder: 'boletus_overview.jpg',
                            key_points: [
                                '[ADMIN_CONTENT] Pore surface characteristics',
                                '[ADMIN_CONTENT] Stem morphology',
                                '[ADMIN_CONTENT] Color change reactions'
                            ]
                        },
                        {
                            title: 'Key Features',
                            content: '[ADMIN_CONTENT] Distinctive Boletus characteristics',
                            image_placeholder: 'boletus_features.jpg',
                            key_points: [
                                '[ADMIN_CONTENT] Pore vs gill distinction',
                                '[ADMIN_CONTENT] Bruising reactions',
                                '[ADMIN_CONTENT] Stem reticulation patterns'
                            ]
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    title: 'Boletus Morphology',
                    description: '[ADMIN_CONTENT] Interactive diagram for Boletus anatomy',
                    svg_data: '[ADMIN_SVG] Boletus-specific SVG diagram',
                    clickable_parts: [
                        {
                            id: 'cap',
                            label: 'Cap',
                            description: '[ADMIN_CONTENT] Cap texture and color variations'
                        },
                        {
                            id: 'pores',
                            label: 'Pores',
                            description: '[ADMIN_CONTENT] Pore size, color, and bruising'
                        },
                        {
                            id: 'stem',
                            label: 'Stem',
                            description: '[ADMIN_CONTENT] Stem thickness and reticulation'
                        }
                    ],
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: '[ADMIN_CONTENT] Boletus identification question 1',
                            options: [
                                '[ADMIN_CONTENT] Pores',
                                '[ADMIN_CONTENT] Gills',
                                '[ADMIN_CONTENT] Ridges',
                                '[ADMIN_CONTENT] Smooth surface'
                            ],
                            correct: 0 // Admin configurable
                        }
                    ]
                }
            }
        },
        
        'genus_amanita': {
            id: 'genus_amanita',
            title: 'Genus Amanita Awareness',
            duration_minutes: 30,
            difficulty_level: 'advanced',
            genus_name: 'Amanita',
            family_name: 'Amanitaceae',
            safety_critical: true,
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: '⚠️ Critical Safety Information',
                            content: '[ADMIN_CONTENT] Safety warnings and importance of proper Amanita identification',
                            image_placeholder: 'amanita_warning.jpg',
                            safety_warnings: [
                                '[ADMIN_CONTENT] Toxicity warning 1',
                                '[ADMIN_CONTENT] Toxicity warning 2',
                                '[ADMIN_CONTENT] Never eat without expert verification'
                            ]
                        },
                        {
                            title: 'Universal Veil System',
                            content: '[ADMIN_CONTENT] Amanita development from universal veil',
                            image_placeholder: 'amanita_development.jpg',
                            key_points: [
                                '[ADMIN_CONTENT] Volva formation',
                                '[ADMIN_CONTENT] Cap patches origin',
                                '[ADMIN_CONTENT] Ring development'
                            ]
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    title: 'Amanita Morphology',
                    description: '[ADMIN_CONTENT] Critical identification features',
                    svg_data: '[ADMIN_SVG] Amanita anatomy with safety emphasis',
                    clickable_parts: [
                        {
                            id: 'volva',
                            label: 'Volva',
                            description: '[ADMIN_CONTENT] Volva types and identification'
                        },
                        {
                            id: 'cap_patches',
                            label: 'Cap Patches',
                            description: '[ADMIN_CONTENT] Universal veil remnants'
                        },
                        {
                            id: 'ring',
                            label: 'Ring',
                            description: '[ADMIN_CONTENT] Partial veil characteristics'
                        }
                    ],
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 90, // Higher requirement for safety-critical content
                    questions: [
                        {
                            question: '[ADMIN_CONTENT] Critical safety identification question',
                            options: [
                                '[ADMIN_CONTENT] Ring',
                                '[ADMIN_CONTENT] Volva',
                                '[ADMIN_CONTENT] Bulb',
                                '[ADMIN_CONTENT] Roots'
                            ],
                            correct: 1 // Admin configurable
                        }
                    ]
                }
            }
        },
        
        'genus_pleurotus': {
            id: 'genus_pleurotus',
            title: 'Genus Pleurotus Mastery',
            duration_minutes: 20,
            difficulty_level: 'intermediate',
            genus_name: 'Pleurotus',
            family_name: 'Pleurotaceae',
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Oyster Mushrooms',
                            content: '[ADMIN_CONTENT] Pleurotus overview and cultivation importance',
                            image_placeholder: 'pleurotus_overview.jpg',
                            key_points: [
                                '[ADMIN_CONTENT] Lateral stem attachment',
                                '[ADMIN_CONTENT] Wood decomposer ecology',
                                '[ADMIN_CONTENT] Cultivated varieties'
                            ]
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    title: 'Pleurotus Morphology',
                    description: '[ADMIN_CONTENT] Oyster mushroom anatomy',
                    svg_data: '[ADMIN_SVG] Pleurotus-specific features',
                    clickable_parts: [
                        {
                            id: 'cap',
                            label: 'Cap',
                            description: '[ADMIN_CONTENT] Shell-shaped cap characteristics'
                        },
                        {
                            id: 'gills',
                            label: 'Gills',
                            description: '[ADMIN_CONTENT] Decurrent gill attachment'
                        },
                        {
                            id: 'stem',
                            label: 'Stem',
                            description: '[ADMIN_CONTENT] Lateral or absent stem'
                        }
                    ],
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: '[ADMIN_CONTENT] Pleurotus habitat question',
                            options: [
                                '[ADMIN_CONTENT] Soil',
                                '[ADMIN_CONTENT] Dead wood',
                                '[ADMIN_CONTENT] Living trees',
                                '[ADMIN_CONTENT] Grass'
                            ],
                            correct: 1 // Admin configurable
                        }
                    ]
                }
            }
        },
        
        'genus_cantharellus': {
            id: 'genus_cantharellus',
            title: 'Genus Cantharellus Guide',
            duration_minutes: 20,
            difficulty_level: 'intermediate',
            genus_name: 'Cantharellus',
            family_name: 'Cantharellaceae',
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Chanterelles',
                            content: '[ADMIN_CONTENT] Cantharellus overview and culinary importance',
                            image_placeholder: 'cantharellus_overview.jpg',
                            key_points: [
                                '[ADMIN_CONTENT] False gill structure',
                                '[ADMIN_CONTENT] Forked ridges',
                                '[ADMIN_CONTENT] Mycorrhizal relationships'
                            ]
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    title: 'Cantharellus Morphology',
                    description: '[ADMIN_CONTENT] Chanterelle anatomy and false gills',
                    svg_data: '[ADMIN_SVG] Cantharellus-specific diagram',
                    clickable_parts: [
                        {
                            id: 'cap',
                            label: 'Cap',
                            description: '[ADMIN_CONTENT] Funnel-shaped cap development'
                        },
                        {
                            id: 'false_gills',
                            label: 'False Gills',
                            description: '[ADMIN_CONTENT] Ridge vs true gill distinction'
                        },
                        {
                            id: 'stem',
                            label: 'Stem',
                            description: '[ADMIN_CONTENT] Solid stem characteristics'
                        }
                    ],
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: '[ADMIN_CONTENT] Cantharellus false gill question',
                            options: [
                                '[ADMIN_CONTENT] True gills',
                                '[ADMIN_CONTENT] False gills/ridges',
                                '[ADMIN_CONTENT] Pores',
                                '[ADMIN_CONTENT] Teeth'
                            ],
                            correct: 1 // Admin configurable
                        }
                    ]
                }
            }
        }
    };
    
    // Helper function to get module by ID
    window.getGenusModule = function(moduleId) {
        return genusModules[moduleId] || null;
    };
    
    // Helper function to get all genus modules
    window.getAllGenusModules = function() {
        return Object.values(genusModules);
    };
    
    // Helper function to process module content (replace placeholders with actual content)
    window.processModuleContent = function(module, adminContent = {}) {
        // Deep clone the module to avoid modifying the original
        const processedModule = JSON.parse(JSON.stringify(module));
        
        // Replace [ADMIN_CONTENT] placeholders with actual content
        const replaceContent = (obj) => {
            if (typeof obj === 'string') {
                return obj.replace(/\[ADMIN_CONTENT\]\s*/, adminContent[obj] || 'Content pending admin review');
            } else if (Array.isArray(obj)) {
                return obj.map(replaceContent);
            } else if (typeof obj === 'object' && obj !== null) {
                const result = {};
                for (const [key, value] of Object.entries(obj)) {
                    result[key] = replaceContent(value);
                }
                return result;
            }
            return obj;
        };
        
        return replaceContent(processedModule);
    };
    
    // Genus Module Player Component (basic framework)
    window.GenusModulePlayer = function GenusModulePlayer({ moduleId, onComplete, onBack }) {
        const [currentModule, setCurrentModule] = useState(null);
        const [currentSection, setCurrentSection] = useState('introduction');
        const [currentPage, setCurrentPage] = useState(0);
        const [isLoading, setIsLoading] = useState(true);
        
        useEffect(() => {
            const module = window.getGenusModule(moduleId);
            if (module) {
                // In a real implementation, this would fetch admin content
                const processedModule = window.processModuleContent(module, {});
                setCurrentModule(processedModule);
            }
            setIsLoading(false);
        }, [moduleId]);
        
        if (isLoading) {
            return React.createElement(window.LoadingScreen, {
                message: 'Loading genus module...'
            });
        }
        
        if (!currentModule) {
            return React.createElement('div', { className: 'p-6 text-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-red-600' }, 'Module Not Found'),
                React.createElement('p', { className: 'text-gray-600 mt-2' }, `Genus module "${moduleId}" could not be loaded.`),
                React.createElement('button', {
                    onClick: onBack,
                    className: 'mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                }, 'Back to Modules')
            );
        }
        
        return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
            React.createElement('div', { className: 'bg-white border-b border-gray-200 px-4 py-4' },
                React.createElement('div', { className: 'max-w-4xl mx-auto flex items-center justify-between' },
                    React.createElement('div', { className: 'flex items-center space-x-4' },
                        React.createElement('button', {
                            onClick: onBack,
                            className: 'text-gray-600 hover:text-gray-800'
                        }, '← Back'),
                        React.createElement('h1', { 
                            className: 'text-xl font-bold text-gray-800'
                        }, currentModule.title),
                        currentModule.safety_critical && React.createElement('span', {
                            className: 'bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded'
                        }, '⚠️ Safety Critical')
                    )
                )
            ),
            
            React.createElement('div', { className: 'max-w-4xl mx-auto p-6' },
                React.createElement('div', { 
                    className: 'bg-white rounded-xl shadow-lg p-8 text-center'
                },
                    React.createElement('h2', { 
                        className: 'text-2xl font-bold text-gray-800 mb-4'
                    }, `🚧 ${currentModule.genus_name} Module Framework`),
                    React.createElement('p', { 
                        className: 'text-gray-600 mb-6'
                    }, 'This module framework is ready for content population via the admin portal.'),
                    
                    React.createElement('div', { 
                        className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'
                    },
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-4' },
                            React.createElement('h3', { className: 'font-semibold mb-2' }, 'Module Structure'),
                            React.createElement('ul', { className: 'text-sm text-gray-600 space-y-1' },
                                React.createElement('li', null, '✓ Introduction lessons'),
                                React.createElement('li', null, '✓ Interactive morphology'),
                                React.createElement('li', null, '✓ Comparison quizzes'),
                                React.createElement('li', null, '✓ Field practice'),
                                React.createElement('li', null, '✓ Final assessment')
                            )
                        ),
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-4' },
                            React.createElement('h3', { className: 'font-semibold mb-2' }, 'Content Placeholders'),
                            React.createElement('ul', { className: 'text-sm text-gray-600 space-y-1' },
                                React.createElement('li', null, `${currentModule.content.introduction?.pages?.length || 0} lesson pages`),
                                React.createElement('li', null, `${currentModule.content.morphology?.clickable_parts?.length || 0} interactive elements`),
                                React.createElement('li', null, `${currentModule.content.assessment?.questions?.length || 0} assessment questions`),
                                React.createElement('li', null, `Est. ${currentModule.duration_minutes} min duration`)
                            )
                        )
                    ),
                    
                    React.createElement('div', { className: 'text-center' },
                        React.createElement('p', { 
                            className: 'text-sm text-gray-500 mb-4'
                        }, 'Access the admin portal to populate this module with educational content.'),
                        React.createElement('button', {
                            onClick: onComplete,
                            className: 'px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium'
                        }, '✓ Mark as Framework Complete')
                    )
                )
            )
        );
    };
    
    // Export to window for use in app
    window.genusModules = genusModules;
    
    console.log('✅ GenusModules component loaded successfully');
})();