// MarathonMode.js - Enhanced Marathon Mode with Touch Gestures and Session Persistence
// Unlimited practice with SM-2 spaced repetition algorithm and mobile optimization

(function() {
    'use strict';
    
    const { useState, useEffect, useCallback, useRef } = React;
    
    // SM-2 Algorithm Implementation (Enhanced)
    class SpacedRepetitionQueue {
        constructor(specimens) {
            this.specimens = specimens;
            this.queue = [];
            this.cardData = new Map();
            this.sessionStats = {
                totalAnswered: 0,
                correctAnswers: 0,
                currentStreak: 0,
                longestStreak: 0,
                startTime: Date.now(),
                masteredCards: 0,
                sessionId: `session_${Date.now()}`
            };
            
            this.initializeQueue();
        }
        
        initializeQueue() {
            this.specimens.forEach(specimen => {
                const cardId = specimen.id;
                this.cardData.set(cardId, {
                    specimenId: cardId,
                    specimen: specimen,
                    repetitions: 0,
                    easeFactor: 2.5,
                    interval: 0,
                    nextReview: 0,
                    lastQuality: null,
                    totalAttempts: 0,
                    correctAttempts: 0,
                    lastSeen: 0
                });
                
                this.queue.push(cardId);
            });
            
            this.shuffleQueue();
        }
        
        shuffleQueue() {
            for (let i = this.queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
            }
        }
        
        getNextCard() {
            if (this.queue.length === 0) {
                this.refillQueue();
            }
            
            const cardId = this.queue.shift();
            const card = this.cardData.get(cardId);
            card.lastSeen = this.sessionStats.totalAnswered;
            
            return card;
        }
        
        refillQueue() {
            // Add all cards that are due for review
            const currentQuestion = this.sessionStats.totalAnswered;
            const duCards = Array.from(this.cardData.values())
                .filter(card => card.nextReview <= currentQuestion)
                .map(card => card.specimenId);
            
            if (duCards.length === 0) {
                // If no cards are due, add all cards (full rotation)
                this.queue.push(...Array.from(this.cardData.keys()));
            } else {
                this.queue.push(...duCards);
            }
            
            this.shuffleQueue();
        }
        
        submitAnswer(cardId, quality, isCorrect) {
            const card = this.cardData.get(cardId);
            if (!card) return;
            
            card.totalAttempts++;
            if (isCorrect) {
                card.correctAttempts++;
            }
            
            // Update session stats
            this.sessionStats.totalAnswered++;
            if (isCorrect) {
                this.sessionStats.correctAnswers++;
                this.sessionStats.currentStreak++;
                this.sessionStats.longestStreak = Math.max(
                    this.sessionStats.longestStreak, 
                    this.sessionStats.currentStreak
                );
            } else {
                this.sessionStats.currentStreak = 0;
            }
            
            // SM-2 Algorithm
            if (quality >= 3) {
                if (card.repetitions === 0) {
                    card.interval = 1;
                } else if (card.repetitions === 1) {
                    card.interval = 6;
                } else {
                    card.interval = Math.round(card.interval * card.easeFactor);
                }
                card.repetitions++;
            } else {
                card.repetitions = 0;
                card.interval = 1;
            }
            
            card.easeFactor = Math.max(1.3, 
                card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            );
            
            if (quality < 3) {
                card.nextReview = this.sessionStats.totalAnswered + 1;
            } else {
                card.nextReview = this.sessionStats.totalAnswered + card.interval;
            }
            
            card.lastQuality = quality;
            
            // Update mastered cards count
            this.sessionStats.masteredCards = Array.from(this.cardData.values())
                .filter(c => c.repetitions >= 3 && c.easeFactor >= 2.5).length;
        }
        
        getSessionStats() {
            const duration = (Date.now() - this.sessionStats.startTime) / 1000 / 60;
            const accuracy = this.sessionStats.totalAnswered > 0 
                ? Math.round((this.sessionStats.correctAnswers / this.sessionStats.totalAnswered) * 100)
                : 0;
            
            return {
                ...this.sessionStats,
                duration: Math.round(duration * 10) / 10,
                accuracy: accuracy,
                cardsInRotation: this.cardData.size,
                masteredCards: this.sessionStats.masteredCards
            };
        }
        
        // Session persistence methods - NEW FEATURE
        saveSession() {
            const sessionData = {
                stats: this.getSessionStats(),
                cards: Array.from(this.cardData.entries()).map(([id, data]) => ({
                    specimenId: id,
                    repetitions: data.repetitions,
                    easeFactor: data.easeFactor,
                    interval: data.interval,
                    nextReview: data.nextReview,
                    lastQuality: data.lastQuality,
                    attempts: data.totalAttempts,
                    correct: data.correctAttempts,
                    lastSeen: data.lastSeen
                })),
                queue: this.queue,
                timestamp: Date.now()
            };
            
            return sessionData;
        }
        
        static loadSession(sessionData, specimens) {
            const queue = new SpacedRepetitionQueue(specimens);
            
            if (sessionData && sessionData.cards) {
                // Restore session state
                queue.sessionStats = { ...sessionData.stats };
                queue.queue = [...sessionData.queue];
                
                // Restore card data
                sessionData.cards.forEach(cardData => {
                    const card = queue.cardData.get(cardData.specimenId);
                    if (card) {
                        Object.assign(card, cardData);
                    }
                });
            }
            
            return queue;
        }
    }
    
    window.MarathonMode = function MarathonMode({ 
        specimens, 
        speciesHints, 
        referencePhotos, 
        specimenPhotos, 
        user, 
        loadSpecimenPhotos, 
        onBack,
        saveProgress 
    }) {
        // State
        const [queue, setQueue] = useState(null);
        const [currentCard, setCurrentCard] = useState(null);
        const [userAnswer, setUserAnswer] = useState('');
        const [currentHintLevel, setCurrentHintLevel] = useState(0);
        const [hintsRevealedManually, setHintsRevealedManually] = useState(0);
        const [showingAnswer, setShowingAnswer] = useState(false);
        const [sessionStats, setSessionStats] = useState({});
        const [isPaused, setIsPaused] = useState(false);
        const [gestureHint, setGestureHint] = useState(null);
        const [sessionSaved, setSessionSaved] = useState(false);
        
        const sessionSaveInterval = useRef(null);

        // Touch gesture integration - NEW FEATURE
        const gestureHandlers = window.useTouchGestures ? window.useTouchGestures({
            onSwipeLeft: () => {
                // Swipe left = Next card (if answer shown)
                if (showingAnswer) {
                    handleNext();
                    showGestureHint('➡️ Next question');
                }
            },
            onSwipeRight: () => {
                // Swipe right = Previous/back
                if (sessionStats.totalAnswered === 0) {
                    onBack();
                    showGestureHint('🏠 Returned to home');
                }
            },
            onSwipeUp: () => {
                // Swipe up = Show hint
                if (!showingAnswer && currentCard) {
                    const hints = speciesHints[currentCard.specimen.species_name];
                    if (hints && currentHintLevel < hints.length) {
                        setCurrentHintLevel(prev => prev + 1);
                        setHintsRevealedManually(prev => prev + 1);
                        showGestureHint('💡 Revealed hint');
                    }
                }
            },
            onSwipeDown: () => {
                // Swipe down = Pause/unpause
                setIsPaused(!isPaused);
                showGestureHint(isPaused ? '▶️ Resumed' : '⏸️ Paused');
            },
            onDoubleTap: () => {
                // Double tap = Submit answer (if typed)
                if (userAnswer.trim() && !showingAnswer) {
                    handleSubmit();
                    showGestureHint('✅ Submitted answer');
                }
            },
            onLongPress: () => {
                // Long press = Show answer (give up)
                if (!showingAnswer && userAnswer.trim()) {
                    handleSubmit();
                    showGestureHint('👁️ Revealed answer');
                }
            },
            disabled: isPaused
        }) : {};

        // Show gesture hint temporarily
        const showGestureHint = (message) => {
            setGestureHint(message);
            setTimeout(() => setGestureHint(null), 2000);
        };

        // Initialize or resume session
        useEffect(() => {
            const initializeSession = async () => {
                try {
                    // Try to load existing session
                    let sessionData = null;
                    if (user?.id) {
                        const response = await fetch(`/api/study-sessions?user_id=${user.id}&mode=marathon&is_active=true`);
                        if (response.ok) {
                            const sessions = await response.json();
                            if (sessions.length > 0) {
                                sessionData = sessions[0];
                            }
                        }
                    }
                    
                    // Create or restore queue
                    const approvedSpecimens = specimens.filter(s => s.status === 'approved');
                    const newQueue = sessionData 
                        ? SpacedRepetitionQueue.loadSession(sessionData.queue, approvedSpecimens)
                        : new SpacedRepetitionQueue(approvedSpecimens);
                    
                    setQueue(newQueue);
                    setCurrentCard(newQueue.getNextCard());
                    setSessionStats(newQueue.getSessionStats());
                    
                    // Start auto-save interval
                    startAutoSave(newQueue);
                    
                } catch (error) {
                    console.error('Error initializing session:', error);
                    // Fallback to new session
                    const approvedSpecimens = specimens.filter(s => s.status === 'approved');
                    const newQueue = new SpacedRepetitionQueue(approvedSpecimens);
                    setQueue(newQueue);
                    setCurrentCard(newQueue.getNextCard());
                    setSessionStats(newQueue.getSessionStats());
                }
            };
            
            if (specimens.length > 0) {
                initializeSession();
            }
            
            return () => {
                if (sessionSaveInterval.current) {
                    clearInterval(sessionSaveInterval.current);
                }
            };
        }, [specimens, user]);

        // Auto-save session every 30 seconds - NEW FEATURE
        const startAutoSave = (queueInstance) => {
            if (sessionSaveInterval.current) {
                clearInterval(sessionSaveInterval.current);
            }
            
            sessionSaveInterval.current = setInterval(async () => {
                if (queueInstance && user?.id) {
                    await saveSession(queueInstance);
                }
            }, 30000); // Save every 30 seconds
        };

        const saveSession = async (queueInstance) => {
            if (!user?.id || !queueInstance) return;
            
            try {
                const sessionData = queueInstance.saveSession();
                const response = await fetch('/api/study-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        mode: 'marathon',
                        queue: sessionData,
                        stats: sessionData.stats,
                        is_active: !isPaused
                    })
                });
                
                if (response.ok) {
                    setSessionSaved(true);
                    setTimeout(() => setSessionSaved(false), 2000);
                }
            } catch (error) {
                console.error('Error saving session:', error);
            }
        };

        const handleSubmit = () => {
            if (!currentCard || !queue) return;
            
            const isCorrect = window.FuzzyMatching.isMatch(userAnswer, currentCard.specimen.species_name);
            const similarity = window.FuzzyMatching.similarity(userAnswer, currentCard.specimen.species_name);
            
            // Calculate quality for SM-2 (0-5 scale)
            let quality;
            if (isCorrect) {
                quality = 5 - hintsRevealedManually; // Perfect answer with fewer hints = higher quality
            } else if (similarity > 0.7) {
                quality = 3; // Close answer
            } else if (similarity > 0.4) {
                quality = 2; // Somewhat close
            } else {
                quality = 1; // Not close
            }
            
            quality = Math.max(0, Math.min(5, quality));
            
            // Submit to queue
            queue.submitAnswer(currentCard.specimenId, quality, isCorrect);
            setSessionStats(queue.getSessionStats());
            setShowingAnswer(true);
            
            // Save progress and trigger achievements - NEW INTEGRATION
            if (saveProgress && user) {
                saveProgress({
                    specimenId: currentCard.specimen.id,
                    userAnswer: userAnswer.trim(),
                    correctAnswer: currentCard.specimen.species_name,
                    isCorrect,
                    score: isCorrect ? (100 - hintsRevealedManually * 10) : Math.round(similarity * 100),
                    hintsUsed: currentHintLevel,
                    attempts: 1,
                    progressType: 'marathon_mode',
                    sessionId: queue.sessionStats.sessionId
                });
                
                // Trigger achievement checks
                if (window.checkAchievements) {
                    const stats = queue.getSessionStats();
                    window.checkAchievements('marathon_answer', {
                        isCorrect,
                        currentStreak: stats.currentStreak,
                        longestStreak: stats.longestStreak,
                        totalAnswered: stats.totalAnswered,
                        masteredCards: stats.masteredCards,
                        sessionDuration: stats.duration
                    });
                    
                    // Special achievement checks for marathon mode
                    if (stats.currentStreak >= 10) {
                        window.checkAchievements('streak_update', { streak: stats.currentStreak });
                    }
                    if (stats.totalAnswered >= 50) {
                        window.checkAchievements('marathon_milestone', { questions: stats.totalAnswered });
                    }
                }
            }
        };

        const handleNext = () => {
            if (!queue) return;
            
            setCurrentCard(queue.getNextCard());
            setUserAnswer('');
            setCurrentHintLevel(0);
            setHintsRevealedManually(0);
            setShowingAnswer(false);
        };

        const togglePause = () => {
            setIsPaused(!isPaused);
            if (queue) {
                // Save session when pausing
                saveSession(queue);
            }
        };

        const endSession = async () => {
            if (queue && user?.id) {
                // Final save and mark session as complete
                await fetch('/api/study-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        mode: 'marathon',
                        queue: queue.saveSession(),
                        stats: queue.getSessionStats(),
                        is_active: false,
                        ended_at: new Date().toISOString()
                    })
                });
            }
            onBack();
        };

        if (!currentCard) {
            return React.createElement('div', { 
                style: { padding: '2rem', textAlign: 'center' }
            },
                React.createElement('h2', null, 'Loading Marathon Mode...'),
                React.createElement('div', { style: { marginTop: '1rem' } },
                    React.createElement('div', { 
                        style: { 
                            width: '2rem', 
                            height: '2rem', 
                            border: '2px solid #e5e7eb',
                            borderTop: '2px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }
                    })
                )
            );
        }

        const currentHints = speciesHints[currentCard.specimen.species_name] || [];
        const currentPhotos = specimenPhotos[currentCard.specimen.inaturalist_id] || [];

        return React.createElement('div', {
            style: { minHeight: '100vh', backgroundColor: '#f9fafb' },
            ...gestureHandlers // Apply gesture handlers to main container
        },
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

            // Session saved indicator - NEW FEATURE
            sessionSaved && React.createElement('div', {
                style: {
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    zIndex: 30,
                    animation: 'fadeIn 0.3s ease-in-out'
                }
            }, '💾 Session Saved'),

            // Header with enhanced stats and mobile controls
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
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }
                },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        React.createElement('button', {
                            onClick: endSession,
                            style: {
                                color: '#6b7280',
                                fontSize: '1.125rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }
                        }, '← End Session'),
                        React.createElement('h1', { 
                            style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }
                        }, '🏃‍♂️ Marathon Mode'),
                        React.createElement(window.Phase3Badge)
                    ),
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
                        React.createElement('button', {
                            onClick: togglePause,
                            style: {
                                padding: '0.5rem 1rem',
                                backgroundColor: isPaused ? '#10b981' : '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }
                        }, isPaused ? '▶️ Resume' : '⏸️ Pause')
                    )
                ),
                
                // Enhanced stats display
                React.createElement('div', { 
                    style: { 
                        maxWidth: '64rem', 
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.75rem'
                    }
                },
                    React.createElement('div', { style: { backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' } },
                        React.createElement('div', { 
                            style: { fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }
                        }, sessionStats.totalAnswered || 0),
                        React.createElement('div', { 
                            style: { fontSize: '0.75rem', color: '#6b7280' }
                        }, 'Questions')
                    ),
                    React.createElement('div', { style: { backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' } },
                        React.createElement('div', { 
                            style: { 
                                fontSize: '1.25rem', 
                                fontWeight: 'bold', 
                                color: sessionStats.accuracy >= 70 ? '#10b981' : sessionStats.accuracy >= 50 ? '#f59e0b' : '#ef4444'
                            }
                        }, `${sessionStats.accuracy || 0}%`),
                        React.createElement('div', { 
                            style: { fontSize: '0.75rem', color: '#6b7280' }
                        }, 'Accuracy')
                    ),
                    React.createElement('div', { style: { backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' } },
                        React.createElement('div', { 
                            style: { fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }
                        }, `🔥 ${sessionStats.currentStreak || 0}`),
                        React.createElement('div', { 
                            style: { fontSize: '0.75rem', color: '#6b7280' }
                        }, 'Streak')
                    ),
                    React.createElement('div', { style: { backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' } },
                        React.createElement('div', { 
                            style: { fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6' }
                        }, `${sessionStats.masteredCards || 0}`),
                        React.createElement('div', { 
                            style: { fontSize: '0.75rem', color: '#6b7280' }
                        }, 'Mastered')
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
                        React.createElement('span', null, '👆 Double tap: Submit'),
                        React.createElement('span', null, '👈 Swipe: Next'),
                        React.createElement('span', null, '👆 Swipe up: Hint'),
                        React.createElement('span', null, '👇 Swipe down: Pause')
                    )
                )
            ),

            // Show pause screen
            isPaused ? React.createElement('div', { 
                style: { 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: 'calc(100vh - 200px)' 
                }
            },
                React.createElement('div', { 
                    style: { 
                        textAlign: 'center', 
                        backgroundColor: 'white', 
                        padding: '3rem', 
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxWidth: '24rem'
                    }
                },
                    React.createElement('h2', { 
                        style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }
                    }, '⏸️ Session Paused'),
                    React.createElement('p', { 
                        style: { color: '#6b7280', marginBottom: '1.5rem' }
                    }, 'Your progress is automatically saved.'),
                    
                    React.createElement('div', { 
                        style: { 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '1rem', 
                            marginBottom: '1.5rem', 
                            textAlign: 'center'
                        }
                    },
                        React.createElement('div', { 
                            style: { backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }
                        },
                            React.createElement('div', { 
                                style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }
                            }, sessionStats.totalAnswered || 0),
                            React.createElement('div', { 
                                style: { fontSize: '0.875rem', color: '#6b7280' }
                            }, 'Questions')
                        ),
                        React.createElement('div', { 
                            style: { backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }
                        },
                            React.createElement('div', { 
                                style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }
                            }, `${sessionStats.accuracy || 0}%`),
                            React.createElement('div', { 
                                style: { fontSize: '0.875rem', color: '#6b7280' }
                            }, 'Accuracy')
                        )
                    ),
                    
                    React.createElement('button', {
                        onClick: togglePause,
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
                    }, '▶️ Resume Session')
                )
            ) : React.createElement('div', { style: { maxWidth: '64rem', margin: '0 auto', padding: '1.5rem' } },
                // Main question interface (when not paused)
                currentPhotos.length > 0 && React.createElement('div', { 
                    style: { 
                        backgroundColor: 'white', 
                        borderRadius: '0.75rem', 
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        marginBottom: '1.5rem'
                    }
                },
                    React.createElement('img', {
                        src: currentPhotos[0].medium_url,
                        alt: showingAnswer ? currentCard.specimen.species_name : 'Mushroom specimen',
                        style: {
                            width: '100%',
                            height: '20rem',
                            objectFit: 'cover'
                        }
                    })
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
                    !showingAnswer ? React.createElement('div', null,
                        React.createElement('h2', { 
                            style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }
                        }, 'What species is this?'),
                        React.createElement('input', {
                            type: 'text',
                            value: userAnswer,
                            onChange: (e) => setUserAnswer(e.target.value),
                            onKeyPress: (e) => e.key === 'Enter' && handleSubmit(),
                            placeholder: 'Enter the species name...',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                marginBottom: '1rem'
                            },
                            autoFocus: true
                        }),
                        React.createElement('div', { style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' } },
                            React.createElement('button', {
                                onClick: handleSubmit,
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
                            currentHints.length > 0 && currentHintLevel < currentHints.length && React.createElement('button', {
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
                            }, `Show Hint (${currentHintLevel + 1}/${currentHints.length})`)
                        )
                    ) : React.createElement('div', null,
                        React.createElement('h3', { 
                            style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }
                        }, `Correct answer: ${currentCard.specimen.species_name}`),
                        React.createElement('p', { 
                            style: { color: '#6b7280', marginBottom: '1rem' }
                        }, `Your answer: ${userAnswer}`),
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
                        }, 'Next Question →')
                    )
                ),
                
                // Hints section
                currentHints.length > 0 && currentHintLevel > 0 && React.createElement('div', { 
                    style: { 
                        backgroundColor: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }
                },
                    React.createElement('h3', { 
                        style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }
                    }, '💡 Hints'),
                    React.createElement('div', { style: { space: '0.5rem' } },
                        currentHints.slice(0, currentHintLevel).map((hint, idx) =>
                            React.createElement('div', {
                                key: idx,
                                style: {
                                    marginBottom: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '0.25rem',
                                    borderLeft: '3px solid #f59e0b'
                                }
                            },
                                React.createElement('p', { 
                                    style: { fontSize: '0.875rem', color: '#374151', margin: 0 }
                                }, `${idx + 1}. ${hint.text}`)
                            )
                        )
                    )
                )
            )
        );
    };
    
    console.log('✅ Enhanced MarathonMode component with touch gestures and session persistence loaded');
    
})();