// AchievementSystem.js - Database-Driven Achievement System
// Flash Fungi - Living Mycology Style with Supabase Integration

(function() {
    'use strict';
    
    // Achievement Toast Component
    window.AchievementToast = function AchievementToast({ achievement, onClose }) {
        const [isVisible, setIsVisible] = React.useState(true);
        
        React.useEffect(() => {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, 5000);
            
            return () => clearTimeout(timer);
        }, []);

        return React.createElement('div', {
            style: {
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                minWidth: '320px',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 1000,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
                transition: 'all 0.3s ease-out'
            }
        },
            React.createElement('div', {
                style: {
                    fontSize: '3rem',
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                }
            }, achievement.icon || '🏆'),
            
            React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', {
                    style: {
                        fontSize: '0.875rem',
                        opacity: 0.9,
                        marginBottom: '0.25rem'
                    }
                }, '🎉 Achievement Unlocked!'),
                React.createElement('div', {
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: 'bold'
                    }
                }, achievement.name),
                React.createElement('div', {
                    style: {
                        fontSize: '0.875rem',
                        opacity: 0.9,
                        marginTop: '0.25rem'
                    }
                }, achievement.description),
                achievement.points && React.createElement('div', {
                    style: {
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }
                },
                    React.createElement('span', null, '⭐'),
                    React.createElement('span', null, `+${achievement.points} XP`)
                )
            ),
            
            React.createElement('button', {
                onClick: () => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                },
                style: {
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '1rem'
                }
            }, '×')
        );
    };
    
    // Achievement Tracker Hook
    window.useAchievementTracker = function(user) {
        const [achievements, setAchievements] = React.useState([]);
        const [userAchievements, setUserAchievements] = React.useState([]);
        const [toastQueue, setToastQueue] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        
        // Load achievements from database
        React.useEffect(() => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            
            loadAchievements();
        }, [user]);
        
        const loadAchievements = async () => {
            try {
                setLoading(true);
                
                // Load all available achievements from database
                const achievementsResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/achievements?select=*&order=category,sort_order`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (achievementsResponse.ok) {
                    const achievementsData = await achievementsResponse.json();
                    setAchievements(achievementsData);
                }
                
                // Load user's earned achievements
                const userAchievementsResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.${user.id}&select=*`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (userAchievementsResponse.ok) {
                    const userAchievementsData = await userAchievementsResponse.json();
                    setUserAchievements(userAchievementsData);
                }
                
            } catch (error) {
                console.error('Error loading achievements:', error);
            } finally {
                setLoading(false);
            }
        };
        
        // Check for new achievements based on user actions
        const checkAchievements = async (eventType, eventData = {}) => {
            if (!user?.id || loading) return;
            
            try {
                // Call a Supabase function to check achievements
                const response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/rpc/check_achievements`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            p_user_id: user.id,
                            p_event_type: eventType,
                            p_event_data: eventData
                        })
                    }
                );
                
                if (response.ok) {
                    const newAchievements = await response.json();
                    
                    if (newAchievements && newAchievements.length > 0) {
                        // Add new achievements to the toast queue
                        setToastQueue(prev => [...prev, ...newAchievements]);
                        
                        // Update user achievements list
                        setUserAchievements(prev => [
                            ...prev,
                            ...newAchievements.map(a => ({
                                achievement_id: a.id,
                                user_id: user.id,
                                earned_at: new Date().toISOString()
                            }))
                        ]);
                    }
                }
            } catch (error) {
                console.error('Error checking achievements:', error);
            }
        };
        
        // Award achievement manually (for testing or special cases)
        const awardAchievement = async (achievementId) => {
            if (!user?.id) return false;
            
            try {
                const response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_achievements`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            user_id: user.id,
                            achievement_id: achievementId,
                            earned_at: new Date().toISOString()
                        })
                    }
                );
                
                if (response.ok) {
                    const result = await response.json();
                    
                    // Find the achievement details
                    const achievement = achievements.find(a => a.id === achievementId);
                    if (achievement) {
                        setToastQueue(prev => [...prev, achievement]);
                    }
                    
                    // Reload achievements
                    await loadAchievements();
                    return true;
                }
            } catch (error) {
                console.error('Error awarding achievement:', error);
            }
            
            return false;
        };
        
        return {
            achievements,
            userAchievements,
            toastQueue,
            setToastQueue,
            checkAchievements,
            awardAchievement,
            loading,
            reload: loadAchievements
        };
    };
    
    // Achievement Display Component
    window.AchievementDisplay = function AchievementDisplay({ achievements = [], userAchievements = [], showAll = false }) {
        const [selectedCategory, setSelectedCategory] = React.useState('all');
        
        // Get unique categories
        const categories = React.useMemo(() => {
            const cats = ['all', ...new Set(achievements.map(a => a.category))];
            return cats.filter(Boolean);
        }, [achievements]);
        
        // Filter achievements
        const displayAchievements = React.useMemo(() => {
            let filtered = achievements;
            
            if (!showAll) {
                // Only show earned achievements
                filtered = achievements.filter(a => 
                    userAchievements.some(ua => ua.achievement_id === a.id)
                );
            }
            
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(a => a.category === selectedCategory);
            }
            
            return filtered;
        }, [achievements, userAchievements, selectedCategory, showAll]);
        
        // Check if achievement is earned
        const isEarned = (achievementId) => {
            return userAchievements.some(ua => ua.achievement_id === achievementId);
        };
        
        return React.createElement('div', null,
            // Category Filter
            React.createElement('div', {
                style: {
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }
            },
                categories.map(category =>
                    React.createElement('button', {
                        key: category,
                        onClick: () => setSelectedCategory(category),
                        style: {
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: selectedCategory === category
                                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                : '#e5e7eb',
                            color: selectedCategory === category ? 'white' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textTransform: 'capitalize'
                        }
                    }, category === 'all' ? 'All Categories' : category)
                )
            ),
            
            // Achievements Grid
            React.createElement('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }
            },
                displayAchievements.map(achievement => {
                    const earned = isEarned(achievement.id);
                    const earnedData = userAchievements.find(ua => ua.achievement_id === achievement.id);
                    
                    return React.createElement('div', {
                        key: achievement.id,
                        style: {
                            backgroundColor: earned ? 'white' : '#f9fafb',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            border: earned ? '2px solid #059669' : '2px solid #e5e7eb',
                            opacity: earned ? 1 : 0.7,
                            transition: 'all 0.2s',
                            position: 'relative',
                            cursor: 'default'
                        },
                        onMouseEnter: (e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        },
                        onMouseLeave: (e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }
                    },
                        // Earned Badge
                        earned && React.createElement('div', {
                            style: {
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }
                        }, '✓'),
                        
                        // Icon and Content
                        React.createElement('div', {
                            style: {
                                display: 'flex',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }
                        },
                            React.createElement('div', {
                                style: {
                                    fontSize: '2.5rem',
                                    filter: earned ? 'none' : 'grayscale(100%)'
                                }
                            }, achievement.icon || '🏆'),
                            
                            React.createElement('div', { style: { flex: 1 } },
                                React.createElement('h4', {
                                    style: {
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: earned ? '#111827' : '#6b7280',
                                        marginBottom: '0.25rem'
                                    }
                                }, achievement.name),
                                
                                React.createElement('div', {
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#6b7280'
                                    }
                                }, achievement.description)
                            )
                        ),
                        
                        // Footer
                        React.createElement('div', {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #e5e7eb'
                            }
                        },
                            React.createElement('div', {
                                style: {
                                    display: 'flex',
                                    gap: '0.5rem',
                                    fontSize: '0.75rem'
                                }
                            },
                                achievement.points && React.createElement('span', {
                                    style: {
                                        backgroundColor: '#fef3c7',
                                        color: '#92400e',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontWeight: '600'
                                    }
                                }, `${achievement.points} XP`),
                                
                                achievement.rarity && React.createElement('span', {
                                    style: {
                                        backgroundColor: achievement.rarity === 'legendary' ? '#f3e8ff'
                                            : achievement.rarity === 'rare' ? '#dbeafe'
                                            : '#f0fdf4',
                                        color: achievement.rarity === 'legendary' ? '#6b21a8'
                                            : achievement.rarity === 'rare' ? '#1e40af'
                                            : '#166534',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }
                                }, achievement.rarity)
                            ),
                            
                            earned && earnedData && React.createElement('div', {
                                style: {
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                }
                            }, new Date(earnedData.earned_at).toLocaleDateString())
                        )
                    );
                })
            ),
            
            // Empty State
            displayAchievements.length === 0 && React.createElement('div', {
                style: {
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#6b7280'
                }
            },
                React.createElement('div', {
                    style: { fontSize: '4rem', marginBottom: '1rem' }
                }, '🎯'),
                React.createElement('p', {
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                    }
                }, 'No achievements yet'),
                React.createElement('p', null, 'Start studying to unlock achievements!')
            )
        );
    };
    
    // Export Achievement Manager
    window.AchievementSystem = {
        useAchievementTracker,
        AchievementToast,
        AchievementDisplay
    };
    
    console.log('✅ Achievement System loaded - Database-driven with Living Mycology Style');
})();