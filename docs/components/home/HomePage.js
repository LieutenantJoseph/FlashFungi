// HomePage.js - Enhanced Home Page Component
// Flash Fungi - Complete home page with training progress and authentication

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
        
        const approvedCount = specimens.filter(s => s.status === 'approved').length;
        const dnaCount = specimens.filter(s => s.dna_sequenced).length;
        const speciesWithHints = props.speciesWithHints || 0;
        
        // Calculate training progress
        const completedModules = Object.values(userProgress).filter(p => p.completed).length;
        const totalModules = 5; // Foundation modules count
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header with Auth Status
            React.createElement('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        React.createElement('div', { style: { textAlign: 'center', flex: 1 } },
                            React.createElement('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                            React.createElement('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                            React.createElement('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                        ),
                        // Auth buttons
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

            // Main content
            React.createElement('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                // User Profile Banner or Sign In Prompt
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
                            `Welcome back, ${user.display_name || user.username}! 🍄`
                        ),
                        React.createElement('p', { style: { marginBottom: '1rem', opacity: 0.9 } }, 'Your learning journey continues...'),
                        React.createElement('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } },
                            React.createElement('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                                `📊 ${specimens.length} Total Specimens`
                            ),
                            React.createElement('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                                `✅ ${approvedCount} Approved for Study`
                            ),
                            React.createElement('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                                `🧬 ${dnaCount} DNA Verified`
                            ),
                            React.createElement('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                                `🎓 ${completedModules}/${totalModules} Modules Complete`
                            )
                        ),
                        
                        // Progress visualization
                        progressPercentage > 0 && React.createElement('div', { style: { marginTop: '1rem' } },
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } },
                                React.createElement('span', { style: { fontSize: '0.875rem', opacity: 0.9 } }, 'Foundation Progress'),
                                React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: 'bold' } }, `${progressPercentage}%`)
                            ),
                            React.createElement('div', { 
                                style: { 
                                    height: '6px', 
                                    backgroundColor: 'rgba(255,255,255,0.2)', 
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                } 
                            },
                                React.createElement('div', {
                                    style: {
                                        width: `${progressPercentage}%`,
                                        height: '100%',
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        borderRadius: '3px',
                                        transition: 'width 0.3s ease'
                                    }
                                })
                            )
                        )
                    ) :
                    React.createElement('div', {
                        style: {
                            background: 'linear-gradient(to right, #f59e0b, #dc2626)',
                            borderRadius: '0.75rem',
                            color: 'white',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }
                    },
                        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                            '🚀 Sign in to Track Your Progress'
                        ),
                        React.createElement('p', { style: { marginBottom: '1rem' } }, 
                            'Create an account to save your learning progress, track your scores, and unlock all features'
                        ),
                        React.createElement('button', {
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
                React.createElement('div', { style: { marginBottom: '2rem' } },
                    React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                        '🎓 Training Modules'
                    ),
                    React.createElement('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                        'Build your foundation with structured lessons before practicing identification'
                    ),
                    
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' } },
                        // Foundation Modules Card
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
                            onClick: () => user ? onTrainingModuleSelect('foundation') : onAuthRequired(),
                            onMouseEnter: (e) => {
                                e.currentTarget.style.borderColor = '#10b981';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' } },
                                React.createElement('div', { style: { fontSize: '2.5rem' } }, '📖'),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' } }, 
                                        'Foundation Modules'
                                    ),
                                    React.createElement('p', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                        'Essential knowledge for beginners'
                                    )
                                )
                            ),
                            
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                'Master the basics: diagnostic features, spore prints, safety, terminology, and Arizona families'
                            ),
                            
                            user ? 
                                React.createElement('div', null,
                                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } },
                                        React.createElement('span', { style: { fontSize: '0.875rem', color: '#059669', fontWeight: '500' } }, 
                                            `${completedModules}/5 Complete`
                                        ),
                                        React.createElement('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                            '~20 min each'
                                        )
                                    ),
                                    // Progress bar
                                    React.createElement('div', { 
                                        style: { 
                                            marginBottom: '1rem',
                                            height: '6px', 
                                            backgroundColor: '#e5e7eb', 
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        } 
                                    },
                                        React.createElement('div', {
                                            style: {
                                                width: `${progressPercentage}%`,
                                                height: '100%',
                                                backgroundColor: '#10b981',
                                                borderRadius: '3px',
                                                transition: 'width 0.3s'
                                            }
                                        })
                                    ),
                                    // Achievement badges
                                    completedModules > 0 && React.createElement('div', { style: { display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' } },
                                        completedModules >= 1 && React.createElement('span', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                backgroundColor: '#dcfce7', 
                                                color: '#059669',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '0.25rem'
                                            } 
                                        }, '🎯 Started'),
                                        completedModules >= 3 && React.createElement('span', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                backgroundColor: '#fef3c7', 
                                                color: '#d97706',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '0.25rem'
                                            } 
                                        }, '🚀 Progress'),
                                        completedModules === 5 && React.createElement('span', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                backgroundColor: '#f3e8ff', 
                                                color: '#7c3aed',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '0.25rem'
                                            } 
                                        }, '👑 Master')
                                    )
                                ) :
                                React.createElement('div', { style: { fontSize: '0.75rem', color: '#f59e0b' } }, 
                                    '🔒 Sign in to access training modules'
                                )
                        ),

                        // Advanced Modules Card (Coming Soon)
                        React.createElement('div', {
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px dashed #e5e7eb',
                                opacity: completedModules === 5 ? 1 : 0.6
                            }
                        },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' } },
                                React.createElement('div', { style: { fontSize: '2.5rem' } }, '🚧'),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' } }, 
                                        'Advanced Modules'
                                    ),
                                    React.createElement('p', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                        'Genus-specific and advanced techniques'
                                    )
                                )
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                'Deep dives into specific genera, microscopy, chemical testing, and advanced identification techniques'
                            ),
                            React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                completedModules === 5 ? 
                                    '🎉 Foundation complete! Advanced modules coming soon.' :
                                    `🔒 Complete foundation first (${5 - completedModules} modules remaining)`
                            )
                        )
                    )
                ),

                // Study Modes Section
                React.createElement('div', { style: { marginBottom: '2rem' } },
                    React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                        '📚 Study Modes'
                    ),
                    React.createElement('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                        'Practice identification with real specimens and progressive hints'
                    ),
                    
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' } },
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
                            onClick: () => user ? onStudyModeSelect('quick') : onAuthRequired(),
                            onMouseEnter: (e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '⚡'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Quick Study'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                '10 random specimens with progressive hints and detailed scoring'
                            ),
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } },
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#3b82f6', fontWeight: '500' } }, 
                                    `${approvedCount} Available`
                                ),
                                React.createElement('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                    '~15 min'
                                )
                            ),
                            React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } },
                                '• Fuzzy answer matching • Photo comparisons • Spore print hints • Progress tracking'
                            ),
                            !user && React.createElement('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                                '🔒 Sign in to track your progress'
                            )
                        ),

                        // Focused Study (Coming Soon)
                        React.createElement('div', {
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px dashed #e5e7eb',
                                opacity: 0.6
                            }
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎯'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Focused Study'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                'Filter by family, genus, or specific features for targeted practice'
                            ),
                            React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                'Coming in Phase 3 • Family filters • Genus selection • Feature-based study'
                            )
                        ),

                        // Marathon Mode (Coming Soon)
                        React.createElement('div', {
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px dashed #e5e7eb',
                                opacity: 0.6
                            }
                        },
                            React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🏃'),
                            React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                                'Marathon Mode'
                            ),
                            React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                                'Unlimited questions with spaced repetition and adaptive difficulty'
                            ),
                            React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                'Coming in Phase 3 • Spaced repetition • Adaptive hints • Performance analytics'
                            )
                        )
                    )
                ),

                // Database Statistics Section
                React.createElement('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }
                },
                    React.createElement('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' } }, 
                        '📊 Database Statistics'
                    ),
                    React.createElement('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' } },
                        'Flash Fungi contains a curated collection of Arizona mushroom specimens, each verified for accurate identification training.'
                    ),
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' } },
                        [
                            { label: 'Total Specimens', value: specimens.length, icon: '🔬', color: '#3b82f6' },
                            { label: 'DNA Verified', value: dnaCount, icon: '🧬', color: '#8b5cf6' },
                            { label: 'Arizona Families', value: new Set(specimens.map(s => s.family)).size, icon: '🏜️', color: '#f59e0b' },
                            { label: 'Species Available', value: new Set(specimens.map(s => s.species_name)).size, icon: '🍄', color: '#10b981' }
                        ].map((stat, idx) =>
                            React.createElement('div', {
                                key: idx,
                                style: {
                                    textAlign: 'center',
                                    padding: '1rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '0.5rem',
                                    border: `2px solid ${stat.color}20`
                                }
                            },
                                React.createElement('div', { style: { fontSize: '1.5rem', marginBottom: '0.25rem' } }, stat.icon),
                                React.createElement('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: stat.color } }, stat.value),
                                React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, stat.label)
                            )
                        )
                    ),
                    
                    // Quality indicators
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
    
    console.log('✅ Enhanced HomePage component loaded');
    
})();