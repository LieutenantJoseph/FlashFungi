// MarathonMode.js - Updated with Living Mycology Dark Theme
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
        MARATHON: 'linear-gradient(135deg, #D4A574 0%, #E5B085 50%, #C49564 100%)'
    };
    
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
        return React.createElement('div', { 
            style: { 
                minHeight: '100vh', 
                backgroundColor: COLORS.BG_PRIMARY 
            } 
        },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: COLORS.BG_CARD, 
                    borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}`, 
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
                                color: COLORS.TEXT_SECONDARY,
                                transition: 'color 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.color = COLORS.TEXT_PRIMARY,
                            onMouseLeave: (e) => e.target.style.color = COLORS.TEXT_SECONDARY
                        }, '← Back'),
                        React.createElement('div', null,
                            React.createElement('h1', { 
                                style: { 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, '🏃 Marathon Mode'),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem', 
                                    color: COLORS.TEXT_SECONDARY
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
                        backgroundColor: COLORS.BG_CARD, 
                        borderRadius: '0.75rem', 
                        padding: '2rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                        textAlign: 'center'
                    } 
                },
                    React.createElement('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🏃‍♂️'),
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '2rem', 
                            fontWeight: 'bold', 
                            marginBottom: '1rem',
                            color: COLORS.TEXT_PRIMARY
                        } 
                    }, 'Ready for the Marathon?'),
                    React.createElement('p', { 
                        style: { 
                            fontSize: '1.125rem', 
                            color: COLORS.TEXT_SECONDARY,
                            marginBottom: '2rem',
                            maxWidth: '600px',
                            margin: '0 auto 2rem auto'
                        } 
                    }, 'Test your endurance with unlimited questions. The algorithm adapts to show you specimens you need to practice most.'),
                    
                    // Features Grid
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
                                    backgroundColor: COLORS.BG_PRIMARY,
                                    borderRadius: '0.5rem',
                                    textAlign: 'center',
                                    border: `1px solid ${COLORS.BORDER_DEFAULT}`,
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e) => {
                                    e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                                    e.currentTarget.style.borderColor = COLORS.BORDER_HOVER;
                                },
                                onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = COLORS.BG_PRIMARY;
                                    e.currentTarget.style.borderColor = COLORS.BORDER_DEFAULT;
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
                                        marginBottom: '0.25rem',
                                        color: COLORS.TEXT_PRIMARY
                                    } 
                                }, feature.title),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.875rem', 
                                        color: COLORS.TEXT_MUTED
                                    } 
                                }, feature.desc)
                            )
                        )
                    ),
                    
                    // Database Stats
                    React.createElement('div', {
                        style: {
                            background: GRADIENTS.MARATHON,
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '2rem',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }
                    },
                        React.createElement('h4', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '0.5rem',
                                color: '#FFFFFF'
                            } 
                        }, '📊 Available for Marathon'),
                        React.createElement('div', { 
                            style: { 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                                gap: '1rem' 
                            } 
                        },
                            [
                                { label: 'Total Species', value: specimens.filter(s => s.status === 'approved').length },
                                { label: 'DNA Verified', value: specimens.filter(s => s.dna_sequenced).length },
                                { label: 'With Hints', value: specimens.filter(s => s.species_hints && s.species_hints.hints && s.species_hints.hints.length > 0).length }
                            ].map((stat, idx) =>
                                React.createElement('div', {
                                    key: idx,
                                    style: { textAlign: 'center' }
                                },
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '1.5rem', 
                                            fontWeight: 'bold',
                                            color: '#FFFFFF'
                                        } 
                                    }, stat.value),
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.9)'
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
                            background: GRADIENTS.SUNSET,
                            color: 'white',
                            borderRadius: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1.25rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.2s'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
                        }
                    }, '🏃‍♂️ Start Marathon Mode'),
                    
                    React.createElement('p', { 
                        style: { 
                            fontSize: '0.75rem', 
                            color: COLORS.TEXT_MUTED,
                            marginTop: '1rem' 
                        } 
                    }, 'Pro tip: Marathon mode is best after completing foundation training modules')
                )
            )
        );
    };
    
    console.log('✅ MarathonMode component loaded with dark theme');
    
})();