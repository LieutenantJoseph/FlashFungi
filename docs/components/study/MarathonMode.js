// Marathon Mode - Phase 3 Complete Implementation
// Unlimited practice with SM-2 spaced repetition algorithm

(function() {
    'use strict';
    
    const { useState, useEffect, useCallback, useRef } = React;
    
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
                startTime: Date.now(),
                masteredCards: 0
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
                    easeFactor: 2.5, // Default ease factor in SM-2
                    interval: 0,
                    nextReview: 0, // Questions until next review
                    lastQuality: null,
                    totalAttempts: 0,
                    correctAttempts: 0,
                    lastSeen: 0
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
                // No cards in immediate queue, check for due reviews
                this.refillQueue();
            }
            
            if (this.queue.length === 0) {
                // Still no cards, all might be mastered
                return null;
            }
            
            const cardId = this.queue.shift();
            const card = this.cardData.get(cardId);
            
            if (!card) {
                return this.getNextCard(); // Skip invalid cards
            }
            
            return card;
        }
        
        refillQueue() {
            const now = this.sessionStats.totalAnswered;
            
            // Find cards that are due for review
            const dueCards = Array.from(this.cardData.entries())
                .filter(([id, card]) => card.nextReview <= now && card.repetitions < 5)
                .map(([id, card]) => id);
            
            if (dueCards.length > 0) {
                this.shuffleArray(dueCards);
                this.queue.push(...dueCards);
            } else {
                // If no due cards, add some random cards for continued practice
                const availableCards = Array.from(this.cardData.keys())
                    .filter(id => this.cardData.get(id).repetitions < 3);
                
                if (availableCards.length > 0) {
                    this.shuffleArray(availableCards);
                    this.queue.push(...availableCards.slice(0, 5));
                }
            }
        }
        
        processAnswer(cardId, quality, hintsUsed = 0) {
            const card = this.cardData.get(cardId);
            if (!card) return;
            
            // Update session stats
            this.sessionStats.totalAnswered++;
            card.totalAttempts++;
            card.lastSeen = this.sessionStats.totalAnswered;
            
            // Determine if answer was correct based on quality and hints
            const wasCorrect = quality >= 3 && hintsUsed <= 2;
            
            if (wasCorrect) {
                this.sessionStats.correctAnswers++;
                this.sessionStats.currentStreak++;
                this.sessionStats.longestStreak = Math.max(
                    this.sessionStats.longestStreak, 
                    this.sessionStats.currentStreak
                );
                card.correctAttempts++;
            } else {
                this.sessionStats.currentStreak = 0;
            }
            
            // SM-2 Algorithm
            if (quality >= 3) {
                // Correct answer
                if (card.repetitions === 0) {
                    card.interval = 1;
                } else if (card.repetitions === 1) {
                    card.interval = 6;
                } else {
                    card.interval = Math.round(card.interval * card.easeFactor);
                }
                card.repetitions++;
            } else {
                // Incorrect answer - restart the card
                card.repetitions = 0;
                card.interval = 1;
            }
            
            // Update ease factor
            card.easeFactor = Math.max(1.3, 
                card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            );
            
            // Schedule next review
            if (quality < 3) {
                // Show again soon for incorrect answers
                card.nextReview = this.sessionStats.totalAnswered + 1;
            } else {
                // Schedule based on interval
                card.nextReview = this.sessionStats.totalAnswered + card.interval;
            }
            
            card.lastQuality = quality;
            
            // Update mastered cards count
            this.sessionStats.masteredCards = Array.from(this.cardData.values())
                .filter(c => c.repetitions >= 3 && c.easeFactor >= 2.5).length;
        }
        
        getSessionStats() {
            const duration = (Date.now() - this.sessionStats.startTime) / 1000 / 60; // minutes
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
        
        saveSession() {
            // Prepare session data for database storage
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
                // Restore session stats
                Object.assign(queue.sessionStats, sessionData.stats);
                queue.sessionStats.startTime = Date.now(); // Reset timer for current session
                
                // Restore card data
                sessionData.cards.forEach(cardInfo => {
                    const card = queue.cardData.get(cardInfo.specimenId);
                    if (card) {
                        Object.assign(card, cardInfo);
                    }
                });
                
                // Restore queue
                if (sessionData.queue && sessionData.queue.length > 0) {
                    queue.queue = [...sessionData.queue];
                } else {
                    queue.refillQueue();
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
        
        const [spQueue, setSpQueue] = useState(null);
        const [currentCard, setCurrentCard] = useState(null);
        const [isPaused, setIsPaused] = useState(false);
        const [showingHint, setShowingHint] = useState(false);
        const [hintsUsed, setHintsUsed] = useState(0);
        const [userAnswer, setUserAnswer] = useState('');
        const [feedback, setFeedback] = useState(null);
        const [showingAnswer, setShowingAnswer] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const [sessionSaved, setSessionSaved] = useState(false);
        
        // Touch gesture state
        const [touchStart, setTouchStart] = useState(null);
        const [touchEnd, setTouchEnd] = useState(null);
        
        // Refs for cleanup
        const saveIntervalRef = useRef(null);
        
        // Initialize or resume session
        useEffect(() => {
            const initializeSession = async () => {
                setIsLoading(true);
                
                try {
                    // Try to load existing session
                    let sessionData = null;
                    if (user?.id) {
                        const response = await fetch(`/api/study-sessions?userId=${user.id}&mode=marathon`);
                        if (response.ok) {
                            const data = await response.json();
                            sessionData = data.session;
                        }
                    }
                    
                    // Create or restore queue
                    const queue = sessionData 
                        ? SpacedRepetitionQueue.loadSession(sessionData, specimens)
                        : new SpacedRepetitionQueue(specimens);
                    
                    setSpQueue(queue);
                    
                    // Get first card
                    const firstCard = queue.getNextCard();
                    setCurrentCard(firstCard);
                    
                    if (sessionData) {
                        window.showToast && window.showToast('Session resumed!', 'success');
                    }
                    
                } catch (error) {
                    console.error('Error initializing session:', error);
                    // Fallback to new session
                    const queue = new SpacedRepetitionQueue(specimens);
                    setSpQueue(queue);
                    setCurrentCard(queue.getNextCard());
                }
                
                setIsLoading(false);
            };
            
            if (specimens.length > 0) {
                initializeSession();
            }
        }, [specimens, user]);
        
        // Auto-save session periodically
        useEffect(() => {
            if (spQueue && user?.id) {
                saveIntervalRef.current = setInterval(async () => {
                    await saveSession();
                }, 30000); // Save every 30 seconds
                
                return () => {
                    if (saveIntervalRef.current) {
                        clearInterval(saveIntervalRef.current);
                    }
                };
            }
        }, [spQueue, user]);
        
        // Save session to database
        const saveSession = useCallback(async () => {
            if (!spQueue || !user?.id) return;
            
            try {
                const sessionData = spQueue.saveSession();
                
                const response = await fetch('/api/study-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        mode: 'marathon',
                        sessionData: sessionData
                    })
                });
                
                if (response.ok) {
                    setSessionSaved(true);
                    setTimeout(() => setSessionSaved(false), 2000);
                }
            } catch (error) {
                console.error('Error saving session:', error);
            }
        }, [spQueue, user]);
        
        // Handle answer submission
        const handleAnswerSubmit = useCallback(async (quality) => {
            if (!currentCard || !spQueue) return;
            
            // Process the answer with SM-2 algorithm
            spQueue.processAnswer(currentCard.specimenId, quality, hintsUsed);
            
            // Show feedback
            const correct = quality >= 3 && hintsUsed <= 2;
            setFeedback({
                correct,
                quality,
                hintsUsed,
                specimen: currentCard.specimen
            });
            setShowingAnswer(true);
            
            // Save progress to database
            if (saveProgress) {
                await saveProgress({
                    specimenId: currentCard.specimenId,
                    correct,
                    hintsUsed,
                    mode: 'marathon',
                    sessionStats: spQueue.getSessionStats()
                });
            }
            
            // Check for achievements
            if (window.useAchievementTracker) {
                const stats = spQueue.getSessionStats();
                // Trigger achievement checks
                if (correct) {
                    window.checkAchievements && window.checkAchievements('answer_correct', {
                        mode: 'marathon',
                        streak: stats.currentStreak
                    });
                }
                
                if (stats.currentStreak > 0 && stats.currentStreak % 5 === 0) {
                    window.checkAchievements && window.checkAchievements('streak_update', {
                        streak: stats.currentStreak
                    });
                }
            }
            
        }, [currentCard, spQueue, hintsUsed, saveProgress]);
        
        // Move to next card
        const handleNextCard = useCallback(() => {
            if (!spQueue) return;
            
            const nextCard = spQueue.getNextCard();
            setCurrentCard(nextCard);
            setShowingAnswer(false);
            setFeedback(null);
            setUserAnswer('');
            setHintsUsed(0);
            setShowingHint(false);
        }, [spQueue]);
        
        // Handle hint request
        const handleHintRequest = () => {
            setShowingHint(true);
            setHintsUsed(prev => prev + 1);
        };
        
        // Toggle pause
        const togglePause = () => {
            setIsPaused(!isPaused);
        };
        
        // End session
        const endSession = async () => {
            if (spQueue) {
                await saveSession();
                window.showToast && window.showToast('Session saved successfully!', 'success');
            }
            onBack();
        };
        
        // Touch gesture handlers
        const handleTouchStart = (e) => {
            setTouchEnd(null);
            setTouchStart(e.targetTouches[0].clientX);
        };
        
        const handleTouchMove = (e) => {
            setTouchEnd(e.targetTouches[0].clientX);
        };
        
        const handleTouchEnd = () => {
            if (!touchStart || !touchEnd) return;
            
            const distance = touchStart - touchEnd;
            const isLeftSwipe = distance > 50;
            const isRightSwipe = distance < -50;
            
            if (isLeftSwipe && !showingAnswer) {
                handleHintRequest();
            } else if (isRightSwipe && showingAnswer) {
                handleNextCard();
            }
        };
        
        if (isLoading) {
            return React.createElement(window.LoadingScreen, {
                message: 'Preparing your marathon session...'
            });
        }
        
        if (!currentCard) {
            return React.createElement('div', { 
                className: 'min-h-screen bg-gray-50 flex items-center justify-center'
            },
                React.createElement('div', { 
                    className: 'bg-white rounded-xl p-8 shadow-lg text-center max-w-md'
                },
                    React.createElement('h2', { 
                        className: 'text-2xl font-bold text-gray-800 mb-4'
                    }, '🏆 Marathon Complete!'),
                    React.createElement('p', { 
                        className: 'text-gray-600 mb-6'
                    }, 'You\'ve completed all available cards. Great work!'),
                    React.createElement('button', {
                        onClick: onBack,
                        className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                    }, 'Return to Menu')
                )
            );
        }
        
        const sessionStats = spQueue ? spQueue.getSessionStats() : {};
        
        return React.createElement('div', { 
            className: 'min-h-screen bg-gray-50',
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd
        },
            // Header with stats
            React.createElement('div', { 
                className: 'bg-white border-b border-gray-200 px-4 py-4'
            },
                React.createElement('div', { className: 'max-w-4xl mx-auto' },
                    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                        React.createElement('div', { className: 'flex items-center space-x-4' },
                            React.createElement('button', {
                                onClick: endSession,
                                className: 'text-gray-600 hover:text-gray-800 text-lg'
                            }, '← End Session'),
                            React.createElement('h1', { 
                                className: 'text-xl font-bold text-gray-800'
                            }, '🏃‍♂️ Marathon Mode'),
                            React.createElement(window.Phase3Badge),
                            sessionSaved && React.createElement('span', {
                                className: 'text-green-600 text-sm'
                            }, '✓ Saved')
                        ),
                        
                        React.createElement('button', {
                            onClick: togglePause,
                            className: `px-4 py-2 rounded-lg font-medium ${
                                isPaused ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                            }`
                        }, isPaused ? '▶️ Resume' : '⏸️ Pause')
                    ),
                    
                    // Stats row
                    React.createElement('div', { 
                        className: 'grid grid-cols-4 gap-4 text-center'
                    },
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-3' },
                            React.createElement('div', { 
                                className: 'text-lg font-bold text-blue-600'
                            }, sessionStats.totalAnswered || 0),
                            React.createElement('div', { 
                                className: 'text-xs text-gray-600'
                            }, 'Questions')
                        ),
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-3' },
                            React.createElement('div', { 
                                className: `text-lg font-bold ${
                                    (sessionStats.accuracy || 0) >= 70 ? 'text-green-600' : 'text-amber-600'
                                }`
                            }, `${sessionStats.accuracy || 0}%`),
                            React.createElement('div', { 
                                className: 'text-xs text-gray-600'
                            }, 'Accuracy')
                        ),
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-3' },
                            React.createElement('div', { 
                                className: 'text-lg font-bold text-orange-600'
                            }, `🔥 ${sessionStats.currentStreak || 0}`),
                            React.createElement('div', { 
                                className: 'text-xs text-gray-600'
                            }, 'Streak')
                        ),
                        React.createElement('div', { className: 'bg-gray-50 rounded-lg p-3' },
                            React.createElement('div', { 
                                className: 'text-lg font-bold text-purple-600'
                            }, `${sessionStats.masteredCards || 0}`),
                            React.createElement('div', { 
                                className: 'text-xs text-gray-600'
                            }, 'Mastered')
                        )
                    ),
                    
                    // Card repetition info
                    currentCard && React.createElement('div', {
                        className: 'mt-3 text-xs text-gray-500 flex justify-between items-center'
                    },
                        React.createElement('span', null, 
                            `Ease: ${currentCard.easeFactor.toFixed(2)} | ` +
                            `Interval: ${currentCard.interval} | ` +
                            `Seen: ${currentCard.repetitions} times`
                        ),
                        React.createElement('span', null, 
                            `Duration: ${sessionStats.duration || 0}min`
                        )
                    )
                )
            ),
            
            // Main content
            !isPaused ? React.createElement('div', { className: 'max-w-4xl mx-auto p-6' },
                // Specimen display
                currentCard && React.createElement('div', { 
                    className: 'bg-white rounded-xl shadow-lg overflow-hidden mb-6'
                },
                    // Image
                    React.createElement('div', { 
                        className: 'aspect-w-16 aspect-h-9 bg-gray-200'
                    },
                        React.createElement('img', {
                            src: currentCard.specimen.primary_image_url || '/placeholder-mushroom.jpg',
                            alt: showingAnswer ? currentCard.specimen.species : 'Mystery mushroom',
                            className: 'w-full h-64 object-cover'
                        })
                    ),
                    
                    // Content
                    React.createElement('div', { className: 'p-6' },
                        !showingAnswer ? (
                            // Question mode
                            React.createElement('div', null,
                                React.createElement('h2', { 
                                    className: 'text-xl font-semibold mb-4'
                                }, 'What species is this?'),
                                
                                React.createElement('input', {
                                    type: 'text',
                                    value: userAnswer,
                                    onChange: (e) => setUserAnswer(e.target.value),
                                    placeholder: 'Enter species name...',
                                    className: 'w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500',
                                    onKeyPress: (e) => {
                                        if (e.key === 'Enter') {
                                            // Simple quality assessment based on answer accuracy
                                            const targetSpecies = currentCard.specimen.species.toLowerCase();
                                            const userInput = userAnswer.toLowerCase().trim();
                                            
                                            let quality = 1; // Default: incorrect
                                            if (userInput === targetSpecies) {
                                                quality = hintsUsed === 0 ? 5 : hintsUsed === 1 ? 4 : 3;
                                            } else if (targetSpecies.includes(userInput) || userInput.includes(targetSpecies.split(' ')[0])) {
                                                quality = 3; // Partial credit
                                            }
                                            
                                            handleAnswerSubmit(quality);
                                        }
                                    }
                                }),
                                
                                React.createElement('div', { 
                                    className: 'flex justify-between items-center'
                                },
                                    React.createElement('button', {
                                        onClick: handleHintRequest,
                                        disabled: hintsUsed >= 3,
                                        className: 'px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300'
                                    }, `💡 Hint (${hintsUsed}/3)`),
                                    
                                    React.createElement('div', { className: 'flex space-x-2' },
                                        React.createElement('button', {
                                            onClick: () => handleAnswerSubmit(1),
                                            className: 'px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
                                        }, "Don't Know"),
                                        React.createElement('button', {
                                            onClick: () => {
                                                const targetSpecies = currentCard.specimen.species.toLowerCase();
                                                const userInput = userAnswer.toLowerCase().trim();
                                                
                                                let quality = 1;
                                                if (userInput === targetSpecies) {
                                                    quality = hintsUsed === 0 ? 5 : hintsUsed === 1 ? 4 : 3;
                                                } else if (targetSpecies.includes(userInput) || userInput.includes(targetSpecies.split(' ')[0])) {
                                                    quality = 3;
                                                }
                                                
                                                handleAnswerSubmit(quality);
                                            },
                                            className: 'px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
                                        }, 'Submit')
                                    )
                                ),
                                
                                // Show hint if requested
                                showingHint && currentCard.specimen.species && speciesHints[currentCard.specimen.species] && (
                                    React.createElement('div', { 
                                        className: 'mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'
                                    },
                                        React.createElement('h3', { 
                                            className: 'font-medium text-yellow-800 mb-2'
                                        }, 'Hint:'),
                                        React.createElement('p', { 
                                            className: 'text-yellow-700'
                                        }, speciesHints[currentCard.specimen.species].hints[hintsUsed - 1] || 'No more hints available')
                                    )
                                )
                            )
                        ) : (
                            // Answer mode
                            React.createElement('div', null,
                                React.createElement('div', { 
                                    className: `p-4 rounded-lg mb-4 ${
                                        feedback?.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                    }`
                                },
                                    React.createElement('h3', { 
                                        className: `font-semibold mb-2 ${
                                            feedback?.correct ? 'text-green-800' : 'text-red-800'
                                        }`
                                    }, feedback?.correct ? '✅ Correct!' : '❌ Incorrect'),
                                    
                                    React.createElement('p', { 
                                        className: 'text-lg font-medium text-gray-800'
                                    }, currentCard.specimen.species),
                                    
                                    currentCard.specimen.common_name && React.createElement('p', { 
                                        className: 'text-gray-600'
                                    }, `Common name: ${currentCard.specimen.common_name}`)
                                ),
                                
                                // Additional info
                                React.createElement('div', { className: 'space-y-2 text-sm text-gray-600' },
                                    React.createElement('p', null, 
                                        `Family: ${currentCard.specimen.family || 'Unknown'}`
                                    ),
                                    React.createElement('p', null, 
                                        `Genus: ${currentCard.specimen.genus || 'Unknown'}`
                                    ),
                                    currentCard.specimen.dna_sequenced && React.createElement('p', { 
                                        className: 'text-blue-600'
                                    }, '🧬 DNA verified')
                                ),
                                
                                React.createElement('div', { className: 'mt-6 flex justify-center' },
                                    React.createElement('button', {
                                        onClick: handleNextCard,
                                        className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium'
                                    }, 'Next Card →')
                                )
                            )
                        )
                    )
                ),
                
                // Mobile swipe instructions
                React.createElement('div', { 
                    className: 'text-center text-gray-500 text-sm md:hidden'
                },
                    '👆 Swipe left for hint, swipe right for next card'
                )
            ) : (
                // Paused state
                React.createElement('div', { 
                    className: 'max-w-md mx-auto mt-12 bg-white rounded-xl p-8 shadow-lg text-center'
                },
                    React.createElement('h2', { 
                        className: 'text-2xl font-bold text-gray-800 mb-4'
                    }, '⏸️ Session Paused'),
                    React.createElement('p', { 
                        className: 'text-gray-600 mb-6'
                    }, 'Take a break! Your progress is automatically saved.'),
                    
                    React.createElement('div', { 
                        className: 'grid grid-cols-2 gap-4 mb-6 text-center'
                    },
                        React.createElement('div', { 
                            className: 'bg-gray-50 rounded-lg p-4'
                        },
                            React.createElement('div', { 
                                className: 'text-2xl font-bold text-green-600'
                            }, sessionStats.totalAnswered || 0),
                            React.createElement('div', { 
                                className: 'text-sm text-gray-600'
                            }, 'Questions')
                        ),
                        React.createElement('div', { 
                            className: 'bg-gray-50 rounded-lg p-4'
                        },
                            React.createElement('div', { 
                                className: 'text-2xl font-bold text-blue-600'
                            }, `${sessionStats.accuracy || 0}%`),
                            React.createElement('div', { 
                                className: 'text-sm text-gray-600'
                            }, 'Accuracy')
                        )
                    ),
                    
                    React.createElement('button', {
                        onClick: togglePause,
                        className: 'w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium'
                    }, '▶️ Resume Session')
                )
            )
        );
    };
    
    console.log('✅ MarathonMode component loaded successfully');
    
})();