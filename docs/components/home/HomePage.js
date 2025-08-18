// HomePage.js - Home Page Component (Fixed)

function HomePage(props) {
    const specimens = props.specimens || [];
    const user = props.user;
    const userProgress = props.userProgress || {};
    const onStudyModeSelect = props.onStudyModeSelect;
    const onAuthRequired = props.onAuthRequired;
    const onSignOut = props.onSignOut;
    
    const approvedCount = specimens.filter(s => s.status === 'approved').length;
    const dnaCount = specimens.filter(s => s.dna_sequenced).length;
    
    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header
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
                                h('span', { style: { color: '#6b7280' } }, `Hello, ${user.display_name || user.username || 'User'}`),
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
            // Welcome section
            h('div', {
                style: {
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }
            },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                    '🍄 Modular Flash Fungi is Active!'
                ),
                h('p', { style: { marginBottom: '1rem' } }, 'Components loaded successfully - your educational system is ready'),
                h('div', { style: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' } },
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `📊 ${specimens.length} Specimens`
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `✅ ${approvedCount} Approved`
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `🧬 ${dnaCount} DNA Verified`
                    )
                )
            ),

            // Study Modes
            h('div', { style: { marginBottom: '2rem' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '📚 Study Modes'
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' } },
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
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem' } }, 
                            '10 random specimens with progressive hints'
                        ),
                        !user && h('p', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                            '🔒 Sign in to play'
                        )
                    )
                )
            ),

            // Component Status
            h('div', {
                style: {
                    backgroundColor: '#f0f9ff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: '1px solid #0369a1'
                }
            },
                h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0369a1' } }, 
                    '🔧 Modular System Status'
                ),
                h('p', { style: { color: '#1e40af', marginBottom: '1rem' } }, 
                    'Flash Fungi is now running with modular components! Each feature loads independently for better performance.'
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' } },
                    [
                        { label: 'Components Loaded', value: window.componentLoadTracker?.loaded?.length || 0, icon: '⚡' },
                        { label: 'Database Connection', value: specimens.length > 0 ? 'Active' : 'Checking', icon: '🔗' },
                        { label: 'Auth System', value: user ? 'Signed In' : 'Ready', icon: '🔐' },
                        { label: 'Study Modes', value: 'Available', icon: '📚' }
                    ].map((stat, idx) =>
                        h('div', {
                            key: idx,
                            style: {
                                textAlign: 'center',
                                padding: '1rem',
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                borderRadius: '0.5rem'
                            }
                        },
                            h('div', { style: { fontSize: '1.5rem', marginBottom: '0.25rem' } }, stat.icon),
                            h('div', { style: { fontSize: '1rem', fontWeight: 'bold', color: '#1f2937' } }, stat.value),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, stat.label)
                        )
                    )
                ),
                h('div', { style: { marginTop: '1rem', fontSize: '0.875rem', color: '#1e40af' } },
                    'Open browser console to see detailed component loading status.'
                )
            )
        )
    );
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HomePage };
} else {
    window.HomePage = HomePage;
}