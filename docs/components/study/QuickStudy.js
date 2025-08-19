// QuickStudy.js - Enhanced Quick Study Component
// Flash Fungi - Advanced flashcard system with progressive hints and scoring

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

        // Get 10 random approved specimens
        const studySpecimens = React.useMemo(() => {
            const approved = specimens.filter(s => s.status === 'approved');
            const shuffled = [...approved].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Math.min(10, approved.length));
        }, [specimens]);

        const currentSpecimen = studySpecimens[currentIndex];
        const currentPhotos = currentSpecimen ? specimenPhotos[currentSpecimen.inaturalist_id] || [] : [];
        const currentSpeciesHints = currentSpecimen ? speciesHintsMap[currentSpecimen.species_name] : null;
        const currentReferencePhotos = currentSpecimen ? referencePhotos[currentSpecimen.species_name] || [] : [];

        // Load photos when specimen changes
        React.useEffect(() => {
            if (currentSpecimen && !specimenPhotos[currentSpecimen.inaturalist_id]) {
                setPhotosLoaded(false);
                loadSpecimenPhotos(currentSpecimen.inaturalist_id).then(() => {
                    setPhotosLoaded(true);
                });
            } else {
                setPhotosLoaded(true);
            }
        }, [currentSpecimen, loadSpecimenPhotos, specimenPhotos]);

        // Get hints from database or generate fallback
        const getHints = React.useCallback(() => {
            if (currentSpeciesHints && currentSpeciesHints.hints && currentSpeciesHints.hints.length > 0) {
                return currentSpeciesHints.hints;
            }
            
            // Fallback hints
            return [
                {
                    type: 'morphological',
                    level: 1,
                    text: `Examine the physical features of this ${currentSpecimen?.family || 'mushroom'} specimen.`
                },
                {
                    type: 'comparative',
                    level: 2,
                    text: `Compare to other ${currentSpecimen?.genus || 'similar'} species for distinguishing features.`
                },
                {
                    type: 'ecological',
                    level: 3,
                    text: `Consider the habitat: ${currentSpecimen?.location || 'Arizona'}.`
                },
                {
                    type: 'taxonomic',
                    level: 4,
                    text: `This belongs to genus ${currentSpecimen?.genus || '[Unknown]'} in family ${currentSpecimen?.family || '[Unknown]'}.`
                }
            ];
        }, [currentSpeciesHints, currentSpecimen]);

        const hints = getHints();

        // Enhanced answer validation with fuzzy matching and scoring
        const validateAnswer = (answer) => {
            if (!window.FuzzyMatching || !answer || !currentSpecimen) {
                return { isCorrect: false, baseScore: 0, feedback: '' };
            }
            
            const validation = window.FuzzyMatching.validateSpeciesAnswer(answer, currentSpecimen);
            const totalHintsUsed = currentHintLevel + hintsRevealedManually;
            const scoreData = window.FuzzyMatching.calculateFinalScore(validation.baseScore, totalHintsUsed);
            
            return {
                ...validation,
                finalScore: scoreData.finalScore,
                hintPenalty: scoreData.hintPenalty
            };
        };

        // Handle answer submission with progressive hints
        const handleSubmitAnswer = () => {
            if (!userAnswer.trim()) return;
            
            const validation = validateAnswer(userAnswer);
            setAttemptCount(prev => prev + 1);
            
            if (validation.isCorrect) {
                // Correct answer
                setLastAttemptScore(validation);
                setScore(prev => ({ 
                    correct: prev.correct + 1, 
                    total: prev.total + 1,
                    totalScore: prev.totalScore + validation.finalScore
                }));
                setShowResult(true);
                
                // Save progress
                if (saveProgress) {
                    saveProgress({
                        specimenId: currentSpecimen.id,
                        progressType: 'flashcard',
                        score: validation.finalScore,
                        hintsUsed: currentHintLevel + hintsRevealedManually,
                        completed: true
                    });
                }
            } else {
                // Wrong answer - show next hint progressively if not all revealed
                setLastAttemptScore(validation);
                if (currentHintLevel < 4) {
                    setCurrentHintLevel(prev => prev + 1);
                    setUserAnswer(''); // Clear for retry
                } else {
                    // All hints exhausted
                    setScore(prev => ({ 
                        correct: prev.correct, 
                        total: prev.total + 1,
                        totalScore: prev.totalScore + validation.finalScore
                    }));
                    setShowGuide(true);
                }
            }
        };

        // Handle "Get Hint" button
        const handleGetHint = () => {
            if (currentHintLevel + hintsRevealedManually < 4) {
                if (currentHintLevel === 0) {
                    setCurrentHintLevel(1);
                } else if (currentHintLevel + hintsRevealedManually < 4) {
                    setHintsRevealedManually(prev => prev + 1);
                }
            }
        };

        // Handle "I Don't Know" button
        const handleIDontKnow = () => {
            setScore(prev => ({ 
                correct: prev.correct, 
                total: prev.total + 1,
                totalScore: prev.totalScore + 0 // No points for giving up
            }));
            setShowGuide(true);
        };

        // Move to next question
        const handleNext = () => {
            if (currentIndex < studySpecimens.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setUserAnswer('');
                setCurrentHintLevel(0);
                setHintsRevealedManually(0);
                setAttemptCount(0);
                setShowResult(false);
                setShowGuide(false);
                setLastAttemptScore(null);
                setSelectedPhoto(null);
            } else {
                // Study complete
                const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;
                const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                
                alert(
                    `🍄 Study Complete!\n\n` +
                    `✅ Correct: ${score.correct}/${score.total} (${accuracy}%)\n` +
                    `📊 Average Score: ${avgScore}%\n` +
                    `${avgScore >= 80 ? '🏆 Excellent work!' : avgScore >= 60 ? '📈 Good job!' : '📚 Keep practicing!'}`
                );
                onBack();
            }
        };

        if (!currentSpecimen) {
            return React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                React.createElement('h2', null, 'No specimens available for study'),
                React.createElement('button', { onClick: onBack }, 'Back to Home')
            );
        }

        // Calculate current score display
        const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header with enhanced scoring display
            React.createElement('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
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
                                React.createElement('h1', { style: { fontSize: '1.25rem', fontWeight: 'bold' } }, 'Quick Study'),
                                React.createElement('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                                    `Question ${currentIndex + 1} of ${studySpecimens.length}`
                                )
                            )
                        ),
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { style: { fontSize: '1.125rem', fontWeight: 'bold' } },
                                    `${score.correct}/${score.total}`
                                ),
                                React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Correct')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444'
                                    } 
                                },
                                    `${avgScore}%`
                                ),
                                React.createElement('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Score')
                            ),
                            currentSpecimen.dna_sequenced && React.createElement('span', {
                                style: {
                                    backgroundColor: '#f3e8ff',
                                    color: '#7c3aed',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem'
                                }
                            }, '🧬 DNA')
                        )
                    ),
                    // Progress bar
                    React.createElement('div', { style: { marginTop: '0.5rem', backgroundColor: '#e5e7eb', height: '0.25rem', borderRadius: '9999px' } },
                        React.createElement('div', {
                            style: {
                                width: `${((currentIndex + 1) / studySpecimens.length) * 100}%`,
                                height: '100%',
                                backgroundColor: '#10b981',
                                borderRadius: '9999px',
                                transition: 'width 0.3s'
                            }
                        })
                    )
                )
            ),

            // Main Content
            React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                    // Left: Photos
                    React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' } },
                        React.createElement('h3', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Specimen Photos'),
                        
                        // Specimen info
                        React.createElement('div', { style: { marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' } },
                            React.createElement('p', { style: { fontSize: '0.875rem' } },
                                React.createElement('strong', null, 'Location: '), currentSpecimen.location
                            ),
                            currentSpecimen.description && React.createElement('p', { style: { fontSize: '0.875rem', marginTop: '0.25rem' } },
                                React.createElement('strong', null, 'Notes: '), currentSpecimen.description.substring(0, 100) + '...'
                            )
                        ),
                        
                        // Photos grid
                        !photosLoaded ? 
                            React.createElement('div', { style: { textAlign: 'center', padding: '2rem' } }, 'Loading photos...') :
                        currentPhotos.length > 0 ?
                            React.createElement('div', null,
                                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                    currentPhotos.slice(0, 4).map((photo, idx) =>
                                        React.createElement('img', {
                                            key: idx,
                                            src: photo.medium_url,
                                            alt: `Photo ${idx + 1}`,
                                            onClick: () => setSelectedPhoto(photo),
                                            style: {
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                ':hover': { transform: 'scale(1.05)' }
                                            }
                                        })
                                    )
                                ),
                                React.createElement('p', { style: { fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' } },
                                    'Click any photo to enlarge'
                                )
                            ) :
                            React.createElement('div', { style: { textAlign: 'center', padding: '2rem' } }, 'No photos available')
                    ),

                    // Right: Answer Interface with Hints
                    React.createElement('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' } },
                        React.createElement('h3', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Identify This Mushroom'),
                        
                        // Show hints if any revealed
                        (currentHintLevel > 0 || hintsRevealedManually > 0) && !showResult && !showGuide && React.createElement('div', {
                            style: {
                                backgroundColor: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }
                        },
                            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } },
                                React.createElement('h4', { style: { fontWeight: '500', color: '#92400e' } }, 
                                    `💡 Hints (${currentHintLevel + hintsRevealedManually}/4)`
                                ),
                                (currentHintLevel + hintsRevealedManually) > 0 && React.createElement('span', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#dc2626',
                                        backgroundColor: '#fee2e2',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    } 
                                }, `-${(currentHintLevel + hintsRevealedManually) * 5}% penalty`)
                            ),
                            
                            // Show all revealed hints
                            hints.slice(0, currentHintLevel + hintsRevealedManually).map((hint, idx) => {
                                const isLatest = idx === currentHintLevel + hintsRevealedManually - 1;
                                return React.createElement('div', {
                                    key: idx,
                                    style: {
                                        marginBottom: idx < currentHintLevel + hintsRevealedManually - 1 ? '0.5rem' : 0,
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
                            }),
                            
                            lastAttemptScore && !lastAttemptScore.isCorrect && React.createElement('div', {
                                style: {
                                    marginTop: '0.75rem',
                                    padding: '0.5rem',
                                    backgroundColor: lastAttemptScore.baseScore > 0 ? '#059669' : '#dc2626',
                                    color: 'white',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem'
                                }
                            }, lastAttemptScore.feedback)
                        ),
                        
                        !showResult && !showGuide ? 
                            // Question Mode
                            React.createElement('div', null,
                                React.createElement('div', { style: { marginBottom: '1rem' } },
                                    React.createElement('input', {
                                        type: 'text',
                                        value: userAnswer,
                                        onChange: (e) => setUserAnswer(e.target.value),
                                        onKeyPress: (e) => e.key === 'Enter' && handleSubmitAnswer(),
                                        placeholder: 'Enter species name (e.g., Agaricus campestris)',
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }
                                    })
                                ),
                                
                                React.createElement('div', { style: { display: 'flex', gap: '0.5rem' } },
                                    React.createElement('button', {
                                        onClick: handleSubmitAnswer,
                                        disabled: !userAnswer.trim(),
                                        style: {
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: userAnswer.trim() ? '#10b981' : '#d1d5db',
                                            color: 'white',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                                            fontWeight: '500'
                                        }
                                    }, currentHintLevel > 0 ? 'Try Again' : 'Submit Answer'),
                                    
                                    React.createElement('button', {
                                        onClick: handleGetHint,
                                        disabled: currentHintLevel + hintsRevealedManually >= 4,
                                        style: {
                                            padding: '0.75rem 1rem',
                                            backgroundColor: currentHintLevel + hintsRevealedManually < 4 ? '#3b82f6' : '#d1d5db',
                                            color: 'white',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: currentHintLevel + hintsRevealedManually < 4 ? 'pointer' : 'not-allowed',
                                            fontWeight: '500'
                                        }
                                    }, `💡 Get Hint`),
                                    
                                    React.createElement('button', {
                                        onClick: handleIDontKnow,
                                        style: {
                                            padding: '0.75rem 1rem',
                                            backgroundColor: '#6b7280',
                                            color: 'white',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }
                                    }, "I Don't Know")
                                )
                            ) :
                            showResult ?
                            // Result Display with Scoring Details
                            React.createElement('div', null,
                                React.createElement('div', {
                                    style: {
                                        padding: '1rem',
                                        backgroundColor: '#f0fdf4',
                                        border: '2px solid #10b981',
                                        borderRadius: '0.5rem',
                                        marginBottom: '1rem'
                                    }
                                },
                                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                        React.createElement('span', { style: { fontSize: '1.5rem' } }, '✅'),
                                        React.createElement('strong', { style: { color: '#065f46' } }, 'Correct!')
                                    ),
                                    React.createElement('p', null, React.createElement('strong', null, 'Species: '), React.createElement('em', null, currentSpecimen.species_name)),
                                    currentSpecimen.common_name && React.createElement('p', null, React.createElement('strong', null, 'Common: '), currentSpecimen.common_name),
                                    React.createElement('p', null, React.createElement('strong', null, 'Family: '), currentSpecimen.family),
                                    
                                    // Score breakdown
                                    lastAttemptScore && React.createElement('div', {
                                        style: {
                                            marginTop: '0.75rem',
                                            padding: '0.5rem',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
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
                                
                                React.createElement('button', {
                                    onClick: handleNext,
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }
                                }, currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 'Finish Study')
                            ) : null
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
    
    console.log('✅ Enhanced QuickStudy component loaded');
    
})();