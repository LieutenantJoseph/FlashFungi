// QuickStudy.js - Enhanced Quick Study Component with Touch Gestures
// Flash Fungi - Advanced flashcard system with progressive hints, scoring, and mobile gestures

(function() {
    'use strict';
    
    window.QuickStudy = function QuickStudy(props) {
        const specimens = props.specimens || [];
        const speciesHints = props.speciesHints || {};
        const onBack = props.onBack;
        const loadSpecimenPhotos = props.loadSpecimenPhotos;
        const specimenPhotos = props.specimenPhotos || {};
        const speciesHintsMap = props.speciesHints || {};
        const referencePhotos = props.referencePhotos || {};
        const user = props.user;
        const saveProgress = props.saveProgress;
        
        // State
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [userAnswer, setUserAnswer] = React.useState('');
        const [currentHintLevel, setCurrentHintLevel] = React.useState(0);
        const [hintsRevealedManually, setHintsRevealedManually] = React.useState(0);
        const [attemptCount, setAttemptCount] = React.useState(0);
        const [showResult, setShowResult] = React.useState(false);
        const [showGuide, setShowGuide] = React.useState(false);
        const [score, setScore] = React.useState({ correct: 0, total: 0, totalScore: 0 });
        const [lastAttemptScore, setLastAttemptScore] = React.useState(null);
        const [photosLoaded, setPhotosLoaded] = React.useState(false);
        const [selectedPhoto, setSelectedPhoto] = React.useState(null);
        const [gestureHint, setGestureHint] = React.useState(null);

        // Get 10 random approved specimens
        const studySpecimens = React.useMemo(() => {
            const approved = specimens.filter(s => s.status === 'approved');
            const shuffled = [...approved].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Math.min(10, approved.length));
        }, [specimens]);

        const currentSpecimen = studySpecimens[currentIndex];
        const currentPhotos = currentSpecimen ? specimenPhotos[currentSpecimen.inaturalist_id] || [] : [];
        const currentSpeciesHints = currentSpecimen ? speciesHintsMap[currentSpecimen.species_name] : null;
        const currentReferencePhotos = currentSpecimen ? 
            (referencePhotos[currentSpecimen.species_name] || []) : [];

        // Touch gesture integration - NEW FEATURE
        const gestureHandlers = window.useTouchGestures ? window.useTouchGestures({
            onSwipeLeft: () => {
                // Swipe left = Next question (if not in input mode)
                if (showResult || showGuide) {
                    handleNext();
                    showGestureHint('✋ Swiped to next question');
                }
            },
            onSwipeRight: () => {
                // Swipe right = Previous question (if possible)
                if (currentIndex > 0 && (showResult || showGuide)) {
                    setCurrentIndex(prev => prev - 1);
                    resetCurrentQuestion();
                    showGestureHint('👈 Swiped to previous question');
                }
            },
            onSwipeUp: () => {
                // Swipe up = Show next hint
                if (!showResult && !showGuide && currentSpeciesHints && currentHintLevel < currentSpeciesHints.length) {
                    setCurrentHintLevel(prev => prev + 1);
                    setHintsRevealedManually(prev => prev + 1);
                    showGestureHint('💡 Revealed hint');
                }
            },
            onDoubleTap: () => {
                // Double tap = Open species guide (when answer is correct/shown)
                if ((showResult && lastAttemptScore?.isCorrect) || showGuide) {
                    setShowGuide(true);
                    showGestureHint('📖 Opened species guide');
                }
            },
            onLongPress: () => {
                // Long press = Skip question (if attempted)
                if (attemptCount > 0 && !showResult && !showGuide) {
                    handleNext();
                    showGestureHint('⏭️ Skipped question');
                }
            },
            disabled: showGuide || !currentSpecimen // Disable gestures when guide is open or no specimen
        }) : {};

        // Show gesture hint temporarily
        const showGestureHint = (message) => {
            setGestureHint(message);
            setTimeout(() => setGestureHint(null), 2000);
        };

        // Reset question state
        const resetCurrentQuestion = () => {
            setUserAnswer('');
            setCurrentHintLevel(0);
            setHintsRevealedManually(0);
            setAttemptCount(0);
            setShowResult(false);
            setShowGuide(false);
            setLastAttemptScore(null);
        };

        // Load photos when specimen changes
        React.useEffect(() => {
            if (currentSpecimen && loadSpecimenPhotos && !currentPhotos.length) {
                setPhotosLoaded(false);
                loadSpecimenPhotos(currentSpecimen.inaturalist_id).finally(() => {
                    setPhotosLoaded(true);
                });
            } else {
                setPhotosLoaded(true);
            }
        }, [currentSpecimen, loadSpecimenPhotos]);

        // Reset state when moving to new specimen
        React.useEffect(() => {
            resetCurrentQuestion();
        }, [currentIndex]);

        // Auto-reveal hints based on wrong attempts
        React.useEffect(() => {
            if (attemptCount > 0 && currentSpeciesHints && currentHintLevel < attemptCount && currentHintLevel < currentSpeciesHints.length) {
                setCurrentHintLevel(attemptCount);
            }
        }, [attemptCount, currentSpeciesHints, currentHintLevel]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!userAnswer.trim() || !currentSpecimen) return;

            const newAttemptCount = attemptCount + 1;
            setAttemptCount(newAttemptCount);

            // Check answer using fuzzy matching
            const isCorrect = window.FuzzyMatching.isMatch(userAnswer, currentSpecimen.species_name);
            
            // Calculate score
            const baseScore = isCorrect ? 100 : Math.max(0, 
                Math.round(window.FuzzyMatching.similarity(userAnswer, currentSpecimen.species_name) * 100)
            );
            
            // Apply hint penalty (only for manually revealed hints)
            const hintPenalty = hintsRevealedManually * 10;
            const finalScore = Math.max(0, baseScore - hintPenalty);
            
            const attemptScore = {
                isCorrect,
                baseScore,
                hintPenalty,
                finalScore,
                userAnswer: userAnswer.trim(),
                correctAnswer: currentSpecimen.species_name,
                feedback: isCorrect ? 
                    "Excellent! That's correct!" : 
                    baseScore > 70 ? "Very close! Check your spelling." :
                    baseScore > 40 ? "You're on the right track, but not quite right." :
                    "Not correct. Try using the hints to help you."
            };

            setLastAttemptScore(attemptScore);
            setShowResult(true);

            // Update score
            if (newAttemptCount === 1) { // Only count first attempts
                setScore(prev => ({
                    correct: prev.correct + (isCorrect ? 1 : 0),
                    total: prev.total + 1,
                    totalScore: prev.totalScore + finalScore
                }));
            }

            // Save progress
            if (saveProgress && user) {
                try {
                    await saveProgress({
                        specimenId: currentSpecimen.id,
                        userAnswer: userAnswer.trim(),
                        correctAnswer: currentSpecimen.species_name,
                        isCorrect,
                        score: finalScore,
                        hintsUsed: currentHintLevel,
                        attempts: newAttemptCount,
                        progressType: 'flashcard'
                    });
                    
                    // Trigger achievement check - NEW INTEGRATION
                    if (window.checkAchievements) {
                        window.checkAchievements('answer_correct', {
                            isCorrect,
                            score: finalScore,
                            hintsUsed: currentHintLevel,
                            attempts: newAttemptCount,
                            specimenId: currentSpecimen.id,
                            dna_verified: currentSpecimen.dna_verified,
                            is_toxic: currentSpecimen.toxic_status === 'toxic'
                        });
                    }
                } catch (error) {
                    console.error('Error saving progress:', error);
                }
            }
        };

        const handleNext = () => {
            if (currentIndex < studySpecimens.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Study complete
                if (onBack) onBack();
            }
        };

        const getHintButtonText = () => {
            if (!currentSpeciesHints || currentSpeciesHints.length === 0) return 'No hints available';
            if (currentHintLevel >= currentSpeciesHints.length) return 'All hints revealed';
            return `Show Hint (${currentHintLevel + 1}/${currentSpeciesHints.length})`;
        };

        const canShowHint = currentSpeciesHints && currentHintLevel < currentSpeciesHints.length;

        if (!currentSpecimen) {
            return React.createElement('div', { 
                style: { padding: '2rem', textAlign: 'center' }
            },
                React.createElement('h2', null, 'No specimens available for study'),
                React.createElement('button', {
                    onClick: onBack,
                    style: {
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                    }
                }, 'Back to Home')
            );
        }

        return React.createElement('div', {
            style: { minHeight: '100vh', backgroundColor: '#f9fafb' },
            ...gestureHandlers // Apply gesture handlers to main container
        },
            // Header with progress and mobile gesture instructions
            React.createElement('div', { 
                style: { 
                    backgroundColor: 'white', 
                    borderBottom: '1px solid #e5e7eb',
                    padding: '1rem'
                }
            },
                React.createElement('div', { 
                    style: { 
                        maxWidth: '64rem', 
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        React.createElement('button', {
                            onClick: onBack,
                            style: {
                                color: '#6b7280',
                                fontSize: '1.125rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }
                        }, '← Back'),
                        React.createElement('h1', { 
                            style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }
                        }, 'Quick Study Mode')
                    ),
                    React.createElement('div', { style: { textAlign: 'right' } },
                        React.createElement('div', { 
                            style: { fontSize: '0.875rem', color: '#6b7280' }
                        }, `Question ${currentIndex + 1} of ${studySpecimens.length}`),
                        React.createElement('div', { 
                            style: { fontSize: '0.875rem', color: '#6b7280' }
                        }, `Score: ${score.correct}/${score.total} (${score.total > 0 ? Math.round(score.totalScore / score.total) : 0}%)`)
                    )
                ),
                
                // Mobile gesture instructions - NEW FEATURE
                window.isMobileDevice && window.isMobileDevice() && React.createElement('div', {
                    style: {
                        maxWidth: '64rem',
                        margin: '0.5rem auto 0',
                        padding: '0.5rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        textAlign: 'center'
                    }
                },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' } },
                        React.createElement('span', null, '👆 Double tap: Guide'),
                        React.createElement('span', null, '👈👉 Swipe: Next/Previous'),
                        React.createElement('span', null, '👆 Swipe up: Hint'),
                        React.createElement('span', null, '✋ Long press: Skip')
                    )
                )
            ),

            // Gesture feedback overlay - NEW FEATURE
            gestureHint && React.createElement('div', {
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '2rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    zIndex: 40,
                    animation: 'fadeIn 0.3s ease-in-out'
                }
            }, gestureHint),

            // Main content
            React.createElement('div', { 
                style: { maxWidth: '64rem', margin: '0 auto', padding: '1.5rem' }
            },
                // Image section
                React.createElement('div', { 
                    style: { 
                        backgroundColor: 'white', 
                        borderRadius: '0.75rem', 
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        marginBottom: '1.5rem'
                    }
                },
                    currentPhotos.length > 0 ? React.createElement('div', { 
                        style: { position: 'relative' }
                    },
                        React.createElement('img', {
                            src: currentPhotos[0].medium_url,
                            alt: showResult ? currentSpecimen.species_name : 'Mushroom specimen',
                            style: {
                                width: '100%',
                                height: '24rem',
                                objectFit: 'cover',
                                cursor: 'pointer'
                            },
                            onClick: () => setSelectedPhoto(currentPhotos[0])
                        }),
                        
                        // Additional photos indicator
                        currentPhotos.length > 1 && React.createElement('div', {
                            style: {
                                position: 'absolute',
                                bottom: '0.5rem',
                                right: '0.5rem',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem'
                            }
                        }, `+${currentPhotos.length - 1} more`)
                    ) : React.createElement('div', {
                        style: {
                            height: '24rem',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6b7280'
                        }
                    }, photosLoaded ? 'No photos available' : 'Loading photo...')
                ),
                
                // Answer section
                React.createElement('div', { 
                    style: { 
                        backgroundColor: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        marginBottom: '1.5rem'
                    }
                },
                    React.createElement('h2', { 
                        style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }
                    }, 'What species is this?'),
                    
                    !showResult && !showGuide && React.createElement('form', { onSubmit: handleSubmit },
                        React.createElement('div', { style: { marginBottom: '1rem' } },
                            React.createElement('input', {
                                type: 'text',
                                value: userAnswer,
                                onChange: (e) => setUserAnswer(e.target.value),
                                placeholder: 'Enter the species name...',
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem'
                                },
                                autoComplete: 'off',
                                autoFocus: true
                            })
                        ),
                        React.createElement('div', { 
                            style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }
                        },
                            React.createElement('button', {
                                type: 'submit',
                                disabled: !userAnswer.trim(),
                                style: {
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: userAnswer.trim() ? '#10b981' : '#9ca3af',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                                    fontWeight: '500'
                                }
                            }, 'Submit Answer'),
                            canShowHint && React.createElement('button', {
                                type: 'button',
                                onClick: () => {
                                    setCurrentHintLevel(prev => prev + 1);
                                    setHintsRevealedManually(prev => prev + 1);
                                },
                                style: {
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, getHintButtonText())
                        )
                    ),
                    
                    // Show result
                    showResult && lastAttemptScore && React.createElement('div', null,
                        React.createElement('div', {
                            style: {
                                padding: '1rem',
                                backgroundColor: lastAttemptScore.isCorrect ? '#d1fae5' : '#fed7d7',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem'
                            }
                        },
                            React.createElement('h3', { 
                                style: { 
                                    fontSize: '1.125rem', 
                                    fontWeight: '600', 
                                    color: lastAttemptScore.isCorrect ? '#065f46' : '#7f1d1d',
                                    marginBottom: '0.5rem'
                                }
                            }, lastAttemptScore.isCorrect ? '✅ Correct!' : '❌ Incorrect'),
                            React.createElement('p', { 
                                style: { 
                                    color: lastAttemptScore.isCorrect ? '#047857' : '#991b1b',
                                    marginBottom: '0.5rem'
                                }
                            }, `The correct answer is: ${currentSpecimen.species_name}`),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    color: lastAttemptScore.isCorrect ? '#047857' : '#991b1b'
                                }
                            }, lastAttemptScore.feedback),
                            React.createElement('div', {
                                style: {
                                    marginTop: '0.75rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    borderRadius: '0.25rem'
                                }
                            },
                                React.createElement('p', { style: { fontSize: '0.875rem', marginBottom: '0.25rem' } },
                                    React.createElement('strong', null, 'Score Breakdown:')
                                ),
                                React.createElement('div', { style: { fontSize: '0.75rem', color: '#374151' } },
                                    React.createElement('p', null, `Base Score: ${lastAttemptScore.baseScore}%`),
                                    lastAttemptScore.hintPenalty > 0 && React.createElement('p', null, 
                                        `Hint Penalty: -${lastAttemptScore.hintPenalty}%`
                                    ),
                                    React.createElement('p', { style: { fontWeight: 'bold', marginTop: '0.25rem' } }, 
                                        `Final Score: ${lastAttemptScore.finalScore}%`
                                    )
                                )
                            )
                        ),
                        
                        React.createElement('div', { style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' } },
                            lastAttemptScore.isCorrect && React.createElement('button', {
                                onClick: () => setShowGuide(true),
                                style: {
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, '📖 Learn More'),
                            React.createElement('button', {
                                onClick: handleNext,
                                style: {
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 'Finish Study')
                        )
                    )
                ),
                
                // Hints section
                currentSpeciesHints && currentHintLevel > 0 && React.createElement('div', { 
                    style: { 
                        backgroundColor: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        marginBottom: '1.5rem'
                    }
                },
                    React.createElement('h3', { 
                        style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }
                    }, '💡 Hints'),
                    React.createElement('div', { style: { space: '0.5rem' } },
                        currentSpeciesHints.slice(0, currentHintLevel).map((hint, idx) => {
                            const isLatest = idx === currentHintLevel - 1;
                            return React.createElement('div', {
                                key: idx,
                                style: {
                                    marginBottom: idx < currentHintLevel - 1 ? '0.5rem' : 0,
                                    padding: '0.5rem',
                                    backgroundColor: isLatest ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                                    borderRadius: '0.25rem',
                                    borderLeft: `3px solid ${isLatest ? '#f59e0b' : 'transparent'}`
                                }
                            },
                                React.createElement('p', { style: { fontSize: '0.875rem', color: '#374151', margin: 0 } }, 
                                    `${idx + 1}. ${hint.text}`
                                )
                            );
                        })
                    )
                )
            ),

            // Enhanced Interactive Species Guide with Reference Photos
            showGuide && window.InteractiveSpeciesGuide && React.createElement(window.InteractiveSpeciesGuide, {
                specimen: currentSpecimen,
                speciesHints: currentSpeciesHints,
                photos: currentPhotos,
                referencePhotos: currentReferencePhotos,
                onClose: () => {
                    setShowGuide(false);
                    handleNext();
                },
                onTryAgain: () => {
                    setShowGuide(false);
                    handleNext();
                }
            }),

            // Photo modal
            selectedPhoto && React.createElement('div', {
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                },
                onClick: () => setSelectedPhoto(null)
            },
                React.createElement('img', {
                    src: selectedPhoto.large_url || selectedPhoto.medium_url,
                    alt: 'Enlarged photo',
                    style: {
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain'
                    }
                })
            )
        );
    };
    
    console.log('✅ Enhanced QuickStudy component with touch gestures loaded');
    
})();