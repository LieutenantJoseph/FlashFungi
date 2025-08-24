// SharedFlashcard.js - Shared flashcard component used by all study modes
// Updated with Living Mycology Design System - Functionality preserved

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
            saveProgress
        } = props;
        
        // Get design system
        const design = window.FLASH_FUNGI_DESIGN || {};
        
        // State - UNCHANGED
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

        // Get study specimens based on mode - UNCHANGED
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

        // Load photos when specimen changes - UNCHANGED
        React.useEffect(() => {
            if (currentSpecimen.id && loadSpecimenPhotos) {
                setPhotosLoaded(false);
                loadSpecimenPhotos(currentSpecimen.id).then(() => {
                    setPhotosLoaded(true);
                });
            }
        }, [currentSpecimen.id, loadSpecimenPhotos]);

        // Calculate accuracy - UNCHANGED
        const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

        // Touch gestures - UNCHANGED
        React.useEffect(() => {
            if (window.TouchGestures) {
                const cleanup = window.TouchGestures.init('flashcard-container', {
                    onSwipeLeft: () => handleNext(),
                    onSwipeRight: () => currentIndex > 0 && setCurrentIndex(prev => prev - 1)
                });
                return cleanup;
            }
        }, [currentIndex]);

        // Calculate string similarity for fuzzy matching - UNCHANGED
        const calculateSimilarity = (str1, str2) => {
            const matrix = [];
            for (let i = 0; i <= str2.length; i++) {
                matrix[i] = [i];
            }
            for (let j = 0; j <= str1.length; j++) {
                matrix[0][j] = j;
            }
            for (let i = 1; i <= str2.length; i++) {
                for (let j = 1; j <= str1.length; j++) {
                    const substitutionCost = str1[j - 1] === str2[i - 1] ? 0 : 1;
                    matrix[i][j] = Math.min(
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1,
                        matrix[i - 1][j - 1] + substitutionCost
                    );
                }
            }
            return 1 - (matrix[str2.length][str1.length] / Math.max(str1.length, str2.length));
        };

        // Get hints from database or generate fallback - UNCHANGED
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

        // Enhanced answer validation with scoring - UNCHANGED
        const validateAnswer = (answer) => {
            if (!answer || !currentSpecimen) return { isCorrect: false, score: 0, feedback: '' };
            
            const cleaned = answer.toLowerCase().trim();
            const species = currentSpecimen.species_name?.toLowerCase() || '';
            const genus = currentSpecimen.genus?.toLowerCase() || '';
            const family = currentSpecimen.family?.toLowerCase() || '';
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

        // Handle answer submission - UNCHANGED
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
                }
            }
        };

        // Handle "Get Hint" button - UNCHANGED
        const handleGetHint = () => {
            if (currentHintLevel + hintsRevealedManually < 4) {
                if (currentHintLevel === 0) {
                    setCurrentHintLevel(1);
                } else {
                    setHintsRevealedManually(prev => prev + 1);
                }
            }
        };

        // Handle "I Don't Know" - UNCHANGED
        const handleIDontKnow = () => {
            setScore(prev => ({ 
                correct: prev.correct, 
                total: prev.total + 1,
                totalScore: prev.totalScore + 0
            }));
            setStreak(0); // Reset streak
            setShowGuide(true);
        };

        // Move to next question - UNCHANGED
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
                // Study complete
                const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;
                const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                const sessionTime = Math.round((Date.now() - sessionStartTime) / 60000);
                
                alert(
                    `🍄 Study Complete!\n\n` +
                    `✅ Correct: ${score.correct}/${score.total} (${accuracy}%)\n` +
                    `📊 Average Score: ${avgScore}%\n` +
                    `🔥 Longest Streak: ${longestStreak}\n` +
                    `⏱️ Time: ${sessionTime} minutes\n\n` +
                    `${avgScore >= 80 ? '🏆 Excellent work!' : avgScore >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}`
                );
                
                if (onBack) onBack();
            }
        };

        // Empty state
        if (studySpecimens.length === 0) {
            return React.createElement('div', { 
                style: { 
                    minHeight: '100vh', 
                    backgroundColor: design.colors?.bgPrimary || '#1A1A19',
                    color: design.colors?.textPrimary || '#F5F5DC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                } 
            },
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('h2', null, 'No specimens available'),
                    React.createElement('p', { style: { marginBottom: '1rem', color: design.colors?.textSecondary || '#D3D3C7' } }, 
                        mode === 'focused' ? 'Try adjusting your filters.' : 'Loading specimens...'
                    ),
                    React.createElement('button', { 
                        onClick: onBack,
                        style: { 
                            padding: '0.75rem 1.5rem',
                            background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                            color: 'white',
                            borderRadius: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }
                    }, '← Back')
                )
            );
        }

        // Main render
        return React.createElement('div', { 
            id: 'flashcard-container',
            style: { 
                minHeight: '100vh', 
                backgroundColor: design.colors?.bgPrimary || '#1A1A19',
                color: design.colors?.textPrimary || '#F5F5DC',
                position: 'relative'
            } 
        },
            // Header
            React.createElement('div', { 
                style: { 
                    background: `linear-gradient(180deg, ${design.colors?.bgSecondary || '#2D2D2A'} 0%, transparent 100%)`,
                    borderBottom: '1px solid rgba(139,69,19,0.2)',
                    boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)'
                } 
            },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1rem 1.5rem' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        // Left section
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                            React.createElement('button', { 
                                onClick: onBack, 
                                style: { 
                                    padding: '0.5rem 1rem',
                                    background: design.colors?.bgCard || '#2A2826',
                                    border: '1px solid rgba(139,69,19,0.2)',
                                    borderRadius: '0.5rem',
                                    color: design.colors?.textSecondary || '#D3D3C7',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                } 
                            }, '← Back'),
                            React.createElement('div', null,
                                React.createElement('h2', { 
                                    style: { 
                                        fontSize: '1.25rem', 
                                        fontWeight: 'bold',
                                        color: design.colors?.textPrimary || '#F5F5DC'
                                    } 
                                }, 
                                    mode === 'quick' ? '⚡ Quick Study' : 
                                    mode === 'focused' ? '🎯 Focused Study' : 
                                    '🏃 Marathon Mode'
                                ),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.875rem', 
                                        color: design.colors?.textMuted || '#A8A89C'
                                    } 
                                },
                                    `Question ${currentIndex + 1} of ${mode === 'marathon' ? '∞' : studySpecimens.length}`
                                )
                            )
                        ),
                        // Stats display
                        React.createElement('div', { 
                            style: { 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                padding: '0.5rem 1rem',
                                background: design.colors?.bgCard || '#2A2826',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(139,69,19,0.2)'
                            } 
                        },
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: design.colors?.textPrimary || '#F5F5DC'
                                    } 
                                }, `${score.correct}/${score.total}`),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: design.colors?.textMuted || '#A8A89C'
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
                                        color: design.colors?.textMuted || '#A8A89C'
                                    } 
                                }, 'Accuracy')
                            ),
                            streak > 0 && React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: design.colors?.accent || '#FF6B35'
                                    } 
                                }, `🔥 ${streak}`),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: design.colors?.textMuted || '#A8A89C'
                                    } 
                                }, 'Streak')
                            )
                        )
                    ),
                    // Progress bar
                    React.createElement('div', { 
                        style: { 
                            marginTop: '0.75rem',
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: design.colors?.bgSecondary || '#2D2D2A', 
                            borderRadius: '0.5rem',
                            overflow: 'hidden'
                        } 
                    },
                        React.createElement('div', {
                            style: {
                                width: `${((currentIndex + 1) / studySpecimens.length) * 100}%`,
                                height: '100%',
                                background: design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
                                borderRadius: '0.5rem',
                                transition: 'width 0.5s ease-out'
                            }
                        })
                    )
                )
            ),

            // Main Content
            React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                    // Left: Photos
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: design.colors?.bgCard || '#2A2826', 
                            borderRadius: '1rem', 
                            padding: '1.5rem',
                            border: '1px solid rgba(139,69,19,0.2)',
                            boxShadow: design.shadows?.lg || '0 8px 32px rgba(0,0,0,0.5)'
                        } 
                    },
                        React.createElement('h3', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem',
                                color: design.colors?.textPrimary || '#F5F5DC'
                            } 
                        }, '📸 Specimen Photos'),
                        
                        // Specimen info
                        React.createElement('div', { 
                            style: { 
                                marginBottom: '1rem', 
                                padding: '0.75rem', 
                                backgroundColor: design.colors?.bgSecondary || '#2D2D2A', 
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(139,69,19,0.15)'
                            } 
                        },
                            React.createElement('p', { style: { fontSize: '0.875rem', color: design.colors?.textSecondary || '#D3D3C7' } },
                                React.createElement('strong', null, 'Location: '), currentSpecimen.location
                            ),
                            currentSpecimen.description && React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem', 
                                    marginTop: '0.25rem',
                                    color: design.colors?.textSecondary || '#D3D3C7'
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
                                    padding: '2rem',
                                    color: design.colors?.textMuted || '#A8A89C'
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
                                                transition: 'all 0.3s ease'
                                            },
                                            onMouseEnter: (e) => {
                                                e.target.style.borderColor = design.colors?.primary || '#8B4513';
                                                e.target.style.transform = 'scale(1.02)';
                                            },
                                            onMouseLeave: (e) => {
                                                e.target.style.borderColor = 'transparent';
                                                e.target.style.transform = 'scale(1)';
                                            }
                                        })
                                    )
                                ),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: design.colors?.textMuted || '#A8A89C', 
                                        marginTop: '0.5rem', 
                                        textAlign: 'center' 
                                    } 
                                }, `${currentPhotos.length} photo${currentPhotos.length !== 1 ? 's' : ''} available • Click to enlarge`)
                            ) :
                            React.createElement('div', { 
                                style: { 
                                    textAlign: 'center', 
                                    padding: '2rem',
                                    color: design.colors?.textMuted || '#A8A89C'
                                } 
                            }, 'No photos available')
                    ),

                    // Right: Answer area
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: design.colors?.bgCard || '#2A2826', 
                            borderRadius: '1rem', 
                            padding: '1.5rem',
                            border: '1px solid rgba(139,69,19,0.2)',
                            boxShadow: design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)'
                        } 
                    },
                        React.createElement('h3', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem',
                                color: design.colors?.textPrimary || '#F5F5DC'
                            } 
                        }, '🔍 Identify This Specimen'),

                        // Hints display
                        React.createElement('div', { 
                            style: { 
                                marginBottom: '1rem', 
                                padding: '0.75rem', 
                                backgroundColor: design.colors?.bgSecondary || '#2D2D2A', 
                                borderRadius: '0.5rem',
                                minHeight: '100px',
                                border: '1px solid rgba(139,69,19,0.15)'
                            } 
                        },
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    marginBottom: '0.5rem',
                                    color: design.colors?.textMuted || '#A8A89C'
                                } 
                            }, `💡 Hints (${4 - currentHintLevel - hintsRevealedManually} remaining)`),
                            
                            hints.slice(0, currentHintLevel + hintsRevealedManually).map((hint, idx) => {
                                return React.createElement('div', {
                                    key: idx,
                                    style: {
                                        padding: '0.5rem',
                                        marginBottom: '0.25rem',
                                        backgroundColor: design.colors?.bgTertiary || '#3A3A37',
                                        borderRadius: '0.25rem',
                                        borderLeft: `3px solid ${idx === 0 ? '#f59e0b' : idx === 1 ? '#3b82f6' : idx === 2 ? '#10b981' : '#8b5cf6'}`
                                    }
                                },
                                    React.createElement('p', { 
                                        style: { 
                                            fontSize: '0.875rem', 
                                            color: design.colors?.textPrimary || '#F5F5DC', 
                                            margin: 0 
                                        } 
                                    }, `${idx + 1}. ${hint.text}`)
                                );
                            }),
                            
                            lastAttemptScore && !lastAttemptScore.isCorrect && React.createElement('div', {
                                style: {
                                    marginTop: '0.75rem',
                                    padding: '0.5rem',
                                    backgroundColor: lastAttemptScore.baseScore > 0 ? 'rgba(34,139,34,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: design.colors?.textPrimary || '#F5F5DC',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem',
                                    border: `1px solid ${lastAttemptScore.baseScore > 0 ? 'rgba(34,139,34,0.3)' : 'rgba(239,68,68,0.3)'}`
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
                                            padding: '0.875rem',
                                            background: design.colors?.bgSecondary || '#2D2D2A',
                                            border: '1px solid rgba(139,69,19,0.2)',
                                            borderRadius: '0.75rem',
                                            color: design.colors?.textPrimary || '#F5F5DC',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        },
                                        onFocus: (e) => {
                                            e.target.style.borderColor = design.colors?.primary || '#8B4513';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(139,69,19,0.1)';
                                        },
                                        onBlur: (e) => {
                                            e.target.style.borderColor = 'rgba(139,69,19,0.2)';
                                            e.target.style.boxShadow = 'none';
                                        }
                                    })
                                ),
                                
                                React.createElement('div', { style: { display: 'flex', gap: '0.5rem' } },
                                    React.createElement('button', {
                                        onClick: handleSubmitAnswer,
                                        disabled: !userAnswer.trim(),
                                        style: {
                                            flex: 1,
                                            padding: '0.875rem',
                                            background: userAnswer.trim() ? 
                                                design.gradients?.earth || 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)' : 
                                                design.colors?.bgSecondary || '#2D2D2A',
                                            color: userAnswer.trim() ? 'white' : design.colors?.textMuted || '#A8A89C',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                                            fontWeight: '600',
                                            boxShadow: userAnswer.trim() ? design.shadows?.md || '0 4px 16px rgba(0,0,0,0.4)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }
                                    }, currentHintLevel > 0 ? 'Try Again' : 'Submit Answer'),
                                    
                                    React.createElement('button', {
                                        onClick: handleGetHint,
                                        disabled: currentHintLevel + hintsRevealedManually >= 4,
                                        style: {
                                            padding: '0.875rem 1rem',
                                            background: currentHintLevel + hintsRevealedManually < 4 ? 
                                                'linear-gradient(135deg, #228B22 0%, #8FBC8F 100%)' : 
                                                design.colors?.bgSecondary || '#2D2D2A',
                                            color: currentHintLevel + hintsRevealedManually < 4 ? 'white' : design.colors?.textMuted || '#A8A89C',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            cursor: currentHintLevel + hintsRevealedManually < 4 ? 'pointer' : 'not-allowed',
                                            fontWeight: '600',
                                            boxShadow: currentHintLevel + hintsRevealedManually < 4 ? '0 4px 12px rgba(34,139,34,0.3)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }
                                    }, '💡 Hint'),
                                    
                                    React.createElement('button', {
                                        onClick: handleIDontKnow,
                                        style: {
                                            padding: '0.875rem 1rem',
                                            background: design.colors?.bgTertiary || '#3A3A37',
                                            color: design.colors?.textSecondary || '#D3D3C7',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(139,69,19,0.2)',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.3s ease'
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
                                        background: 'rgba(34,139,34,0.1)',
                                        border: '1px solid rgba(16,185,129,0.3)',
                                        borderRadius: '0.75rem',
                                        marginBottom: '1rem',
                                        backdropFilter: 'blur(10px)'
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
                                        React.createElement('strong', { style: { color: design.colors?.textPrimary || '#F5F5DC' } }, 'Correct!')
                                    ),
                                    React.createElement('p', { style: { color: design.colors?.textSecondary || '#D3D3C7' } }, 
                                        React.createElement('strong', null, 'Species: '), 
                                        React.createElement('em', null, currentSpecimen.species_name)
                                    ),
                                    currentSpecimen.common_name && React.createElement('p', { style: { color: design.colors?.textSecondary || '#D3D3C7' } }, 
                                        React.createElement('strong', null, 'Common: '), currentSpecimen.common_name
                                    ),
                                    React.createElement('p', { style: { color: design.colors?.textSecondary || '#D3D3C7' } }, 
                                        React.createElement('strong', null, 'Family: '), currentSpecimen.family
                                    ),
                                    
                                    // Score breakdown
                                    React.createElement('div', {
                                        style: {
                                            marginTop: '0.75rem',
                                            padding: '0.5rem',
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            borderRadius: '0.25rem'
                                        }
                                    },
                                        React.createElement('p', { 
                                            style: { 
                                                fontSize: '0.875rem', 
                                                marginBottom: '0.25rem',
                                                color: design.colors?.textPrimary || '#F5F5DC'
                                            } 
                                        },
                                            React.createElement('strong', null, 'Score Breakdown:')
                                        ),
                                        React.createElement('div', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                color: design.colors?.textSecondary || '#D3D3C7'
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
                                        padding: '0.875rem',
                                        background: 'linear-gradient(135deg, #228B22 0%, #8FBC8F 100%)',
                                        color: 'white',
                                        borderRadius: '0.75rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 12px rgba(34,139,34,0.3)',
                                        transition: 'all 0.3s ease'
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
                    backgroundColor: 'rgba(0,0,0,0.95)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    cursor: 'zoom-out'
                },
                onClick: () => setSelectedPhoto(null)
            },
                React.createElement('img', {
                    src: selectedPhoto.large_url || selectedPhoto.medium_url,
                    alt: 'Enlarged photo',
                    style: {
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain',
                        borderRadius: '1rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                    }
                })
            )
        );
    };
    
    console.log('✅ SharedFlashcard component loaded successfully (with session tracking v2.0)');
    
})();