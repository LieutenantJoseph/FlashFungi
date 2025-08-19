// TrainingModules.js - Complete Training Modules System
// Flash Fungi - Structured learning modules with progress tracking

(function() {
    'use strict';
    
    window.TrainingModules = function TrainingModules({ onBack, onModuleSelect, userProgress, user }) {
        const [selectedCategory, setSelectedCategory] = React.useState('foundation');
        
        // Foundation modules data
        const foundationModules = [
            {
                id: 'foundation-1',
                title: 'Basic Diagnostic Features',
                description: 'Learn to identify key mushroom parts: cap, stem, gills, and spores',
                duration: '20 min',
                difficulty: 'Beginner',
                icon: '🔬',
                completed: userProgress['foundation-1']?.completed || false
            },
            {
                id: 'foundation-2',
                title: 'Spore Print Basics',
                description: 'Master the essential skill of collecting and interpreting spore prints',
                duration: '15 min',
                difficulty: 'Beginner',
                icon: '🎨',
                completed: userProgress['foundation-2']?.completed || false
            },
            {
                id: 'foundation-3',
                title: 'Safety First: Deadly Species',
                description: 'Critical knowledge about poisonous mushrooms in Arizona',
                duration: '25 min',
                difficulty: 'Beginner',
                icon: '⚠️',
                completed: userProgress['foundation-3']?.completed || false
            },
            {
                id: 'foundation-4',
                title: 'Mycological Terminology',
                description: 'Essential vocabulary for accurate mushroom identification',
                duration: '18 min',
                difficulty: 'Beginner',
                icon: '📚',
                completed: userProgress['foundation-4']?.completed || false
            },
            {
                id: 'foundation-5',
                title: 'Arizona Fungal Families',
                description: 'Overview of major mushroom families found in Arizona',
                duration: '22 min',
                difficulty: 'Beginner',
                icon: '🌵',
                completed: userProgress['foundation-5']?.completed || false
            }
        ];

        const handleStartModule = (module) => {
            onModuleSelect(module);
        };

        const completedCount = foundationModules.filter(m => m.completed).length;

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header
            React.createElement('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        React.createElement('button', { 
                            onClick: onBack, 
                            style: { 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontSize: '1rem',
                                color: '#6b7280'
                            } 
                        }, '← Back'),
                        React.createElement('div', null,
                            React.createElement('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, '🎓 Training Modules'),
                            React.createElement('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                                'Build your foundation with structured lessons'
                            )
                        )
                    )
                )
            ),

            // Main Content
            React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                // Progress overview
                React.createElement('div', {
                    style: {
                        background: 'linear-gradient(to right, #10b981, #059669)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }
                },
                    React.createElement('h2', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                        'Your Learning Progress'
                    ),
                    React.createElement('p', { style: { marginBottom: '1rem', opacity: 0.9 } }, 
                        `Welcome, ${user?.display_name || user?.username || 'Learner'}! Complete foundation modules to unlock advanced features.`
                    ),
                    React.createElement('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } },
                        React.createElement('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `📊 ${completedCount}/5 Complete`
                        ),
                        React.createElement('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `⏱️ ~90 min total`
                        ),
                        React.createElement('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `🎯 ${Math.round((completedCount / 5) * 100)}% Progress`
                        )
                    ),
                    
                    // Progress bar
                    React.createElement('div', { 
                        style: { 
                            marginTop: '1rem', 
                            height: '8px', 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                        } 
                    },
                        React.createElement('div', {
                            style: {
                                width: `${(completedCount / 5) * 100}%`,
                                height: '100%',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                borderRadius: '4px',
                                transition: 'width 0.3s ease'
                            }
                        })
                    )
                ),

                // Foundation Modules Grid
                React.createElement('div', null,
                    React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                        '📖 Foundation Modules'
                    ),
                    React.createElement('p', { style: { color: '#6b7280', marginBottom: '1.5rem' } }, 
                        'Essential knowledge for safe and accurate mushroom identification'
                    ),
                    
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' } },
                        foundationModules.map((module, idx) =>
                            React.createElement('div', {
                                key: module.id,
                                style: {
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                    border: `2px solid ${module.completed ? '#10b981' : 'transparent'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                },
                                onClick: () => handleStartModule(module),
                                onMouseEnter: (e) => {
                                    if (!module.completed) {
                                        e.currentTarget.style.borderColor = '#10b981';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                },
                                onMouseLeave: (e) => {
                                    if (!module.completed) {
                                        e.currentTarget.style.borderColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }
                            },
                                // Completion indicator
                                module.completed && React.createElement('div', {
                                    style: {
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
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

                                // Module number badge
                                React.createElement('div', {
                                    style: {
                                        position: 'absolute',
                                        top: '1rem',
                                        left: '1rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }
                                }, idx + 1),

                                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', marginTop: '1rem' } },
                                    React.createElement('div', { style: { fontSize: '2.5rem' } }, module.icon),
                                    React.createElement('div', { style: { flex: 1 } },
                                        React.createElement('h4', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' } }, 
                                            module.title
                                        ),
                                        React.createElement('div', { style: { display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' } },
                                            React.createElement('span', null, module.duration),
                                            React.createElement('span', null, '•'),
                                            React.createElement('span', null, module.difficulty)
                                        )
                                    )
                                ),
                                
                                React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' } }, 
                                    module.description
                                ),
                                
                                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                    React.createElement('span', { 
                                        style: { 
                                            fontSize: '0.75rem', 
                                            color: module.completed ? '#059669' : '#6b7280',
                                            fontWeight: module.completed ? '600' : '400',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        } 
                                    }, 
                                        module.completed ? 
                                            [React.createElement('span', { key: 'icon' }, '✅'), 'Completed'] : 
                                            [React.createElement('span', { key: 'icon' }, '⭕'), 'Not Started']
                                    ),
                                    React.createElement('button', {
                                        style: {
                                            padding: '0.5rem 1rem',
                                            backgroundColor: module.completed ? '#059669' : '#3b82f6',
                                            color: 'white',
                                            borderRadius: '0.375rem',
                                            border: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        },
                                        onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = module.completed ? '#047857' : '#2563eb';
                                        },
                                        onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = module.completed ? '#059669' : '#3b82f6';
                                        }
                                    }, module.completed ? 'Review' : 'Start')
                                )
                            )
                        )
                    )
                ),

                // Achievement Section
                completedCount > 0 && React.createElement('div', { 
                    style: { 
                        marginTop: '3rem', 
                        padding: '2rem', 
                        backgroundColor: '#f0f9ff', 
                        borderRadius: '0.75rem', 
                        border: '1px solid #0ea5e9' 
                    } 
                },
                    React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0369a1' } }, 
                        '🏆 Your Achievements'
                    ),
                    React.createElement('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } },
                        completedCount >= 1 && React.createElement('div', { 
                            style: { 
                                padding: '0.5rem 1rem', 
                                backgroundColor: '#dcfce7', 
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            } 
                        },
                            React.createElement('span', null, '🎯'),
                            React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '500' } }, 'First Steps')
                        ),
                        completedCount >= 3 && React.createElement('div', { 
                            style: { 
                                padding: '0.5rem 1rem', 
                                backgroundColor: '#fef3c7', 
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            } 
                        },
                            React.createElement('span', null, '🚀'),
                            React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '500' } }, 'Making Progress')
                        ),
                        completedCount === 5 && React.createElement('div', { 
                            style: { 
                                padding: '0.5rem 1rem', 
                                backgroundColor: '#f3e8ff', 
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            } 
                        },
                            React.createElement('span', null, '👑'),
                            React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '500' } }, 'Foundation Master')
                        )
                    )
                ),

                // Coming Soon Section
                React.createElement('div', { style: { marginTop: '3rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' } },
                    React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#64748b' } }, 
                        '🚧 Coming Soon'
                    ),
                    React.createElement('p', { style: { color: '#64748b', marginBottom: '1rem' } }, 
                        `Advanced modules will be unlocked as you complete the foundation${completedCount === 5 ? ' (All foundation modules complete!)' : ` (${5 - completedCount} modules remaining)`}`
                    ),
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' } },
                        [
                            { title: 'Genus-Specific Modules', icon: '🧬', desc: 'Deep dives into Agaricus, Boletus, etc.' },
                            { title: 'Advanced Techniques', icon: '🔬', desc: 'Microscopy and chemical testing' },
                            { title: 'Regional Specialties', icon: '🏜️', desc: 'Desert and mountain ecosystems' },
                            { title: 'Chemical Testing', icon: '⚗️', desc: 'KOH, Melzer\'s, and other reagents' }
                        ].map((item, idx) =>
                            React.createElement('div', {
                                key: idx,
                                style: {
                                    padding: '1rem',
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    textAlign: 'center',
                                    opacity: completedCount === 5 ? 1 : 0.5,
                                    border: completedCount === 5 ? '1px solid #10b981' : '1px solid #e5e7eb'
                                }
                            },
                                React.createElement('div', { style: { fontSize: '1.5rem', marginBottom: '0.5rem' } }, item.icon),
                                React.createElement('p', { style: { fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' } }, item.title),
                                React.createElement('p', { style: { fontSize: '0.75rem', color: '#64748b' } }, item.desc)
                            )
                        )
                    ),
                    completedCount === 5 && React.createElement('div', {
                        style: {
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: '#dcfce7',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                        }
                    },
                        React.createElement('p', { style: { color: '#059669', fontWeight: '600' } },
                            '🎉 Congratulations! You\'ve completed all foundation modules. Advanced content coming soon!'
                        )
                    )
                )
            )
        );
    };
    
    console.log('✅ Complete TrainingModules component loaded');
    
})();