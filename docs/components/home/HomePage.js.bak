// Flash Fungi - Home Page Component
// Main landing page with training modules and study modes

window.HomePage = function HomePage(props) {
    const specimens = props.specimens || [];
    const user = props.user;
    const userProgress = props.userProgress || {};
    const onStudyModeSelect = props.onStudyModeSelect;
    const onTrainingModuleSelect = props.onTrainingModuleSelect;
    const onAuthRequired = props.onAuthRequired;
    const onProfileClick = props.onProfileClick;
    const onSignOut = props.onSignOut;
    
    const h = React.createElement;
    
    const approvedCount = specimens.filter(s => s.status === 'approved').length;
    const dnaCount = specimens.filter(s => s.dna_sequenced).length;
    const speciesWithHints = props.speciesWithHints || 0;
    
    // Calculate training progress
    const completedModules = Object.values(userProgress).filter(p => p.completed).length;
    const totalModules = window.FLASH_FUNGI_CONFIG.TRAINING.FOUNDATION_MODULES_COUNT;

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header with Auth Status
        h('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { textAlign: 'center', flex: 1 } },
                        h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                        h('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                        h('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                    ),
                    // Auth buttons
                    h('div', { style: { position: 'absolute', right: '1.5rem' } },
                        user ? 
                            h('div', { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' } },
                                h('button', {
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
                                h('button', {
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
                            h('button', {
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

        // Main content
        h('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
            // User Profile Banner or Sign In Prompt
            user ? 
                h('div', {
                    style: {
                        background: 'linear-gradient(to right, #10b981, #059669)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }
                },
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                        `Welcome, ${user.display_name || user.username}! 🍄`
                    ),
                    h('p', { style: { marginBottom: '1rem' } }, 'Your learning journey continues...'),
                    h('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } },
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `📊 ${specimens.length} Total`
                        ),
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `✅ ${approvedCount} Approved`
                        ),
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `🧬 ${dnaCount} DNA Verified`
                        ),
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `🎓 ${completedModules}/${totalModules} Modules`
                        )
                    )
                ) :
                h('div', {
                    style: {
                        background: 'linear-gradient(to right, #f59e0b, #dc2626)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }
                },
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                        '🔒 Sign in to Track Your Progress'
                    ),
                    h('p', { style: { marginBottom: '1rem' } }, 
                        'Create an account to save your learning progress and unlock all features'
                    ),
                    h('button', {
                        onClick: onAuthRequired,
                        style: {
                            padding: '0.75rem 2rem',
                            backgroundColor: 'white',
                            color: '#dc2626',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                        }
                    }, 'Get Started Free')
                ),

            // Training Modules Section
            h('div', { style: { marginBottom: '2rem' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '🎓 Training Modules'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                    'Build your foundation with structured lessons before practicing'
                ),
                
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' } },
                    // Foundation Modules Card
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => user ? onTrainingModuleSelect('foundation') : onAuthRequired(),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#10b981',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🗿'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Foundation Modules'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Essential knowledge for beginners'
                        ),
                        user ? 
                            h('div', null,
                                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                    h('span', { style: { fontSize: '0.75rem', color: '#059669' } }, 
                                        `${completedModules}/5 Complete`
                                    ),
                                    h('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                        '20-25 min each'
                                    )
                                ),
                                // Progress bar
                                h('div', { 
                                    style: { 
                                        marginTop: '0.5rem', 
                                        height: '4px', 
                                        backgroundColor: '#e5e7eb', 
                                        borderRadius: '2px' 
                                    } 
                                },
                                    h('div', {
                                        style: {
                                            width: `${(completedModules / 5) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#10b981',
                                            borderRadius: '2px',
                                            transition: 'width 0.3s'
                                        }
                                    })
                                )
                            ) :
                            h('div', { style: { fontSize: '0.75rem', color: '#f59e0b' } }, 
                                '🔒 Sign in to access'
                            )
                    ),

                    // Coming Soon Card
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            border: '2px dashed #e5e7eb',
                            opacity: 0.7
                        }
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🚀'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Advanced Modules'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Genus-specific and advanced techniques'
                        ),
                        h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                            'Unlocked after foundation completion'
                        )
                    )
                )
            ),

            // Study Modes Section
            h('div', { style: { marginBottom: '2rem' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '📚 Study Modes'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                    'Practice identification with real specimens'
                ),
                
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' } },
                    // Quick Study
                    h('div', {
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
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '⚡'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Quick Study'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            '10 random specimens with progressive hints'
                        ),
                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            h('span', { style: { fontSize: '0.75rem', color: '#3b82f6' } }, 
                                `${approvedCount} Available`
                            ),
                            h('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                '~15 min'
                            )
                        ),
                        !user && h('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                            '🔒 Sign in to play'
                        )
                    ),

                    // Focused Study
                    h('div', {
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
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎯'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Focused Study'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Filter by family, genus, or features'
                        ),
                        h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                            'Coming in Phase 3'
                        )
                    ),

                    // Marathon Mode
                    h('div', {
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
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#f59e0b',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🏃'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Marathon Mode'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Unlimited questions with spaced repetition'
                        ),
                        h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                            'Coming in Phase 3'
                        )
                    )
                )
            ),

            // Quick Stats Section
            h('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }
            },
                h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' } }, 
                    '📊 Database Statistics'
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' } },
                    [
                        { label: 'Total Specimens', value: specimens.length, icon: '🔬' },
                        { label: 'DNA Verified', value: dnaCount, icon: '🧬' },
                        { label: 'Arizona Families', value: new Set(specimens.map(s => s.family)).size, icon: '🏔️' },
                        { label: 'Species Available', value: new Set(specimens.map(s => s.species_name)).size, icon: '🍄' }
                    ].map((stat, idx) =>
                        h('div', {
                            key: idx,
                            style: {
                                textAlign: 'center',
                                padding: '1rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '0.5rem'
                            }
                        },
                            h('div', { style: { fontSize: '1.5rem', marginBottom: '0.25rem' } }, stat.icon),
                            h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' } }, stat.value),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, stat.label)
                        )
                    )
                )
            )
        )
    );
};

console.log('✅ HomePage component loaded');