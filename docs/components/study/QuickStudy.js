// components/study/QuickStudy.js
// Quick Study mode component with progressive hints and scoring

const h = React.createElement;

function QuickStudy(props) {
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
        if (!answer || !currentSpecimen) return { isCorrect: false, score: 0, feedback: '' };
        
        // Use fuzzy matching utilities if available
        if (window.FuzzyMatching) {
            const validation = window.FuzzyMatching.validateTaxonomicAnswer(answer, currentSpecimen);
            return {
                isCorrect: validation.isCorrect,
                baseScore: validation.score,
                finalScore: validation.score,
                hintPenalty: 0,
                feedback: validation.feedback
            };
        }
        
        // Fallback validation logic
        const cleaned = answer.toLowerCase().trim();
        const species = currentSpecimen.species_name.toLowerCase();
        const genus = currentSpecimen.genus.toLowerCase();
        const family = currentSpecimen.family.toLowerCase();
        const common = (currentSpecimen.common_name || '').toLowerCase();
        
        let baseScore = 0;
        let feedback = '';
        let isCorrect = false;
        
        if (cleaned === species) {
            baseScore = 100;
            feedback = 'Perfect! Complete species identification!';
            isCorrect = true;
        } else if (common && cleaned === common) {
            baseScore = 90;
            feedback = 'Correct! You identified it by common name!';
            isCorrect = true;
        } else if (cleaned.includes(genus) && cleaned.split(' ').length > 1) {
            baseScore = 60;
            feedback = `Good! Genus "${currentSpecimen.genus}" is correct, but wrong species epithet.`;
        } else if (cleaned === genus) {
            baseScore = 50;
            feedback = `Partial credit: Genus "${currentSpecimen.genus}" is correct. Need full species name.`;
        } else if (cleaned === family || cleaned.includes(family)) {
            baseScore = 30;
            feedback = `You identified the family "${currentSpecimen.family}". Try to get more specific.`;
        } else {
            baseScore = 0;
            feedback = 'Not quite. Try using the hints!';
        }
        
        const totalHintsUsed = currentHintLevel + hintsRevealedManually;
        const hintPenalty = Math.min(totalHintsUsed * 5, 40);
        const finalScore = Math.max(baseScore - hintPenalty, 0);
        
        return {
            isCorrect: isCorrect,
            baseScore: baseScore,
            finalScore: finalScore,
            hintPenalty: hintPenalty,
            feedback: feedback
        };
    };

    // Handle answer submission with progressive hints
    const handleSubmitAnswer = () => {
        if (!userAnswer.trim()) return;
        
        const validation = validateAnswer(userAnswer);
        setAttemptCount(prev => prev + 1);
        
        if (validation.isCorrect) {
            setLastAttemptScore(validation);
            setScore(prev => ({ 
                correct: prev.correct + 1, 
                total: prev.total + 1,
                totalScore: prev.totalScore + validation.finalScore
            }));
            setShowResult(true);
            
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
            setLastAttemptScore(validation);
            if (currentHintLevel < 4) {
                setCurrentHintLevel(prev => prev + 1);
                setUserAnswer('');
            } else {
                setScore(prev => ({ 
                    correct: prev.correct, 
                    total: prev.total + 1,
                    totalScore: prev.totalScore + validation.finalScore
                }));
                setShowGuide(true);
            }
        }
    };

    const handleGetHint = () => {
        if (currentHintLevel + hintsRevealedManually < 4) {
            if (currentHintLevel === 0) {
                setCurrentHintLevel(1);
            } else if (currentHintLevel + hintsRevealedManually < 4) {
                setHintsRevealedManually(prev => prev + 1);
            }
        }
    };

    const handleIDontKnow = () => {
        setScore(prev => ({ 
            correct: prev.correct, 
            total: prev.total + 1,
            totalScore: prev.totalScore + 0
        }));
        setShowGuide(true);
    };

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
            const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;
            const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
            
            alert(
                `🍄 Study Complete!\n\n` +
                `✅ Correct: ${score.correct}/${score.total} (${accuracy}%)\n` +
                `📊 Average Score: ${avgScore}%\n` +
                `${avgScore >= 80 ? '🌟 Excellent work!' : avgScore >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}`
            );
            onBack();
        }
    };

    if (!currentSpecimen) {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h2', null, 'No specimens available for study'),
            h('button', { onClick: onBack }, 'Back to Home')
        );
    }

    const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header with enhanced scoring display
        h('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        h('button', { onClick: onBack, style: { background: 'none', border: 'none', cursor: 'pointer' } }, '← Back'),
                        h('div', null,
                            h('h1', { style: { fontSize: '1.25rem', fontWeight: 'bold' } }, 'Quick Study'),
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                                `Question ${currentIndex + 1} of ${studySpecimens.length}`
                            )
                        )
                    ),
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        h('div', { style: { textAlign: 'center' } },
                            h('div', { style: { fontSize: '1.125rem', fontWeight: 'bold' } },
                                `${score.correct}/${score.total}`
                            ),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Correct')
                        ),
                        h('div', { style: { textAlign: 'center' } },
                            h('div', { 
                                style: { 
                                    fontSize: '1.125rem', 
                                    fontWeight: 'bold',
                                    color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444'
                                } 
                            },
                                `${avgScore}%`
                            ),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Score')
                        ),
                        currentSpecimen.dna_sequenced && window.DNABadge && h(window.DNABadge, { size: 'sm' })
                    )
                ),
                // Progress bar
                h('div', { style: { marginTop: '0.5rem', backgroundColor: '#e5e7eb', height: '0.25rem', borderRadius: '9999px' } },
                    h('div', {
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
        h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                // Left: Photos
                h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' } },
                    h('h3', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Specimen Photos'),
                    
                    // Specimen info
                    h('div', { style: { marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' } },
                        h('p', { style: { fontSize: '0.875rem' } },
                            h('strong', null, 'Location: '), currentSpecimen.location
                        ),
                        currentSpecimen.description && h('p', { style: { fontSize: '0.875rem', marginTop: '0.25rem' } },
                            h('strong', null, 'Notes: '), currentSpecimen.description.substring(0, 100) + '...'
                        )
                    ),
                    
                    // Photos grid
                    !photosLoaded ? 
                        h('div', { style: { textAlign: 'center', padding: '2rem' } }, 'Loading photos...') :
                    currentPhotos.length > 0 ?
                        h('div', null,
                            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                currentPhotos.slice(0, 4).map((photo, idx) =>
                                    h('img', {
                                        key: idx,
                                        src: photo.medium_url,
                                        alt: `Photo ${idx + 1}`,
                                        onClick: () => setSelectedPhoto(photo),
                                        style: {
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer'
                                        }
                                    })
                                )
                            ),
                            h('p', { style: { fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' } },
                                'Click any photo to enlarge'
                            )
                        ) :
                        h('div', { style: { textAlign: 'center', padding: '2rem' } }, 'No photos available')
                ),

                // Right: Answer Interface
                h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' } },
                    h('h3', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Identify This Mushroom'),
                    
                    // Show hints if any revealed
                    (currentHintLevel > 0 || hintsRevealedManually > 0) && !showResult && !showGuide && h('div', {
                        style: {
                            backgroundColor: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }
                    },
                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } },
                            h('h4', { style: { fontWeight: '500', color: '#92400e' } }, 
                                `💡 Hints (${currentHintLevel + hintsRevealedManually}/4)`
                            ),
                            (currentHintLevel + hintsRevealedManually) > 0 && h('span', { 
                                style: { 
                                    fontSize: '0.75rem', 
                                    color: '#dc2626',
                                    backgroundColor: '#fee2e2',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '0.25rem'
                                } 
                            }, `-${(currentHintLevel + hintsRevealedManually) * 5}% penalty`)
                        ),
                        
                        hints.slice(0, currentHintLevel + hintsRevealedManually).map((hint, idx) => {
                            const isLatest = idx === currentHintLevel + hintsRevealedManually - 1;
                            return h('div', {
                                key: idx,
                                style: {
                                    marginBottom: idx < currentHintLevel + hintsRevealedManually - 1 ? '0.5rem' : 0,
                                    padding: '0.5rem',
                                    backgroundColor: isLatest ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                                    borderRadius: '0.25rem',
                                    borderLeft: `3px solid ${isLatest ? '#f59e0b' : 'transparent'}`
                                }
                            },
                                h('p', { style: { fontSize: '0.875rem', color: '#374151', margin: 0 } }, 
                                    `${idx + 1}. ${hint.text}`
                                )
                            );
                        }),
                        
                        lastAttemptScore && !lastAttemptScore.isCorrect && h('div', {
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
                        h('div', null,
                            h('div', { style: { marginBottom: '1rem' } },
                                h('input', {
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
                            
                            h('div', { style: { display: 'flex', gap: '0.5rem' } },
                                h('button', {
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
                                
                                h('button', {
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
                                
                                h('button', {
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
                        // Result Display
                        h('div', null,
                            h('div', {
                                style: {
                                    padding: '1rem',
                                    backgroundColor: '#f0fdf4',
                                    border: '2px solid #10b981',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem'
                                }
                            },
                                h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                    h('span', { style: { fontSize: '1.5rem' } }, '✅'),
                                    h('strong', { style: { color: '#065f46' } }, 'Correct!')
                                ),
                                h('p', null, h('strong', null, 'Species: '), h('em', null, currentSpecimen.species_name)),
                                currentSpecimen.common_name && h('p', null, h('strong', null, 'Common: '), currentSpecimen.common_name),
                                h('p', null, h('strong', null, 'Family: '), currentSpecimen.family),
                                
                                lastAttemptScore && h('div', {
                                    style: {
                                        marginTop: '0.75rem',
                                        padding: '0.5rem',
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        borderRadius: '0.25rem'
                                    }
                                },
                                    h('p', { style: { fontSize: '0.875rem', marginBottom: '0.25rem' } },
                                        h('strong', null, 'Score Breakdown:')
                                    ),
                                    h('div', { style: { fontSize: '0.75rem', color: '#374151' } },
                                        h('p', null, `Base Score: ${lastAttemptScore.baseScore}%`),
                                        lastAttemptScore.hintPenalty > 0 && h('p', null, 
                                            `Hint Penalty: -${lastAttemptScore.hintPenalty}%`
                                        ),
                                        h('p', { style: { fontWeight: 'bold', marginTop: '0.25rem' } }, 
                                            `Final Score: ${lastAttemptScore.finalScore}%`
                                        )
                                    )
                                )
                            ),
                            
                            h('button', {
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

        // Interactive Species Guide
        showGuide && window.InteractiveSpeciesGuide && h(window.InteractiveSpeciesGuide, {
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
        selectedPhoto && h('div', {
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
            h('img', {
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
}

// Export to window for global access
window.QuickStudy = QuickStudy;