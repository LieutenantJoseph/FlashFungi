// genus-modules.js - Genus-specific training modules
(function() {
    'use strict';
    
    const genusModules = {
        'genus_agaricus': {
            id: 'genus_agaricus',
            title: 'Genus Agaricus Mastery',
            duration_minutes: 25,
            difficulty_level: 'intermediate',
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Welcome to Agaricus',
                            content: 'The genus Agaricus includes some of the most commonly cultivated and consumed mushrooms worldwide, including the button mushroom.',
                            image: '🍄'
                        },
                        {
                            title: 'Key Identifying Features',
                            content: 'Agaricus species typically have:\n• Free gills that start pink and turn chocolate brown\n• A partial veil leaving a ring on the stem\n• Spore print that is chocolate brown to purple-brown',
                            image: '🔍'
                        },
                        {
                            title: 'Arizona Species',
                            content: 'Common Agaricus species in Arizona include:\n• A. campestris (Meadow Mushroom)\n• A. bernardii (Salt-loving Mushroom)\n• A. deserticola (Desert Agaricus)',
                            image: '🌵'
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    title: 'Agaricus Morphology',
                    description: 'Click on different parts to learn more',
                    // Placeholder for interactive diagram
                    placeholder: true
                },
                comparison: {
                    type: 'quiz',
                    questions: [
                        {
                            question: 'Which feature distinguishes Agaricus from Amanita?',
                            options: [
                                'Free gills vs. attached gills',
                                'Brown spores vs. white spores',
                                'Presence of a volva',
                                'Cap color'
                            ],
                            correct: 1,
                            explanation: 'Agaricus has brown spores while Amanita has white spores'
                        }
                    ]
                },
                field_practice: {
                    type: 'simulation',
                    specimens: [], // Will be populated with actual specimens
                    instructions: 'Identify these Agaricus specimens from the field'
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: 'What color are mature Agaricus gills?',
                            options: ['White', 'Pink', 'Brown', 'Yellow'],
                            correct: 2
                        },
                        {
                            question: 'What is the spore print color of Agaricus?',
                            options: ['White', 'Black', 'Brown to purple-brown', 'Green'],
                            correct: 2
                        }
                    ]
                }
            }
        },
        
        'genus_boletus': {
            id: 'genus_boletus',
            title: 'Genus Boletus Mastery',
            duration_minutes: 25,
            difficulty_level: 'intermediate',
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Welcome to Boletus',
                            content: 'Boletus is a genus of mushrooms characterized by their spongy pore surface instead of gills.',
                            image: '🟫'
                        },
                        {
                            title: 'Key Features',
                            content: 'Boletus species have:\n• Pores instead of gills\n• Thick, often bulbous stems\n• Some species stain blue when bruised',
                            image: '🔵'
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: 'What do Boletus have instead of gills?',
                            options: ['Teeth', 'Pores', 'Ridges', 'Smooth surface'],
                            correct: 1
                        }
                    ]
                }
            }
        },
        
        'genus_amanita': {
            id: 'genus_amanita',
            title: 'Genus Amanita Awareness',
            duration_minutes: 30,
            difficulty_level: 'intermediate',
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: '⚠️ Critical Safety Information',
                            content: 'The genus Amanita contains some of the deadliest mushrooms. Proper identification can save lives.',
                            image: '☠️'
                        },
                        {
                            title: 'Universal Veil',
                            content: 'Amanitas emerge from an egg-like universal veil, leaving a volva at the base and often patches on the cap.',
                            image: '🥚'
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 90, // Higher score required for safety-critical content
                    questions: [
                        {
                            question: 'What structure at the base indicates an Amanita?',
                            options: ['Ring', 'Volva', 'Bulb', 'Roots'],
                            correct: 1
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
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Oyster Mushrooms',
                            content: 'Pleurotus species are wood decomposers known as oyster mushrooms.',
                            image: '🦪'
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: 'What is the typical habitat of Pleurotus?',
                            options: ['Soil', 'Dead wood', 'Living trees', 'Grass'],
                            correct: 1
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
            content: {
                introduction: {
                    type: 'lesson',
                    pages: [
                        {
                            title: 'Chanterelles',
                            content: 'Cantharellus species are prized edibles with false gills.',
                            image: '🌟'
                        }
                    ]
                },
                morphology: {
                    type: 'interactive',
                    placeholder: true
                },
                assessment: {
                    type: 'test',
                    passing_score: 80,
                    questions: [
                        {
                            question: 'What type of "gills" do Cantharellus have?',
                            options: ['True gills', 'False gills/ridges', 'Pores', 'Teeth'],
                            correct: 1
                        }
                    ]
                }
            }
        }
    };
    
    // Export to window for use in app
    window.genusModules = genusModules;
})();