// HomePage.js - Fixed Module Progress Tracking
// Flash Fungi - Correctly filters for training module completions only

(function() {
    'use strict';
    
    window.HomePage = function HomePage(props) {
        const specimens = props.specimens || [];
        const user = props.user;
        const userProgress = props.userProgress || {};
        const onStudyModeSelect = props.onStudyModeSelect;
        const onTrainingModuleSelect = props.onTrainingModuleSelect;
        const onAuthRequired = props.onAuthRequired;
        const onProfileClick = props.onProfileClick;
        const onSignOut = props.onSignOut;
        
        // Calculate statistics
        const approvedCount = specimens.filter(s => s.status === 'approved' || s.quality_grade === 'research').length;
        const dnaCount = specimens.filter(s => s.dna_sequenced).length;
        const speciesWithHints = props.speciesWithHints || 0;
        
        // FIX: Calculate training progress - filter specifically for training modules
        const trainingModuleProgress = Object.values(userProgress).filter(p => 
            p.progress_type === 'training_module' && p.completed
        );
        const completedModules = trainingModuleProgress.length;
        
        // For now, keep totalModules as 5 for foundation modules
        // This could be made dynamic by counting actual foundation modules from the database
        const totalModules = 5; 
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // Debug logging to help track the issue
        console.log('📊 Module Progress Debug:', {
            allProgress: Object.values(userProgress).length,
            allCompleted: Object.values(userProgress).filter(p => p.completed).length,
            trainingModules: Object.values(userProgress).filter(p => p.progress_type === 'training_module').length,
            completedTrainingModules: completedModules,
            percentage: progressPercentage
        });

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header with Auth Status
            React.createElement('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        // Centered title section
                        React.createElement('div', { style: { textAlign: 'center', flex: 1 } },
                            React.createElement('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                            React.createElement('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                            React.createElement('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                        ),
                        // Auth buttons
                        React.createElement('div', { style: { position: 'absolute', right: '1.5rem' } },
                            user ?
                            React.createElement('div', { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' } },
                                React.createElement('button', {
                                    onClick: onProfileClick,
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }
                                },
                                    React.createElement('span', null, '👤'),
                                    React.createElement('span', null, user.email?.split('@')[0] || 'Profile')
                                ),
                                React.createElement('button', {
                                    onClick: onSignOut,
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }
                                }, 'Sign Out')
                            ) :
                            React.createElement('button', {
                                onClick: onAuthRequired,
                                style: {
                                    padding: '0.5rem 1.5rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, 'Sign In')
                        )
                    )
                )
            ),

            // Main content
            React.createElement('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                // Statistics cards
                React.createElement('div', { 
                    style: { 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    } 
                },
                    React.createElement('div', {
                        style: {
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }
                    },
                        React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '✅'),
                        React.createElement('div', { style: { fontSize: '2rem', fontWeight: 'bold' } }, approvedCount),
                        React.createElement('div', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 'Verified Specimens')
                    ),
                    React.createElement('div', {
                        style: {
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }
                    },
                        React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🧬'),
                        React.createElement('div', { style: { fontSize: '2rem', fontWeight: 'bold' } }, dnaCount),
                        React.createElement('div', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 'DNA Sequenced')
                    ),
                    React.createElement('div', {
                        style: {
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }
                    },
                        React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '💡'),
                        React.createElement('div', { style: { fontSize: '2rem', fontWeight: 'bold' } }, speciesWithHints),
                        React.createElement('div', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 'Species with Hints')
                    )
                ),

                // Training Progress Section (only if logged in)
                user ? 
                    React.createElement('div', {
                        style: {
                            backgroundColor: '#4c1d95',
                            color: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            marginBottom: '2rem'
                        }
                    },
                        React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem'
                            } 
                        },
                            React.createElement('h2', { 
                                style: { 
                                    fontSize: '1.25rem', 
                                    fontWeight: 'bold' 
                                } 
                            }, '🎓 Training Progress'),
                            React.createElement('span', { 
                                style: { 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold' 
                                } 
                            }, `${progressPercentage}%`)
                        ),
                        React.createElement('div', { style: { display: 'flex', gap: '1rem', alignItems: 'center' } },
                            React.createElement('div', { style: { fontSize: '0.875rem' } },
                                `Foundation Modules: ${completedModules}/${totalModules} complete`
                            ),
                            React.createElement('div', {
                                style: {
                                    flex: 1,
                                    height: '0.5rem',
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    borderRadius: '0.25rem',
                                    overflow: 'hidden'
                                }
                            },
                                React.createElement('div', {
                                    style: {
                                        width: `${progressPercentage}%`,
                                        height: '100%',
                                        backgroundColor: 'white',
                                        borderRadius: '0.25rem',
                                        transition: 'width 0.3s'
                                    }
                                })
                            )
                        )
                    ) :
                    React.createElement('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            border: '2px dashed #e5e7eb'
                        }
                    },
                        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                            '🔒 Sign In to Start Learning'
                        ),
                        React.createElement('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                            'Track your progress, save achievements, and access personalized training'
                        ),
                        React.createElement('button', {
                            onClick: onAuthRequired,
                            style: {
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }
                        }, 'Get Started')
                    ),

                // Study Modes Section
                React.createElement('div', { style: { marginBottom: '2rem' } },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            marginBottom: '1rem' 
                        } 
                    }, '📚 Study Modes'),
                    React.createElement('div', { 
                        style: { 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                        } 
                    },
                        // Quick Study
                        React.createElement('div', {
                            onClick: () => user ? onStudyModeSelect('quick') : onAuthRequired(),
                            style: {
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                border: '2px solid transparent'
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = '#10b981';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '⚡'),
                            React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'Quick Study'),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 
                                '5-minute sessions for rapid learning'
                            )
                        ),

                        // Focused Practice
                        React.createElement('div', {
                            onClick: () => user ? onStudyModeSelect('focused') : onAuthRequired(),
                            style: {
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                border: '2px solid transparent'
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = '#3b82f6';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎯'),
                            React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'Focused Practice'),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 
                                'Target specific genera or families'
                            )
                        ),

                        // Marathon Mode
                        React.createElement('div', {
                            onClick: () => user ? onStudyModeSelect('marathon') : onAuthRequired(),
                            style: {
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                border: '2px solid transparent'
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = '#ef4444';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🏃'),
                            React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'Marathon Mode'),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 
                                'Extended sessions for deep learning'
                            )
                        )
                    )
                ),

                // Training Modules Button
                React.createElement('div', {
                    onClick: () => user ? onTrainingModuleSelect() : onAuthRequired(),
                    style: {
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    },
                    onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#7c3aed',
                    onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#8b5cf6'
                },
                    React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '📖'),
                    React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                        'Training Modules'
                    ),
                    React.createElement('p', { style: { fontSize: '0.875rem', opacity: 0.9 } }, 
                        'Structured learning paths from basics to advanced identification'
                    )
                )
            )
        );
    };
    
    console.log('✅ HomePage component loaded with fixed module tracking');
    
})();