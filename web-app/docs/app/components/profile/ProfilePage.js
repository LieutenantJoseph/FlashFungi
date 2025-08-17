// profile-page.js - User's own profile management page
(function() {
    'use strict';
    
    const { useState, useEffect, useCallback } = React;
    const h = React.createElement;
    
    window.ProfilePage = function ProfilePage({ user, userProgress, onBack }) {
        const [activeTab, setActiveTab] = useState('overview');
        const [stats, setStats] = useState(null);
        const [loading, setLoading] = useState(true);
        const [editMode, setEditMode] = useState(false);
        const [profileData, setProfileData] = useState({
            display_name: '',
            username: '',
            bio: '',
            avatar_url: '',
            privacy_settings: {
                show_stats: true,
                show_achievements: true,
                allow_messages: false
            }
        });
        const [saving, setSaving] = useState(false);
        const [achievements, setAchievements] = useState([]);
        const [recentActivity, setRecentActivity] = useState([]);
        
        const { updateProfile, signOut } = window.useAuth();
        
        useEffect(() => {
            loadUserData();
        }, [user]);
        
        const loadUserData = async () => {
            if (!user?.id) return;
            
            try {
                // Load full profile
                const profileResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_profiles?id=eq.${user.id}`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (profileResponse.ok) {
                    const [profile] = await profileResponse.json();
                    setProfileData({
                        display_name: profile.display_name || profile.username || '',
                        username: profile.username || '',
                        bio: profile.bio || '',
                        avatar_url: profile.avatar_url || '',
                        privacy_settings: profile.privacy_settings || {
                            show_stats: true,
                            show_achievements: true,
                            allow_messages: false
                        }
                    });
                }
                
                // Load progress stats
                const progressResponse = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${user.id}`,
                    {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    }
                );
                
                if (progressResponse.ok) {
                    const progress = await progressResponse.json();
                    calculateStats(progress);
                    setRecentActivity(progress.slice(0, 10));
                }
                
                // Load achievements
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
        
        const calculateStats = (progress) => {
            const flashcards = progress.filter(p => p.progress_type === 'flashcard');
            const modules = progress.filter(p => p.module_id);
            const total = flashcards.length;
            const correct = flashcards.filter(p => p.score > 50).length;
            
            setStats({
                totalQuestions: total,
                correctAnswers: correct,
                accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
                modulesCompleted: modules.filter(p => p.completed).length,
                totalModules: 5,
                studyStreak: calculateStreak(progress),
                totalStudyTime: Math.round(progress.length * 1.5)
            });
        };
        
        const calculateStreak = (progress) => {
            if (!progress.length) return 0;
            const dates = progress.map(p => new Date(p.created_at).toDateString());
            const uniqueDates = [...new Set(dates)];
            return uniqueDates.length;
        };
        
        const handleSaveProfile = async () => {
            setSaving(true);
            try {
                const response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/user_profiles?id=eq.${user.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            display_name: profileData.display_name,
                            bio: profileData.bio,
                            privacy_settings: profileData.privacy_settings,
                            updated_at: new Date().toISOString()
                        })
                    }
                );
                
                if (response.ok) {
                    setEditMode(false);
                    await loadUserData();
                }
            } catch (error) {
                console.error('Error saving profile:', error);
            } finally {
                setSaving(false);
            }
        };
        
        const handleViewPublicProfile = () => {
            window.open(`/profile/${profileData.username}`, '_blank');
        };
        
        if (loading) {
            return h('div', { 
                style: { 
                    minHeight: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                } 
            },
                h('div', { style: { textAlign: 'center' } },
                    h('div', { style: { fontSize: '1.5rem', marginBottom: '0.5rem' } }, '🍄'),
                    h('p', null, 'Loading profile...')
                )
            );
        }
        
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
                                    cursor: 'pointer' 
                                } 
                            }, '← Back'),
                            h('h1', { 
                                style: { 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold' 
                                } 
                            }, 'My Profile')
                        ),
                        h('div', { style: { display: 'flex', gap: '0.5rem' } },
                            h('button', {
                                onClick: handleViewPublicProfile,
                                style: {
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }
                            }, 'View Public Profile'),
                            h('button', {
                                onClick: signOut,
                                style: {
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }
                            }, 'Sign Out')
                        )
                    )
                )
            ),
            
            // Tabs
            h('div', { 
                style: { 
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb'
                } 
            },
                h('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                    h('div', { style: { display: 'flex', gap: '2rem' } },
                        ['overview', 'stats', 'achievements', 'settings'].map(tab =>
                            h('button', {
                                key: tab,
                                onClick: () => setActiveTab(tab),
                                style: {
                                    padding: '1rem 0',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                                    color: activeTab === tab ? '#3b82f6' : '#6b7280',
                                    fontWeight: activeTab === tab ? '600' : '400',
                                    textTransform: 'capitalize',
                                    cursor: 'pointer'
                                }
                            }, tab)
                        )
                    )
                )
            ),
            
            // Content
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                // Overview Tab
                activeTab === 'overview' && h('div', { 
                    style: { 
                        display: 'grid', 
                        gridTemplateColumns: '300px 1fr', 
                        gap: '2rem' 
                    } 
                },
                    // Profile Card
                    h('div', { 
                        style: { 
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            height: 'fit-content'
                        } 
                    },
                        h('div', { style: { textAlign: 'center' } },
                            h('div', {
                                style: {
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    backgroundColor: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    color: 'white',
                                    margin: '0 auto 1rem'
                                }
                            }, profileData.username[0]?.toUpperCase() || '?'),
                            
                            editMode ? 
                                h('div', null,
                                    h('input', {
                                        type: 'text',
                                        value: profileData.display_name,
                                        onChange: (e) => setProfileData(prev => ({
                                            ...prev,
                                            display_name: e.target.value
                                        })),
                                        style: {
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            marginBottom: '0.5rem',
                                            textAlign: 'center'
                                        }
                                    }),
                                    h('textarea', {
                                        value: profileData.bio,
                                        onChange: (e) => setProfileData(prev => ({
                                            ...prev,
                                            bio: e.target.value
                                        })),
                                        placeholder: 'Bio...',
                                        style: {
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            marginBottom: '1rem',
                                            minHeight: '100px',
                                            resize: 'vertical'
                                        }
                                    }),
                                    h('div', { style: { display: 'flex', gap: '0.5rem' } },
                                        h('button', {
                                            onClick: handleSaveProfile,
                                            disabled: saving,
                                            style: {
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }
                                        }, saving ? 'Saving...' : 'Save'),
                                        h('button', {
                                            onClick: () => setEditMode(false),
                                            style: {
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: '#6b7280',
                                                color: 'white',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }
                                        }, 'Cancel')
                                    )
                                ) :
                                h('div', null,
                                    h('h2', { 
                                        style: { 
                                            fontSize: '1.25rem', 
                                            fontWeight: '600',
                                            marginBottom: '0.25rem'
                                        } 
                                    }, profileData.display_name || profileData.username),
                                    h('p', { 
                                        style: { 
                                            color: '#6b7280',
                                            fontSize: '0.875rem',
                                            marginBottom: '1rem'
                                        } 
                                    }, `@${profileData.username}`),
                                    profileData.bio && h('p', { 
                                        style: { 
                                            fontSize: '0.875rem',
                                            color: '#374151',
                                            marginBottom: '1rem',
                                            lineHeight: '1.5'
                                        } 
                                    }, profileData.bio),
                                    h('button', {
                                        onClick: () => setEditMode(true),
                                        style: {
                                            width: '100%',
                                            padding: '0.5rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            borderRadius: '0.375rem',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }
                                    }, 'Edit Profile')
                                )
                        )
                    ),
                    
                    // Quick Stats
                    stats && h('div', null,
                        h('div', { 
                            style: { 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem',
                                marginBottom: '2rem'
                            } 
                        },
                            [
                                { label: 'Questions', value: stats.totalQuestions, color: '#3b82f6' },
                                { label: 'Accuracy', value: `${stats.accuracy}%`, color: '#10b981' },
                                { label: 'Modules', value: `${stats.modulesCompleted}/${stats.totalModules}`, color: '#8b5cf6' },
                                { label: 'Streak', value: `${stats.studyStreak} days`, color: '#f59e0b' }
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
                                            fontWeight: 'bold',
                                            color: stat.color
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
                        
                        // Recent Activity
                        h('div', { 
                            style: { 
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem'
                            } 
                        },
                            h('h3', { 
                                style: { 
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '1rem'
                                } 
                            }, 'Recent Activity'),
                            recentActivity.length > 0 ?
                                recentActivity.slice(0, 5).map((activity, idx) =>
                                    h('div', {
                                        key: idx,
                                        style: {
                                            padding: '0.75rem 0',
                                            borderBottom: idx < 4 ? '1px solid #e5e7eb' : 'none'
                                        }
                                    },
                                        h('div', { 
                                            style: { 
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            } 
                                        },
                                            h('span', null, 
                                                activity.progress_type === 'flashcard' ? '📝 Flashcard' :
                                                activity.module_id ? '📚 Module' :
                                                '🍄 Study'
                                            ),
                                            h('span', { 
                                                style: { 
                                                    fontSize: '0.875rem',
                                                    color: '#6b7280'
                                                } 
                                            }, new Date(activity.created_at).toLocaleDateString())
                                        )
                                    )
                                ) :
                                h('p', { style: { color: '#6b7280' } }, 'No activity yet')
                        )
                    )
                ),
                
                // Settings Tab
                activeTab === 'settings' && h('div', { 
                    style: { 
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        maxWidth: '600px'
                    } 
                },
                    h('h2', { 
                        style: { 
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            marginBottom: '1.5rem'
                        } 
                    }, 'Privacy Settings'),
                    
                    h('div', { style: { marginBottom: '1.5rem' } },
                        h('label', { 
                            style: { 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer'
                            } 
                        },
                            h('input', {
                                type: 'checkbox',
                                checked: profileData.privacy_settings.show_stats,
                                onChange: (e) => setProfileData(prev => ({
                                    ...prev,
                                    privacy_settings: {
                                        ...prev.privacy_settings,
                                        show_stats: e.target.checked
                                    }
                                }))
                            }),
                            h('div', null,
                                h('div', { style: { fontWeight: '500' } }, 'Show Statistics'),
                                h('div', { 
                                    style: { 
                                        fontSize: '0.875rem',
                                        color: '#6b7280'
                                    } 
                                }, 'Display your learning stats on your public profile')
                            )
                        )
                    ),
                    
                    h('div', { style: { marginBottom: '1.5rem' } },
                        h('label', { 
                            style: { 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer'
                            } 
                        },
                            h('input', {
                                type: 'checkbox',
                                checked: profileData.privacy_settings.show_achievements,
                                onChange: (e) => setProfileData(prev => ({
                                    ...prev,
                                    privacy_settings: {
                                        ...prev.privacy_settings,
                                        show_achievements: e.target.checked
                                    }
                                }))
                            }),
                            h('div', null,
                                h('div', { style: { fontWeight: '500' } }, 'Show Achievements'),
                                h('div', { 
                                    style: { 
                                        fontSize: '0.875rem',
                                        color: '#6b7280'
                                    } 
                                }, 'Display earned achievements on your public profile')
                            )
                        )
                    ),
                    
                    h('button', {
                        onClick: handleSaveProfile,
                        disabled: saving,
                        style: {
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }
                    }, saving ? 'Saving...' : 'Save Settings')
                ),
                
                // Stats Tab
                activeTab === 'stats' && stats && h('div', null,
                    // Detailed stats grid
                    h('div', { 
                        style: { 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem'
                        } 
                    },
                        [
                            { label: 'Total Questions', value: stats.totalQuestions, icon: '📝' },
                            { label: 'Correct Answers', value: stats.correctAnswers, icon: '✅' },
                            { label: 'Accuracy Rate', value: `${stats.accuracy}%`, icon: '🎯' },
                            { label: 'Modules Complete', value: `${stats.modulesCompleted}/${stats.totalModules}`, icon: '📚' },
                            { label: 'Study Streak', value: `${stats.studyStreak} days`, icon: '🔥' },
                            { label: 'Study Time', value: `${stats.totalStudyTime} min`, icon: '⏱️' }
                        ].map((stat, idx) =>
                            h('div', {
                                key: idx,
                                style: {
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                }
                            },
                                h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, stat.icon),
                                h('div', { 
                                    style: { 
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        marginBottom: '0.5rem'
                                    } 
                                }, stat.value),
                                h('div', { 
                                    style: { 
                                        fontSize: '0.875rem',
                                        color: '#6b7280'
                                    } 
                                }, stat.label)
                            )
                        )
                    )
                ),
                
                // Achievements Tab
                activeTab === 'achievements' && h('div', null,
                    achievements.length > 0 ?
                        h('div', { 
                            style: { 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '1rem'
                            } 
                        },
                            achievements.map((achievement, idx) =>
                                h('div', {
                                    key: idx,
                                    style: {
                                        backgroundColor: 'white',
                                        borderRadius: '0.75rem',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        border: '2px solid #10b981',
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                    }
                                },
                                    h('div', { style: { fontSize: '3rem', marginBottom: '0.5rem' } }, 
                                        window.achievementIcons?.[achievement.achievement_id] || '🏆'
                                    ),
                                    h('div', { 
                                        style: { 
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        } 
                                    }, achievement.name || 'Achievement'),
                                    h('div', { 
                                        style: { 
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            marginTop: '0.5rem'
                                        } 
                                    }, new Date(achievement.earned_at).toLocaleDateString())
                                )
                            )
                        ) :
                        h('div', { 
                            style: { 
                                textAlign: 'center',
                                padding: '4rem',
                                backgroundColor: 'white',
                                borderRadius: '0.75rem'
                            } 
                        },
                            h('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '🏆'),
                            h('p', { style: { color: '#6b7280' } }, 'No achievements earned yet. Keep studying!')
                        )
                )
            )
        );
    };
})();