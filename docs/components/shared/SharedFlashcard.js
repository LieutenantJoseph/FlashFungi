// SharedFlashcard.js - Living Mycology Design System
// Flash Fungi - Immersive flashcard experience with enhanced visuals

(function() {
    'use strict';
    
    window.SharedFlashcard = function SharedFlashcard(props) {
        const {
            specimens = [],
            mode = 'quick',
            filters = null,
            onBack,
            loadSpecimenPhotos,
            specimenPhotos = {},
            speciesHints = {},
            referencePhotos = {},
            user,
            saveProgress
        } = props;
        
        const design = window.FLASH_FUNGI_DESIGN || {};
        
        // State
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [userAnswer, setUserAnswer] = React.useState('');
        const [currentHintLevel, setCurrentHintLevel] = React.useState(0);
        const [hintsRevealedManually, setHintsRevealedManually] = React.useState(0);
        const [showResult, setShowResult] = React.useState(false);
        const [showGuide, setShowGuide] = React.useState(false);
        const [score, setScore] = React.useState({ correct: 0, total: 0, totalScore: 0 });
        const [lastAttemptScore, setLastAttemptScore] = React.useState(null);
        const [photosLoaded, setPhotosLoaded] = React.useState(false);
        const [selectedPhoto, setSelectedPhoto] = React.useState(null);
        const [streak, setStreak] = React.useState(0);
        const [longestStreak, setLongestStreak] = React.useState(0);
        const [sessionStartTime] = React.useState(Date.now());
        const [isFlipped, setIsFlipped] = React.useState(false);
        const [answerAnimation, setAnswerAnimation] = React.useState(null);

        // Get study specimens based on mode
        const studySpecimens = React.useMemo(() => {
            let filtered = specimens.filter(s => s.status === 'approved');
            
            if (mode === 'focused' && filters) {
                if (filters.family && filters.family.length > 0) {
                    filtered = filtered.filter(s => filters.family.includes(s.family));
                }
                if (filters.genus && filters.genus.length > 0) {
                    filtered = filtered.filter(s => filters.genus.includes(s.genus));
                }
                if (filters.difficulty) {
                    // Add difficulty filtering if needed
                }
            }
            
            // Shuffle for variety
            return filtered.sort(() => Math.random() - 0.5);
        }, [specimens, mode, filters]);

        const currentSpecimen = studySpecimens[currentIndex] || {};
        const currentPhotos = specimenPhotos[currentSpecimen.id] || [];
        const currentSpeciesHints = speciesHints[currentSpecimen.species] || {};
        const currentReferencePhotos = referencePhotos[currentSpecimen.species] || [];

        // Load photos when specimen changes
        React.useEffect(() => {
            if (currentSpecimen.id && loadSpecimenPhotos) {
                setPhotosLoaded(false);
                loadSpecimenPhotos(currentSpecimen.id).then(() => {
                    setPhotosLoaded(true);
                });
            }
        }, [currentSpecimen.id, loadSpecimenPhotos]);

        // Calculate accuracy
        const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
        
        // Session duration
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        const formatDuration = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        // Handle answer submission
        const handleSubmit = () => {
            if (!userAnswer.trim()) return;
            
            const isCorrect = window.checkMushroomAnswer(
                userAnswer, 
                currentSpecimen.species,
                currentSpecimen.common_name
            );
            
            const baseScore = isCorrect ? 100 : 0;
            const hintPenalty = Math.min(hintsRevealedManually * 20, 60);
            const finalScore = Math.max(baseScore - hintPenalty, 0);
            
            setLastAttemptScore({
                baseScore,
                hintPenalty,
                finalScore,
                isCorrect
            });
            
            setShowResult(true);
            setAnswerAnimation(isCorrect ? 'correct' : 'incorrect');
            
            if (isCorrect) {
                setScore(prev => ({
                    correct: prev.correct + 1,
                    total: prev.total + 1,
                    totalScore: prev.totalScore + finalScore
                }));
                setStreak(prev => {
                    const newStreak = prev + 1;
                    setLongestStreak(old => Math.max(old, newStreak));
                    return newStreak;
                });
            } else {
                setScore(prev => ({
                    ...prev,
                    total: prev.total + 1
                }));
                setStreak(0);
            }
            
            // Save progress
            if (user && saveProgress) {
                saveProgress({
                    mode,
                    score: finalScore,
                    correct: isCorrect,
                    specimen_id: currentSpecimen.id,
                    hints_used: hintsRevealedManually
                });
            }
            
            // Auto-advance for correct answers after delay
            if (isCorrect && mode !== 'marathon') {
                setTimeout(() => {
                    handleNext();
                }, 2000);
            }
        };

        // Handle next question
        const handleNext = () => {
            if (mode === 'marathon' || currentIndex < studySpecimens.length - 1) {
                setCurrentIndex(prev => (prev + 1) % studySpecimens.length);
                setUserAnswer('');
                setCurrentHintLevel(0);
                setHintsRevealedManually(0);
                setShowResult(false);
                setShowGuide(false);
                setIsFlipped(false);
                setAnswerAnimation(null);
                setLastAttemptScore(null);
            } else {
                // Study session complete
                handleComplete();
            }
        };

        // Handle session completion
        const handleComplete = () => {
            if (onBack) onBack();
        };

        // Handle hint reveal
        const handleRevealHint = () => {
            const maxHints = 3;
            if (currentHintLevel < maxHints) {
                setCurrentHintLevel(prev => prev + 1);
                setHintsRevealedManually(prev => prev + 1);
            }
        };

        // Keyboard shortcuts
        React.useEffect(() => {
            const handleKeyPress = (e) => {
                if (e.key === 'Enter' && !showResult) {
                    handleSubmit();
                } else if (e.key === 'Enter' && showResult) {
                    handleNext();
                } else if (e.key === 'h') {
                    handleRevealHint();
                } else if (e.key === 'Escape') {
                    onBack && onBack();
                }
            };
            
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }, [userAnswer, showResult, currentHintLevel]);

        // Touch gestures
        React.useEffect(() => {
            if (window.TouchGestures) {
                const cleanup = window.TouchGestures.init('flashcard-container', {
                    onSwipeLeft: handleNext,
                    onSwipeRight: () => setCurrentIndex(prev => Math.max(0, prev - 1)),
                    onSwipeUp: handleRevealHint
                });
                return cleanup;
            }
        }, [currentIndex]);

        if (studySpecimens.length === 0) {
            return window.h('div', { 
                style: { 
                    minHeight: '100vh',
                    background: design.colors?.bgPrimary || '#1A1A19',
                    color: design.colors?.textPrimary || '#F5F5DC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                } 
            },
                window.h('div', { style: { textAlign: 'center' } },
                    window.h('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '🍄'),
                    window.h('h2', { style: { fontSize: '1.5rem', marginBottom: '1rem' } }, 
                        'No specimens available'
                    ),
                    window.h('p', { style: { color: design.colors?.textSecondary || '#D3D3C7', marginBottom: '2rem' } }, 
                        mode === 'focused' ? 
                        'Try adjusting your filters to include more specimens.' :
                        'Loading specimens...'
                    ),
                    window.h('button', {
                        onClick: onBack,
                        style: {
                            padding: '0.75rem 2rem',
                            background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                            border: 'none',
                            borderRadius: design.radius?.md || '0.75rem',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }
                    }, '← Back to Home')
                )
            );
        }

        return window.h('div', { 
            id: 'flashcard-container',
            style: { 
                minHeight: '100vh',
                background: design.colors?.bgPrimary || '#1A1A19',
                color: design.colors?.textPrimary || '#F5F5DC',
                position: 'relative',
                overflow: 'hidden'
            } 
        },
            // Background pattern
            window.h('div', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 30% 40%, rgba(139,69,19,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 60%, rgba(34,139,34,0.08) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none'
                }
            }),
            
            // Main Content
            window.h('div', { style: { position: 'relative', zIndex: 2 } },
                // Compact Header
                window.h('header', { 
                    style: { 
                        background: `linear-gradient(180deg, ${design.colors?.bgSecondary || '#2D2D2A'} 0%, transparent 100%)`,
                        padding: '1rem',
                        borderBottom: '1px solid rgba(139,69,19,0.2)'
                    } 
                },
                    window.h('div', { 
                        style: { 
                            maxWidth: '1200px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'center',
                            gap: '1rem'
                        } 
                    },
                        // Left: Back & Mode
                        window.h('div', { 
                            style: { 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            } 
                        },
                            window.h('button', {
                                onClick: onBack,
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: design.colors?.bgCard || '#2A2826',
                                    border: '1px solid rgba(139,69,19,0.2)',
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    color: design.colors?.textSecondary || '#D3D3C7',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                }
                            }, '← Back'),
                            window.h('div', { 
                                style: { 
                                    padding: '0.375rem 0.75rem',
                                    background: design.colors?.bgTertiary || '#3A3A37',
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: design.colors?.textMuted || '#A8A89C'
                                } 
                            }, 
                                mode === 'quick' ? '⚡ Quick' : 
                                mode === 'focused' ? '🎯 Focused' : 
                                '🏃 Marathon'
                            )
                        ),
                        
                        // Center: Progress
                        window.h('div', { 
                            style: { 
                                textAlign: 'center'
                            } 
                        },
                            window.h('div', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: design.colors?.textPrimary || '#F5F5DC'
                                } 
                            }, `Question ${currentIndex + 1}${mode !== 'marathon' ? ` of ${studySpecimens.length}` : ''}`),
                            window.h('div', { 
                                style: { 
                                    width: '200px',
                                    height: '4px',
                                    background: design.colors?.bgSecondary || '#2D2D2A',
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    overflow: 'hidden',
                                    marginTop: '0.25rem'
                                } 
                            },
                                window.h('div', { 
                                    style: { 
                                        width: mode === 'marathon' ? '100%' : `${((currentIndex + 1) / studySpecimens.length) * 100}%`,
                                        height: '100%',
                                        background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                        transition: 'width 0.5s ease'
                                    } 
                                })
                            )
                        ),
                        
                        // Right: Stats
                        window.h('div', { 
                            style: { 
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end',
                                alignItems: 'center'
                            } 
                        },
                            // Score
                            window.h('div', { 
                                style: { 
                                    textAlign: 'center',
                                    padding: '0.375rem 0.75rem',
                                    background: design.colors?.bgCard || '#2A2826',
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    border: `1px solid ${accuracy >= 80 ? '#10B981' : accuracy >= 60 ? '#F59E0B' : '#EF4444'}30`
                                } 
                            },
                                window.h('div', { 
                                    style: { 
                                        fontSize: '1.125rem',
                                        fontWeight: '700',
                                        color: accuracy >= 80 ? '#10B981' : accuracy >= 60 ? '#F59E0B' : '#EF4444'
                                    } 
                                }, `${accuracy}%`),
                                window.h('div', { 
                                    style: { 
                                        fontSize: '0.625rem',
                                        color: design.colors?.textMuted || '#A8A89C',
                                        textTransform: 'uppercase'
                                    } 
                                }, 'Accuracy')
                            ),
                            // Streak
                            streak > 0 && window.h('div', { 
                                style: { 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.375rem 0.75rem',
                                    background: `linear-gradient(135deg, ${design.colors?.bgCard || '#2A2826'}, ${design.colors?.bgTertiary || '#3A3A37'})`,
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    border: '1px solid rgba(255,107,53,0.3)'
                                } 
                            },
                                window.h('span', { style: { fontSize: '1.125rem' } }, '🔥'),
                                window.h('span', { 
                                    style: { 
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: design.colors?.accent || '#FF6B35'
                                    } 
                                }, streak)
                            ),
                            // Timer
                            window.h('div', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    color: design.colors?.textMuted || '#A8A89C',
                                    fontWeight: '600'
                                } 
                            }, formatDuration(sessionDuration))
                        )
                    )
                ),
                
                // Main Study Area
                window.h('main', { 
                    style: { 
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '2rem 1rem',
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                        gap: '2rem',
                        alignItems: 'start'
                    } 
                },
                    // Left: Photo Gallery
                    window.h('div', { 
                        style: { 
                            position: 'relative'
                        } 
                    },
                        window.h('div', {
                            style: {
                                background: design.colors?.bgCard || '#2A2826',
                                borderRadius: design.radius?.lg || '1rem',
                                border: '1px solid rgba(139,69,19,0.2)',
                                overflow: 'hidden',
                                boxShadow: design.shadows?.lg || '0 8px 32px rgba(0,0,0,0.5)',
                                position: 'relative',
                                aspectRatio: '4/3'
                            }
                        },
                            // Main Photo
                            currentPhotos.length > 0 ? 
                                window.h('img', {
                                    src: currentPhotos[0]?.medium_url || currentPhotos[0]?.url,
                                    alt: 'Specimen photo',
                                    onClick: () => setSelectedPhoto(currentPhotos[0]),
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        cursor: 'zoom-in',
                                        transition: 'transform 0.3s ease',
                                        filter: showResult ? 'none' : 'brightness(0.95)'
                                    },
                                    onMouseEnter: (e) => e.target.style.transform = 'scale(1.02)',
                                    onMouseLeave: (e) => e.target.style.transform = 'scale(1)'
                                }) :
                                window.h('div', { 
                                    style: { 
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: design.colors?.bgSecondary || '#2D2D2A'
                                    } 
                                },
                                    window.h('div', { style: { textAlign: 'center' } },
                                        window.h('div', { style: { fontSize: '4rem', opacity: 0.3 } }, '🍄'),
                                        window.h('p', { 
                                            style: { 
                                                color: design.colors?.textMuted || '#A8A89C',
                                                marginTop: '1rem'
                                            } 
                                        }, 'Loading photo...')
                                    )
                                ),
                            
                            // Photo count badge
                            currentPhotos.length > 1 && window.h('div', {
                                style: {
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    padding: '0.375rem 0.75rem',
                                    background: 'rgba(26,26,25,0.9)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    border: '1px solid rgba(139,69,19,0.3)',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: design.colors?.textPrimary || '#F5F5DC',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }
                            },
                                window.h('span', null, '📸'),
                                window.h('span', null, `${currentPhotos.length} photos`)
                            ),
                            
                            // Location badge
                            currentSpecimen.place_guess && window.h('div', {
                                style: {
                                    position: 'absolute',
                                    bottom: '1rem',
                                    left: '1rem',
                                    padding: '0.375rem 0.75rem',
                                    background: 'rgba(26,26,25,0.9)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: design.radius?.sm || '0.5rem',
                                    border: '1px solid rgba(139,69,19,0.3)',
                                    fontSize: '0.75rem',
                                    color: design.colors?.textSecondary || '#D3D3C7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }
                            },
                                window.h('span', null, '📍'),
                                window.h('span', null, currentSpecimen.place_guess)
                            )
                        ),
                        
                        // Thumbnail Gallery
                        currentPhotos.length > 1 && window.h('div', {
                            style: {
                                display: 'flex',
                                gap: '0.5rem',
                                marginTop: '1rem',
                                overflowX: 'auto',
                                padding: '0.5rem 0'
                            }
                        },
                            currentPhotos.slice(0, 5).map((photo, index) => 
                                window.h('img', {
                                    key: index,
                                    src: photo.small_url || photo.url,
                                    alt: `Photo ${index + 1}`,
                                    onClick: () => setSelectedPhoto(photo),
                                    style: {
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        borderRadius: design.radius?.sm || '0.5rem',
                                        border: '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        opacity: 0.8
                                    },
                                    onMouseEnter: (e) => {
                                        e.target.style.opacity = '1';
                                        e.target.style.borderColor = design.colors?.primary || '#8B4513';
                                        e.target.style.transform = 'scale(1.05)';
                                    },
                                    onMouseLeave: (e) => {
                                        e.target.style.opacity = '0.8';
                                        e.target.style.borderColor = 'transparent';
                                        e.target.style.transform = 'scale(1)';
                                    }
                                })
                            )
                        )
                    ),
                    
                    // Right: Answer Area
                    window.h('div', { 
                        style: { 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        } 
                    },
                        // Hints Section
                        window.h('div', {
                            style: {
                                background: design.colors?.bgCard || '#2A2826',
                                borderRadius: design.radius?.lg || '1rem',
                                border: '1px solid rgba(139,69,19,0.2)',
                                padding: '1.5rem',
                                boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)'
                            }
                        },
                            window.h('div', { 
                                style: { 
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem'
                                } 
                            },
                                window.h('h3', { 
                                    style: { 
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: design.colors?.textSecondary || '#D3D3C7'
                                    } 
                                }, '💡 Identification Hints'),
                                !showResult && window.h('button', {
                                    onClick: handleRevealHint,
                                    disabled: currentHintLevel >= 3,
                                    style: {
                                        padding: '0.375rem 0.75rem',
                                        background: currentHintLevel >= 3 ? 
                                            design.colors?.bgSecondary || '#2D2D2A' :
                                            design.gradients?.forest || 'linear-gradient(135deg, #228B22 0%, #8FBC8F 100%)',
                                        border: 'none',
                                        borderRadius: design.radius?.sm || '0.5rem',
                                        color: currentHintLevel >= 3 ? design.colors?.textMuted || '#A8A89C' : 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: currentHintLevel >= 3 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        opacity: currentHintLevel >= 3 ? 0.5 : 1
                                    }
                                }, `Reveal Hint (${3 - currentHintLevel} left)`)
                            ),
                            
                            // Hint Display
                            window.h('div', { 
                                style: { 
                                    minHeight: '80px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem'
                                } 
                            },
                                currentHintLevel === 0 && !showResult ? 
                                    window.h('p', { 
                                        style: { 
                                            color: design.colors?.textMuted || '#A8A89C',
                                            fontSize: '0.875rem',
                                            fontStyle: 'italic'
                                        } 
                                    }, 'Click "Reveal Hint" for help (-20 points per hint)') :
                                    [
                                        currentHintLevel >= 1 && window.h('div', { 
                                            key: 'hint1',
                                            style: { 
                                                padding: '0.75rem',
                                                background: design.colors?.bgSecondary || '#2D2D2A',
                                                borderRadius: design.radius?.sm || '0.5rem',
                                                borderLeft: '3px solid #F59E0B',
                                                fontSize: '0.875rem'
                                            } 
                                        },
                                            window.h('strong', null, 'Family: '),
                                            currentSpecimen.family || 'Unknown'
                                        ),
                                        currentHintLevel >= 2 && window.h('div', { 
                                            key: 'hint2',
                                            style: { 
                                                padding: '0.75rem',
                                                background: design.colors?.bgSecondary || '#2D2D2A',
                                                borderRadius: design.radius?.sm || '0.5rem',
                                                borderLeft: '3px solid #3B82F6',
                                                fontSize: '0.875rem'
                                            } 
                                        },
                                            window.h('strong', null, 'Genus: '),
                                            currentSpecimen.genus || 'Unknown'
                                        ),
                                        currentHintLevel >= 3 && currentSpeciesHints.ecological_type && window.h('div', { 
                                            key: 'hint3',
                                            style: { 
                                                padding: '0.75rem',
                                                background: design.colors?.bgSecondary || '#2D2D2A',
                                                borderRadius: design.radius?.sm || '0.5rem',
                                                borderLeft: '3px solid #10B981',
                                                fontSize: '0.875rem'
                                            } 
                                        },
                                            window.h('strong', null, 'Ecology: '),
                                            currentSpeciesHints.ecological_type
                                        )
                                    ]
                            )
                        ),
                        
                        // Answer Input Section
                        window.h('div', {
                            style: {
                                background: design.colors?.bgCard || '#2A2826',
                                borderRadius: design.radius?.lg || '1rem',
                                border: `1px solid ${
                                    answerAnimation === 'correct' ? '#10B981' :
                                    answerAnimation === 'incorrect' ? '#EF4444' :
                                    'rgba(139,69,19,0.2)'
                                }`,
                                padding: '1.5rem',
                                boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)',
                                transition: 'all 0.3s ease',
                                transform: answerAnimation ? 'scale(1.02)' : 'scale(1)'
                            }
                        },
                            window.h('label', { 
                                style: { 
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: design.colors?.textSecondary || '#D3D3C7',
                                    marginBottom: '0.75rem'
                                } 
                            }, 'Your Answer'),
                            
                            window.h('input', {
                                type: 'text',
                                value: userAnswer,
                                onChange: (e) => setUserAnswer(e.target.value),
                                onKeyPress: (e) => e.key === 'Enter' && !showResult && handleSubmit(),
                                disabled: showResult,
                                placeholder: 'Enter species name or common name...',
                                style: {
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: design.colors?.bgSecondary || '#2D2D2A',
                                    border: '1px solid rgba(139,69,19,0.2)',
                                    borderRadius: design.radius?.md || '0.75rem',
                                    color: design.colors?.textPrimary || '#F5F5DC',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }
                            }),
                            
                            // Submit/Next Button
                            window.h('button', {
                                onClick: showResult ? handleNext : handleSubmit,
                                style: {
                                    width: '100%',
                                    marginTop: '1rem',
                                    padding: '0.875rem',
                                    background: showResult ? 
                                        (lastAttemptScore?.isCorrect ? 
                                            'linear-gradient(135deg, #228B22 0%, #8FBC8F 100%)' :
                                            'linear-gradient(135deg, #EF4444 0%, #F87171 100%)') :
                                        design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                    border: 'none',
                                    borderRadius: design.radius?.md || '0.75rem',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)'
                                }
                            }, showResult ? 
                                (mode === 'marathon' || currentIndex < studySpecimens.length - 1 ? 
                                    'Next Question →' : 'Complete Session') :
                                'Submit Answer'
                            ),
                            
                            // Result Display
                            showResult && window.h('div', {
                                style: {
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: lastAttemptScore?.isCorrect ? 
                                        'rgba(34,139,34,0.1)' : 'rgba(239,68,68,0.1)',
                                    borderRadius: design.radius?.md || '0.75rem',
                                    border: `1px solid ${lastAttemptScore?.isCorrect ? '#10B981' : '#EF4444'}30`
                                }
                            },
                                window.h('div', { 
                                    style: { 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem'
                                    } 
                                },
                                    window.h('span', { 
                                        style: { fontSize: '1.5rem' } 
                                    }, lastAttemptScore?.isCorrect ? '✅' : '❌'),
                                    window.h('div', null,
                                        window.h('div', { 
                                            style: { 
                                                fontSize: '1.125rem',
                                                fontWeight: '700',
                                                color: lastAttemptScore?.isCorrect ? '#10B981' : '#EF4444'
                                            } 
                                        }, lastAttemptScore?.isCorrect ? 'Correct!' : 'Incorrect'),
                                        window.h('div', { 
                                            style: { 
                                                fontSize: '0.875rem',
                                                color: design.colors?.textSecondary || '#D3D3C7'
                                            } 
                                        }, `Score: ${lastAttemptScore?.finalScore}%`)
                                    )
                                ),
                                
                                // Correct Answer Display
                                !lastAttemptScore?.isCorrect && window.h('div', {
                                    style: {
                                        padding: '0.75rem',
                                        background: design.colors?.bgSecondary || '#2D2D2A',
                                        borderRadius: design.radius?.sm || '0.5rem',
                                        marginTop: '0.75rem'
                                    }
                                },
                                    window.h('div', { 
                                        style: { 
                                            fontSize: '0.75rem',
                                            color: design.colors?.textMuted || '#A8A89C',
                                            marginBottom: '0.25rem'
                                        } 
                                    }, 'Correct Answer:'),
                                    window.h('div', { 
                                        style: { 
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            color: design.colors?.textPrimary || '#F5F5DC'
                                        } 
                                    }, currentSpecimen.species),
                                    currentSpecimen.common_name && window.h('div', { 
                                        style: { 
                                            fontSize: '0.875rem',
                                            color: design.colors?.textSecondary || '#D3D3C7',
                                            fontStyle: 'italic'
                                        } 
                                    }, `Common: ${currentSpecimen.common_name}`)
                                ),
                                
                                // Learn More Button
                                window.h('button', {
                                    onClick: () => setShowGuide(true),
                                    style: {
                                        marginTop: '0.75rem',
                                        padding: '0.5rem 1rem',
                                        background: 'transparent',
                                        border: '1px solid rgba(139,69,19,0.3)',
                                        borderRadius: design.radius?.sm || '0.5rem',
                                        color: design.colors?.textSecondary || '#D3D3C7',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }
                                }, '📖 Learn More About This Species')
                            )
                        ),
                        
                        // Keyboard Shortcuts Help
                        window.h('div', {
                            style: {
                                padding: '1rem',
                                background: design.colors?.bgCard || '#2A2826',
                                borderRadius: design.radius?.md || '0.75rem',
                                border: '1px solid rgba(139,69,19,0.15)',
                                fontSize: '0.75rem',
                                color: design.colors?.textMuted || '#A8A89C'
                            }
                        },
                            window.h('div', { style: { fontWeight: '600', marginBottom: '0.5rem' } }, 
                                '⌨️ Keyboard Shortcuts'
                            ),
                            window.h('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } },
                                window.h('span', null, 'Enter: Submit/Next'),
                                window.h('span', null, 'H: Reveal Hint'),
                                window.h('span', null, 'Esc: Exit')
                            )
                        )
                    )
                )
            ),
            
            // Photo Modal
            selectedPhoto && window.h('div', {
                onClick: () => setSelectedPhoto(null),
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    cursor: 'zoom-out'
                }
            },
                window.h('img', {
                    src: selectedPhoto.large_url || selectedPhoto.medium_url || selectedPhoto.url,
                    alt: 'Enlarged photo',
                    style: {
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain',
                        borderRadius: design.radius?.lg || '1rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                    }
                })
            ),
            
            // Interactive Species Guide Modal
            showGuide && window.InteractiveSpeciesGuide && window.h(window.InteractiveSpeciesGuide, {
                specimen: currentSpecimen,
                speciesHints: currentSpeciesHints,
                photos: currentPhotos,
                referencePhotos: currentReferencePhotos,
                onClose: () => setShowGuide(false),
                onTryAgain: () => {
                    setShowGuide(false);
                    handleNext();
                }
            })
        );
    };
    
    console.log('✅ SharedFlashcard component loaded with Living Mycology design');
    
})();