// HomePage.js - Living Mycology Design System
// Flash Fungi - Modern, nature-inspired home page with enhanced functionality

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
        
        const design = window.FLASH_FUNGI_DESIGN || {};
        
        // Calculate statistics
        const approvedCount = specimens.filter(s => s.status === 'approved' || s.quality_grade === 'research').length;
        const dnaCount = specimens.filter(s => s.dna_sequenced).length;
        const speciesWithHints = props.speciesWithHints || 0;
        
        // Calculate training progress
        const completedModules = Object.values(userProgress).filter(p => p.completed).length;
        const totalModules = 5;
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
        
        // Animation state
        const [isLoaded, setIsLoaded] = React.useState(false);
        React.useEffect(() => {
            setTimeout(() => setIsLoaded(true), 100);
        }, []);

        return React.createElement('div', { 
            style: { 
                minHeight: '100vh',
                background: design.colors?.bgPrimary || '#1A1A19',
                color: design.colors?.textPrimary || '#F5F5DC',
                position: 'relative',
                overflow: 'hidden'
            } 
        },
            // Organic background pattern
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 10% 20%, rgba(139,69,19,0.15) 0%, transparent 40%),
                        radial-gradient(circle at 80% 80%, rgba(34,139,34,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 90% 10%, rgba(210,105,30,0.1) 0%, transparent 40%)
                    `,
                    pointerEvents: 'none',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 1s ease-out'
                }
            }),
            
            // Main Content
            React.createElement('div', { style: { position: 'relative', zIndex: 2 } },
                // Compact Header with integrated navigation
                React.createElement('header', { 
                    style: { 
                        background: `linear-gradient(180deg, ${design.colors?.bgSecondary || '#2D2D2A'} 0%, transparent 100%)`,
                        padding: '1rem 1.5rem',
                        borderBottom: `1px solid rgba(139,69,19,0.2)`
                    } 
                },
                    React.createElement('div', { 
                        style: { 
                            maxWidth: '1400px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: window.innerWidth > 768 ? 'auto 1fr auto' : '1fr auto',
                            alignItems: 'center',
                            gap: '1.5rem'
                        } 
                    },
                        // Logo & Title (more compact)
                        React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transform: isLoaded ? 'translateX(0)' : 'translateX(-20px)',
                                opacity: isLoaded ? 1 : 0,
                                transition: 'all 0.5s ease-out'
                            } 
                        },
                            React.createElement('div', { 
                                style: { 
                                    fontSize: '2rem',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                } 
                            }, '🍄'),
                            React.createElement('div', null,
                                React.createElement('h1', { 
                                    style: { 
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        letterSpacing: '-0.02em'
                                    } 
                                }, 'Flash Fungi'),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.625rem',
                                        color: design.colors?.textMuted || '#A8A89C',
                                        marginTop: '0.125rem',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        display: window.innerWidth > 480 ? 'block' : 'none'
                                    } 
                                }, 'Master Mushrooms in Minutes a Day')
                            )
                        ),
                        
                        // Live Stats Bar (hide on mobile)
                        window.innerWidth > 768 && React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isLoaded ? 1 : 0,
                                transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'all 0.5s ease-out 0.2s'
                            } 
                        },
                            [
                                { value: approvedCount, label: 'Specimens', icon: '🔬' },
                                { value: dnaCount, label: 'DNA', icon: '🧬' },
                                { value: speciesWithHints, label: 'Species', icon: '📚' },
                                { value: `${progressPercentage}%`, label: 'Progress', icon: '📈' }
                            ].map((stat, index) => 
                                React.createElement('div', { 
                                    key: index,
                                    style: { 
                                        textAlign: 'center',
                                        padding: '0.375rem 0.75rem',
                                        background: design.colors?.bgCard || '#2A2826',
                                        borderRadius: design.radius?.sm || '0.5rem',
                                        border: '1px solid rgba(139,69,19,0.15)',
                                        minWidth: '80px',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    },
                                    onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.borderColor = design.colors?.primary || '#8B4513';
                                    },
                                    onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = 'rgba(139,69,19,0.15)';
                                    }
                                },
                                    React.createElement('div', { style: { fontSize: '1rem', marginBottom: '0.125rem' } }, stat.icon),
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            color: design.colors?.textPrimary || '#F5F5DC'
                                        } 
                                    }, stat.value),
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '0.5rem',
                                            color: design.colors?.textMuted || '#A8A89C',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        } 
                                    }, stat.label)
                                )
                            )
                        ),
                        
                        // User Menu
                        React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                opacity: isLoaded ? 1 : 0,
                                transform: isLoaded ? 'translateX(0)' : 'translateX(20px)',
                                transition: 'all 0.5s ease-out 0.3s'
                            } 
                        },
                            user ? 
                                React.createElement(React.Fragment, null,
                                    React.createElement('button', {
                                        onClick: onProfileClick,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            background: design.colors?.bgCard || '#2A2826',
                                            border: '1px solid rgba(139,69,19,0.2)',
                                            borderRadius: design.radius?.md || '0.75rem',
                                            color: design.colors?.textPrimary || '#F5F5DC',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        },
                                        onMouseEnter: (e) => {
                                            e.currentTarget.style.background = design.colors?.bgTertiary || '#3A3A37';
                                            e.currentTarget.style.borderColor = design.colors?.primary || '#8B4513';
                                        },
                                        onMouseLeave: (e) => {
                                            e.currentTarget.style.background = design.colors?.bgCard || '#2A2826';
                                            e.currentTarget.style.borderColor = 'rgba(139,69,19,0.2)';
                                        }
                                    },
                                        React.createElement('span', { style: { fontSize: '1.25rem' } }, '👤'),
                                        React.createElement('span', { style: { fontSize: '0.875rem', fontWeight: '600' } }, 
                                            user.email?.split('@')[0] || 'Profile'
                                        )
                                    ),
                                    React.createElement('button', {
                                        onClick: onSignOut,
                                        style: {
                                            padding: '0.5rem',
                                            background: 'transparent',
                                            border: '1px solid rgba(139,69,19,0.2)',
                                            borderRadius: design.radius?.md || '0.75rem',
                                            color: design.colors?.textMuted || '#A8A89C',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        },
                                        onMouseEnter: (e) => {
                                            e.currentTarget.style.borderColor = design.colors?.accent || '#FF6B35';
                                            e.currentTarget.style.color = design.colors?.accent || '#FF6B35';
                                        },
                                        onMouseLeave: (e) => {
                                            e.currentTarget.style.borderColor = 'rgba(139,69,19,0.2)';
                                            e.currentTarget.style.color = design.colors?.textMuted || '#A8A89C';
                                        }
                                    }, '↪')
                                ) :
                                React.createElement('button', {
                                    onClick: onAuthRequired,
                                    className: 'btn btn-primary',
                                    style: {
                                        padding: '0.625rem 1.5rem',
                                        background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                        border: 'none',
                                        borderRadius: design.radius?.md || '0.75rem',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)',
                                        transition: 'all 0.3s ease'
                                    },
                                    onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = design.shadows?.lg || '0 8px 32px rgba(0,0,0,0.5)';
                                    },
                                    onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)';
                                    }
                                }, 'Sign In')
                        )
                    )
                ),
                
                // Main Content Area
                React.createElement('main', { 
                    style: { 
                        maxWidth: '1400px',
                        margin: '0 auto',
                        padding: '2rem 1.5rem'
                    } 
                },
                    // Training Progress Section (if user is logged in)
                    user && React.createElement('div', { 
                        style: { 
                            marginBottom: '2rem',
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.5s ease-out 0.4s'
                        } 
                    },
                        React.createElement('div', { 
                            className: 'fungi-card',
                            style: {
                                background: `linear-gradient(135deg, ${design.colors?.bgCard || '#2A2826'} 0%, ${design.colors?.bgTertiary || '#3A3A37'} 100%)`,
                                padding: '1.5rem',
                                borderRadius: design.radius?.lg || '1rem',
                                border: '1px solid rgba(139,69,19,0.2)',
                                boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)'
                            }
                        },
                            React.createElement('div', { 
                                style: { 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem'
                                } 
                            },
                                React.createElement('h2', { 
                                    style: { 
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    } 
                                },
                                    React.createElement('span', { style: { fontSize: '1.5rem' } }, '🎯'),
                                    'Your Learning Journey'
                                ),
                                React.createElement('span', { 
                                    style: { 
                                        fontSize: '2rem',
                                        fontWeight: '700',
                                        background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    } 
                                }, `${progressPercentage}%`)
                            ),
                            React.createElement('div', { 
                                className: 'progress-bar',
                                style: { 
                                    height: '10px',
                                    background: design.colors?.bgSecondary || '#2D2D2A',
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    overflow: 'hidden',
                                    marginBottom: '1rem'
                                } 
                            },
                                React.createElement('div', { 
                                    className: 'progress-fill',
                                    style: { 
                                        width: `${progressPercentage}%`,
                                        height: '100%',
                                        background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                        transition: 'width 1s ease-out',
                                        position: 'relative'
                                    } 
                                },
                                    React.createElement('div', {
                                        style: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                            animation: 'shimmer 2s infinite'
                                        }
                                    })
                                )
                            ),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    color: design.colors?.textSecondary || '#D3D3C7'
                                } 
                            }, `${completedModules} of ${totalModules} foundation modules completed`)
                        )
                    ),
                    
                    // Action Cards Grid - Updated layout for Training Modules prominence
                    React.createElement('div', { 
                        style: { 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem',
                            marginBottom: '3rem'
                        } 
                    },
                        // Study Modes - First Row (3 cards)
                        [
                            {
                                title: 'Quick Study',
                                icon: '⚡',
                                description: 'Rapid-fire identification practice',
                                stats: 'Study 10 species in 5 minutes',
                                gradient: design.gradients?.earth,
                                action: () => onStudyModeSelect('quick'),
                                delay: '0.5s'
                            },
                            {
                                title: 'Focused Study',
                                icon: '🎯',
                                description: 'Target specific families & genera',
                                stats: 'Deep dive into diagnostics',
                                gradient: design.gradients?.forest,
                                action: () => onStudyModeSelect('focused'),
                                delay: '0.6s'
                            },
                            {
                                title: 'Marathon Mode',
                                icon: '🏃',
                                description: 'Endless practice session',
                                stats: 'Build streaks & endurance',
                                gradient: design.gradients?.accent,
                                action: () => onStudyModeSelect('marathon'),
                                delay: '0.7s'
                            }
                        ].map((mode, index) => 
                            React.createElement('div', {
                                key: index,
                                className: 'fungi-card',
                                onClick: mode.action,
                                style: {
                                    background: design.colors?.bgCard || '#2A2826',
                                    padding: '1.5rem',
                                    borderRadius: design.radius?.lg || '1rem',
                                    border: '1px solid rgba(139,69,19,0.2)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    opacity: isLoaded ? 1 : 0,
                                    transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                                    transition: `all 0.5s ease-out ${mode.delay}`,
                                    boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)'
                                },
                                onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = design.shadows?.lg || '0 8px 32px rgba(0,0,0,0.5)';
                                    e.currentTarget.querySelector('.card-gradient').style.opacity = '1';
                                },
                                onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)';
                                    e.currentTarget.querySelector('.card-gradient').style.opacity = '0';
                                }
                            },
                                // Gradient overlay
                                React.createElement('div', {
                                    className: 'card-gradient',
                                    style: {
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: mode.gradient || design.gradients?.earth,
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease'
                                    }
                                }),
                                
                                React.createElement('div', { 
                                    style: { 
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1rem',
                                        marginBottom: '1rem'
                                    } 
                                },
                                    React.createElement('span', { 
                                        style: { 
                                            fontSize: '2.5rem',
                                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                        } 
                                    }, mode.icon),
                                    React.createElement('div', { style: { flex: 1 } },
                                        React.createElement('h3', { 
                                            style: { 
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                marginBottom: '0.25rem',
                                                color: design.colors?.textPrimary || '#F5F5DC'
                                            } 
                                        }, mode.title),
                                        React.createElement('p', { 
                                            style: { 
                                                fontSize: '0.875rem',
                                                color: design.colors?.textSecondary || '#D3D3C7',
                                                lineHeight: '1.4'
                                            } 
                                        }, mode.description)
                                    )
                                ),
                                
                                React.createElement('div', { 
                                    style: { 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid rgba(139,69,19,0.1)'
                                    } 
                                },
                                    React.createElement('span', { 
                                        style: { 
                                            fontSize: '0.75rem',
                                            color: design.colors?.textMuted || '#A8A89C',
                                            fontWeight: '600',
                                            letterSpacing: '0.025em'
                                        } 
                                    }, mode.stats),
                                    React.createElement('span', { 
                                        style: { 
                                            fontSize: '1.25rem',
                                            color: design.colors?.primary || '#8B4513',
                                            transition: 'transform 0.3s ease'
                                        } 
                                    }, '→')
                                )
                            )
                        )
                    ),
                    
                    // Training Modules - Prominent Section
                    React.createElement('div', { 
                        style: { 
                            marginBottom: '3rem',
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.5s ease-out 0.8s'
                        } 
                    },
                        React.createElement('div', {
                            onClick: () => onTrainingModuleSelect('foundation-1'),
                            style: {
                                background: `linear-gradient(135deg, ${design.colors?.bgCard || '#2A2826'} 0%, ${design.colors?.bgTertiary || '#3A3A37'} 100%)`,
                                padding: '2rem',
                                borderRadius: design.radius?.xl || '1.5rem',
                                border: '2px solid rgba(139,69,19,0.3)',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: design.shadows?.lg || '0 8px 32px rgba(0,0,0,0.5)',
                                transition: 'all 0.3s ease'
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(210,105,30,0.4)';
                                e.currentTarget.style.borderColor = design.colors?.primary || '#8B4513';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = design.shadows?.lg || '0 8px 32px rgba(0,0,0,0.5)';
                                e.currentTarget.style.borderColor = 'rgba(139,69,19,0.3)';
                            }
                        },
                            // Background pattern
                            React.createElement('div', {
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `
                                        radial-gradient(circle at 20% 50%, rgba(244,228,193,0.05) 0%, transparent 40%),
                                        radial-gradient(circle at 80% 20%, rgba(210,105,30,0.05) 0%, transparent 40%)
                                    `,
                                    pointerEvents: 'none'
                                }
                            }),
                            
                            React.createElement('div', { 
                                style: { 
                                    position: 'relative',
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr auto',
                                    alignItems: 'center',
                                    gap: '2rem'
                                } 
                            },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '4rem',
                                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                    } 
                                }, '📚'),
                                
                                React.createElement('div', null,
                                    React.createElement('h2', { 
                                        style: { 
                                            fontSize: '1.75rem',
                                            fontWeight: '700',
                                            marginBottom: '0.5rem',
                                            background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        } 
                                    }, 'Training Modules'),
                                    React.createElement('p', { 
                                        style: { 
                                            fontSize: '1rem',
                                            color: design.colors?.textSecondary || '#D3D3C7',
                                            marginBottom: '0.5rem'
                                        } 
                                    }, 'Structured learning paths from beginner to expert'),
                                    React.createElement('div', { 
                                        style: { 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem'
                                        } 
                                    },
                                        React.createElement('span', { 
                                            style: { 
                                                fontSize: '0.875rem',
                                                color: design.colors?.textMuted || '#A8A89C',
                                                fontWeight: '600'
                                            } 
                                        }, `${completedModules} of ${totalModules} foundation modules complete`),
                                        React.createElement('div', { 
                                            style: { 
                                                flex: 1,
                                                maxWidth: '200px',
                                                height: '6px',
                                                background: design.colors?.bgSecondary || '#2D2D2A',
                                                borderRadius: design.radius?.sm || '0.5rem',
                                                overflow: 'hidden'
                                            } 
                                        },
                                            React.createElement('div', { 
                                                style: { 
                                                    width: `${progressPercentage}%`,
                                                    height: '100%',
                                                    background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                                    transition: 'width 1s ease-out'
                                                } 
                                            })
                                        )
                                    )
                                ),
                                
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem',
                                        color: design.colors?.primary || '#8B4513',
                                        transition: 'transform 0.3s ease'
                                    } 
                                }, '→')
                            )
                        )
                    ),
                    
                    // Database Overview Section - Matching the provided layout
                    React.createElement('div', { 
                        style: { 
                            marginTop: '3rem',
                            paddingTop: '2rem',
                            borderTop: `1px solid rgba(139,69,19,0.2)`,
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.5s ease-out 1s'
                        } 
                    },
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            } 
                        },
                            React.createElement('span', { style: { fontSize: '1.5rem' } }, '📊'),
                            'Dataset Overview'
                        ),
                        
                        // Stats Grid
                        React.createElement('div', { 
                            style: { 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            } 
                        },
                            [
                                { icon: '🍄', value: approvedCount, label: 'Specimens', color: '#3B82F6' },
                                { icon: '🔬', value: dnaCount, label: 'DNA Verified', color: '#10B981' },
                                { icon: '💡', value: speciesWithHints, label: 'With Hints', color: '#F59E0B' },
                                { icon: '📍', value: 'Arizona', label: 'Geographic Focus', color: '#EF4444' }
                            ].map((stat, index) => 
                                React.createElement('div', { 
                                    key: index,
                                    style: { 
                                        textAlign: 'center',
                                        padding: '1rem',
                                        background: design.colors?.bgCard || '#2A2826',
                                        borderRadius: design.radius?.md || '0.75rem',
                                        border: '1px solid rgba(139,69,19,0.2)',
                                        transition: 'all 0.3s ease'
                                    },
                                    onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.borderColor = stat.color;
                                        e.currentTarget.style.boxShadow = `0 0 20px ${stat.color}30`;
                                    },
                                    onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = 'rgba(139,69,19,0.2)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                },
                                    React.createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, stat.icon),
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '1.75rem',
                                            fontWeight: '700',
                                            color: stat.color,
                                            marginBottom: '0.25rem'
                                        } 
                                    }, stat.value),
                                    React.createElement('div', { 
                                        style: { 
                                            fontSize: '0.75rem',
                                            color: design.colors?.textMuted || '#A8A89C',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        } 
                                    }, stat.label)
                                )
                            )
                        ),
                        
                        // Feature Badges
                        React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                justifyContent: 'center'
                            } 
                        },
                            [
                                { icon: '✅', label: 'Expert Verified' },
                                { icon: '📸', label: 'High-Quality Photos' },
                                { icon: '📍', label: 'Arizona Native' },
                                { icon: '🎓', label: 'Educational Purpose' }
                            ].map((badge, index) => 
                                React.createElement('div', { 
                                    key: index,
                                    style: { 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: design.colors?.bgSecondary || '#2D2D2A',
                                        borderRadius: design.radius?.sm || '0.5rem',
                                        border: '1px solid rgba(139,69,19,0.15)',
                                        fontSize: '0.875rem',
                                        color: design.colors?.textSecondary || '#D3D3C7',
                                        transition: 'all 0.3s ease'
                                    },
                                    onMouseEnter: (e) => {
                                        e.currentTarget.style.background = design.colors?.bgTertiary || '#3A3A37';
                                        e.currentTarget.style.borderColor = design.colors?.primary || '#8B4513';
                                    },
                                    onMouseLeave: (e) => {
                                        e.currentTarget.style.background = design.colors?.bgSecondary || '#2D2D2A';
                                        e.currentTarget.style.borderColor = 'rgba(139,69,19,0.15)';
                                    }
                                },
                                    React.createElement('span', null, badge.icon),
                                    React.createElement('span', null, badge.label)
                                )
                            )
                        )
                    )
                )
            ),
            
            // Floating animation styles (only for elements that need it)
            React.createElement('style', null, `
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `)
        );
    };
    
    console.log('✅ HomePage component loaded with Living Mycology design v2');
    
})();