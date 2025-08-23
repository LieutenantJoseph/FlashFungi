// SessionTracker.js - Updated to work with study_sessions table
// Lightweight session-based progress tracking with API integration

(function() {
    'use strict';
    
    window.SessionTracker = {
        // In-memory session storage
        currentSession: null,
        saveTimer: null,
        
        // Start a new study session
        startSession: function(userId, mode = 'quick', filters = null) {
            this.currentSession = {
                userId: userId,
                mode: mode,
                filters: filters,
                startTime: Date.now(),
                stats: {
                    totalQuestions: 0,
                    correctAnswers: 0,
                    totalScore: 0,
                    hintsUsed: 0,
                    streak: 0,
                    longestStreak: 0,
                    specimensStudied: new Set(),
                    genusCounts: {},
                    familyCounts: {},
                    perfectScores: 0,
                    noHintCorrect: 0,
                    uniqueSpecimens: 0
                },
                milestones: [],
                lastSaved: Date.now()
            };
            
            // Set up auto-save timer (every 5 minutes)
            this.startAutoSave();
            
            console.log('📊 Session started:', mode);
            return this.currentSession;
        },
        
        // Start auto-save timer
        startAutoSave: function() {
            // Clear any existing timer
            if (this.saveTimer) {
                clearInterval(this.saveTimer);
            }
            
            // Save every 5 minutes
            this.saveTimer = setInterval(() => {
                if (this.currentSession) {
                    this.saveSessionProgress(false);
                }
            }, 300000); // 5 minutes
        },
        
        // Track individual flashcard (in memory only)
        trackFlashcard: function(data) {
            if (!this.currentSession) return;
            
            const { 
                specimenId, 
                genus, 
                family, 
                score, 
                hintsUsed, 
                isCorrect 
            } = data;
            
            const session = this.currentSession;
            
            // Update basic stats
            session.stats.totalQuestions++;
            if (isCorrect) {
                session.stats.correctAnswers++;
                session.stats.streak++;
                if (session.stats.streak > session.stats.longestStreak) {
                    session.stats.longestStreak = session.stats.streak;
                }
                if (hintsUsed === 0) {
                    session.stats.noHintCorrect++;
                }
                if (score === 100) {
                    session.stats.perfectScores++;
                }
            } else {
                session.stats.streak = 0;
            }
            
            session.stats.totalScore += score;
            session.stats.hintsUsed += hintsUsed;
            session.stats.specimensStudied.add(specimenId);
            session.stats.uniqueSpecimens = session.stats.specimensStudied.size;
            
            // Track genus/family for focused learning insights
            if (genus) {
                session.stats.genusCounts[genus] = (session.stats.genusCounts[genus] || 0) + 1;
            }
            if (family) {
                session.stats.familyCounts[family] = (session.stats.familyCounts[family] || 0) + 1;
            }
            
            // Check for milestones
            this.checkMilestones(session.stats);
            
            // Auto-save every 10 questions
            if (session.stats.totalQuestions % 10 === 0) {
                this.saveSessionProgress(false);
            }
            
            return session.stats;
        },
        
        // Check for achievement milestones
        checkMilestones: function(stats) {
            const milestones = this.currentSession.milestones;
            
            // Define milestone thresholds
            const milestoneChecks = [
                { key: 'first_correct', condition: stats.correctAnswers === 1 },
                { key: 'streak_5', condition: stats.streak === 5 },
                { key: 'streak_10', condition: stats.streak === 10 },
                { key: 'streak_20', condition: stats.streak === 20 },
                { key: 'questions_10', condition: stats.totalQuestions === 10 },
                { key: 'questions_25', condition: stats.totalQuestions === 25 },
                { key: 'questions_50', condition: stats.totalQuestions === 50 },
                { key: 'questions_100', condition: stats.totalQuestions === 100 },
                { key: 'perfect_5', condition: stats.perfectScores === 5 },
                { key: 'perfect_10', condition: stats.perfectScores === 10 },
                { key: 'no_hints_10', condition: stats.noHintCorrect === 10 }
            ];
            
            milestoneChecks.forEach(({ key, condition }) => {
                if (condition && !milestones.includes(key)) {
                    milestones.push(key);
                    this.triggerAchievement(key, stats);
                }
            });
            
            // Perfect session check (every 10 questions)
            if (stats.totalQuestions % 10 === 0 && stats.totalQuestions > 0) {
                const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
                if (accuracy === 100) {
                    this.triggerAchievement(`perfect_${stats.totalQuestions}`, stats);
                }
            }
        },
        
        // Trigger achievement
        triggerAchievement: function(type, stats) {
            if (window.checkAchievements) {
                window.checkAchievements(type, {
                    sessionStats: stats,
                    timestamp: Date.now()
                });
            }
            console.log('🏆 Milestone reached:', type);
        },
        
        // Get top item from counts
        getTopItem: function(counts) {
            if (!counts || Object.keys(counts).length === 0) return null;
            return Object.entries(counts)
                .sort((a, b) => b[1] - a[1])[0][0];
        },
        
        // Save session progress to database
        saveSessionProgress: async function(isComplete = false) {
            if (!this.currentSession) return;
            
            const session = this.currentSession;
            const duration = Math.round((Date.now() - session.startTime) / 60000);
            
            const sessionData = {
                userId: session.userId,
                sessionType: session.mode,
                stats: session.stats,
                metadata: {
                    duration: duration,
                    milestones: session.milestones,
                    topGenus: this.getTopItem(session.stats.genusCounts),
                    topFamily: this.getTopItem(session.stats.familyCounts),
                    genusCounts: session.stats.genusCounts,
                    familyCounts: session.stats.familyCounts
                },
                filters: session.filters,
                isComplete: isComplete
            };
            
            try {
                const response = await fetch('/api/study-sessions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sessionData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    session.lastSaved = Date.now();
                    console.log('💾 Session progress saved:', result.stats);
                    return result;
                } else {
                    console.error('Failed to save session:', await response.text());
                }
            } catch (error) {
                console.error('Error saving session:', error);
            }
        },
        
        // End session and save final stats
        endSession: async function() {
            if (!this.currentSession) return null;
            
            // Clear auto-save timer
            if (this.saveTimer) {
                clearInterval(this.saveTimer);
                this.saveTimer = null;
            }
            
            // Save final session state
            const finalStats = await this.saveSessionProgress(true);
            
            // Create session summary
            const sessionSummary = {
                duration: Math.round((Date.now() - this.currentSession.startTime) / 60000),
                stats: this.currentSession.stats,
                milestones: this.currentSession.milestones,
                accuracy: this.currentSession.stats.totalQuestions > 0
                    ? Math.round((this.currentSession.stats.correctAnswers / this.currentSession.stats.totalQuestions) * 100)
                    : 0
            };
            
            // Clear session
            this.currentSession = null;
            console.log('📊 Session ended:', sessionSummary);
            
            return sessionSummary;
        },
        
        // Get current session stats (for UI display)
        getCurrentStats: function() {
            if (!this.currentSession) return null;
            
            const stats = this.currentSession.stats;
            return {
                questions: stats.totalQuestions,
                correct: stats.correctAnswers,
                accuracy: stats.totalQuestions > 0 
                    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
                    : 0,
                avgScore: stats.totalQuestions > 0
                    ? Math.round(stats.totalScore / stats.totalQuestions)
                    : 0,
                streak: stats.streak,
                longestStreak: stats.longestStreak,
                hintsUsed: stats.hintsUsed,
                uniqueSpecimens: stats.uniqueSpecimens,
                duration: Math.round((Date.now() - this.currentSession.startTime) / 60000)
            };
        },
        
        // Force save (for UI to call)
        forceSave: async function() {
            if (this.currentSession) {
                return await this.saveSessionProgress(false);
            }
            return null;
        }
    };
    
    // Auto-save on page unload
    window.addEventListener('beforeunload', (e) => {
        if (window.SessionTracker.currentSession) {
            // Try to save synchronously (best effort)
            const session = window.SessionTracker.currentSession;
            const data = {
                userId: session.userId,
                sessionType: session.mode,
                stats: session.stats,
                metadata: {
                    duration: Math.round((Date.now() - session.startTime) / 60000),
                    milestones: session.milestones,
                    interrupted: true
                },
                isComplete: false
            };
            
            // Use sendBeacon for reliable unload saves
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                navigator.sendBeacon('/api/study-sessions', blob);
            }
        }
    });
    
    // Clear timer on window unload
    window.addEventListener('unload', () => {
        if (window.SessionTracker.saveTimer) {
            clearInterval(window.SessionTracker.saveTimer);
        }
    });
    
    console.log('✅ Session Tracker v2.0 loaded (with study_sessions table integration)');
})();