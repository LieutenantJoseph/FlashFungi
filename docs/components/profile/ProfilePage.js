// ProfilePage.js - Updated to use user_stats table
// Displays comprehensive statistics from the new session tracking system

(function() {
    'use strict';
    
    window.ProfilePage = function ProfilePage({ user, onBack }) {
        const [stats, setStats] = React.useState(null);
        const [sessionStats, setSessionStats] = React.useState(null);
        const [achievements, setAchievements] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        const [activeTab, setActiveTab] = React.useState('overview');
        
        React.useEffect(() => {
            if (user) {
                loadUserData();
            }
        }, [user]);
        
        const loadUserData = async () => {
            try {
                setLoading(true);
                
                // Fetch user_stats data
                const statsResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_stats?user_id=eq.${user.id}`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    if (statsData.length > 0) {
                        setStats(statsData[0]);
                    } else {
                        // Initialize empty stats if user has none
                        setStats({
                            total_attempted: 0,
                            total_correct: 0,
                            current_streak: 0,
                            max_streak: 0,
                            consecutive_days: 0,
                            modules_completed: 0,
                            total_study_time: 0
                        });
                    }
                }
                
                // Fetch session statistics
                const sessionsResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/study_sessions?user_id=eq.${user.id}&completed=eq.true&select=id,questions_attempted,questions_correct,session_score,created_at&order=created_at.desc`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (sessionsResponse.ok) {
                    const sessions = await sessionsResponse.json();
                    
                    // Calculate session-based stats
                    const totalSessions = sessions.length;
                    const bestScore = sessions.length > 0 
                        ? Math.max(...sessions.map(s => s.session_score || 0))
                        : 0;
                    const avgQuestionsPerSession = totalSessions > 0
                        ? Math.round(sessions.reduce((sum, s) => sum + (s.questions_attempted || 0), 0) / totalSessions)
                        : 0;
                    
                    setSessionStats({
                        totalSessions,
                        bestSessionScore: bestScore,
                        avgQuestionsPerSession,
                        recentSessions: sessions.slice(0, 5) // Keep last 5 for display
                    });
                }
                
                // Fetch achievements
                const achievementsResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.${user.id}`,
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
                
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        // Calculate accuracy percentage
        const accuracy = stats && stats.total_attempted > 0 
            ? Math.round((stats.total_correct / stats.total_attempted) * 100)
            : 0;
        
        // Format study time
        const formatStudyTime = (minutes) => {
            if (!minutes) return '0m';
            if (minutes < 60) return `${minutes}m`;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        };
        
        if (loading) {
            return React.createElement('div', { 
                style: { 
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb'
                } 
            },
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { 
                        style: { 
                            fontSize: '2rem',
                            marginBottom: '1rem',
                            animation: 'spin 1s linear infinite'
                        } 
                    }, '⏳'),
                    React.createElement('p', null, 'Loading profile...')
                )
            );
        }
        
        // Main stats grid configuration
        const mainStats = [
            {
                label: 'Total Questions',
                value: stats?.total_attempted || 0,
                icon: '📝',
                color: '#3b82f6'
            },
            {
                label: 'Accuracy',
                value: `${accuracy}%`,
                icon: '🎯',
                color: accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#ef4444'
            },
            {
                label: 'Current Streak',
                value: stats?.current_streak || 0,
                icon: '🔥',
                color: '#f59e0b'
            },
            {
                label: 'Best Streak',
                value: stats?.max_streak || 0,
                icon: '🏆',
                color: '#f59e0b'
            },
            {
                label: 'Study Streak',
                value: `${stats?.consecutive_days || 0} days`,
                icon: '📅',
                color: '#8b5cf6'
            },
            {
                label: 'Modules Completed',
                value: stats?.modules_completed || 0,
                icon: '🎓',
                color: '#10b981'
            },
            {
                label: 'Total Sessions',
                value: sessionStats?.totalSessions || 0,
                icon: '📊',
                color: '#3b82f6'
            },
            {
                label: 'Best Session',
                value: `${sessionStats?.bestSessionScore || 0}%`,
                icon: '⭐',
                color: '#f59e0b'
            },
            {
                label: 'Avg. Questions/Session',
                value: sessionStats?.avgQuestionsPerSession || 0,
                icon: '📈',
                color: '#6b7280'
            }
        ];
        
        return React.createElement('div', { 
            style: { 
                minHeight: '100vh',
                backgroundColor: '#f9fafb'
            } 
        },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '1.5rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        maxWidth: '72rem',
                        margin: '0 auto'
                    } 
                },
                    React.createElement('div', { 
                        style: { 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        } 
                    },
                        React.createElement('div', null,
                            React.createElement('button', {
                                onClick: onBack,
                                style: {
                                    marginBottom: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }
                            }, '← Back'),
                            React.createElement('h1', { 
                                style: { 
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.25rem'
                                } 
                            }, 'Your Profile'),
                            React.createElement('p', { 
                                style: { 
                                    color: '#6b7280'
                                } 
                            }, user.email)
                        ),
                        React.createElement('div', { 
                            style: { 
                                textAlign: 'right'
                            } 
                        },
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    color: '#6b7280'
                                } 
                            }, 'Study Time'),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                } 
                            }, formatStudyTime(stats?.total_study_time))
                        )
                    )
                )
            ),
            
            // Main content
            React.createElement('div', { 
                style: { 
                    maxWidth: '72rem',
                    margin: '0 auto',
                    padding: '2rem'
                } 
            },
                // Stats Grid
                React.createElement('div', { 
                    style: { 
                        marginBottom: '2rem'
                    } 
                },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                        } 
                    }, '📊 Your Statistics'),
                    
                    React.createElement('div', { 
                        style: { 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem'
                        } 
                    },
                        mainStats.map((stat, idx) => 
                            React.createElement('div', {
                                key: idx,
                                style: {
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                    borderLeft: `4px solid ${stat.color}`
                                }
                            },
                                React.createElement('div', { 
                                    style: { 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    } 
                                },
                                    React.createElement('span', { 
                                        style: { 
                                            fontSize: '1.5rem'
                                        } 
                                    }, stat.icon),
                                    React.createElement('span', { 
                                        style: { 
                                            fontSize: '1.875rem',
                                            fontWeight: 'bold',
                                            color: stat.color
                                        } 
                                    }, stat.value)
                                ),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.875rem',
                                        color: '#6b7280'
                                    } 
                                }, stat.label)
                            )
                        )
                    )
                ),
                
                // Achievements Section
                React.createElement('div', { 
                    style: { 
                        marginBottom: '2rem'
                    } 
                },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                        } 
                    }, '🏆 Achievements'),
                    
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        } 
                    },
                        achievements.length > 0 ?
                            React.createElement('div', { 
                                style: { 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '1rem'
                                } 
                            },
                                achievements.filter(a => a.earned_at).slice(0, 12).map(achievement =>
                                    React.createElement('div', {
                                        key: achievement.id,
                                        style: {
                                            textAlign: 'center',
                                            padding: '1rem',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '0.5rem',
                                            border: '2px solid #e5e7eb'
                                        }
                                    },
                                        React.createElement('div', { 
                                            style: { 
                                                fontSize: '2rem',
                                                marginBottom: '0.5rem'
                                            } 
                                        }, achievement.icon || '🏅'),
                                        React.createElement('p', { 
                                            style: { 
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            } 
                                        }, achievement.name),
                                        React.createElement('p', { 
                                            style: { 
                                                fontSize: '0.625rem',
                                                color: '#6b7280',
                                                marginTop: '0.25rem'
                                            } 
                                        }, new Date(achievement.earned_at).toLocaleDateString())
                                    )
                                )
                            ) :
                            React.createElement('p', { 
                                style: { 
                                    textAlign: 'center',
                                    color: '#6b7280',
                                    padding: '2rem'
                                } 
                            }, 'Start studying to earn achievements!')
                    )
                ),
                
                // Recent Sessions
                sessionStats && sessionStats.recentSessions && sessionStats.recentSessions.length > 0 &&
                React.createElement('div', null,
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                        } 
                    }, '📅 Recent Sessions'),
                    
                    React.createElement('div', { 
                        style: { 
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        } 
                    },
                        sessionStats.recentSessions.map((session, idx) => {
                            const sessionAccuracy = session.questions_attempted > 0
                                ? Math.round((session.questions_correct / session.questions_attempted) * 100)
                                : 0;
                            
                            return React.createElement('div', {
                                key: session.id,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    borderBottom: idx < sessionStats.recentSessions.length - 1 ? '1px solid #e5e7eb' : 'none'
                                }
                            },
                                React.createElement('div', null,
                                    React.createElement('p', { 
                                        style: { 
                                            fontWeight: '500'
                                        } 
                                    }, new Date(session.created_at).toLocaleDateString()),
                                    React.createElement('p', { 
                                        style: { 
                                            fontSize: '0.875rem',
                                            color: '#6b7280'
                                        } 
                                    }, `${session.questions_attempted} questions`)
                                ),
                                React.createElement('div', { 
                                    style: { 
                                        textAlign: 'right'
                                    } 
                                },
                                    React.createElement('p', { 
                                        style: { 
                                            fontWeight: '500',
                                            color: sessionAccuracy >= 80 ? '#10b981' : sessionAccuracy >= 60 ? '#f59e0b' : '#ef4444'
                                        } 
                                    }, `${sessionAccuracy}%`),
                                    React.createElement('p', { 
                                        style: { 
                                            fontSize: '0.875rem',
                                            color: '#6b7280'
                                        } 
                                    }, `Score: ${session.session_score || 0}`)
                                )
                            );
                        })
                    )
                )
            )
        );
    };
    
    console.log('✅ ProfilePage component loaded (with user_stats integration)');
})();