// Achievement Integration System - Connects all study components with achievement triggers
// Flash Fungi - Phase 3 Complete Achievement Framework

(function() {
    'use strict';
    
    // Global Achievement Integration Manager
    window.AchievementIntegration = {
        initialized: false,
        achievementTracker: null,
        originalCheckAchievements: null,
        
        // Initialize the integration system
        init: function(user) {
            if (this.initialized) return;
            
            console.log('🏆 Initializing Achievement Integration System...');
            
            // Set up achievement tracker if available
            if (window.useAchievementTracker) {
                this.achievementTracker = window.useAchievementTracker(user);
                
                // Override global checkAchievements function
                window.checkAchievements = this.checkAchievements.bind(this);
                
                this.initialized = true;
                console.log('✅ Achievement Integration System initialized');
            } else {
                console.warn('⚠️ AchievementSystem not loaded yet, retrying...');
                setTimeout(() => this.init(user), 1000);
            }
        },
        
        // Main achievement checking function - integrates with all components
        checkAchievements: function(eventType, eventData = {}) {
            console.log(`🎯 Checking achievements for event: ${eventType}`, eventData);
            
            // Call original checkAchievements if it exists (from AchievementSystem.js)
            if (this.originalCheckAchievements) {
                this.originalCheckAchievements(eventType, eventData);
            }
            
            // Use the achievement tracker's check function if available
            if (this.achievementTracker && this.achievementTracker.checkAchievements) {
                this.achievementTracker.checkAchievements(eventType, eventData);
            }
            
            // Additional integration-specific logic
            this.handleSpecialAchievements(eventType, eventData);
        },
        
        // Handle special achievement scenarios that require cross-component logic
        handleSpecialAchievements: function(eventType, eventData) {
            try {
                switch (eventType) {
                    case 'answer_correct':
                        this.handleAnswerAchievements(eventData);
                        break;
                    case 'marathon_answer':
                        this.handleMarathonAchievements(eventData);
                        break;
                    case 'focused_study_complete':
                        this.handleFocusedStudyAchievements(eventData);
                        break;
                    case 'training_module_complete':
                        this.handleTrainingAchievements(eventData);
                        break;
                    case 'streak_update':
                        this.handleStreakAchievements(eventData);
                        break;
                    case 'time_based':
                        this.handleTimeBasedAchievements(eventData);
                        break;
                }
            } catch (error) {
                console.error('Error in special achievement handling:', error);
            }
        },
        
        // Handle answer-based achievements
        handleAnswerAchievements: function(eventData) {
            const { isCorrect, score, hintsUsed, attempts, specimenId, dna_verified, is_toxic } = eventData;
            
            // Perfect score achievement
            if (isCorrect && score === 100 && hintsUsed === 0) {
                this.checkAchievements('perfect_answer', { specimenId });
            }
            
            // DNA verified achievement
            if (isCorrect && dna_verified) {
                this.checkAchievements('dna_verified_correct', { specimenId });
            }
            
            // Toxic species achievement
            if (isCorrect && is_toxic) {
                this.checkAchievements('toxic_identified', { specimenId });
            }
            
            // Quick learner (correct on first try)
            if (isCorrect && attempts === 1) {
                this.checkAchievements('quick_learner', { specimenId });
            }
            
            // Night owl / Early bird achievements
            const hour = new Date().getHours();
            if (hour >= 22 || hour <= 5) {
                this.checkAchievements('time_based', { timeType: 'night_owl' });
            } else if (hour >= 5 && hour <= 7) {
                this.checkAchievements('time_based', { timeType: 'early_bird' });
            }
        },
        
        // Handle marathon mode specific achievements
        handleMarathonAchievements: function(eventData) {
            const { currentStreak, longestStreak, totalAnswered, masteredCards, sessionDuration } = eventData;
            
            // Marathon milestones
            if (totalAnswered === 25) {
                this.checkAchievements('marathon_25', { questions: totalAnswered });
            } else if (totalAnswered === 50) {
                this.checkAchievements('marathon_50', { questions: totalAnswered });
            } else if (totalAnswered === 100) {
                this.checkAchievements('marathon_100', { questions: totalAnswered });
            }
            
            // Marathon endurance (time-based)
            if (sessionDuration >= 30) {
                this.checkAchievements('marathon_30min', { duration: sessionDuration });
            } else if (sessionDuration >= 60) {
                this.checkAchievements('marathon_1hour', { duration: sessionDuration });
            }
            
            // Mastery achievements
            if (masteredCards >= 10) {
                this.checkAchievements('mastery_10', { mastered: masteredCards });
            } else if (masteredCards >= 25) {
                this.checkAchievements('mastery_25', { mastered: masteredCards });
            }
        },
        
        // Handle focused study achievements
        handleFocusedStudyAchievements: function(eventData) {
            const { filters, category, score, isCorrect } = eventData;
            
            // Genus specialist achievements
            if (filters.genus !== 'all' && isCorrect) {
                this.checkAchievements('genus_specialist', { 
                    genus: filters.genus,
                    score: score
                });
            }
            
            // Family expert achievements
            if (filters.family !== 'all' && isCorrect) {
                this.checkAchievements('family_expert', { 
                    family: filters.family,
                    score: score
                });
            }
            
            // Difficulty master achievements
            if (filters.difficulty === 'hard' && isCorrect) {
                this.checkAchievements('difficulty_master', { difficulty: 'hard' });
            }
        },
        
        // Handle training module achievements
        handleTrainingAchievements: function(eventData) {
            const { moduleId, score, completionTime, attempts } = eventData;
            
            // Module completion achievements
            this.checkAchievements('module_complete', {
                moduleId: moduleId,
                score: score
            });
            
            // Perfect module score
            if (score >= 90) {
                this.checkAchievements('module_mastery', {
                    moduleId: moduleId,
                    score: score
                });
            }
            
            // Speed completion
            if (completionTime <= 10) { // 10 minutes or less
                this.checkAchievements('speed_learner', {
                    moduleId: moduleId,
                    time: completionTime
                });
            }
        },
        
        // Handle streak achievements
        handleStreakAchievements: function(eventData) {
            const { streak } = eventData;
            
            // Trigger haptic feedback on streak milestones
            if (window.provideTouchFeedback && streak % 5 === 0) {
                window.provideTouchFeedback('success');
            }
            
            // Show gesture hint for major streaks
            if (streak === 20 && window.showGestureHint) {
                window.showGestureHint('🔥 Amazing streak! Keep it up!');
            }
        },
        
        // Handle time-based achievements
        handleTimeBasedAchievements: function(eventData) {
            const { timeType } = eventData;
            
            // Provide appropriate feedback
            if (window.provideTouchFeedback) {
                window.provideTouchFeedback('light');
            }
        },
        
        // Enhanced progress tracking for achievements
        trackProgressUpdate: function(progressType, metadata = {}) {
            // This function can be called by components to track general progress
            // that might contribute to achievements
            
            console.log(`📊 Tracking progress: ${progressType}`, metadata);
            
            // Track cumulative achievements
            this.checkAchievements('progress_update', {
                type: progressType,
                ...metadata
            });
        },
        
        // Show achievement toast with enhanced feedback
        showAchievementNotification: function(achievement) {
            // Visual notification
            if (window.showToast) {
                window.showToast(
                    `🏆 Achievement Unlocked: ${achievement.name}!`, 
                    'success'
                );
            }
            
            // Haptic feedback
            if (window.provideTouchFeedback) {
                window.provideTouchFeedback('success');
            }
            
            // Console log for debugging
            console.log(`🏆 Achievement unlocked: ${achievement.name}`, achievement);
        }
    };
    
    // Enhanced component integration helpers
    window.AchievementHelpers = {
        // Wrapper for study components to automatically trigger achievements
        wrapSaveProgress: function(originalSaveProgress, componentType) {
            return async function(data) {
                // Call original save progress
                if (originalSaveProgress) {
                    await originalSaveProgress(data);
                }
                
                // Trigger achievement checks based on component type
                if (window.checkAchievements) {
                    switch (componentType) {
                        case 'quick_study':
                            window.checkAchievements('answer_correct', data);
                            break;
                        case 'focused_study':
                            window.checkAchievements('focused_study_complete', data);
                            break;
                        case 'marathon_mode':
                            window.checkAchievements('marathon_answer', data);
                            break;
                        case 'training_module':
                            window.checkAchievements('training_module_complete', data);
                            break;
                    }
                }
            };
        },
        
        // Track session milestones
        trackSessionMilestone: function(sessionType, milestone) {
            if (window.checkAchievements) {
                window.checkAchievements('session_milestone', {
                    sessionType: sessionType,
                    milestone: milestone
                });
            }
        },
        
        // Track user interaction patterns
        trackUserInteraction: function(interactionType, data = {}) {
            // Track patterns that might unlock hidden achievements
            if (window.checkAchievements) {
                window.checkAchievements('user_interaction', {
                    type: interactionType,
                    ...data
                });
            }
        }
    };
    
    // Auto-initialize when DOM is ready and user is available
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Wait for auth system to be ready
            const checkAuth = () => {
                if (window.currentUser) {
                    window.AchievementIntegration.init(window.currentUser);
                } else {
                    setTimeout(checkAuth, 1000);
                }
            };
            setTimeout(checkAuth, 2000); // Give time for auth to initialize
        });
    } else {
        // DOM already loaded
        setTimeout(() => {
            const checkAuth = () => {
                if (window.currentUser) {
                    window.AchievementIntegration.init(window.currentUser);
                } else {
                    setTimeout(checkAuth, 1000);
                }
            };
            checkAuth();
        }, 2000);
    }
    
    console.log('✅ Achievement Integration System loaded');
    
})();