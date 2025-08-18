// Achievement System - Phase 3 Complete Implementation
// Manages user achievements, triggers, and notifications

(function() {
    'use strict';
    
    const { useState, useEffect, useCallback } = React;
    
    // Achievement Definitions
    const ACHIEVEMENT_DEFINITIONS = {
        // Beginner achievements
        first_correct: {
            id: 'first_correct',
            name: 'First Steps',
            description: 'Identify your first mushroom correctly',
            icon: '🎯',
            category: 'learning',
            points: 10,
            requirement_type: 'first_correct',
            requirement_value: 1
        },
        
        early_bird: {
            id: 'early_bird',
            name: 'Early Bird',
            description: 'Study before 6 AM',
            icon: '🌅',
            category: 'dedication',
            points: 15,
            requirement_type: 'time_based',
            requirement_value: 'early_bird'
        },
        
        night_owl: {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Study after 10 PM',
            icon: '🦉',
            category: 'dedication',
            points: 15,
            requirement_type: 'time_based',
            requirement_value: 'night_owl'
        },
        
        // Streak achievements
        streak_5: {
            id: 'streak_5',
            name: 'Getting Warm',
            description: 'Get 5 correct answers in a row',
            icon: '🔥',
            category: 'streaks',
            points: 25,
            requirement_type: 'streak',
            requirement_value: 5
        },
        
        streak_10: {
            id: 'streak_10',
            name: 'On Fire',
            description: 'Get 10 correct answers in a row',
            icon: '🔥',
            category: 'streaks',
            points: 50,
            requirement_type: 'streak',
            requirement_value: 10
        },
        
        streak_25: {
            id: 'streak_25',
            name: 'Blazing Hot',
            description: 'Get 25 correct answers in a row',
            icon: '🔥',
            category: 'streaks',
            points: 100,
            requirement_type: 'streak',
            requirement_value: 25
        },
        
        // Volume achievements
        hundred_club: {
            id: 'hundred_club',
            name: 'Hundred Club',
            description: 'Answer 100 questions correctly',
            icon: '💯',
            category: 'volume',
            points: 75,
            requirement_type: 'total_correct',
            requirement_value: 100
        },
        
        thousand_club: {
            id: 'thousand_club',
            name: 'Thousand Club',
            description: 'Answer 1000 questions correctly',
            icon: '🎖️',
            category: 'volume',
            points: 200,
            requirement_type: 'total_correct',
            requirement_value: 1000
        },
        
        // Accuracy achievements
        perfectionist: {
            id: 'perfectionist',
            name: 'Perfectionist',
            description: 'Achieve 100% accuracy in a session of 20+ questions',
            icon: '✨',
            category: 'accuracy',
            points: 150,
            requirement_type: 'perfect_session',
            requirement_value: 20
        },
        
        accuracy_master: {
            id: 'accuracy_master',
            name: 'Accuracy Master',
            description: 'Maintain 90%+ accuracy over 100 questions',
            icon: '🎯',
            category: 'accuracy',
            points: 100,
            requirement_type: 'accuracy_streak',
            requirement_value: { accuracy: 90, questions: 100 }
        },
        
        // Genus mastery
        genus_master_agaricus: {
            id: 'genus_master_agaricus',
            name: 'Agaricus Expert',
            description: 'Achieve 90% accuracy with Agaricus species',
            icon: '🍄',
            category: 'mastery',
            points: 75,
            requirement_type: 'genus_accuracy',
            requirement_value: { genus: 'Agaricus', accuracy: 90, minimum: 20 }
        },
        
        genus_master_boletus: {
            id: 'genus_master_boletus',
            name: 'Boletus Expert',
            description: 'Achieve 90% accuracy with Boletus species',
            icon: '🟫',
            category: 'mastery',
            points: 75,
            requirement_type: 'genus_accuracy',
            requirement_value: { genus: 'Boletus', accuracy: 90, minimum: 20 }
        },
        
        // Special achievements
        dna_detective: {
            id: 'dna_detective',
            name: 'DNA Detective',
            description: 'Correctly identify 50 DNA-verified specimens',
            icon: '🧬',
            category: 'special',
            points: 100,
            requirement_type: 'dna_specialist',
            requirement_value: 50
        },
        
        marathon_runner: {
            id: 'marathon_runner',
            name: 'Marathon Runner',
            description: 'Complete a 60+ minute Marathon Mode session',
            icon: '🏃‍♂️',
            category: 'dedication',
            points: 125,
            requirement_type: 'marathon_duration',
            requirement_value: 60
        },
        
        module_graduate: {
            id: 'module_graduate',
            name: 'Training Graduate',
            description: 'Complete all foundation training modules',
            icon: '🎓',
            category: 'learning',
            points: 150,
            requirement_type: 'modules_complete',
            requirement_value: ['foundation_intro', 'foundation_morphology', 'foundation_ecology', 'foundation_safety', 'foundation_practice']
        },
        
        dangerous_game: {
            id: 'dangerous_game',
            name: 'Playing with Fire',
            description: 'Correctly identify 10 toxic mushroom species',
            icon: '☠️',
            category: 'safety',
            points: 200,
            requirement_type: 'toxic_species',
            requirement_value: 10
        }
    };
    
    // Achievement Toast Component
    window.AchievementToast = function AchievementToast({ achievement, onClose, isVisible }) {
        const [animationClass, setAnimationClass] = useState('');
        
        useEffect(() => {
            if (isVisible) {
                setAnimationClass('animate-slide-in-right');
                const timer = setTimeout(() => {
                    setAnimationClass('animate-slide-out-right');
                    setTimeout(onClose, 300);
                }, 4000);
                return () => clearTimeout(timer);
            }
        }, [isVisible, onClose]);
        
        if (!isVisible) return null;
        
        return React.createElement('div', {
            className: `fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm ${animationClass}`,
            style: { zIndex: 9999 }
        },
            React.createElement('div', { className: 'flex items-center space-x-3' },
                React.createElement('div', { 
                    className: 'text-2xl'
                }, achievement.icon),
                React.createElement('div', { className: 'flex-1' },
                    React.createElement('div', { 
                        className: 'font-bold text-sm'
                    }, '🏆 Achievement Unlocked!'),
                    React.createElement('div', { 
                        className: 'font-semibold'
                    }, achievement.name),
                    React.createElement('div', { 
                        className: 'text-sm opacity-90'
                    }, achievement.description),
                    achievement.points && React.createElement('div', { 
                        className: 'text-xs font-medium mt-1'
                    }, `+${achievement.points} points`)
                ),
                React.createElement('button', {
                    onClick: onClose,
                    className: 'text-white hover:text-gray-200 text-xl leading-none'
                }, '×')
            )
        );
    };
    
    // Achievement Tracker Hook
    window.useAchievementTracker = function(user) {
        const [achievements, setAchievements] = useState([]);
        const [userAchievements, setUserAchievements] = useState([]);
        const [toastQueue, setToastQueue] = useState([]);
        const [userStats, setUserStats] = useState({});
        
        // Load achievements and user data
        useEffect(() => {
            if (!user?.id) return;
            
            const loadAchievements = async () => {
                try {
                    // Load all achievement definitions
                    const allAchievements = Object.values(ACHIEVEMENT_DEFINITIONS).map(achievement => ({
                        ...achievement,
                        earned: false,
                        earned_at: null,
                        progress: 0
                    }));
                    
                    // Load user's earned achievements
                    const response = await fetch(`${window.SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.${user.id}&select=*`, {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    });
                    
                    if (response.ok) {
                        const earnedAchievements = await response.json();
                        
                        // Mark earned achievements
                        const mergedAchievements = allAchievements.map(achievement => {
                            const earned = earnedAchievements.find(ea => ea.achievement_id === achievement.id);
                            return earned ? {
                                ...achievement,
                                earned: true,
                                earned_at: earned.earned_at,
                                progress: earned.progress || 100
                            } : achievement;
                        });
                        
                        setAchievements(mergedAchievements);
                        setUserAchievements(earnedAchievements);
                    } else {
                        setAchievements(allAchievements);
                    }
                    
                    // Load user stats for progress tracking
                    const statsResponse = await fetch(`${window.SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${user.id}&select=*`, {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    });
                    
                    if (statsResponse.ok) {
                        const progressData = await statsResponse.json();
                        const stats = {
                            total_correct: 0,
                            total_attempts: 0,
                            current_streak: 0,
                            longest_streak: 0,
                            genus_accuracy: {},
                            modules_completed: [],
                            dna_correct: 0,
                            toxic_correct: 0
                        };
                        
                        // Aggregate stats from progress data
                        progressData.forEach(record => {
                            if (record.progress_type === 'quiz') {
                                stats.total_attempts++;
                                if (record.score > 50) {
                                    stats.total_correct++;
                                }
                            }
                        });
                        
                        setUserStats(stats);
                    }
                } catch (error) {
                    console.error('Error loading achievements:', error);
                }
            };
            
            loadAchievements();
        }, [user]);
        
        // Check achievement triggers
        const checkAchievements = useCallback(async (eventType, eventData) => {
            if (!user?.id || achievements.length === 0) return;
            
            const unearned = achievements.filter(a => !a.earned);
            const newlyEarned = [];
            
            for (const achievement of unearned) {
                let earned = false;
                let progress = achievement.progress || 0;
                
                // Check based on requirement type
                switch (achievement.requirement_type) {
                    case 'first_correct':
                        if (eventType === 'answer_correct' && userStats.total_correct === 0) {
                            earned = true;
                        }
                        break;
                        
                    case 'streak':
                        if (eventType === 'streak_update' && eventData.streak >= achievement.requirement_value) {
                            earned = true;
                        }
                        break;
                        
                    case 'total_correct':
                        if (eventType === 'answer_correct') {
                            const newTotal = userStats.total_correct + 1;
                            progress = Math.min((newTotal / achievement.requirement_value) * 100, 100);
                            if (newTotal >= achievement.requirement_value) {
                                earned = true;
                            }
                        }
                        break;
                        
                    case 'genus_accuracy':
                        if (eventType === 'genus_complete') {
                            const { genus, accuracy, attempts } = eventData;
                            const req = achievement.requirement_value;
                            if (genus === req.genus && attempts >= req.minimum && accuracy >= req.accuracy) {
                                earned = true;
                            }
                        }
                        break;
                        
                    case 'dna_specialist':
                        if (eventType === 'answer_correct' && eventData.dna_verified) {
                            const newCount = userStats.dna_correct + 1;
                            progress = Math.min((newCount / achievement.requirement_value) * 100, 100);
                            if (newCount >= achievement.requirement_value) {
                                earned = true;
                            }
                        }
                        break;
                        
                    case 'toxic_species':
                        if (eventType === 'answer_correct' && eventData.is_toxic) {
                            const newCount = userStats.toxic_correct + 1;
                            progress = Math.min((newCount / achievement.requirement_value) * 100, 100);
                            if (newCount >= achievement.requirement_value) {
                                earned = true;
                            }
                        }
                        break;
                        
                    case 'time_based':
                        const hour = new Date().getHours();
                        if (achievement.requirement_value === 'night_owl' && hour >= 22) {
                            earned = true;
                        } else if (achievement.requirement_value === 'early_bird' && hour < 6) {
                            earned = true;
                        }
                        break;
                        
                    case 'perfect_session':
                        if (eventType === 'session_complete' && 
                            eventData.accuracy === 100 && 
                            eventData.questions >= achievement.requirement_value) {
                            earned = true;
                        }
                        break;
                        
                    case 'marathon_duration':
                        if (eventType === 'marathon_complete' && 
                            eventData.duration >= achievement.requirement_value) {
                            earned = true;
                        }
                        break;
                        
                    case 'modules_complete':
                        if (eventType === 'module_complete') {
                            const requiredModules = achievement.requirement_value;
                            const completedModules = [...userStats.modules_completed, eventData.moduleId];
                            const uniqueCompleted = [...new Set(completedModules)];
                            
                            progress = Math.min((uniqueCompleted.length / requiredModules.length) * 100, 100);
                            
                            if (requiredModules.every(module => uniqueCompleted.includes(module))) {
                                earned = true;
                            }
                        }
                        break;
                }
                
                // Award achievement if earned or update progress
                if (earned || progress > achievement.progress) {
                    try {
                        const response = await fetch(`${window.SUPABASE_URL}/rest/v1/user_achievements`, {
                            method: 'POST',
                            headers: {
                                'apikey': window.SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'resolution=merge-duplicates'
                            },
                            body: JSON.stringify({
                                user_id: user.id,
                                achievement_id: achievement.id,
                                earned: earned,
                                progress: earned ? 100 : progress,
                                earned_at: earned ? new Date().toISOString() : null
                            })
                        });
                        
                        if (response.ok && earned) {
                            newlyEarned.push(achievement);
                            setToastQueue(prev => [...prev, achievement]);
                        }
                        
                        // Update local achievement state
                        setAchievements(prev => prev.map(a => 
                            a.id === achievement.id 
                                ? { ...a, earned, progress: earned ? 100 : progress, earned_at: earned ? new Date().toISOString() : null }
                                : a
                        ));
                    } catch (error) {
                        console.error('Error awarding achievement:', error);
                    }
                }
            }
            
            // Update user stats
            if (eventType === 'answer_correct') {
                setUserStats(prev => ({
                    ...prev,
                    total_correct: prev.total_correct + 1,
                    total_attempts: prev.total_attempts + 1,
                    dna_correct: eventData.dna_verified ? prev.dna_correct + 1 : prev.dna_correct,
                    toxic_correct: eventData.is_toxic ? prev.toxic_correct + 1 : prev.toxic_correct
                }));
            }
            
        }, [user, achievements, userStats]);
        
        return {
            achievements,
            userAchievements,
            checkAchievements,
            toastQueue,
            clearToast: () => setToastQueue(prev => prev.slice(1)),
            userStats
        };
    };
    
    // Achievement Showcase Component
    window.AchievementShowcase = function({ achievements, user }) {
        const [selectedCategory, setSelectedCategory] = useState('all');
        
        const earned = achievements.filter(a => a.earned);
        const categories = ['all', ...new Set(achievements.map(a => a.category))];
        
        const filteredAchievements = selectedCategory === 'all' 
            ? achievements 
            : achievements.filter(a => a.category === selectedCategory);
        
        const totalPoints = earned.reduce((sum, a) => sum + (a.points || 0), 0);
        
        return React.createElement('div', { className: 'p-6' },
            React.createElement('h2', { 
                className: 'text-2xl font-bold text-gray-800 mb-6'
            }, '🏆 Your Achievements'),
            
            // Stats overview
            React.createElement('div', { 
                className: 'grid grid-cols-3 gap-4 mb-6'
            },
                React.createElement('div', { 
                    className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-4 text-center'
                },
                    React.createElement('div', { className: 'text-2xl font-bold' }, earned.length),
                    React.createElement('div', { className: 'text-sm opacity-90' }, 'Earned')
                ),
                React.createElement('div', { 
                    className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 text-center'
                },
                    React.createElement('div', { className: 'text-2xl font-bold' }, achievements.length),
                    React.createElement('div', { className: 'text-sm opacity-90' }, 'Total')
                ),
                React.createElement('div', { 
                    className: 'bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg p-4 text-center'
                },
                    React.createElement('div', { className: 'text-2xl font-bold' }, totalPoints),
                    React.createElement('div', { className: 'text-sm opacity-90' }, 'Points')
                )
            ),
            
            // Category filter
            React.createElement('div', { className: 'mb-6' },
                React.createElement('div', { className: 'flex flex-wrap gap-2' },
                    categories.map(category =>
                        React.createElement('button', {
                            key: category,
                            onClick: () => setSelectedCategory(category),
                            className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`
                        }, category.charAt(0).toUpperCase() + category.slice(1))
                    )
                )
            ),
            
            // Achievement grid
            React.createElement('div', { 
                className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            },
                filteredAchievements.map(achievement =>
                    React.createElement('div', {
                        key: achievement.id,
                        className: `p-4 rounded-lg border-2 transition-all ${
                            achievement.earned
                                ? 'bg-green-50 border-green-300 shadow-md'
                                : 'bg-gray-50 border-gray-200 opacity-75'
                        }`
                    },
                        React.createElement('div', { className: 'flex items-start space-x-3' },
                            React.createElement('div', { 
                                className: `text-2xl ${achievement.earned ? '' : 'grayscale'}`
                            }, achievement.icon),
                            React.createElement('div', { className: 'flex-1' },
                                React.createElement('h3', { 
                                    className: `font-semibold ${
                                        achievement.earned ? 'text-green-800' : 'text-gray-600'
                                    }`
                                }, achievement.name),
                                React.createElement('p', { 
                                    className: `text-sm ${
                                        achievement.earned ? 'text-green-700' : 'text-gray-500'
                                    }`
                                }, achievement.description),
                                achievement.points && React.createElement('div', { 
                                    className: `text-xs font-medium mt-2 ${
                                        achievement.earned ? 'text-green-600' : 'text-gray-400'
                                    }`
                                }, `${achievement.points} points`),
                                
                                // Progress bar for unearned achievements
                                !achievement.earned && achievement.progress > 0 && (
                                    React.createElement('div', { className: 'mt-2' },
                                        React.createElement('div', { 
                                            className: 'w-full bg-gray-200 rounded-full h-2'
                                        },
                                            React.createElement('div', {
                                                className: 'bg-blue-600 h-2 rounded-full transition-all duration-300',
                                                style: { width: `${achievement.progress}%` }
                                            })
                                        ),
                                        React.createElement('div', { 
                                            className: 'text-xs text-gray-500 mt-1'
                                        }, `${Math.round(achievement.progress)}% complete`)
                                    )
                                ),
                                
                                // Earned date
                                achievement.earned && achievement.earned_at && (
                                    React.createElement('div', { 
                                        className: 'text-xs text-green-600 mt-2'
                                    }, `Earned: ${new Date(achievement.earned_at).toLocaleDateString()}`)
                                )
                            )
                        )
                    )
                )
            )
        );
    };
    
    // Global achievement checker function
    window.checkAchievements = function(eventType, eventData) {
        if (window.achievementChecker) {
            window.achievementChecker(eventType, eventData);
        }
    };
    
    console.log('✅ AchievementSystem component loaded successfully');
    
})();