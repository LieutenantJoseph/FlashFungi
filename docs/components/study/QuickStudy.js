// QuickStudy Component - Phase 3 Enhanced with Touch Gestures
// Interactive flashcard-style study mode with mobile optimization

(function() {
    'use strict';
    
    const { useState, useEffect, useMemo, useCallback, useRef } = React;
    
    window.QuickStudy = function QuickStudy(props) {
        const {
            specimens = [],
            speciesHints = {},
            referencePhotos = {},
            specimenPhotos = {},
            user,
            saveProgress,
            loadSpecimenPhotos,
            onBack
        } = props;
        
        // State
        const [currentIndex, setCurrentIndex] = useState(0);
        const [userAnswer, setUserAnswer] = useState('');
        const [currentHintLevel, setCurrentHintLevel] = useState(0);
        const [hintsRevealedManually, setHintsRevealedManually] = useState(0);
        const [attemptCount, setAttemptCount] = useState(0);
        const [showResult, setShowResult] = useState(false);
        const [showGuide, setShowGuide] = useState(false);
        const [score, setScore] = useState({ correct: 0, total: 0, totalScore: 0 });
        const [lastAttemptScore, setLastAttemptScore] = useState(null);
        const [photosLoaded, setPhotosLoaded] = useState(false);
        const [selectedPhoto, setSelectedPhoto] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const [currentStreak, setCurrentStreak] = useState(0);
        
        // Mobile-specific state
        const [isMobile, setIsMobile] = useState(false);
        const [showTouchInstructions, setShowTouchInstructions] = useState(true);
        
        // Refs for touch gestures
        const cardRef = useRef(null);
        const inputRef = useRef(null);
        
        // Detect mobile device
        useEffect(() => {
            const checkMobile = () => {
                setIsMobile(window.isMobileDevice && window.isMobileDevice());
            };
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);
        
        // Hide touch instructions after first interaction
        useEffect(() => {
            if (isMobile && showTouchInstructions) {
                const timer = setTimeout(() => {
                    setShowTouchInstructions(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }, [isMobile, showTouchInstructions]);
        
        // Get study specimens
        const studySpecimens = useMemo(() => {
            const approved = specimens.filter(s => s.status === 'approved');
            const shuffled = [...approved].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Math.min(10, approved.length));
        }, [specimens]);
        
        const currentSpecimen = studySpecimens[currentIndex];
        const currentPhotos = currentSpecimen ? specimenPhotos[currentSpecimen.inaturalist_id] || [] : [];
        const currentSpeciesHints = currentSpecimen ? speciesHints[currentSpecimen.species_name] : null;
        const currentReferencePhotos = currentSpecimen ? referencePhotos[currentSpecimen.species_name] || [] : [];
        
        // Touch gesture handlers
        const gestureHandlers = window.useTouchGestures && window.useTouchGestures({
            onSwipeLeft: () => {
                if (!showResult && currentHintLevel < 3) {
                    handleShowHint();
                    window.provideTouchFeedback && window.provideTouchFeedback('light');
                }
            },
            onSwipeRight: () => {
                if (showResult) {
                    handleNext();
                    window.provideTouchFeedback && window.provideTouchFeedback('light');
                }
            },
            onSwipeUp: () => {
                if (!showResult && userAnswer.trim()) {
                    handleSubmitAnswer();
                    window.provideTouchFeedback && window.provideTouchFeedback('medium');
                }
            },
            onSwipeDown: () => {
                if (!showResult) {
                    setShowGuide(true);
                    window.provideTouchFeedback && window.provideTouchFeedback('light');
                }
            },
            onDoubleTap: () => {
                if (currentPhotos.length > 0) {
                    setSelectedPhoto(currentPhotos[0]);
                }
            },
            disabled: showGuide || selectedPhoto
        }) || {};
        
        // Load photos on component mount
        useEffect(() => {
            const loadPhotos = async () => {
                if (loadSpecimenPhotos && studySpecimens.length > 0) {
                    setIsLoading(true);
                    try {
                        await Promise.all(
                            studySpecimens.map(specimen =>
                                loadSpecimenPhotos(specimen.inaturalist_id)
                            )
                        );
                        setPhotosLoaded(true);
                    } catch (error) {
                        console.error('Error loading photos:', error);
                    }
                    setIsLoading(false);
                }
            };
            
            loadPhotos();
        }, [studySpecimens, loadSpecimenPhotos]);
        
        // Enhanced answer validation with fuzzy matching and scoring
        const validateAnswer = useCallback((answer) => {
            if (!answer || !currentSpecimen) return { isCorrect: false, score: 0, feedback: '' };
            
            const validation = window.FuzzyMatching?.validateAnswer(answer, currentSpecimen) || {
                isCorrect: false,
                baseScore: 0,
                feedback: 'Unable to validate answer'
            };
            
            const totalHintsUsed = currentHintLevel + hintsRevealedManually;
            const hintPenalty = totalHintsUsed * 10; // 10% penalty per hint
            const finalScore = Math.max(0, validation.baseScore - hintPenalty);
            
            return {
                ...validation,
                finalScore: finalScore,
                hintPenalty: hintPenalty
            };
        }, [currentSpecimen, currentHintLevel, hintsRevealedManually]);
        
        // Handle answer submission
        const handleSubmitAnswer = useCallback(() => {
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
                setCurrentStreak(prev => prev + 1);
                setShowResult(true);
                
                // Haptic feedback for success
                window.provideTouchFeedback && window.provideTouchFeedback('success');
                
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
                
                // Check achievements
                if (window.checkAchievements) {
                    window.checkAchievements('answer_correct', {
                        specimenId: currentSpecimen.id,
                        score: validation.finalScore,
                        streak: currentStreak + 1,
                        hintsUsed: currentHintLevel + hintsRevealedManually,
                        dna_verified: currentSpecimen.dna_sequenced,
                        is_toxic: currentSpecimen.edibility === 'toxic'
                    });
                }
            } else {
                // Wrong answer - show next hint progressively
                if (currentHintLevel < 3) {
                    setCurrentHintLevel(prev => prev + 1);
                    window.provideTouchFeedback && window.provideTouchFeedback('error');
                } else {
                    // No more automatic hints, show result
                    setLastAttemptScore(validation);
                    setScore(prev => ({ 
                        correct: prev.correct, 
                        total: prev.total + 1,
                        totalScore: prev.totalScore
                    }));
                    setCurrentStreak(0);
                    setShowResult(true);
                    window.provideTouchFeedback && window.provideTouchFeedback('error');
                }
            }
            
            // Hide touch instructions after first interaction
            if (showTouchInstructions) {
                setShowTouchInstructions(false);
            }
        }, [userAnswer, validateAnswer, currentSpecimen, currentHintLevel, hintsRevealedManually, saveProgress, currentStreak, showTouchInstructions]);
        
        // Handle manual hint request
        const handleShowHint = useCallback(() => {
            setHintsRevealedManually(prev => prev + 1);
            setShowTouchInstructions(false);
            window.provideTouchFeedback && window.provideTouchFeedback('light');
        }, []);
        
        // Handle next question
        const handleNext = useCallback(() => {
            if (currentIndex < studySpecimens.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setUserAnswer('');
                setCurrentHintLevel(0);
                setHintsRevealedManually(0);
                setAttemptCount(0);
                setShowResult(false);
                setLastAttemptScore(null);
                
                // Focus input on mobile
                if (isMobile && inputRef.current) {
                    setTimeout(() => inputRef.current.focus(), 100);
                }
            } else {
                // Study complete
                handleFinishStudy();
            }
        }, [currentIndex, studySpecimens.length, isMobile]);
        
        // Handle study completion
        const handleFinishStudy = useCallback(() => {
            if (window.checkAchievements) {
                const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
                window.checkAchievements('session_complete', {
                    mode: 'quick_study',
                    questions: score.total,
                    accuracy: accuracy,
                    total_score: score.totalScore
                });
            }
            
            if (onBack) {
                onBack();
            }
        }, [score, onBack]);
        
        // Keyboard shortcuts
        useEffect(() => {
            const handleKeyPress = (e) => {
                if (showGuide || selectedPhoto) return;
                
                if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
                    handleSubmitAnswer();
                } else if (e.key === 'ArrowRight' && showResult) {
                    handleNext();
                } else if (e.key === 'h' && !showResult && currentHintLevel + hintsRevealedManually < 3) {
                    handleShowHint();
                }
            };
            
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }, [showGuide, selectedPhoto, showResult, userAnswer, handleSubmitAnswer, handleNext, handleShowHint, currentHintLevel, hintsRevealedManually]);
        
        if (isLoading) {
            return React.createElement(window.LoadingScreen, {
                message: 'Loading study session...'
            });
        }
        
        if (studySpecimens.length === 0) {
            return React.createElement('div', { 
                className: 'min-h-screen bg-gray-50 flex items-center justify-center'
            },
                React.createElement('div', { 
                    className: 'bg-white rounded-xl p-8 shadow-lg text-center max-w-md'
                },
                    React.createElement('h2', { 
                        className: 'text-2xl font-bold text-gray-800 mb-4'
                    }, 'No Specimens Available'),
                    React.createElement('p', { 
                        className: 'text-gray-600 mb-6'
                    }, 'No approved specimens found for study.'),
                    React.createElement('button', {
                        onClick: onBack,
                        className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                    }, 'Back to Menu')
                )
            );
        }
        
        if (!currentSpecimen) {
            return React.createElement('div', { className: 'p-6' }, 'Loading specimen...');
        }
        
        const progressPercentage = ((currentIndex + 1) / studySpecimens.length) * 100;
        const averageScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;
        const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
        
        return React.createElement('div', { 
            className: 'min-h-screen bg-gray-50',
            ...gestureHandlers
        },
            // Header with progress
            React.createElement('div', { 
                className: 'bg-white border-b border-gray-200 px-4 py-4'
            },
                React.createElement('div', { className: 'max-w-4xl mx-auto' },
                    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                        React.createElement('div', { className: 'flex items-center space-x-4' },
                            React.createElement('button', {
                                onClick: onBack,
                                className: 'text-gray-600 hover:text-gray-800 text-lg'
                            }, '← Back'),
                            React.createElement('h1', { 
                                className: 'text-xl font-bold text-gray-800'
                            }, '⚡ Quick Study'),
                            React.createElement(window.Phase3Badge)
                        ),
                        
                        React.createElement('div', { className: 'text-right' },
                            React.createElement('div', { 
                                className: 'text-sm text-gray-600'
                            }, `Question ${currentIndex + 1} of ${studySpecimens.length}`),
                            currentStreak > 0 && React.createElement('div', { 
                                className: 'text-sm font-semibold text-orange-600'
                            }, `🔥 Streak: ${currentStreak}`)
                        )
                    ),
                    
                    // Progress bar
                    React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2 mb-4' },
                        React.createElement('div', {
                            className: 'bg-blue-600 h-2 rounded-full transition-all duration-300',
                            style: { width: `${progressPercentage}%` }
                        })
                    ),
                    
                    // Stats row
                    React.createElement('div', { 
                        className: 'grid grid-cols-3 gap-4 text-center text-sm'
                    },
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-2' },
                            React.createElement('div', { className: 'font-bold text-green-600' }, score.correct),
                            React.createElement('div', { className: 'text-gray-600' }, 'Correct')
                        ),
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-2' },
                            React.createElement('div', { className: 'font-bold text-blue-600' }, `${accuracy}%`),
                            React.createElement('div', { className: 'text-gray-600' }, 'Accuracy')
                        ),
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-2' },
                            React.createElement('div', { className: 'font-bold text-purple-600' }, averageScore),
                            React.createElement('div', { className: 'text-gray-600' }, 'Avg Score')
                        )
                    )
                )
            ),
            
            // Main content
            React.createElement('div', { className: 'max-w-4xl mx-auto p-6' },
                // Study card
                React.createElement('div', { 
                    ref: cardRef,
                    className: 'bg-white rounded-xl shadow-lg overflow-hidden mb-6'
                },
                    // Image section
                    currentPhotos.length > 0 && React.createElement('div', { 
                        className: 'relative'
                    },
                        React.createElement('img', {
                            src: currentPhotos[0].medium_url || currentPhotos[0].small_url,
                            alt: showResult ? currentSpecimen.species_name : 'Mystery mushroom',
                            className: 'w-full h-64 md:h-80 object-cover cursor-pointer',
                            onClick: () => setSelectedPhoto(currentPhotos[0])
                        }),
                        
                        // Photo navigation
                        currentPhotos.length > 1 && React.createElement('div', {
                            className: 'absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm'
                        }, `1 of ${currentPhotos.length}`)
                    ),
                    
                    // Content section
                    React.createElement('div', { className: 'p-6' },
                        !showResult ? (
                            // Question mode
                            React.createElement('div', null,
                                React.createElement('h2', { 
                                    className: 'text-xl font-semibold mb-4'
                                }, 'What species is this?'),
                                
                                // Answer input
                                React.createElement('input', {
                                    ref: inputRef,
                                    type: 'text',
                                    value: userAnswer,
                                    onChange: (e) => setUserAnswer(e.target.value),
                                    placeholder: 'Enter species name...',
                                    className: 'w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                    onKeyPress: (e) => {
                                        if (e.key === 'Enter' && userAnswer.trim()) {
                                            handleSubmitAnswer();
                                        }
                                    },
                                    autoFocus: !isMobile
                                }),
                                
                                // Hints display
                                (currentHintLevel > 0 || hintsRevealedManually > 0) && currentSpeciesHints && (
                                    React.createElement('div', { 
                                        className: 'mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'
                                    },
                                        React.createElement('h3', { 
                                            className: 'font-medium text-yellow-800 mb-2'
                                        }, `💡 Hint${currentHintLevel + hintsRevealedManually > 1 ? 's' : ''}:`),
                                        currentSpeciesHints.hints && currentSpeciesHints.hints
                                            .slice(0, currentHintLevel + hintsRevealedManually)
                                            .map((hint, index) =>
                                                React.createElement('p', { 
                                                    key: index,
                                                    className: 'text-yellow-700 mb-1'
                                                }, `${index + 1}. ${hint}`)
                                            )
                                    )
                                ),
                                
                                // Action buttons
                                React.createElement('div', { 
                                    className: 'flex flex-col sm:flex-row gap-3'
                                },
                                    React.createElement('button', {
                                        onClick: handleShowHint,
                                        disabled: currentHintLevel + hintsRevealedManually >= 3,
                                        className: 'px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
                                    }, `💡 Hint (${currentHintLevel + hintsRevealedManually}/3)`),
                                    
                                    React.createElement('button', {
                                        onClick: () => setShowGuide(true),
                                        className: 'px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
                                    }, '📖 Guide'),
                                    
                                    React.createElement('button', {
                                        onClick: handleSubmitAnswer,
                                        disabled: !userAnswer.trim(),
                                        className: 'flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium'
                                    }, 'Submit Answer')
                                )
                            )
                        ) : (
                            // Result mode
                            React.createElement('div', null,
                                React.createElement('div', { 
                                    className: `p-4 rounded-lg mb-4 ${
                                        lastAttemptScore?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                    }`
                                },
                                    React.createElement('h3', { 
                                        className: `font-semibold mb-2 ${
                                            lastAttemptScore?.isCorrect ? 'text-green-800' : 'text-red-800'
                                        }`
                                    }, lastAttemptScore?.isCorrect ? '✅ Correct!' : '❌ Incorrect'),
                                    
                                    React.createElement('p', { 
                                        className: 'text-lg font-medium text-gray-800 mb-2'
                                    }, currentSpecimen.species_name),
                                    
                                    currentSpecimen.common_name && React.createElement('p', { 
                                        className: 'text-gray-600 mb-2'
                                    }, `Common name: ${currentSpecimen.common_name}`),
                                    
                                    // Score breakdown
                                    lastAttemptScore && React.createElement('div', { 
                                        className: 'text-sm text-gray-600 mt-3'
                                    },
                                        React.createElement('p', null, `Score: ${lastAttemptScore.finalScore}%`),
                                        lastAttemptScore.hintPenalty > 0 && React.createElement('p', null, 
                                            `(${lastAttemptScore.baseScore}% - ${lastAttemptScore.hintPenalty}% hint penalty)`
                                        )
                                    )
                                ),
                                
                                // Additional info
                                React.createElement('div', { className: 'space-y-2 text-sm text-gray-600 mb-6' },
                                    React.createElement('p', null, 
                                        `Family: ${currentSpecimen.family || 'Unknown'}`
                                    ),
                                    React.createElement('p', null, 
                                        `Genus: ${currentSpecimen.genus || 'Unknown'}`
                                    ),
                                    currentSpecimen.dna_sequenced && React.createElement('p', { 
                                        className: 'text-blue-600 font-medium'
                                    }, '🧬 DNA verified')
                                ),
                                
                                React.createElement('button', {
                                    onClick: handleNext,
                                    className: 'w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium'
                                }, currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 'Finish Study')
                            )
                        )
                    )
                ),
                
                // Touch instructions for mobile
                isMobile && showTouchInstructions && !showResult && (
                    React.createElement(window.GestureInstructions, {
                        gestures: [
                            { icon: '👆', text: 'Swipe ← for hint' },
                            { icon: '👆', text: 'Swipe ↑ to submit' },
                            { icon: '👆', text: 'Swipe ↓ for guide' }
                        ],
                        className: 'mb-4'
                    })
                ),
                
                isMobile && showTouchInstructions && showResult && (
                    React.createElement(window.GestureInstructions, {
                        gestures: [
                            { icon: '👆', text: 'Swipe → for next' },
                            { icon: '👆', text: 'Double tap image to enlarge' }
                        ],
                        className: 'mb-4'
                    })
                )
            ),
            
            // Enhanced Interactive Species Guide
            showGuide && React.createElement(window.InteractiveSpeciesGuide, {
                specimen: currentSpecimen,
                speciesHints: currentSpeciesHints,
                photos: currentPhotos,
                referencePhotos: currentReferencePhotos,
                onClose: () => {
                    setShowGuide(false);
                },
                onTryAgain: () => {
                    setShowGuide(false);
                }
            }),
            
            // Photo modal
            selectedPhoto && React.createElement('div', {
                className: 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50',
                onClick: () => setSelectedPhoto(null)
            },
                React.createElement('div', { className: 'relative max-w-4xl max-h-full p-4' },
                    React.createElement('img', {
                        src: selectedPhoto.large_url || selectedPhoto.medium_url,
                        alt: 'Enlarged photo',
                        className: 'max-w-full max-h-full object-contain'
                    }),
                    React.createElement('button', {
                        onClick: () => setSelectedPhoto(null),
                        className: 'absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75'
                    }, '×')
                )
            )
        );
    };
    
    console.log('✅ Enhanced QuickStudy component loaded successfully');
    
})();