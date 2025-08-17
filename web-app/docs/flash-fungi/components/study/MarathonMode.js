// Marathon Mode - Phase 3 Implementation
// Unlimited practice with SM-2 spaced repetition algorithm

(function() {
    'use strict';
    
    const { useState, useEffect, useCallback, useRef } = React;
    const h = React.createElement;
    
    // SM-2 Algorithm Implementation
    class SpacedRepetitionQueue {
        constructor(specimens) {
            this.specimens = specimens;
            this.queue = [];
            this.cardData = new Map(); // Maps specimen ID to SM-2 data
            this.sessionStats = {
                totalAnswered: 0,
                correctAnswers: 0,
                currentStreak: 0,
                longestStreak: 0,
                startTime: Date.now()
            };
            
            this.initializeQueue();
        }
        
        initializeQueue() {
            // Initialize all specimens as new cards
            this.specimens.forEach(specimen => {
                const cardId = specimen.id;
                this.cardData.set(cardId, {
                    specimenId: cardId,
                    specimen: specimen,
                    repetitions: 0,
                    easeFactor: 2.5, // Default ease factor
                    interval: 0,
                    nextReview: 0, // Questions until next review
                    lastQuality: null,
                    totalAttempts: 0,
                    correctAttempts: 0
                });
                
                // Add to initial queue
                this.queue.push(cardId);
            });
            
            // Shuffle initial queue
            this.shuffleArray(this.queue);
        }
        
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        
        getNextCard() {
            if (this.queue.length === 0) {
                this.refillQueue();
            }
            
            if (this.queue.length === 0) {
                return null; // No cards available
            }
            
            const cardId = this.queue.shift();
            const card = this.cardData.get(cardId);
            
            return card;
        }
        
        refillQueue() {
            // Find all cards that are due for review
            const now = this.sessionStats.totalAnswered;
            const dueCards = [];
            
            this.cardData.forEach((card, cardId) => {
                if (card.nextReview <= now) {
                    dueCards.push(cardId);
                }
            });
            
            // If no cards are due, add some new ones or recently failed ones
            if (dueCards.length === 0) {
                this.cardData.forEach((card, cardId) => {
                    if (card.repetitions === 0 || card.lastQuality < 3) {
                        dueCards.push(cardId);
                    }
                });
            }
            
            // Shuffle and add to queue
            this.shuffleArray(dueCards);
            this.queue.push(...dueCards);
        }
        
        processAnswer(cardId, quality, hintsUsed, timeSpent) {
            // Quality is 0-5 based on answer correctness and hints used
            // 5 = perfect (no hints)
            // 4 = correct with 1 hint
            // 3 = correct with 2 hints
            // 2 = correct with 3-4 hints
            // 1 = incorrect with hints
            // 0 = gave up / no attempt
            
            const card = this.cardData.get(cardId);
            if (!card) return;
            
            card.totalAttempts++;
            card.lastQuality = quality;
            
            // Update statistics
            this.sessionStats.totalAnswered++;
            
            if (quality >= 3) {
                card.correctAttempts++;
                this.sessionStats.correctAnswers++;
                this.sessionStats.currentStreak++;
                if (this.sessionStats.currentStreak > this.sessionStats.longestStreak) {
                    this.sessionStats.longestStreak = this.sessionStats.currentStreak;
                }
            } else {
                this.sessionStats.currentStreak = 0;
            }
            
            // Apply SM-2 algorithm
            const { repetitions, easeFactor, interval } = card;
            let newRepetitions = repetitions;
            let newEaseFactor = easeFactor;
            let newInterval = interval;
            
            if (quality >= 3) {
                // Correct response
                if (repetitions === 0) {
                    newInterval = 1;
                } else if (repetitions === 1) {
                    newInterval = 6;
                } else {
                    newInterval = Math.round(interval * easeFactor);
                }
                newRepetitions = repetitions + 1;
            } else {
                // Incorrect response
                newRepetitions = 0;
                newInterval = 1;
            }
            
            // Update ease factor (min 1.3, no max)
            newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            newEaseFactor = Math.max(1.3, newEaseFactor);
            
            // Update card data
            card.repetitions = newRepetitions;
            card.easeFactor = newEaseFactor;
            card.interval = newInterval;
            card.nextReview = this.sessionStats.totalAnswered + newInterval;
            
            // If the card needs immediate review (failed), add it back soon
            if (quality < 3) {
                const reviewIn = Math.min(3, Math.max(1, 5 - quality));
                this.queue.splice(reviewIn, 0, cardId);
            }
        }
        
        getSessionStats() {
            const duration = Date.now() - this.sessionStats.startTime;
            const minutes = Math.floor(duration / 60000);
            const accuracy = this.sessionStats.totalAnswered > 0 
                ? Math.round((this.sessionStats.correctAnswers / this.sessionStats.totalAnswered) * 100)
                : 0;
            
            return {
                ...this.sessionStats,
                duration: minutes,
                accuracy: accuracy,
                cardsInRotation: this.cardData.size,
                masteredCards: Array.from(this.cardData.values()).filter(c => c.repetitions >= 3).length
            };
        }
        
        saveSession() {
            // Prepare session data for database storage
            const sessionData = {
                stats: this.getSessionStats(),
                cards: Array.from(this.cardData.entries()).map(([id, data]) => ({
                    specimenId: id,
                    repetitions: data.repetitions,
                    easeFactor: data.easeFactor,
                    interval: data.interval,
                    lastQuality: data.lastQuality,
                    attempts: data.totalAttempts,
                    correct: data.correctAttempts
                })),
                queue: this.queue
            };
            
            return sessionData;
        }
        
        static loadSession(sessionData, specimens) {
            const queue = new SpacedRepetitionQueue(specimens);
            
            if (sessionData) {
                // Restore session stats
                Object.assign(queue.sessionStats, sessionData.stats);
                queue.sessionStats.startTime = Date.now(); // Reset timer
                
                // Restore card data
                sessionData.cards.forEach(cardInfo => {
                    const card = queue.cardData.get(cardInfo.specimenId);
                    if (card) {
                        Object.assign(card, cardInfo);
                    }
                });
                
                // Restore queue
                if (sessionData.queue && sessionData.queue.length > 0) {
                    queue.queue = sessionData.queue;
                }
            }
            
            return queue;
        }
    }
    
    // Marathon Mode Component
    window.MarathonMode = function MarathonMode(props) {
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
        const [srpQueue, setSrpQueue] = useState(null);
        const [currentCard, setCurrentCard] = useState(null);
        const [userAnswer, setUserAnswer] = useState('');
        const [currentHintLevel, setCurrentHintLevel] = useState(0);
        const [hintsRevealed, setHintsRevealed] = useState(0);
        const [attemptCount, setAttemptCount] = useState(0);
        const [showResult, setShowResult] = useState(false);
        const [showGuide, setShowGuide] = useState(false);
        const [sessionStats, setSessionStats] = useState(null);
        const [isPaused, setIsPaused] = useState(false);
        const [lastScore, setLastScore] = useState(null);
        const [photosLoaded, setPhotosLoaded] = useState(false);
        
        const sessionRef = useRef(null);
        const autoSaveTimer = useRef(null);
        
        // Initialize or restore session
        useEffect(() => {
            const initSession = async () => {
                // Only use approved specimens
                const approvedSpecimens = specimens.filter(s => s.status === 'approved');
                
                if (approvedSpecimens.length === 0) {
                    alert('No approved specimens available for Marathon Mode');
                    onBack();
                    return;
                }
                
                // Try to restore previous session
                let queue;
                const savedSession = localStorage.getItem(`marathonSession_${user?.id}`);
                
                if (savedSession) {
                    try {
                        const sessionData = JSON.parse(savedSession);
                        const resumeSession = confirm(
                            'Resume previous Marathon session?\n' +
                            `Progress: ${sessionData.stats.totalAnswered} questions\n` +
                            `Accuracy: ${sessionData.stats.accuracy}%`
                        );
                        
                        if (resumeSession) {
                            queue = SpacedRepetitionQueue.loadSession(sessionData, approvedSpecimens);
                        }
                    } catch (e) {
                        console.warn('Could not restore session:', e);
                    }
                }
                
                if (!queue) {
                    queue = new SpacedRepetitionQueue(approvedSpecimens);
                }
                
                setSrpQueue(queue);
                sessionRef.current = queue;
                
                // Get first card
                const firstCard = queue.getNextCard();
                setCurrentCard(firstCard);
                setSessionStats(queue.getSessionStats());
            };
            
            initSession();
            
            // Auto-save session every 30 seconds
            autoSaveTimer.current = setInterval(() => {
                if (sessionRef.current && !isPaused) {
                    saveSessionToStorage();
                }
            }, 30000);
            
            return () => {
                if (autoSaveTimer.current) {
                    clearInterval(autoSaveTimer.current);
                }
            };
        }, [specimens, user, onBack]);
        
        // Load photos when card changes
        useEffect(() => {
            if (currentCard?.specimen && !specimenPhotos[currentCard.specimen.inaturalist_id]) {
                setPhotosLoaded(false);
                loadSpecimenPhotos(currentCard.specimen.inaturalist_id).then(() => {
                    setPhotosLoaded(true);
                });
            } else {
                setPhotosLoaded(true);
            }
        }, [currentCard, loadSpecimenPhotos, specimenPhotos]);
        
        // Save session to localStorage
        const saveSessionToStorage = useCallback(() => {
            if (sessionRef.current && user?.id) {
                const sessionData = sessionRef.current.saveSession();
                localStorage.setItem(`marathonSession_${user.id}`, JSON.stringify(sessionData));
            }
        }, [user]);
        
        // Save session to database
        const saveSessionToDatabase = useCallback(async () => {
            if (!sessionRef.current || !user?.id) return;
            
            const sessionData = sessionRef.current.saveSession();
            
            try {
                await fetch(`${window.SUPABASE_URL}/rest/v1/study_sessions`, {
                    method: 'POST',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        mode: 'marathon',
                        queue: sessionData,
                        stats: sessionData.stats,
                        is_active: !isPaused
                    })
                });
            } catch (error) {
                console.error('Error saving session to database:', error);
            }
        }, [user, isPaused]);
        
        // Calculate quality rating based on answer
        const calculateQuality = (isCorrect, hintsUsed, timeSpent) => {
            if (!isCorrect) return hintsUsed === 0 ? 0 : 1;
            
            // Quality based on hints used
            if (hintsUsed === 0) return 5;
            if (hintsUsed === 1) return 4;
            if (hintsUsed === 2) return 3;
            if (hintsUsed <= 4) return 2;
            return 1;
        };
        
        // Validate answer (reuse from QuickStudy logic)
        const validateAnswer = (answer) => {
            if (!answer || !currentCard?.specimen) return { isCorrect: false, score: 0 };
            
            const cleaned = answer.toLowerCase().trim();
            const species = currentCard.specimen.species_name.toLowerCase();
            const genus = currentCard.specimen.genus.toLowerCase();
            const common = (currentCard.specimen.common_name || '').toLowerCase();
            
            // Check for exact or close match
            if (cleaned === species || cleaned === common) {
                return { isCorrect: true, score: 100 };
            }
            
            // Check for genus match
            if (cleaned === genus || cleaned.startsWith(genus + ' ')) {
                return { isCorrect: cleaned === species, score: cleaned === species ? 100 : 50 };
            }
            
            return { isCorrect: false, score: 0 };
        };
        
        // Handle answer submission
        const handleSubmitAnswer = () => {
            if (!userAnswer.trim() || !sessionRef.current) return;
            
            const validation = validateAnswer(userAnswer);
            const totalHints = currentHintLevel + hintsRevealed;
            const quality = calculateQuality(validation.isCorrect, totalHints, 0);
            
            setAttemptCount(prev => prev + 1);
            
            if (validation.isCorrect) {
                // Process with SM-2
                sessionRef.current.processAnswer(currentCard.specimenId, quality, totalHints, 0);
                setLastScore({ quality, hints: totalHints, score: validation.score });
                setShowResult(true);
                setSessionStats(sessionRef.current.getSessionStats());
                
                // Save progress
                if (saveProgress) {
                    saveProgress({
                        specimenId: currentCard.specimen.id,
                        progressType: 'marathon',
                        score: validation.score,
                        hintsUsed: totalHints,
                        completed: true
                    });
                }
            } else {
                // Wrong answer - show next hint if available
                if (currentHintLevel < 4) {
                    setCurrentHintLevel(prev => prev + 1);
                    setUserAnswer('');
                } else {
                    // All hints exhausted
                    sessionRef.current.processAnswer(currentCard.specimenId, 0, totalHints, 0);
                    setShowGuide(true);
                    setSessionStats(sessionRef.current.getSessionStats());
                }
            }
        };
        
        // Move to next card
        const handleNext = () => {
            const nextCard = sessionRef.current.getNextCard();
            
            if (!nextCard) {
                alert('No more cards available in this session!');
                return;
            }
            
            setCurrentCard(nextCard);
            setUserAnswer('');
            setCurrentHintLevel(0);
            setHintsRevealed(0);
            setAttemptCount(0);
            setShowResult(false);
            setShowGuide(false);
            setLastScore(null);
            
            // Auto-save periodically
            if (sessionRef.current.sessionStats.totalAnswered % 10 === 0) {
                saveSessionToStorage();
            }
        };
        
        // Pause/Resume session
        const togglePause = () => {
            setIsPaused(prev => !prev);
            if (!isPaused) {
                saveSessionToStorage();
                saveSessionToDatabase();
            }
        };
        
        // End session
        const endSession = () => {
            if (confirm('End Marathon session? Your progress will be saved.')) {
                saveSessionToDatabase();
                localStorage.removeItem(`marathonSession_${user?.id}`);
                onBack();
            }
        };
        
        // Get hints for current specimen
        const getHints = useCallback(() => {
            if (!currentCard?.specimen) return [];
            
            const speciesHint = speciesHints[currentCard.specimen.species_name];
            if (speciesHint?.hints && speciesHint.hints.length > 0) {
                return speciesHint.hints;
            }
            
            // Fallback hints
            return [
                { type: 'morphological', level: 1, text: `Examine the physical features.` },
                { type: 'comparative', level: 2, text: `Compare to similar species.` },
                { type: 'ecological', level: 3, text: `Consider the habitat.` },
                { type: 'taxonomic', level: 4, text: `Family: ${currentCard.specimen.family}` }
            ];
        }, [currentCard, speciesHints]);
        
        const hints = getHints();
        const currentPhotos = currentCard ? specimenPhotos[currentCard.specimen.inaturalist_id] || [] : [];
        
        if (!srpQueue || !currentCard) {
            return h('div', { style: { padding: '2rem', textAlign: 'center' } },
                h('h2', null, 'Loading Marathon Mode...'),
                h('button', { onClick: onBack, style: { marginTop: '1rem' } }, 'Back to Home')
            );
        }
        
        return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header with session stats
            h('div', { 
                style: { 
                    backgroundColor: 'white', 
                    borderBottom: '1px solid #e5e7eb', 
                    padding: '1rem' 
                } 
            },
                h('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                    h('div', { 
                        style: { 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                        } 
                    },
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                            h('button', { 
                                onClick: endSession, 
                                style: { 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer' 
                                } 
                            }, '← End Session'),
                            h('div', null,
                                h('h1', { 
                                    style: { 
                                        fontSize: '1.25rem', 
                                        fontWeight: 'bold' 
                                    } 
                                }, '🏃 Marathon Mode'),
                                h('p', { 
                                    style: { 
                                        fontSize: '0.875rem', 
                                        color: '#6b7280' 
                                    } 
                                }, `Question ${sessionStats.totalAnswered + 1} • ${sessionStats.duration} min`)
                            )
                        ),
                        
                        // Session stats
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                            h('div', { style: { textAlign: 'center' } },
                                h('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: '#10b981'
                                    } 
                                }, sessionStats.correctAnswers),
                                h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Correct')
                            ),
                            h('div', { style: { textAlign: 'center' } },
                                h('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: sessionStats.accuracy >= 70 ? '#10b981' : '#f59e0b'
                                    } 
                                }, `${sessionStats.accuracy}%`),
                                h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Accuracy')
                            ),
                            h('div', { style: { textAlign: 'center' } },
                                h('div', { 
                                    style: { 
                                        fontSize: '1.125rem', 
                                        fontWeight: 'bold',
                                        color: '#f59e0b'
                                    } 
                                }, `🔥 ${sessionStats.currentStreak}`),
                                h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Streak')
                            ),
                            h('button', {
                                onClick: togglePause,
                                style: {
                                    padding: '0.5rem 1rem',
                                    backgroundColor: isPaused ? '#10b981' : '#6b7280',
                                    color: 'white',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }
                            }, isPaused ? '▶️ Resume' : '⏸️ Pause')
                        )
                    ),
                    
                    // Card repetition info
                    h('div', {
                        style: {
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            display: 'flex',
                            gap: '1rem'
                        }
                    },
                        h('span', null, `Mastered: ${sessionStats.masteredCards}/${sessionStats.cardsInRotation}`),
                        h('span', null, `Ease: ${currentCard.easeFactor.toFixed(2)}`),
                        h('span', null, `Interval: ${currentCard.interval}`),
                        currentCard.repetitions > 0 && h('span', { 
                            style: { color: '#10b981' } 
                        }, `✓ Seen ${currentCard.repetitions} times`)
                    )
                )
            ),
            
            // Main content (similar to QuickStudy but adapted for Marathon)
            !isPaused ? h('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto', 
                    padding: '1.5rem' 
                } 
            },
                h('div', { 
                    style: { 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '1.5rem' 
                    } 
                },
                    // Left: Photos
                    h('div', { 
                        style: { 
                            backgroundColor: 'white', 
                            borderRadius: '0.75rem', 
                            padding: '1.5rem' 
                        } 
                    },
                        h('h3', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem' 
                            } 
                        }, 'Specimen Photos'),
                        
                        !photosLoaded ? 
                            h('div', { 
                                style: { 
                                    textAlign: 'center', 
                                    padding: '2rem' 
                                } 
                            }, 'Loading photos...') :
                        currentPhotos.length > 0 ?
                            h('div', { 
                                style: { 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                    gap: '0.5rem' 
                                } 
                            },
                                currentPhotos.slice(0, 4).map((photo, idx) =>
                                    h('img', {
                                        key: idx,
                                        src: photo.medium_url,
                                        alt: `Photo ${idx + 1}`,
                                        style: {
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '0.5rem'
                                        }
                                    })
                                )
                            ) :
                            h('div', { 
                                style: { 
                                    textAlign: 'center', 
                                    padding: '2rem' 
                                } 
                            }, 'No photos available')
                    ),
                    
                    // Right: Answer interface
                    h('div', { 
                        style: { 
                            backgroundColor: 'white', 
                            borderRadius: '0.75rem', 
                            padding: '1.5rem' 
                        } 
                    },
                        h('h3', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem' 
                            } 
                        }, 'Identify This Mushroom'),
                        
                        // Show hints if revealed
                        (currentHintLevel > 0 || hintsRevealed > 0) && !showResult && !showGuide && h('div', {
                            style: {
                                backgroundColor: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }
                        },
                            h('h4', { 
                                style: { 
                                    fontWeight: '500', 
                                    color: '#92400e',
                                    marginBottom: '0.5rem'
                                } 
                            }, `💡 Hints (${currentHintLevel + hintsRevealed}/4)`),
                            hints.slice(0, currentHintLevel + hintsRevealed).map((hint, idx) =>
                                h('p', {
                                    key: idx,
                                    style: {
                                        fontSize: '0.875rem',
                                        color: '#374151',
                                        marginBottom: idx < currentHintLevel + hintsRevealed - 1 ? '0.5rem' : 0
                                    }
                                }, `${idx + 1}. ${hint.text}`)
                            )
                        ),
                        
                        !showResult && !showGuide ?
                            // Input mode
                            h('div', null,
                                h('div', { style: { marginBottom: '1rem' } },
                                    h('input', {
                                        type: 'text',
                                        value: userAnswer,
                                        onChange: (e) => setUserAnswer(e.target.value),
                                        onKeyPress: (e) => e.key === 'Enter' && handleSubmitAnswer(),
                                        placeholder: 'Enter species name',
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
                                    }, 'Submit Answer'),
                                    
                                    h('button', {
                                        onClick: () => {
                                            if (currentHintLevel + hintsRevealed < 4) {
                                                setHintsRevealed(prev => prev + 1);
                                            }
                                        },
                                        disabled: currentHintLevel + hintsRevealed >= 4,
                                        style: {
                                            padding: '0.75rem 1rem',
                                            backgroundColor: currentHintLevel + hintsRevealed < 4 ? '#3b82f6' : '#d1d5db',
                                            color: 'white',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            cursor: currentHintLevel + hintsRevealed < 4 ? 'pointer' : 'not-allowed',
                                            fontWeight: '500'
                                        }
                                    }, '💡 Hint')
                                )
                            ) :
                        showResult ?
                            // Result display
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
                                    h('h4', { 
                                        style: { 
                                            color: '#065f46',
                                            marginBottom: '0.5rem'
                                        } 
                                    }, '✅ Correct!'),
                                    h('p', null, 
                                        h('strong', null, 'Species: '), 
                                        h('em', null, currentCard.specimen.species_name)
                                    ),
                                    lastScore && h('div', {
                                        style: {
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.875rem'
                                        }
                                    },
                                        h('p', null, `Quality Rating: ${lastScore.quality}/5`),
                                        h('p', null, `Next Review: ${currentCard.interval} questions`)
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
                                }, 'Next Question →')
                            ) : null
                    )
                )
            ) : 
            // Paused state
            h('div', {
                style: {
                    maxWidth: '32rem',
                    margin: '4rem auto',
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }
            },
                h('h2', { 
                    style: { 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        marginBottom: '1rem' 
                    } 
                }, '⏸️ Session Paused'),
                h('p', { 
                    style: { 
                        color: '#6b7280', 
                        marginBottom: '2rem' 
                    } 
                }, 'Your progress has been saved. Click resume to continue.'),
                
                h('div', { 
                    style: { 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '1rem',
                        marginBottom: '2rem'
                    } 
                },
                    h('div', { 
                        style: { 
                            padding: '1rem', 
                            backgroundColor: '#f9fafb', 
                            borderRadius: '0.5rem' 
                        } 
                    },
                        h('div', { 
                            style: { 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: '#10b981' 
                            } 
                        }, sessionStats.totalAnswered),
                        h('div', { 
                            style: { 
                                fontSize: '0.875rem', 
                                color: '#6b7280' 
                            } 
                        }, 'Questions')
                    ),
                    h('div', { 
                        style: { 
                            padding: '1rem', 
                            backgroundColor: '#f9fafb', 
                            borderRadius: '0.5rem' 
                        } 
                    },
                        h('div', { 
                            style: { 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: '#3b82f6' 
                            } 
                        }, `${sessionStats.accuracy}%`),
                        h('div', { 
                            style: { 
                                fontSize: '0.875rem', 
                                color: '#6b7280' 
                            } 
                        }, 'Accuracy')
                    )
                ),
                
                h('button', {
                    onClick: togglePause,
                    style: {
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '1rem'
                    }
                }, '▶️ Resume Session')
            ),
            
            // Show guide modal if needed
            showGuide && window.InteractiveSpeciesGuide && h(window.InteractiveSpeciesGuide, {
                specimen: currentCard.specimen,
                speciesHints: speciesHints[currentCard.specimen.species_name],
                photos: currentPhotos,
                referencePhotos: referencePhotos[currentCard.specimen.species_name] || [],
                onClose: () => {
                    setShowGuide(false);
                    handleNext();
                },
                onTryAgain: () => {
                    setShowGuide(false);
                    handleNext();
                }
            })
        );
    };
})();