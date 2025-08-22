// TrainingModules.js - Training Modules Display Component
// Updated to use database modules via ModuleLoader

(function() {
    'use strict';
    
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
        const completedCount = Object.values(userProgress).filter(p => p?.completed).length;
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
                backgroundColor: '#f9fafb',
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
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }
                }, '← Back to Home'),
                
                React.createElement('h1', { 
                    style: { 
                        fontSize: '2rem', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                    } 
                }, '📚 Training Modules'),
                
                React.createElement('p', { 
                    style: { 
                        color: '#6b7280',
                        marginBottom: '1rem'
                    } 
                }, 'Structured learning paths for systematic mushroom identification mastery')
            ),
            
            // Progress bar
            totalModules > 0 && React.createElement('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto',
                    marginBottom: '2rem',
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                    } 
                },
                    React.createElement('span', { 
                        style: { 
                            fontWeight: '600' 
                        } 
                    }, 'Overall Progress'),
                    React.createElement('span', { 
                        style: { 
                            color: '#6b7280' 
                        } 
                    }, `${completedCount} of ${totalModules} modules completed`)
                ),
                React.createElement('div', { 
                    style: { 
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        height: '0.5rem',
                        overflow: 'hidden'
                    } 
                },
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: '#10b981',
                            height: '100%',
                            width: `${progressPercentage}%`,
                            transition: 'width 0.3s ease'
                        } 
                    })
                )
            ),
            
            // Category tabs
            React.createElement('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto',
                    marginBottom: '2rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        padding: '0.25rem',
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
                                whiteSpace: 'nowrap',
                                backgroundColor: selectedCategory === cat.id ? '#8b5cf6' : 'transparent',
                                color: selectedCategory === cat.id ? 'white' : '#374151',
                                fontWeight: selectedCategory === cat.id ? '600' : '400',
                                transition: 'all 0.2s'
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
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
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
                        color: '#6b7280'
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
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '3rem',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        } 
                    },
                        React.createElement('p', { 
                            style: { 
                                fontSize: '1.25rem',
                                color: '#6b7280',
                                marginBottom: '1rem'
                            } 
                        }, selectedCategory === 'all' ? 
                            'No modules found in the database.' : 
                            `No ${selectedCategory} modules found.`
                        ),
                        React.createElement('p', { 
                            style: { 
                                color: '#9ca3af',
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
                            const isCompleted = userProgress[module.id]?.completed || false;
                            const difficultyColor = {
                                'beginner': '#10b981',
                                'intermediate': '#f59e0b', 
                                'advanced': '#ef4444'
                            }[module.difficulty_level] || '#6b7280';
                            
                            return React.createElement('div', {
                                key: module.id,
                                onClick: () => onModuleSelect(module),
                                style: {
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                    cursor: 'pointer',
                                    border: '2px solid transparent',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                },
                                onMouseEnter: (e) => {
                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                },
                                onMouseLeave: (e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                                }
                            },
                                // Completed badge
                                isCompleted && React.createElement('div', {
                                    style: {
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }
                                }, '✓'),
                                
                                // Module content
                                React.createElement('div', { style: { marginBottom: '1rem' } },
                                    React.createElement('h3', { 
                                        style: { 
                                            fontSize: '1.125rem',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
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
                                                backgroundColor: '#f3f4f6',
                                                borderRadius: '0.25rem',
                                                color: '#374151'
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
                                                backgroundColor: '#e0e7ff',
                                                color: '#4f46e5',
                                                borderRadius: '0.25rem'
                                            }
                                        }, `${module.duration_minutes || 20} min`)
                                    )
                                ),
                                
                                // Module description (if available)
                                module.description && React.createElement('p', {
                                    style: {
                                        fontSize: '0.875rem',
                                        color: '#6b7280',
                                        lineHeight: '1.5',
                                        marginBottom: '1rem'
                                    }
                                }, module.description),
                                
                                // Action button
                                React.createElement('button', {
                                    style: {
                                        width: '100%',
                                        padding: '0.5rem',
                                        backgroundColor: isCompleted ? '#f3f4f6' : '#8b5cf6',
                                        color: isCompleted ? '#374151' : 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        e.stopPropagation();
                                        e.currentTarget.style.backgroundColor = isCompleted ? '#e5e7eb' : '#7c3aed';
                                    },
                                    onMouseLeave: (e) => {
                                        e.stopPropagation();
                                        e.currentTarget.style.backgroundColor = isCompleted ? '#f3f4f6' : '#8b5cf6';
                                    }
                                }, isCompleted ? 'Review Module' : 'Start Module')
                            );
                        })
                    )
            ),
            
            // Add CSS animation for loading spinner
            React.createElement('style', null, `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `)
        );
    };
    
    console.log('✅ TrainingModules component updated for database integration');
    
})();