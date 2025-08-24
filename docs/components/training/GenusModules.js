// GenusModules.js - Updated with Living Mycology Dark Theme
(function() {
    'use strict';
    
    // Design constants matching the established dark theme
    const COLORS = {
        // Dark theme backgrounds
        BG_PRIMARY: '#1A1A19',
        BG_CARD: '#2A2826',
        BG_HOVER: '#323230',
        
        // Text colors
        TEXT_PRIMARY: '#E8E2D5',
        TEXT_SECONDARY: '#B8B2A5',
        TEXT_MUTED: '#888478',
        
        // Accent colors
        ACCENT_PRIMARY: '#8B7355',
        ACCENT_SUCCESS: '#7C8650',
        ACCENT_WARNING: '#D4A574',
        ACCENT_ERROR: '#B85C5C',
        ACCENT_INFO: '#6B8CAE',
        ACCENT_PURPLE: '#9B7AA8',
        
        // Borders
        BORDER_DEFAULT: 'rgba(139, 115, 85, 0.2)',
        BORDER_HOVER: 'rgba(139, 115, 85, 0.4)',
        BORDER_ACTIVE: 'rgba(139, 115, 85, 0.6)'
    };
    
    // Gradient definitions
    const GRADIENTS = {
        EARTH: 'linear-gradient(135deg, #8B7355 0%, #6B5745 100%)',
        FOREST: 'linear-gradient(135deg, #7C8650 0%, #5C6640 100%)',
        SUNSET: 'linear-gradient(135deg, #D4A574 0%, #B48554 100%)',
        MUSHROOM: 'linear-gradient(135deg, #8B7355 0%, #A0826D 50%, #6B5745 100%)',
        PURPLE: 'linear-gradient(135deg, #9B7AA8 0%, #7B5A88 100%)',
        DANGER: 'linear-gradient(135deg, #B85C5C 0%, #985454 100%)'
    };
    
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
                        }
                    ]
                }
            }
        },
        'genus_amanita': {
            id: 'genus_amanita',
            title: 'Genus Amanita Mastery',
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
                            title: 'Amanita: Critical Safety Information',
                            content: '[ADMIN_CONTENT] Safety-first approach to Amanita identification',
                            warning: true,
                            key_points: [
                                '[ADMIN_CONTENT] Universal veil',
                                '[ADMIN_CONTENT] Volva at base',
                                '[ADMIN_CONTENT] Ring development'
                            ]
                        }
                    ]
                }
            }
        }
    };
    
    // Helper functions
    window.getGenusModule = function(moduleId) {
        return genusModules[moduleId] || null;
    };
    
    window.getAllGenusModules = function() {
        return Object.values(genusModules);
    };
    
    window.processModuleContent = function(module, adminContent = {}) {
        const processedModule = JSON.parse(JSON.stringify(module));
        
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
    
    // Genus Module Player Component with Dark Theme
    window.GenusModulePlayer = function GenusModulePlayer({ moduleId, onComplete, onBack }) {
        const [currentModule, setCurrentModule] = React.useState(null);
        const [currentSection, setCurrentSection] = React.useState('introduction');
        const [currentPage, setCurrentPage] = React.useState(0);
        const [isLoading, setIsLoading] = React.useState(true);
        
        React.useEffect(() => {
            const module = window.getGenusModule(moduleId);
            if (module) {
                const processedModule = window.processModuleContent(module, {});
                setCurrentModule(processedModule);
            }
            setIsLoading(false);
        }, [moduleId]);
        
        if (isLoading) {
            return React.createElement('div', {
                style: {
                    minHeight: '100vh',
                    backgroundColor: COLORS.BG_PRIMARY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            },
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { 
                        style: { 
                            fontSize: '2rem',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '1rem'
                        } 
                    }, '⏳'),
                    React.createElement('p', { 
                        style: { 
                            color: COLORS.TEXT_SECONDARY 
                        } 
                    }, 'Loading genus module...')
                )
            );
        }
        
        if (!currentModule) {
            return React.createElement('div', { 
                style: { 
                    minHeight: '100vh',
                    backgroundColor: COLORS.BG_PRIMARY,
                    padding: '2rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        maxWidth: '48rem',
                        margin: '0 auto',
                        textAlign: 'center',
                        backgroundColor: COLORS.BG_CARD,
                        borderRadius: '0.75rem',
                        padding: '3rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    } 
                },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: COLORS.ACCENT_ERROR,
                            marginBottom: '1rem'
                        } 
                    }, 'Module Not Found'),
                    React.createElement('p', { 
                        style: { 
                            color: COLORS.TEXT_SECONDARY,
                            marginBottom: '2rem'
                        } 
                    }, `Genus module "${moduleId}" could not be loaded.`),
                    React.createElement('button', {
                        onClick: onBack,
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: GRADIENTS.EARTH,
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                        }
                    }, 'Back to Modules')
                )
            );
        }
        
        return React.createElement('div', { 
            style: { 
                minHeight: '100vh',
                backgroundColor: COLORS.BG_PRIMARY
            } 
        },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: COLORS.BG_CARD,
                    borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}`,
                    padding: '1rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        maxWidth: '64rem',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    } 
                },
                    React.createElement('div', { 
                        style: { 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        } 
                    },
                        React.createElement('button', {
                            onClick: onBack,
                            style: {
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: COLORS.TEXT_SECONDARY,
                                fontSize: '1rem',
                                transition: 'color 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.color = COLORS.TEXT_PRIMARY,
                            onMouseLeave: (e) => e.target.style.color = COLORS.TEXT_SECONDARY
                        }, '← Back'),
                        React.createElement('h1', { 
                            style: { 
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, currentModule.title),
                        currentModule.safety_critical && React.createElement('span', {
                            style: {
                                background: GRADIENTS.DANGER,
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }
                        }, '⚠️ Safety Critical')
                    )
                )
            ),
            
            // Main Content
            React.createElement('div', { 
                style: { 
                    maxWidth: '64rem',
                    margin: '0 auto',
                    padding: '2rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        backgroundColor: COLORS.BG_CARD,
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                        padding: '3rem',
                        textAlign: 'center'
                    } 
                },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: COLORS.TEXT_PRIMARY,
                            marginBottom: '1rem'
                        } 
                    }, `🚧 ${currentModule.genus_name} Module Framework`),
                    React.createElement('p', { 
                        style: { 
                            color: COLORS.TEXT_SECONDARY,
                            marginBottom: '2rem',
                            fontSize: '1.125rem'
                        } 
                    }, 'This module framework is ready for content population via the admin portal.'),
                    
                    React.createElement('div', { 
                        style: { 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem'
                        } 
                    },
                        React.createElement('div', { 
                            style: { 
                                backgroundColor: COLORS.BG_PRIMARY,
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                border: `1px solid ${COLORS.BORDER_DEFAULT}`
                            } 
                        },
                            React.createElement('h3', { 
                                style: { 
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, 'Module Structure'),
                            React.createElement('ul', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    color: COLORS.TEXT_SECONDARY,
                                    lineHeight: '1.6',
                                    textAlign: 'left',
                                    listStyle: 'none'
                                } 
                            },
                                React.createElement('li', null, '✓ Introduction lessons'),
                                React.createElement('li', null, '✓ Interactive morphology'),
                                React.createElement('li', null, '✓ Comparison quizzes'),
                                React.createElement('li', null, '✓ Field practice'),
                                React.createElement('li', null, '✓ Final assessment')
                            )
                        ),
                        React.createElement('div', { 
                            style: { 
                                backgroundColor: COLORS.BG_PRIMARY,
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                border: `1px solid ${COLORS.BORDER_DEFAULT}`
                            } 
                        },
                            React.createElement('h3', { 
                                style: { 
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, 'Content Placeholders'),
                            React.createElement('ul', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    color: COLORS.TEXT_SECONDARY,
                                    lineHeight: '1.6',
                                    textAlign: 'left',
                                    listStyle: 'none'
                                } 
                            },
                                React.createElement('li', null, `${currentModule.content.introduction?.pages?.length || 0} lesson pages`),
                                React.createElement('li', null, `${currentModule.content.morphology?.clickable_parts?.length || 0} interactive elements`),
                                React.createElement('li', null, `${currentModule.content.assessment?.questions?.length || 0} assessment questions`),
                                React.createElement('li', null, `Est. ${currentModule.duration_minutes} min duration`)
                            )
                        )
                    ),
                    
                    // Info box
                    React.createElement('div', {
                        style: {
                            backgroundColor: COLORS.ACCENT_INFO + '20',
                            borderLeft: `3px solid ${COLORS.ACCENT_INFO}`,
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '2rem',
                            textAlign: 'left',
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }
                    },
                        React.createElement('p', { 
                            style: { 
                                fontSize: '0.875rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, 'Access the admin portal to populate this module with educational content, images, and interactive elements.')
                    ),
                    
                    React.createElement('button', {
                        onClick: onComplete,
                        style: {
                            padding: '0.75rem 2rem',
                            background: GRADIENTS.FOREST,
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                        }
                    }, '✓ Mark as Framework Complete')
                )
            )
        );
    };
    
    // Export to window for use in app
    window.genusModules = genusModules;
    
    console.log('✅ GenusModules component loaded with dark theme');
})();