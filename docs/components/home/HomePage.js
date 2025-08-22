// HomePage.js - Restored Original Design from Legacy App
// Flash Fungi - Complete home page preserving original UI/UX

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
        
        // Calculate statistics (restored from original)
        const approvedCount = specimens.filter(s => s.status === 'approved' || s.quality_grade === 'research').length;
        const dnaCount = specimens.filter(s => s.dna_sequenced).length;
        const speciesWithHints = props.speciesWithHints || 0;
        
        // Calculate training progress (restored from original)
        const completedModules = Object.values(userProgress).filter(p => p.completed).length;
        const totalModules = 5; // Foundation modules count
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header with Auth Status (restored original design)
            React.createElement('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        // Centered title section (original design)
                        React.createElement('div', { style: { textAlign: 'center', flex: 1 } },
                            React.createElement('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                            React.createElement('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                            React.createElement('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                        ),
                        // Auth buttons (original design - positioned absolutely to the right)
                        React.createElement('div', { style: { position: 'absolute', right: '1.5rem' } },
                            user ?
                                React.createElement('div', { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' } },
                                    React.createElement('div', { style: { textAlign: 'right', marginRight: '0.5rem' } },
                                        React.createElement('div', { style: { fontSize: '0.875rem', fontWeight: '500' } }, 
                                            `Hello, ${user.display_name || user.username || 'User'}`
                                        ),
                                        React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                            `${progressPercentage}% Foundation Complete`
                                        )
                                    ),
                                    React.createElement('button', {
                                        onClick: onProfileClick,
                                        style: {
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }
                                    }, '👤 Profile'),
                                    React.createElement('button', {
                                        onClick: onSignOut,
                                        style: {
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#6b7280',
                                            color: 'white',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }
                                    }, 'Sign Out')
                                ) :
                                React.createElement('button', {
                                    onClick: onAuthRequired,
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }
                                }, 'Sign In / Sign Up')
                        )
                    )
                )
            ),

            // Main content (restored original layout)
            React.createElement('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                // User Profile Banner or Sign In Prompt (restored original)
                user ? 
                    React.createElement('div', {
                        style: {
                            background: 'linear-gradient(to right, #10b981, #059669)',
                            borderRadius: '0.75rem',
                            color: 'white',
                            padding: '1.5rem',
                            marginBottom: '2rem'
                        }
                    },
                        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                            `Welcome back, ${user.display_name || user.username || 'User'}!`
                        ),
                        React.createElement('p', { style: { opacity: 0.9, marginBottom: '1rem' } }, 
                            'Ready to continue your mushroom identification training?'
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
                                fontWeight: '500',
                                fontSize: '1rem'
                            }
                        }, 'Get Started')
                    ),

                // Training Modules Section
                React.createElement('div', { style: { marginBottom: '2rem' } },
                    React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                        '📚 Training Modules'
                    ),
                    React.createElement('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                        'Structured learning paths for systematic mastery'
                    ),
                    
                    // Single button for all modules
                    React.createElement('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => user ? onTrainingModuleSelect() : onAuthRequired(),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#8b5cf6',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                    },
                        React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎓'),
                        React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'All Training Modules'
                        ),
                        React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Access foundation, genus-specific, advanced, and regional modules'
                        ),
                        React.createElement('button', {
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: user ? '#8b5cf6' : '#e5e7eb',
                                color: user ? 'white' : '#6b7280',
                                borderRadius: '0.5rem',
                                border: 'none',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }
                        }, user ? 'Browse All Modules' : 'Sign In to Access')
                    )
                ),

                // Study Modes Section (restored original design)
                React.createElement('div', { style: { marginBottom: '2rem' } },
                    React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                        '🎯 Study Modes'
                    ),
                    React.createElement('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                        'Practice identification with real specimens'
                    ),
                    
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' } },
                        // Quick Study (restored original)
                        React.createElement('div', {
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                border: '2px solid transparent',
                                transition: 'all 0.2s'
                            },
                            onClick: () => user ? onStudyModeSelect('quick') : onAuthRequired(),
                            onMouseEnter: (e) => e.currentTarget.style.borderColor = '#3b82f6',
                            onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '⚡'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Quick Study'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                '10 random specimens with progressive hints'
                            ),
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#3b82f6' } }, 
                                    `${approvedCount} specimens`
                                ),
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                    '~15 min'
                                )
                            ),
                            !user && React.createElement('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                                '🔒 Sign in to play'
                            )
                        ),

                        // Focused Study (restored original)
                        React.createElement('div', {
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                border: '2px solid transparent',
                                transition: 'all 0.2s'
                            },
                            onClick: () => user ? onStudyModeSelect('focused') : onAuthRequired(),
                            onMouseEnter: (e) => e.currentTarget.style.borderColor = '#8b5cf6',
                            onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎯'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Focused Study'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                'Filter by family, genus, or features'
                            ),
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#8b5cf6' } }, 
                                    'Now Available!'
                                ),
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                    '~25 min'
                                )
                            ),
                            !user && React.createElement('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                                '🔒 Sign in to access'
                            )
                        ),

                        // Marathon Mode (restored original)
                        React.createElement('div', {
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                border: '2px solid transparent',
                                transition: 'all 0.2s'
                            },
                            onClick: () => user ? onStudyModeSelect('marathon') : onAuthRequired(),
                            onMouseEnter: (e) => e.currentTarget.style.borderColor = '#10b981',
                            onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🏃'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Marathon Mode'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                'Unlimited practice with spaced repetition'
                            ),
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#10b981' } }, 
                                    'Enhanced!'
                                ),
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                    'Unlimited'
                                )
                            ),
                            !user && React.createElement('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                                '🔒 Sign in to access'
                            )
                        )
                    )
                ),

                // Statistics and Quality Indicators (restored original)
                React.createElement('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        marginBottom: '2rem'
                    }
                },
                    React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' } }, 
                        '📊 Dataset Overview'
                    ),
                    
                    // Statistics grid (restored original)
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' } },
                        [
                            { icon: '🍄', value: approvedCount, label: 'Specimens', color: '#3b82f6' },
                            { icon: '🔬', value: dnaCount, label: 'DNA Verified', color: '#10b981' },
                            { icon: '💡', value: speciesWithHints, label: 'With Hints', color: '#8b5cf6' },
                            { icon: '📍', value: 'Arizona', label: 'Geographic Focus', color: '#f59e0b' }
                        ].map((stat, index) =>
                            React.createElement('div', {
                                key: index,
                                style: {
                                    textAlign: 'center',
                                    padding: '0.75rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '0.5rem'
                                }
                            },
                                React.createElement('div', { style: { fontSize: '1.5rem', marginBottom: '0.25rem' } }, stat.icon),
                                React.createElement('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: stat.color } }, stat.value),
                                React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, stat.label)
                            )
                        )
                    ),
                    
                    // Quality indicators (restored original)
                    React.createElement('div', { style: { marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' } },
                        React.createElement('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' } },
                                React.createElement('span', null, '✅'),
                                React.createElement('span', null, 'Expert Verified')
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' } },
                                React.createElement('span', null, '📸'),
                                React.createElement('span', null, 'High-Quality Photos')
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' } },
                                React.createElement('span', null, '📍'),
                                React.createElement('span', null, 'Arizona Native')
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' } },
                                React.createElement('span', null, '🔬'),
                                React.createElement('span', null, 'Educational Purpose')
                            )
                        )
                    )
                )
            )
        );
    };
    
    console.log('✅ HomePage component loaded with restored original design');
    
})();