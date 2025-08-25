// ProfilePage.js - Living Mycology Style Update
// Flash Fungi - Modern user profile dashboard

(function() {
    'use strict';
    
    window.ProfilePage = function ProfilePage({ user, userProgress = {}, onBack }) {
        const [activeTab, setActiveTab] = React.useState('overview');
        const [achievements, setAchievements] = React.useState([]);
        const [stats, setStats] = React.useState({
            totalSessions: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            studyTime: 0,
            streak: 0,
            favoriteGenus: '',
            level: 1,
            xp: 0
        });
        
        React.useEffect(() => {
            loadUserData();
        }, [user]);
        
        const loadUserData = async () => {
            if (!user?.id) return;
            
            try {
                // Load user achievements from database
                const achievementsResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.${user.id}&select=*`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (achievementsResponse.ok) {
                    const data = await achievementsResponse.json();
                    setAchievements(data);
                }
                
                // Calculate stats from userProgress
                const sessions = Object.values(userProgress);
                const totalSessions = sessions.length;
                const correct = sessions.reduce((sum, s) => sum + (s.correct || 0), 0);
                const total = sessions.reduce((sum, s) => sum + (s.total || 0), 0);
                const studyTimeMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
                
                // Calculate level and XP
                const xp = correct * 10 + achievements.length * 50;
                const level = Math.floor(xp / 1000) + 1;
                
                setStats({
                    totalSessions,
                    correctAnswers: correct,
                    totalQuestions: total,
                    studyTime: studyTimeMinutes,
                    streak: calculateStreak(sessions),
                    favoriteGenus: findFavoriteGenus(sessions),
                    level,
                    xp: xp % 1000
                });
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        
        const calculateStreak = (sessions) => {
            // Simple streak calculation
            const today = new Date().toDateString();
            const recentSessions = sessions.filter(s => {
                const sessionDate = new Date(s.timestamp || s.created_at).toDateString();
                return sessionDate === today;
            });
            return recentSessions.length > 0 ? 1 : 0;
        };
        
        const findFavoriteGenus = (sessions) => {
            const genusCount = {};
            sessions.forEach(s => {
                if (s.genus) {
                    genusCount[s.genus] = (genusCount[s.genus] || 0) + 1;
                }
            });
            
            let favorite = 'None yet';
            let maxCount = 0;
            Object.entries(genusCount).forEach(([genus, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    favorite = genus;
                }
            });
            return favorite;
        };
        
        const formatStudyTime = (minutes) => {
            if (minutes < 60) return `${Math.round(minutes)} min`;
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return `${hours}h ${mins}m`;
        };

        return React.createElement('div', {
            style: {
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%)'
            }
        },
            // Header
            React.createElement('header', {
                style: {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    padding: '2rem 0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }
            },
                React.createElement('div', {
                    style: {
                        maxWidth: '72rem',
                        margin: '0 auto',
                        padding: '0 1.5rem'
                    }
                },
                    // Back button
                    React.createElement('button', {
                        onClick: onBack,
                        style: {
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 1rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '1.5rem',
                            transition: 'background 0.2s'
                        },
                        onMouseEnter: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)',
                        onMouseLeave: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                    }, '← Back to Home'),
                    
                    // Profile Header
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem'
                        }
                    },
                        // Avatar
                        React.createElement('div', {
                            style: {
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                border: '3px solid rgba(255, 255, 255, 0.3)'
                            }
                        }, '🍄'),
                        
                        // User Info
                        React.createElement('div', null,
                            React.createElement('h1', {
                                style: {
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem'
                                }
                            }, user?.username || 'Mycologist'),
                            
                            React.createElement('div', {
                                style: {
                                    display: 'flex',
                                    gap: '2rem',
                                    fontSize: '0.875rem',
                                    opacity: 0.9
                                }
                            },
                                React.createElement('div', null,
                                    React.createElement('span', { style: { fontWeight: '600' } }, 'Level ', stats.level),
                                    ' • ',
                                    React.createElement('span', null, stats.xp, '/1000 XP')
                                ),
                                React.createElement('div', null,
                                    React.createElement('span', null, '🔥 ', stats.streak, ' day streak')
                                )
                            )
                        )
                    )
                )
            ),
            
            // Main Content
            React.createElement('div', {
                style: {
                    maxWidth: '72rem',
                    margin: '0 auto',
                    padding: '2rem 1.5rem'
                }
            },
                // Stats Grid
                React.createElement('div', {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }
                },
                    // Stat Cards
                    [
                        {
                            icon: '📚',
                            label: 'Study Sessions',
                            value: stats.totalSessions,
                            color: '#3b82f6'
                        },
                        {
                            icon: '✅',
                            label: 'Correct Answers',
                            value: `${stats.correctAnswers}/${stats.totalQuestions}`,
                            color: '#10b981'
                        },
                        {
                            icon: '⏱️',
                            label: 'Study Time',
                            value: formatStudyTime(stats.studyTime),
                            color: '#f59e0b'
                        },
                        {
                            icon: '🎯',
                            label: 'Accuracy',
                            value: stats.totalQuestions > 0 
                                ? `${Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%`
                                : '0%',
                            color: '#8b5cf6'
                        }
                    ].map((stat, index) =>
                        React.createElement('div', {
                            key: index,
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'default'
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                            }
                        },
                            React.createElement('div', {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '1rem'
                                }
                            },
                                React.createElement('div', {
                                    style: {
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '0.5rem',
                                        backgroundColor: `${stat.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        marginRight: '1rem'
                                    }
                                }, stat.icon),
                                React.createElement('div', null,
                                    React.createElement('div', {
                                        style: {
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            marginBottom: '0.25rem'
                                        }
                                    }, stat.label),
                                    React.createElement('div', {
                                        style: {
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: '#111827'
                                        }
                                    }, stat.value)
                                )
                            )
                        )
                    )
                ),
                
                // Tabs Section
                React.createElement('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }
                },
                    // Tab Headers
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            borderBottom: '2px solid #e5e7eb'
                        }
                    },
                        ['overview', 'achievements', 'progress'].map(tab =>
                            React.createElement('button', {
                                key: tab,
                                onClick: () => setActiveTab(tab),
                                style: {
                                    flex: 1,
                                    padding: '1rem',
                                    border: 'none',
                                    background: activeTab === tab 
                                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                        : 'white',
                                    color: activeTab === tab ? 'white' : '#6b7280',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textTransform: 'capitalize'
                                }
                            }, tab)
                        )
                    ),
                    
                    // Tab Content
                    React.createElement('div', {
                        style: {
                            padding: '2rem'
                        }
                    },
                        // Overview Tab
                        activeTab === 'overview' && React.createElement('div', null,
                            React.createElement('h3', {
                                style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1.5rem',
                                    color: '#111827'
                                }
                            }, 'Learning Overview'),
                            
                            React.createElement('div', {
                                style: {
                                    display: 'grid',
                                    gap: '1rem'
                                }
                            },
                                React.createElement('div', {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '0.5rem'
                                    }
                                },
                                    React.createElement('span', { style: { color: '#6b7280' } }, 'Favorite Genus'),
                                    React.createElement('span', { style: { fontWeight: '600' } }, stats.favoriteGenus)
                                ),
                                React.createElement('div', {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '0.5rem'
                                    }
                                },
                                    React.createElement('span', { style: { color: '#6b7280' } }, 'Member Since'),
                                    React.createElement('span', { style: { fontWeight: '600' } }, 
                                        user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'
                                    )
                                )
                            )
                        ),
                        
                        // Achievements Tab
                        activeTab === 'achievements' && React.createElement('div', null,
                            React.createElement('h3', {
                                style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1.5rem',
                                    color: '#111827'
                                }
                            }, '🏆 Achievements'),
                            
                            achievements.length > 0 ?
                                React.createElement('div', {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '1rem'
                                    }
                                },
                                    achievements.map((achievement, index) =>
                                        React.createElement('div', {
                                            key: index,
                                            style: {
                                                padding: '1rem',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '0.5rem',
                                                textAlign: 'center',
                                                transition: 'transform 0.2s'
                                            },
                                            onMouseEnter: (e) => e.currentTarget.style.transform = 'scale(1.05)',
                                            onMouseLeave: (e) => e.currentTarget.style.transform = 'scale(1)'
                                        },
                                            React.createElement('div', {
                                                style: { fontSize: '2rem', marginBottom: '0.5rem' }
                                            }, achievement.icon || '🏆'),
                                            React.createElement('div', {
                                                style: {
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    color: '#111827'
                                                }
                                            }, achievement.name),
                                            React.createElement('div', {
                                                style: {
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280',
                                                    marginTop: '0.25rem'
                                                }
                                            }, achievement.description)
                                        )
                                    )
                                ) :
                                React.createElement('div', {
                                    style: {
                                        textAlign: 'center',
                                        padding: '3rem',
                                        color: '#6b7280'
                                    }
                                },
                                    React.createElement('div', {
                                        style: { fontSize: '3rem', marginBottom: '1rem' }
                                    }, '🎯'),
                                    React.createElement('p', null, 'Start studying to earn achievements!')
                                )
                        ),
                        
                        // Progress Tab
                        activeTab === 'progress' && React.createElement('div', null,
                            React.createElement('h3', {
                                style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1.5rem',
                                    color: '#111827'
                                }
                            }, '📈 Learning Progress'),
                            
                            React.createElement('div', {
                                style: {
                                    textAlign: 'center',
                                    padding: '2rem',
                                    color: '#6b7280'
                                }
                            },
                                React.createElement('p', null, 'Detailed progress tracking coming soon!')
                            )
                        )
                    )
                )
            )
        );
    };
    
    console.log('✅ ProfilePage component loaded - Living Mycology Style');
})();