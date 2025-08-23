// HomePage.js - Fixed Foundation Module Progress Tracking
// Flash Fungi - Complete home page with accurate module completion

(function() {
    'use strict';
    
    window.HomePage = function HomePage(props) {
        const specimens = props.specimens || [];
        const user = props.user;
        const userProgress = props.userProgress || {};
        const modules = props.modules || []; // Now receiving modules from app.js
        const onStudyModeSelect = props.onStudyModeSelect;
        const onTrainingModuleSelect = props.onTrainingModuleSelect;
        const onAuthRequired = props.onAuthRequired;
        const onProfileClick = props.onProfileClick;
        const onSignOut = props.onSignOut;
        
        // Calculate statistics (restored from original)
        const approvedCount = specimens.filter(s => s.status === 'approved' || s.quality_grade === 'research').length;
        const dnaCount = specimens.filter(s => s.dna_sequenced).length;
        const speciesWithHints = props.speciesWithHints || 0;
        
        // Calculate ACCURATE foundation module progress
        const foundationModules = modules.filter(m => m.category === 'foundation');
        const foundationModuleIds = foundationModules.map(m => m.id);
        const completedFoundationModules = Object.entries(userProgress)
            .filter(([moduleId, progress]) => 
                foundationModuleIds.includes(moduleId) && progress.completed
            );
        
        const totalFoundationModules = foundationModules.length;
        const completedFoundationCount = completedFoundationModules.length;
        const foundationProgressPercentage = totalFoundationModules > 0 
            ? Math.round((completedFoundationCount / totalFoundationModules) * 100) 
            : 0;
        
        // Only show foundation progress if user has NOT completed all foundation modules
        const showFoundationProgress = user && totalFoundationModules > 0 && completedFoundationCount < totalFoundationModules;

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
                                React.createElement('button', {
                                    onClick: onProfileClick,
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#f3f4f6',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }
                                }, user.username || user.email),
                                React.createElement('button', {
                                    onClick: onSignOut,
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }
                                }, 'Sign Out')
                            ) :
                            React.createElement('button', {
                                onClick: onAuthRequired,
                                style: {
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, 'Sign In')
                        )
                    )
                )
            ),

            // Main content (restored original design)
            React.createElement('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                // Statistics Grid (original design)
                React.createElement('div', { 
                    style: { 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    } 
                },
                    // Approved Specimens
                    React.createElement('div', { style: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            React.createElement('div', null,
                                React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 'Research Grade'),
                                React.createElement('p', { style: { fontSize: '2rem', fontWeight: 'bold' } }, approvedCount.toLocaleString())
                            ),
                            React.createElement('span', { style: { fontSize: '2rem' } }, '✓')
                        )
                    ),

                    // DNA Sequenced
                    React.createElement('div', { style: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            React.createElement('div', null,
                                React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 'DNA Sequenced'),
                                React.createElement('p', { style: { fontSize: '2rem', fontWeight: 'bold' } }, dnaCount.toLocaleString())
                            ),
                            React.createElement('span', { style: { fontSize: '2rem' } }, '🧬')
                        )
                    ),

                    // Species with Hints
                    React.createElement('div', { style: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            React.createElement('div', null,
                                React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 'Species with Hints'),
                                React.createElement('p', { style: { fontSize: '2rem', fontWeight: 'bold' } }, speciesWithHints.toLocaleString())
                            ),
                            React.createElement('span', { style: { fontSize: '2rem' } }, '💡')
                        )
                    ),

                    // Training Progress - Only show if foundations not complete
                    showFoundationProgress && React.createElement('div', { style: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            React.createElement('div', null,
                                React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 'Foundation Progress'),
                                React.createElement('p', { style: { fontSize: '2rem', fontWeight: 'bold' } }, 
                                    `${completedFoundationCount}/${totalFoundationModules}`
                                ),
                                React.createElement('div', { style: { marginTop: '0.5rem' } },
                                    React.createElement('div', { 
                                        style: { 
                                            width: '150px', 
                                            height: '8px', 
                                            backgroundColor: '#e5e7eb', 
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        } 
                                    },
                                        React.createElement('div', { 
                                            style: { 
                                                width: `${foundationProgressPercentage}%`, 
                                                height: '100%', 
                                                backgroundColor: '#8b5cf6',
                                                transition: 'width 0.3s'
                                            } 
                                        })
                                    ),
                                    React.createElement('p', { 
                                        style: { 
                                            fontSize: '0.75rem', 
                                            color: '#9ca3af',
                                            marginTop: '0.25rem'
                                        } 
                                    }, `${foundationProgressPercentage}% Complete`)
                                )
                            ),
                            React.createElement('span', { style: { fontSize: '2rem' } }, '🎓')
                        )
                    )
                ),

                // Study Modes Section (restored original)
                React.createElement('div', { style: { marginBottom: '2rem' } },
                    React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                        '⚡ Quick Study Modes'
                    ),
                    React.createElement('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                        'Jump right in with flashcard-based practice'
                    ),
                    React.createElement('div', { 
                        style: { 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                        } 
                    },
                        // Quick Study
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
                            onClick: () => onStudyModeSelect('quick'),
                            onMouseEnter: (e) => e.currentTarget.style.borderColor = '#8b5cf6',
                            onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '⚡'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Quick Study'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 
                                'Rapid-fire practice with random specimens'
                            )
                        ),

                        // Focused Study
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
                            onClick: () => onStudyModeSelect('focused'),
                            onMouseEnter: (e) => e.currentTarget.style.borderColor = '#8b5cf6',
                            onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎯'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Focused Study'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 
                                'Target specific families or genera'
                            )
                        ),

                        // Marathon Mode
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
                            onClick: () => onStudyModeSelect('marathon'),
                            onMouseEnter: (e) => e.currentTarget.style.borderColor = '#8b5cf6',
                            onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🏃'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Marathon Mode'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 
                                'Continuous practice with all specimens'
                            )
                        ),

                        // Get Started button
                        React.createElement('button', {
                            onClick: () => user ? onStudyModeSelect('quick') : onAuthRequired(),
                            style: {
                                gridColumn: 'span 3',
                                padding: '1rem',
                                backgroundColor: user ? '#8b5cf6' : '#e5e7eb',
                                color: user ? 'white' : '#6b7280',
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '1rem'
                            }
                        }, 'Get Started')
                    )
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
                )
            )
        );
    };
})();