(function() {
    'use strict';
    
    window.MarathonMode = function MarathonMode(props) {
        const specimens = props.specimens || [];
        const onBack = props.onBack;
        
        // State
        const [sessionStarted, setSessionStarted] = React.useState(false);
        const [sessionStats, setSessionStats] = React.useState({
            questionsAnswered: 0,
            correctAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageScore: 0,
            sessionTime: 0
        });
        
        const handleStartMarathon = () => {
            setSessionStarted(true);
        };
        
        const handleBackToSetup = () => {
            setSessionStarted(false);
        };
        
        if (sessionStarted) {
            return React.createElement(window.SharedFlashcard, {
                ...props,
                mode: 'marathon',
                onBack: handleBackToSetup
            });
        }
        
        // Marathon Mode Setup Screen
        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: 'white', 
                    borderBottom: '1px solid #e5e7eb', 
                    padding: '1rem' 
                } 
            },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
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
                                fontSize: '1rem',
                                color: '#6b7280'
                            } 
                        }, '← Back'),
                        React.createElement('div', null,
                            React.createElement('h1', { 
                                style: { 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold' 
                                } 
                            }, '🏃 Marathon Mode'),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem', 
                                    color: '#6b7280' 
                                } 
                            }, 'Unlimited study with spaced repetition')
                        )
                    )
                )
            ),
            
            // Main Content
            React.createElement('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto', 
                    padding: '2rem' 
                } 
            },
                React.createElement('div', { 
                    style: { 
                        backgroundColor: 'white', 
                        borderRadius: '0.75rem', 
                        padding: '2rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    } 
                },
                    React.createElement('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🏃‍♂️'),
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '2rem', 
                            fontWeight: 'bold', 
                            marginBottom: '1rem' 
                        } 
                    }, 'Ready for the Marathon?'),
                    React.createElement('p', { 
                        style: { 
                            fontSize: '1.125rem', 
                            color: '#6b7280', 
                            marginBottom: '2rem',
                            maxWidth: '600px',
                            margin: '0 auto 2rem auto'
                        } 
                    }, 'Test your endurance with unlimited questions. The algorithm adapts to show you specimens you need to practice most.'),
                    
                    // Features
                    React.createElement('div', { 
                        style: { 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '1rem',
                            marginBottom: '2rem'
                        } 
                    },
                        [
                            { icon: '🔄', title: 'Spaced Repetition', desc: 'Focuses on your weak areas' },
                            { icon: '📈', title: 'Live Stats', desc: 'Track progress in real-time' },
                            { icon: '🎯', title: 'Adaptive Difficulty', desc: 'Questions get smarter' },
                            { icon: '⏱️', title: 'No Time Limit', desc: 'Study at your own pace' }
                        ].map((feature, idx) =>
                            React.createElement('div', {
                                key: idx,
                                style: {
                                    padding: '1rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '0.5rem',
                                    textAlign: 'center'
                                }
                            },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem', 
                                        marginBottom: '0.5rem' 
                                    } 
                                }, feature.icon),
                                React.createElement('h3', { 
                                    style: { 
                                        fontWeight: '600', 
                                        marginBottom: '0.25rem' 
                                    } 
                                }, feature.title),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.875rem', 
                                        color: '#6b7280' 
                                    } 
                                }, feature.desc)
                            )
                        )
                    ),
                    
                    // Database Stats
                    React.createElement('div', {
                        style: {
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #3b82f6',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '2rem'
                        }
                    },
                        React.createElement('h4', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '0.5rem',
                                color: '#1e40af'
                            } 
                        }, '📊 Available for Marathon'),
                        React.createElement('div', { 
                            style: { 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                                gap: '1rem',
                                textAlign: 'center'
                            } 
                        },
                            [
                                { label: 'Total', value: specimens.filter(s => s.status === 'approved').length },
                                { label: 'DNA Verified', value: specimens.filter(s => s.dna_sequenced && s.status === 'approved').length },
                                { label: 'Families', value: new Set(specimens.filter(s => s.status === 'approved').map(s => s.family)).size },
                                { label: 'Genera', value: new Set(specimens.filter(s => s.status === 'approved').map(s => s.genus)).size }
                            ].map((stat, idx) =>
                                React.createElement('div', { key: idx },
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '1.5rem', 
                                            fontWeight: 'bold',
                                            color: '#1e40af'
                                        } 
                                    }, stat.value),
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '0.75rem', 
                                            color: '#6b7280' 
                                        } 
                                    }, stat.label)
                                )
                            )
                        )
                    ),
                    
                    // Start Button
                    React.createElement('button', {
                        onClick: handleStartMarathon,
                        style: {
                            padding: '1rem 3rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            borderRadius: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1.25rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.backgroundColor = '#d97706';
                            e.target.style.transform = 'translateY(-2px)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.backgroundColor = '#f59e0b';
                            e.target.style.transform = 'translateY(0)';
                        }
                    }, '🏃‍♂️ Start Marathon Mode'),
                    
                    React.createElement('p', { 
                        style: { 
                            fontSize: '0.75rem', 
                            color: '#6b7280', 
                            marginTop: '1rem' 
                        } 
                    }, 'Pro tip: Marathon mode is best after completing foundation training modules')
                )
            )
        );
    };
    
    console.log('✅ MarathonMode component loaded');
    
})();