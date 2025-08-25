// TrainingModules.js - Updated with Living Mycology Dark Theme
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
        PURPLE: 'linear-gradient(135deg, #9B7AA8 0%, #7B5A88 100%)'
    };
    
    window.TrainingModules = function TrainingModules({ 
        modules = [], 
        modulesLoading = false,
        userProgress = {},
        user,
        onBack, 
        onModuleSelect,
        onRefresh 
    }) {
        const [selectedCategory, setSelectedCategory] = React.useState('all');
        
        // Filter modules by category
        const filteredModules = React.useMemo(() => {
            if (selectedCategory === 'all') {
                return modules;
            }
            return modules.filter(m => m.category === selectedCategory);
        }, [modules, selectedCategory]);
        
        // Calculate progress
        const completedCount = React.useMemo(() => {
            let count = 0;
            modules.forEach(module => {
                const progressKey = `training_module_${module.id}`;
                const moduleProgress = userProgress[progressKey] || userProgress[module.id];
                if (moduleProgress?.completed) {
                    count++;
                }
            });
            return count;
        }, [modules, userProgress]);
        const totalModules = modules.length;
        const progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
        
        // Categories with icons
        const categories = [
            { id: 'all', label: 'All Modules', icon: '📚' },
            { id: 'foundation', label: 'Foundation', icon: '🎓' },
            { id: 'genus', label: 'Genus-Specific', icon: '🧬' },
            { id: 'advanced', label: 'Advanced', icon: '🔬' },
            { id: 'regional', label: 'Regional', icon: '🏜️' }
        ];
        
        return React.createElement('div', { 
            style: { 
                minHeight: '100vh', 
                backgroundColor: COLORS.BG_PRIMARY,
                padding: '2rem'
            } 
        },
            // Header with back button
            React.createElement('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto',
                    marginBottom: '2rem'
                } 
            },
                React.createElement('button', {
                    onClick: onBack,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: COLORS.BG_CARD,
                        border: `1px solid ${COLORS.BORDER_DEFAULT}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        color: COLORS.TEXT_SECONDARY,
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                        e.currentTarget.style.borderColor = COLORS.BORDER_HOVER;
                        e.currentTarget.style.color = COLORS.TEXT_PRIMARY;
                    },
                    onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = COLORS.BG_CARD;
                        e.currentTarget.style.borderColor = COLORS.BORDER_DEFAULT;
                        e.currentTarget.style.color = COLORS.TEXT_SECONDARY;
                    }
                }, '← Back to Home'),
                
                React.createElement('h1', { 
                    style: { 
                        fontSize: '2rem', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: COLORS.TEXT_PRIMARY
                    } 
                }, '📚 Training Modules'),
                
                React.createElement('p', { 
                    style: { 
                        fontSize: '1rem', 
                        color: COLORS.TEXT_SECONDARY,
                        marginBottom: '1.5rem'
                    } 
                }, 'Master mushroom identification through structured learning'),
                
                // Progress bar
                React.createElement('div', { 
                    style: { 
                        backgroundColor: COLORS.BG_CARD,
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        border: `1px solid ${COLORS.BORDER_DEFAULT}`
                    } 
                },
                    React.createElement('div', { 
                        style: { 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        } 
                    },
                        React.createElement('span', { 
                            style: { 
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, 'Overall Progress'),
                        React.createElement('span', { 
                            style: { 
                                fontSize: '0.875rem',
                                color: COLORS.TEXT_SECONDARY
                            } 
                        }, `${completedCount} / ${totalModules} modules completed`)
                    ),
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: COLORS.BG_PRIMARY,
                            height: '0.5rem',
                            borderRadius: '9999px',
                            overflow: 'hidden'
                        } 
                    },
                        React.createElement('div', {
                            style: {
                                width: `${progressPercentage}%`,
                                height: '100%',
                                background: GRADIENTS.FOREST,
                                borderRadius: '9999px',
                                transition: 'width 0.3s'
                            }
                        })
                    )
                ),
                
                // Category filters
                React.createElement('div', { 
                    style: { 
                        display: 'flex', 
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    } 
                },
                    categories.map(cat =>
                        React.createElement('button', {
                            key: cat.id,
                            onClick: () => setSelectedCategory(cat.id),
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedCategory === cat.id ? GRADIENTS.PURPLE : COLORS.BG_CARD,
                                color: selectedCategory === cat.id ? 'white' : COLORS.TEXT_SECONDARY,
                                fontWeight: selectedCategory === cat.id ? '600' : '400',
                                transition: 'all 0.2s',
                                boxShadow: selectedCategory === cat.id ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none'
                            },
                            onMouseEnter: (e) => {
                                if (selectedCategory !== cat.id) {
                                    e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                                    e.currentTarget.style.color = COLORS.TEXT_PRIMARY;
                                }
                            },
                            onMouseLeave: (e) => {
                                if (selectedCategory !== cat.id) {
                                    e.currentTarget.style.backgroundColor = COLORS.BG_CARD;
                                    e.currentTarget.style.color = COLORS.TEXT_SECONDARY;
                                }
                            }
                        },
                            React.createElement('span', null, cat.icon),
                            React.createElement('span', null, cat.label)
                        )
                    )
                ),
                
                // Refresh button
                React.createElement('button', {
                    onClick: onRefresh,
                    style: {
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: COLORS.BG_CARD,
                        border: `1px solid ${COLORS.BORDER_DEFAULT}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: COLORS.TEXT_SECONDARY,
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                        e.currentTarget.style.borderColor = COLORS.BORDER_HOVER;
                        e.currentTarget.style.color = COLORS.TEXT_PRIMARY;
                    },
                    onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = COLORS.BG_CARD;
                        e.currentTarget.style.borderColor = COLORS.BORDER_DEFAULT;
                        e.currentTarget.style.color = COLORS.TEXT_SECONDARY;
                    }
                }, '🔄 Refresh Modules')
            ),
            
            // Loading state
            modulesLoading ? React.createElement('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto',
                    textAlign: 'center',
                    padding: '3rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        display: 'inline-block',
                        animation: 'spin 1s linear infinite',
                        fontSize: '2rem'
                    } 
                }, '⏳'),
                React.createElement('p', { 
                    style: { 
                        marginTop: '1rem',
                        color: COLORS.TEXT_SECONDARY
                    } 
                }, 'Loading modules from database...')
            ) :
            
            // Modules grid
            React.createElement('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto' 
                } 
            },
                filteredModules.length === 0 ?
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: COLORS.BG_CARD,
                            borderRadius: '0.75rem',
                            padding: '3rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                            border: `1px solid ${COLORS.BORDER_DEFAULT}`
                        } 
                    },
                        React.createElement('p', { 
                            style: { 
                                fontSize: '1.25rem',
                                color: COLORS.TEXT_SECONDARY,
                                marginBottom: '1rem'
                            } 
                        }, selectedCategory === 'all' ? 
                            'No modules found in the database.' : 
                            `No ${selectedCategory} modules found.`
                        ),
                        React.createElement('p', { 
                            style: { 
                                color: COLORS.TEXT_MUTED,
                                fontSize: '0.875rem'
                            } 
                        }, 'Modules can be created through the admin portal.')
                    ) :
                    
                    React.createElement('div', { 
                        style: { 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        } 
                    },
                        filteredModules.map((module, idx) => {
                            // Check for module completion using correct progress type
                            const progressKey = `training_module_${module.id}`;
                            const moduleProgress = userProgress[progressKey] || userProgress[module.id];
                            const isCompleted = moduleProgress?.completed || false;
                            
                            const difficultyColor = {
                                'beginner': COLORS.ACCENT_SUCCESS,
                                'intermediate': COLORS.ACCENT_WARNING, 
                                'advanced': COLORS.ACCENT_ERROR
                            }[module.difficulty_level] || COLORS.TEXT_MUTED;
                            
                            return React.createElement('div', {
                                key: module.id,
                                onClick: () => onModuleSelect(module),
                                style: {
                                    backgroundColor: COLORS.BG_CARD,
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                                    cursor: 'pointer',
                                    border: `2px solid ${isCompleted ? COLORS.ACCENT_SUCCESS : COLORS.BORDER_DEFAULT}`,
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                },
                                onMouseEnter: (e) => {
                                    e.currentTarget.style.borderColor = isCompleted ? COLORS.ACCENT_SUCCESS : COLORS.ACCENT_PRIMARY;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
                                },
                                onMouseLeave: (e) => {
                                    e.currentTarget.style.borderColor = isCompleted ? COLORS.ACCENT_SUCCESS : COLORS.BORDER_DEFAULT;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                                }
                            },
                                // Completed badge
                                isCompleted && React.createElement('div', {
                                    style: {
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        backgroundColor: COLORS.ACCENT_SUCCESS,
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }
                                }, '✓ Completed'),
                                
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem',
                                        marginBottom: '0.75rem',
                                        opacity: isCompleted ? 0.7 : 1
                                    } 
                                }, module.icon || '📖'),
                                
                                React.createElement('h3', { 
                                    style: { 
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        color: COLORS.TEXT_PRIMARY
                                    } 
                                }, module.title),
                                
                                React.createElement('div', { 
                                    style: { 
                                        display: 'flex',
                                        gap: '0.5rem',
                                        marginBottom: '0.75rem',
                                        flexWrap: 'wrap'
                                    } 
                                },
                                    React.createElement('span', {
                                        style: {
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: COLORS.BG_PRIMARY,
                                            borderRadius: '0.25rem',
                                            color: COLORS.TEXT_SECONDARY
                                        }
                                    }, module.category),
                                    
                                    React.createElement('span', {
                                        style: {
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: difficultyColor + '20',
                                            color: difficultyColor,
                                            borderRadius: '0.25rem',
                                            fontWeight: '500'
                                        }
                                    }, module.difficulty_level),
                                    
                                    React.createElement('span', {
                                        style: {
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: COLORS.BG_PRIMARY,
                                            borderRadius: '0.25rem',
                                            color: COLORS.TEXT_MUTED
                                        }
                                    }, `${module.duration_minutes || 20} min`)
                                ),
                                
                                module.description && React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.875rem',
                                        color: COLORS.TEXT_SECONDARY,
                                        lineHeight: '1.4',
                                        marginBottom: '1rem'
                                    } 
                                }, module.description),
                                
                                // Action button
                                React.createElement('div', {
                                    style: {
                                        marginTop: 'auto',
                                        paddingTop: '0.75rem'
                                    }
                                },
                                    React.createElement('button', {
                                        style: {
                                            width: '100%',
                                            padding: '0.5rem 1rem',
                                            background: isCompleted ? 'transparent' : GRADIENTS.EARTH,
                                            color: isCompleted ? COLORS.ACCENT_SUCCESS : 'white',
                                            border: isCompleted ? `1px solid ${COLORS.ACCENT_SUCCESS}` : 'none',
                                            borderRadius: '0.5rem',
                                            fontWeight: '500',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        },
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            onModuleSelect(module);
                                        },
                                        onMouseEnter: (e) => {
                                            if (isCompleted) {
                                                e.target.style.backgroundColor = COLORS.ACCENT_SUCCESS + '20';
                                            }
                                        },
                                        onMouseLeave: (e) => {
                                            if (isCompleted) {
                                                e.target.style.backgroundColor = 'transparent';
                                            }
                                        }
                                    }, isCompleted ? '📚 Review Module' : '🎯 Start Module')
                                ),
                                
                                // Prerequisites
                                module.prerequisites && module.prerequisites.length > 0 && 
                                React.createElement('div', {
                                    style: {
                                        marginTop: '0.75rem',
                                        paddingTop: '0.75rem',
                                        borderTop: `1px solid ${COLORS.BORDER_DEFAULT}`,
                                        fontSize: '0.75rem',
                                        color: COLORS.TEXT_MUTED
                                    }
                                }, `Prerequisites: ${module.prerequisites.join(', ')}`)
                            );
                        })
                    )
            )
        );
    };
    
    console.log('✅ TrainingModules component loaded with dark theme');
    
})();