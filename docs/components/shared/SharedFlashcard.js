// SharedFlashcard.js - Updated with lightweight session tracking
// Replaces individual flashcard saves with aggregated session data

(function() {
    'use strict';
    
    window.SharedFlashcard = function SharedFlashcard(props) {
        const {
            specimens = [],
            mode = 'quick', // 'quick', 'focused', 'marathon'
            filters = null, // For focused study
            onBack,
            loadSpecimenPhotos,
            specimenPhotos = {},
            speciesHints = {},
            referencePhotos = {},
            user,
            saveProgress  // Keep this prop but won't use it for flashcards
        } = props;
        
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

        // Initialize session tracking when component mounts
        React.useEffect(() => {
            if (user && window.SessionTracker) {
                console.log('📊 Starting study session:', mode);
                window.SessionTracker.startSession(user.id, mode, filters);
            }
            
            // Cleanup: End session when component unmounts
            return () => {
                if (window.SessionTracker && window.SessionTracker.currentSession) {
                    console.log('📊 Ending study session');
                    window.SessionTracker.endSession();
                }
            };
        }, [user, mode, filters]);

        // Get study specimens based on mode
        const studySpecimens = React.useMemo(() => {
            let filtered = specimens.filter(s => s.status === 'approved');
            
            // Apply filters for focused study
            if (mode === 'focused' && filters) {
                if (filters.family && filters.family.length > 0) {
                    filtered = filtered.filter(s => filters.family.includes(s.family));
                }
                if (filters.genus && filters.genus.length > 0) {
                    filtered = filtered.filter(s => filters.genus.includes(s.genus));
                }
                if (filters.features) {
                    if (filters.features.includes('dna_verified')) {
                        filtered = filtered.filter(s => s.dna_sequenced);
                    }
                    if (filters.features.includes('has_common_name')) {
                        filtered = filtered.filter(s => s.common_name);
                    }
                }
            }
            
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            
            // Return appropriate number based on mode
            if (mode === 'quick') {
                return shuffled.slice(0, Math.min(10, shuffled.length));
            } else if (mode === 'focused') {
                return shuffled.slice(0, Math.min(20, shuffled.length));
            } else if (mode === 'marathon') {
                return shuffled; // All available specimens
            }
            
            return shuffled.slice(0, 10);
        }, [specimens, mode, filters]);

        const currentSpecimen = studySpecimens[currentIndex];
        const currentPhotos = currentSpecimen ? specimenPhotos[currentSpecimen.inaturalist_id] || [] : [];
        const currentSpeciesHints = currentSpecimen ? speciesHints[currentSpecimen.species_name] : null;
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

        // Utility function for fuzzy matching
        const calculateSimilarity = (str1, str2) => {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0) return 1.0;
            
            const editDistance = levenshteinDistance(longer, shorter);
            return (longer.length - editDistance) / longer.length;
        };

        const levenshteinDistance = (str1, str2) => {
            const matrix = Array(str2.length + 1).fill(null).map(() => 
                Array(str1.length + 1).fill(null)
            );
            
            for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
            for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
            
            for (let j = 1; j <= str2.length; j++) {
                for (let i = 1; i <= str1.length; i++) {
                    const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                    matrix[j][i] = Math.min(
                        matrix[j][i - 1] + 1,
                        matrix[j - 1][i] + 1,
                        matrix[j - 1][i - 1] + substitutionCost
                    );
                }
            }
            return matrix[str2.length][str1.length];
        };

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

        // Enhanced answer validation with scoring
        const validateAnswer = (answer) => {
            if (!answer || !currentSpecimen) return { isCorrect: false, score: 0, feedback: '' };
            
            const cleaned = answer.toLowerCase().trim();
            const species = currentSpecimen.species_name.toLowerCase();
            const genus = currentSpecimen.genus.toLowerCase();
            const family = currentSpecimen.family.toLowerCase();
            const common = (currentSpecimen.common_name || '').toLowerCase();
            
            let baseScore = 0;
            let feedback = '';
            let isCorrect = false;
            
            // Perfect species match
            if (cleaned === species) {
                baseScore = 100;
                feedback = 'Perfect! Complete species identification!';
                isCorrect = true;
            }
            // Fuzzy species match (typos)
            else if (calculateSimilarity(cleaned, species) > 0.85) {
                baseScore = 95;
                feedback = 'Correct! (Minor spelling variation accepted)';
                isCorrect = true;
            }
            // Common name match
            else if (common && cleaned === common) {
                baseScore = 90;
                feedback = 'Correct! You identified it by common name!';
                isCorrect = true;
            }
            // Genus + species attempt
            else if (cleaned.includes(genus) && cleaned.split(' ').length > 1) {
                baseScore = 60;
                feedback = `Good! Genus "${currentSpecimen.genus}" is correct, but wrong species epithet.`;
            }
            // Genus only
            else if (cleaned === genus) {
                baseScore = 50;
                feedback = `Partial credit: Genus "${currentSpecimen.genus}" is correct. Need full species name.`;
            }
            // Family only
            else if (cleaned === family || cleaned.includes(family)) {
                baseScore = 30;
                feedback = `You identified the family "${currentSpecimen.family}". Try to get more specific.`;
            }
            // No match
            else {
                baseScore = 0;
                feedback = 'Not quite. Try using the hints!';
            }
            
            // Apply hint penalty
            const totalHintsUsed = currentHintLevel + hintsRevealedManually;
            const hintPenalty = Math.min(totalHintsUsed * 5, 40);
            const finalScore = Math.max(baseScore - hintPenalty, 0);
            
            return {
                isCorrect,
                baseScore,
                finalScore,
                hintPenalty,
                feedback
            };
        };

        // Handle answer submission - UPDATED WITH SESSION TRACKING
        const handleSubmitAnswer = () => {
            if (!userAnswer.trim()) return;
            
            const validation = validateAnswer(userAnswer);
            
            if (validation.isCorrect) {
                setLastAttemptScore(validation);
                setScore(prev => ({ 
                    correct: prev.correct + 1, 
                    total: prev.total + 1,
                    totalScore: prev.totalScore + validation.finalScore
                }));
                setStreak(prev => prev + 1);
                setLongestStreak(prev => Math.max(prev, streak + 1));
                setShowResult(true);
                
                // LIGHTWEIGHT SESSION TRACKING - Replace individual save
                if (window.SessionTracker) {
                    window.SessionTracker.trackFlashcard({
                        specimenId: currentSpecimen.id,
                        genus: currentSpecimen.genus,
                        family: currentSpecimen.family,
                        score: validation.finalScore,
                        hintsUsed: currentHintLevel + hintsRevealedManually,
                        isCorrect: true
                    });
                }
                
                // REMOVED: Individual flashcard database save
                // The old saveProgress call has been removed
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
                    setStreak(0); // Reset streak on wrong answer
                    setShowGuide(true);
                    
                    // Track incorrect answer in session
                    if (window.SessionTracker) {
                        window.SessionTracker.trackFlashcard({
                            specimenId: currentSpecimen.id,
                            genus: currentSpecimen.genus,
                            family: currentSpecimen.family,
                            score: validation.finalScore,
                            hintsUsed: currentHintLevel + hintsRevealedManually,
                            isCorrect: false
                        });
                    }
                }
            }
        };

        // Handle "Get Hint" button
        const handleGetHint = () => {
            if (currentHintLevel + hintsRevealedManually < 4) {
                if (currentHintLevel === 0) {
                    setCurrentHintLevel(1);
                } else {
                    setHintsRevealedManually(prev => prev + 1);
                }
            }
        };

        // Handle "I Don't Know" - UPDATED WITH SESSION TRACKING
        const handleIDontKnow = () => {
            setScore(prev => ({ 
                correct: prev.correct, 
                total: prev.total + 1,
                totalScore: prev.totalScore + 0
            }));
            setStreak(0); // Reset streak
            setShowGuide(true);
            
            // Track as incorrect with 0 score
            if (window.SessionTracker && currentSpecimen) {
                window.SessionTracker.trackFlashcard({
                    specimenId: currentSpecimen.id,
                    genus: currentSpecimen.genus,
                    family: currentSpecimen.family,
                    score: 0,
                    hintsUsed: currentHintLevel + hintsRevealedManually,
                    isCorrect: false
                });
            }
        };

        // Move to next question
        const handleNext = () => {
            if (currentIndex < studySpecimens.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setUserAnswer('');
                setCurrentHintLevel(0);
                setHintsRevealedManually(0);
                setShowResult(false);
                setShowGuide(false);
                setLastAttemptScore(null);
                setSelectedPhoto(null);
            } else {
                // Study complete - end session
                handleStudyComplete();
            }
        };

        // Handle study completion - NEW FUNCTION
        const handleStudyComplete = async () => {
            const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;
            const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
            const sessionTime = Math.round((Date.now() - sessionStartTime) / 60000);
            
            // End session and save final stats
            if (window.SessionTracker) {
                const sessionSummary = await window.SessionTracker.endSession();
                console.log('📊 Study session complete:', sessionSummary);
            }
            
            // Show completion dialog
            alert(
                `🍄 Study Complete!\n\n` +
                `✅ Correct: ${score.correct}/${score.total} (${accuracy}%)\n` +
                `📊 Average Score: ${avgScore}%\n` +
                `🔥 Longest Streak: ${longestStreak}\n` +
                `⏱️ Time: ${sessionTime} minutes\n\n` +
                `${avgScore >= 80 ? '🏆 Excellent work!' : avgScore >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}`
            );
            
            onBack();
        };

        if (!currentSpecimen) {
            return React.createElement('div', { 
                style: { 
                    padding: '2rem', 
                    textAlign: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                } 
            },
                React.createElement('div', null,
                    React.createElement('h2', { style: { marginBottom: '1rem' } }, 'No specimens available for study'),
                    React.createElement('p', { style: { marginBottom: '1rem', color: '#6b7280' } }, 
                        `No approved specimens found${mode === 'focused' ? ' matching your filters' : ''}.`
                    ),
                    React.createElement('button', { 
                        onClick: onBack,
                        style: {
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer'
                        }
                    }, 'Back to Home')
                )
            );
        }

        // Calculate current stats for display
        const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;
        const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header with enhanced stats (original design)
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
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                        } 
                    },
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
                                        fontSize: '1.25rem', 
                                        fontWeight: 'bold' 
                                    } 
                                }, mode === 'quick' ? 'Quick Study' : 
                                   mode === 'focused' ? 'Focused Study' : 
                                   'Marathon Mode'),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.875rem', 
                                        color: '#6b7280' 
                                    } 
                                },
                                    `Question ${currentIndex + 1} of ${mode === 'marathon' ? '∞' : studySpecimens.length}`
                                )
                            )
                        ),
                        // Stats display (original design)
                        React.createElement('div', { 
                            style: { 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1.5rem' 
                            } 
                        },
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold' 
                                    } 
                                }, `${score.correct}/${score.total}`),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280' 
                                    } 
                                }, 'Correct')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#ef4444'
                                    } 
                                }, `${accuracy}%`),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280' 
                                    } 
                                }, 'Accuracy')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: streak > 0 ? '#f59e0b' : '#6b7280'
                                    } 
                                }, `🔥 ${streak}`),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280' 
                                    } 
                                }, 'Streak')
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
                    mode !== 'marathon' && React.createElement('div', { 
                        style: { 
                            marginTop: '0.5rem', 
                            backgroundColor: '#e5e7eb', 
                            height: '0.25rem', 
                            borderRadius: '9999px' 
                        } 
                    },
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

            // Main Content - Rest of UI remains exactly the same
            React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                    // Left: Photos
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: 'white', 
                            borderRadius: '0.75rem', 
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        } 
                    },
                        React.createElement('h3', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem' 
                            } 
                        }, '📸 Specimen Photos'),
                        
                        // Specimen info
                        React.createElement('div', { 
                            style: { 
                                marginBottom: '1rem', 
                                padding: '0.75rem', 
                                backgroundColor: '#f3f4f6', 
                                borderRadius: '0.5rem' 
                            } 
                        },
                            React.createElement('p', { style: { fontSize: '0.875rem' } },
                                React.createElement('strong', null, 'Location: '), currentSpecimen.location
                            ),
                            currentSpecimen.description && React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem', 
                                    marginTop: '0.25rem' 
                                } 
                            },
                                React.createElement('strong', null, 'Notes: '), 
                                currentSpecimen.description.length > 100 ? 
                                    currentSpecimen.description.substring(0, 100) + '...' : 
                                    currentSpecimen.description
                            )
                        ),
                        
                        // Photos grid
                        !photosLoaded ? 
                            React.createElement('div', { 
                                style: { 
                                    textAlign: 'center', 
                                    padding: '2rem' 
                                } 
                            }, 'Loading photos...') :
                        currentPhotos.length > 0 ?
                            React.createElement('div', null,
                                React.createElement('div', { 
                                    style: { 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(2, 1fr)', 
                                        gap: '0.5rem' 
                                    } 
                                },
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
                                                border: '2px solid transparent',
                                                transition: 'border-color 0.2s'
                                            },
                                            onMouseEnter: (e) => e.target.style.borderColor = '#3b82f6',
                                            onMouseLeave: (e) => e.target.style.borderColor = 'transparent'
                                        })
                                    )
                                ),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280', 
                                        marginTop: '0.5rem', 
                                        textAlign: 'center' 
                                    } 
                                }, 'Click any photo to enlarge')
                            ) :
                            React.createElement('div', { 
                                style: { 
                                    textAlign: 'center', 
                                    padding: '2rem',
                                    color: '#6b7280'
                                } 
                            }, 'No photos available')
                    ),

                    // Right: Answer Interface
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: 'white', 
                            borderRadius: '0.75rem', 
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        } 
                    },
                        React.createElement('h3', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem' 
                            } 
                        }, '🔍 Identify This Mushroom'),
                        
                        // Show hints if any revealed
                        (currentHintLevel > 0 || hintsRevealedManually > 0) && !showResult && !showGuide && 
                        React.createElement('div', {
                            style: {
                                backgroundColor: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }
                        },
                            React.createElement('div', { 
                                style: { 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    marginBottom: '0.5rem' 
                                } 
                            },
                                React.createElement('h4', { 
                                    style: { 
                                        fontWeight: '500', 
                                        color: '#92400e' 
                                    } 
                                }, `💡 Hints (${currentHintLevel + hintsRevealedManually}/4)`),
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
                                    React.createElement('p', { 
                                        style: { 
                                            fontSize: '0.875rem', 
                                            color: '#374151', 
                                            margin: 0 
                                        } 
                                    }, `${idx + 1}. ${hint.text}`)
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
                                    }, '💡 Hint'),
                                    
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
                            // Result Display
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
                                    React.createElement('div', { 
                                        style: { 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            marginBottom: '0.5rem' 
                                        } 
                                    },
                                        React.createElement('span', { style: { fontSize: '1.5rem' } }, '✅'),
                                        React.createElement('strong', { style: { color: '#065f46' } }, 'Correct!')
                                    ),
                                    React.createElement('p', null, 
                                        React.createElement('strong', null, 'Species: '), 
                                        React.createElement('em', null, currentSpecimen.species_name)
                                    ),
                                    currentSpecimen.common_name && React.createElement('p', null, 
                                        React.createElement('strong', null, 'Common: '), currentSpecimen.common_name
                                    ),
                                    React.createElement('p', null, 
                                        React.createElement('strong', null, 'Family: '), currentSpecimen.family
                                    ),
                                    
                                    // Score breakdown
                                    React.createElement('div', {
                                        style: {
                                            marginTop: '0.75rem',
                                            padding: '0.5rem',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            borderRadius: '0.25rem'
                                        }
                                    },
                                        React.createElement('p', { 
                                            style: { 
                                                fontSize: '0.875rem', 
                                                marginBottom: '0.25rem' 
                                            } 
                                        },
                                            React.createElement('strong', null, 'Score Breakdown:')
                                        ),
                                        React.createElement('div', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                color: '#374151' 
                                            } 
                                        },
                                            React.createElement('p', null, `Base Score: ${lastAttemptScore.baseScore}%`),
                                            lastAttemptScore.hintPenalty > 0 && React.createElement('p', null, 
                                                `Hint Penalty: -${lastAttemptScore.hintPenalty}%`
                                            ),
                                            React.createElement('p', { 
                                                style: { 
                                                    fontWeight: 'bold', 
                                                    marginTop: '0.25rem' 
                                                } 
                                            }, `Final Score: ${lastAttemptScore.finalScore}%`)
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
                                }, mode === 'marathon' ? 'Next Question →' :
                                   currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 
                                   'Finish Study')
                            ) : null
                    )
                )
            ),

            // Interactive Species Guide Modal
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
    
    console.log('✅ SharedFlashcard component loaded successfully (with session tracking v2.0)');
    
})();