// user-profile-view.js - User profile and stats view
// Place this in web-app/docs/user-profile-view.js

(function() {
    'use strict';
    
    const { useState, useEffect } = React;
    const h = React.createElement;
    
    window.UserProfileView = function UserProfileView({ user, onBack }) {
        const [stats, setStats] = useState(null);
        const [loading, setLoading] = useState(true);
        const [editMode, setEditMode] = useState(false);
        const [displayName, setDisplayName] = useState(user.display_name || user.username);
        const [bio, setBio] = useState(user.bio || '');
        const [saving, setSaving] = useState(false);
        const [achievements, setAchievements] = useState([]);
        const [recentActivity, setRecentActivity] = useState([]);
        
        const { logout, updateProfile } = window.useAuth();
        
        // Load user stats and progress
        useEffect(() => {
            loadUserData();
        }, [user]);
        
        const loadUserData = async () => {
            setLoading(true);
            
            try {
                // Load user progress stats
                const progressResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${user.id}&select=*`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (progressResponse.ok) {
                    const progress = await progressResponse.json();
                    
                    // Calculate statistics
                    const flashcardProgress = progress.filter(p => p.progress_type === 'flashcard');
                    const moduleProgress = progress.filter(p => p.progress_type === 'training_module');
                    const marathonProgress = progress.filter(p => p.progress_type === 'marathon');
                    
                    const totalQuestions = flashcardProgress.length + marathonProgress.length;
                    const correctAnswers = flashcardProgress.filter(p => p.score > 50).length + 
                                         marathonProgress.filter(p => p.score > 50).length;
                    const modulesCompleted = moduleProgress.filter(p => p.completed).length;
                    
                    // Calculate accuracy
                    const accuracy = totalQuestions > 0 
                        ? Math.round((correctAnswers / totalQuestions) * 100) 
                        : 0;
                    
                    // Calculate study streak (simplified)
                    const today = new Date().toDateString();
                    const hasStudiedToday = progress.some(p => 
                        new Date(p.last_attempted).toDateString() === today
                    );
                    
                    setStats({
                        totalQuestions,
                        correctAnswers,
                        accuracy,
                        modulesCompleted,
                        studyStreak: hasStudiedToday ? 1 : 0,
                        totalStudyTime: Math.round(progress.length * 1.5), // Estimate
                        favoriteGenus: getMostPracticedGenus(progress),
                        masteryLevel: calculateMasteryLevel(accuracy, totalQuestions)
                    });
                    
                    // Get recent activity
                    const recent = progress
                        .sort((a, b) => new Date(b.last_attempted) - new Date(a.last_attempted))
                        .slice(0, 5);
                    setRecentActivity(recent);
                }
                
                // Load achievements
                const achievementsResponse = await fetch(
                    `/api/achievements?userId=${user.id}`
                );
                
                if (achievementsResponse.ok) {
                    const achievementsData = await achievementsResponse.json();
                    setAchievements(achievementsData.filter(a => a.earned).slice(0, 6));
                }
                
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        const getMostPracticedGenus = (progress) => {
            const genusCount = {};
            progress.forEach(p => {
                if (p.metadata?.genus) {
                    genusCount[p.metadata.genus] = (genusCount[p.metadata.genus] || 0) + 1;
                }
            });
            
            const sorted = Object.entries(genusCount).sort((a, b) => b[1] - a[1]);
            return sorted[0] ? sorted[0][0] : 'None yet';
        };
        
        const calculateMasteryLevel = (accuracy, totalQuestions) => {
            if (totalQuestions < 10) return 'Novice';
            if (accuracy >= 90) return 'Expert';
            if (accuracy >= 75) return 'Advanced';
            if (accuracy >= 60) return 'Intermediate';
            return 'Beginner';
        };
        
        const handleSaveProfile = async () => {
            setSaving(true);
            
            try {
                const response = await fetch('/api/profiles', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        updates: {
                            display_name: displayName,
                            bio: bio
                        }
                    })
                });
                
                if (response.ok) {
                    updateProfile({ display_name: displayName, bio: bio });
                    setEditMode(false);
                }
            } catch (error) {
                console.error('Error saving profile:', error);
            } finally {
                setSaving(false);
            }
        };
        
        const handleLogout = async () => {
            if (confirm('Are you sure you want to log out?')) {
                await logout();
                window.location.reload(); // Refresh to show login screen
            }
        };
        
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };
        
        const formatTimeAgo = (dateString) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays < 7) return `${diffDays} days ago`;
            return formatDate(dateString);
        };
        
        return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header
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
                                onClick: onBack,
                                style: { 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                } 
                            }, '← Back'),
                            h('h1', { 
                                style: { 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold' 
                                } 
                            }, 'Your Profile')
                        ),
                        h('button', {
                            onClick: handleLogout,
                            style: {
                                padding: '0.5rem 1rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }
                        }, 'Log Out')
                    )
                )
            ),
            
            // Main content
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                loading ? 
                    h('div', { style: { textAlign: 'center', padding: '4rem' } }, 
                        h('div', { style: { fontSize: '1.125rem', color: '#6b7280' } }, 'Loading profile...')
                    ) :
                    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' } },
                        // Left column - Profile info
                        h('div', null,
                            // Profile card
                            h('div', { 
                                style: { 
                                    backgroundColor: 'white', 
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                } 
                            },
                                // Avatar
                                h('div', { 
                                    style: { 
                                        textAlign: 'center',
                                        marginBottom: '1rem'
                                    } 
                                },
                                    h('div', {
                                        style: {
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            backgroundColor: '#10b981',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                            color: 'white',
                                            margin: '0 auto',
                                            marginBottom: '1rem'
                                        }
                                    }, user.username ? user.username[0].toUpperCase() : '?'),
                                    
                                    editMode ? 
                                        h('input', {
                                            type: 'text',
                                            value: displayName,
                                            onChange: (e) => setDisplayName(e.target.value),
                                            style: {
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '0.375rem',
                                                fontSize: '1.125rem',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                marginBottom: '0.5rem'
                                            }
                                        }) :
                                        h('h2', { 
                                            style: { 
                                                fontSize: '1.25rem', 
                                                fontWeight: '600',
                                                marginBottom: '0.25rem'
                                            } 
                                        }, displayName),
                                    
                                    h('p', { 
                                        style: { 
                                            color: '#6b7280',
                                            fontSize: '0.875rem'
                                        } 
                                    }, `@${user.username}`)
                                ),
                                
                                // Bio
                                editMode ? 
                                    h('textarea', {
                                        value: bio,
                                        onChange: (e) => setBio(e.target.value),
                                        placeholder: 'Tell us about yourself...',
                                        style: {
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            minHeight: '80px',
                                            marginBottom: '1rem',
                                            boxSizing: 'border-box',
                                            resize: 'vertical'
                                        }
                                    }) :
                                    bio && h('p', { 
                                        style: { 
                                            fontSize: '0.875rem',
                                            color: '#374151',
                                            marginBottom: '1rem',
                                            lineHeight: '1.5'
                                        } 
                                    }, bio),
                                
                                // Member since
                                h('p', { 
                                    style: { 
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        marginBottom: '1rem'
                                    } 
                                }, `Member since ${formatDate(user.created_at)}`),
                                
                                // Edit/Save button
                                editMode ? 
                                    h('div', { style: { display: 'flex', gap: '0.5rem' } },
                                        h('button', {
                                            onClick: handleSaveProfile,
                                            disabled: saving,
                                            style: {
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: saving ? '#9ca3af' : '#10b981',
                                                color: 'white',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }
                                        }, saving ? 'Saving...' : 'Save'),
                                        h('button', {
                                            onClick: () => {
                                                setEditMode(false);
                                                setDisplayName(user.display_name || user.username);
                                                setBio(user.bio || '');
                                            },
                                            style: {
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: '#6b7280',
                                                color: 'white',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }
                                        }, 'Cancel')
                                    ) :
                                    h('button', {
                                        onClick: () => setEditMode(true),
                                        style: {
                                            width: '100%',
                                            padding: '0.5rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            borderRadius: '0.375rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                        }
                                    }, 'Edit Profile')
                            ),
                            
                            // Mastery level card
                            stats && h('div', { 
                                style: { 
                                    backgroundColor: 'white', 
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                } 
                            },
                                h('h3', { 
                                    style: { 
                                        fontSize: '1rem', 
                                        fontWeight: '600',
                                        marginBottom: '1rem'
                                    } 
                                }, 'Mastery Level'),
                                h('div', { 
                                    style: { 
                                        textAlign: 'center',
                                        padding: '1rem',
                                        backgroundColor: '#f0fdf4',
                                        borderRadius: '0.5rem',
                                        marginBottom: '0.75rem'
                                    } 
                                },
                                    h('div', { 
                                        style: { 
                                            fontSize: '2rem',
                                            marginBottom: '0.25rem'
                                        } 
                                    }, 
                                        stats.masteryLevel === 'Expert' ? '🏆' :
                                        stats.masteryLevel === 'Advanced' ? '🥇' :
                                        stats.masteryLevel === 'Intermediate' ? '🥈' :
                                        stats.masteryLevel === 'Beginner' ? '🥉' : '🌱'
                                    ),
                                    h('div', { 
                                        style: { 
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: '#059669'
                                        } 
                                    }, stats.masteryLevel)
                                ),
                                h('div', { 
                                    style: { 
                                        fontSize: '0.75rem',
                                        color: '#6b7280'
                                    } 
                                },
                                    h('p', null, `Favorite Genus: ${stats.favoriteGenus}`),
                                    h('p', null, `Study Time: ${stats.totalStudyTime} min`)
                                )
                            )
                        ),
                        
                        // Right column - Stats and activity
                        h('div', null,
                            // Stats grid
                            stats && h('div', { 
                                style: { 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '2rem'
                                } 
                            },
                                [
                                    { label: 'Questions Answered', value: stats.totalQuestions, icon: '📝', color: '#3b82f6' },
                                    { label: 'Correct Answers', value: stats.correctAnswers, icon: '✅', color: '#10b981' },
                                    { label: 'Accuracy Rate', value: `${stats.accuracy}%`, icon: '🎯', color: '#8b5cf6' },
                                    { label: 'Modules Completed', value: stats.modulesCompleted, icon: '📚', color: '#f59e0b' },
                                    { label: 'Study Streak', value: `${stats.studyStreak} day${stats.studyStreak !== 1 ? 's' : ''}`, icon: '🔥', color: '#ef4444' },
                                    { label: 'Achievements', value: achievements.length, icon: '🏆', color: '#06b6d4' }
                                ].map((stat, idx) =>
                                    h('div', {
                                        key: idx,
                                        style: {
                                            backgroundColor: 'white',
                                            borderRadius: '0.5rem',
                                            padding: '1rem',
                                            textAlign: 'center',
                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                        }
                                    },
                                        h('div', { 
                                            style: { 
                                                fontSize: '1.5rem',
                                                marginBottom: '0.5rem'
                                            } 
                                        }, stat.icon),
                                        h('div', { 
                                            style: { 
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: stat.color,
                                                marginBottom: '0.25rem'
                                            } 
                                        }, stat.value),
                                        h('div', { 
                                            style: { 
                                                fontSize: '0.75rem',
                                                color: '#6b7280'
                                            } 
                                        }, stat.label)
                                    )
                                )
                            ),
                            
                            // Recent achievements
                            achievements.length > 0 && h('div', { 
                                style: { 
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                } 
                            },
                                h('h3', { 
                                    style: { 
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        marginBottom: '1rem'
                                    } 
                                }, 'Recent Achievements'),
                                h('div', { 
                                    style: { 
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                        gap: '0.75rem'
                                    } 
                                },
                                    achievements.map((achievement, idx) =>
                                        h('div', {
                                            key: idx,
                                            style: {
                                                textAlign: 'center',
                                                padding: '0.5rem',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '0.5rem',
                                                border: '2px solid #10b981'
                                            }
                                        },
                                            h('div', { 
                                                style: { 
                                                    fontSize: '1.5rem',
                                                    marginBottom: '0.25rem'
                                                } 
                                            }, achievement.icon || '🏆'),
                                            h('div', { 
                                                style: { 
                                                    fontSize: '0.625rem',
                                                    fontWeight: '500'
                                                } 
                                            }, achievement.name)
                                        )
                                    )
                                )
                            ),
                            
                            // Recent activity
                            recentActivity.length > 0 && h('div', { 
                                style: { 
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                } 
                            },
                                h('h3', { 
                                    style: { 
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        marginBottom: '1rem'
                                    } 
                                }, 'Recent Activity'),
                                h('div', { style: { fontSize: '0.875rem' } },
                                    recentActivity.map((activity, idx) =>
                                        h('div', {
                                            key: idx,
                                            style: {
                                                padding: '0.75rem',
                                                borderBottom: idx < recentActivity.length - 1 ? '1px solid #e5e7eb' : 'none'
                                            }
                                        },
                                            h('div', { 
                                                style: { 
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                } 
                                            },
                                                h('div', null,
                                                    h('span', { 
                                                        style: { 
                                                            fontWeight: '500'
                                                        } 
                                                    }, 
                                                        activity.progress_type === 'flashcard' ? '📝 Flashcard Practice' :
                                                        activity.progress_type === 'training_module' ? '📚 Module Study' :
                                                        activity.progress_type === 'marathon' ? '🏃 Marathon Mode' :
                                                        '📖 Study Session'
                                                    ),
                                                    activity.score !== undefined && h('span', { 
                                                        style: { 
                                                            marginLeft: '0.5rem',
                                                            color: activity.score > 70 ? '#10b981' : '#f59e0b'
                                                        } 
                                                    }, ` • ${activity.score}%`)
                                                ),
                                                h('span', { 
                                                    style: { 
                                                        fontSize: '0.75rem',
                                                        color: '#6b7280'
                                                    } 
                                                }, formatTimeAgo(activity.last_attempted))
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
            )
        );
    };
})();