// public-profile.js - Public profile view for other users
(function() {
    'use strict';
    
    const { useState, useEffect } = React;
    const h = React.createElement;
    
    window.PublicProfile = function PublicProfile({ username, onBack, onClose }) {
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        
        const { user: currentUser } = window.useAuth();
        const isOwnProfile = currentUser?.username === username;
        
        useEffect(() => {
            loadProfile();
        }, [username]);
        
        const loadProfile = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`/api/profiles?username=${username}`);
                
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                } else if (response.status === 404) {
                    setError('User not found');
                } else {
                    setError('Failed to load profile');
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        };
        
        const formatNumber = (num) => {
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k';
            }
            return num.toString();
        };
        
        if (loading) {
            return h('div', {
                style: {
                    minHeight: '100vh',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            },
                h('div', { style: { textAlign: 'center' } },
                    h('div', { style: { fontSize: '1.5rem', marginBottom: '0.5rem' } }, '🍄'),
                    h('div', { style: { color: '#6b7280' } }, 'Loading profile...')
                )
            );
        }
        
        if (error) {
            return h('div', {
                style: {
                    minHeight: '100vh',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            },
                h('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }
                },
                    h('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '😕'),
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, error),
                    h('p', { style: { color: '#6b7280', marginBottom: '1.5rem' } }, 
                        `The user @${username} could not be found.`
                    ),
                    h('button', {
                        onClick: onBack || (() => window.history.back()),
                        style: {
                            padding: '0.5rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }
                    }, 'Go Back')
                )
            );
        }
        
        // Don't show private profiles
        if (!profile.privacy_settings?.show_stats && !isOwnProfile) {
            return h('div', {
                style: {
                    minHeight: '100vh',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            },
                h('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }
                },
                    h('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '🔒'),
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                        'Private Profile'
                    ),
                    h('p', { style: { color: '#6b7280', marginBottom: '1.5rem' } }, 
                        `@${username} has set their profile to private.`
                    ),
                    h('button', {
                        onClick: onBack || (() => window.history.back()),
                        style: {
                            padding: '0.5rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }
                    }, 'Go Back')
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
                                onClick: onBack || (() => window.history.back()),
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }
                            }, '← Back'),
                            h('h1', {
                                style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                }
                            }, `@${username}'s Profile`)
                        ),
                        isOwnProfile && h('button', {
                            onClick: () => {
                                // Navigate to edit profile
                                if (onClose) onClose();
                            },
                            style: {
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }
                        }, 'Edit Profile')
                    )
                )
            ),
            
            // Profile Content
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
                // Profile Header Card
                h('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        marginBottom: '2rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }
                },
                    h('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem'
                        }
                    },
                        // Avatar
                        h('div', {
                            style: {
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                color: 'white',
                                flexShrink: 0
                            }
                        }, profile.avatar_url ? 
                            h('img', {
                                src: profile.avatar_url,
                                alt: profile.display_name,
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }
                            }) :
                            (profile.display_name || profile.username)[0].toUpperCase()
                        ),
                        
                        // Profile Info
                        h('div', { style: { flex: 1 } },
                            h('h2', {
                                style: {
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.25rem'
                                }
                            }, profile.display_name || profile.username),
                            h('p', {
                                style: {
                                    fontSize: '1.125rem',
                                    color: '#6b7280',
                                    marginBottom: '1rem'
                                }
                            }, `@${profile.username}`),
                            profile.bio && h('p', {
                                style: {
                                    color: '#374151',
                                    marginBottom: '1rem',
                                    lineHeight: '1.5'
                                }
                            }, profile.bio),
                            h('p', {
                                style: {
                                    fontSize: '0.875rem',
                                    color: '#6b7280'
                                }
                            }, `Joined ${formatDate(profile.stats.join_date)}`)
                        ),
                        
                        // Quick Stats
                        h('div', {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                minWidth: '200px'
                            }
                        },
                            h('div', {
                                style: {
                                    textAlign: 'center',
                                    padding: '1rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '0.5rem'
                                }
                            },
                                h('div', {
                                    style: {
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: '#10b981'
                                    }
                                }, formatNumber(profile.stats.specimens_identified)),
                                h('div', {
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#6b7280'
                                    }
                                }, 'Identified')
                            ),
                            h('div', {
                                style: {
                                    textAlign: 'center',
                                    padding: '1rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '0.5rem'
                                }
                            },
                                h('div', {
                                    style: {
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: '#3b82f6'
                                    }
                                }, `${profile.stats.accuracy_rate}%`),
                                h('div', {
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#6b7280'
                                    }
                                }, 'Accuracy')
                            )
                        )
                    )
                ),
                
                // Stats Grid
                profile.privacy_settings?.show_stats !== false && h('div', {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }
                },
                    [
                        { 
                            label: 'Specimens Identified', 
                            value: profile.stats.specimens_identified, 
                            icon: '🔬',
                            color: '#10b981'
                        },
                        { 
                            label: 'Accuracy Rate', 
                            value: `${profile.stats.accuracy_rate}%`, 
                            icon: '🎯',
                            color: '#3b82f6'
                        },
                        { 
                            label: 'Modules Completed', 
                            value: profile.stats.modules_completed, 
                            icon: '📚',
                            color: '#8b5cf6'
                        },
                        { 
                            label: 'Achievements', 
                            value: profile.stats.achievements_earned, 
                            icon: '🏆',
                            color: '#f59e0b'
                        }
                    ].map((stat, idx) =>
                        h('div', {
                            key: idx,
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.5rem',
                                padding: '1.5rem',
                                textAlign: 'center',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                            }
                        },
                            h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, stat.icon),
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
                                    fontSize: '0.875rem',
                                    color: '#6b7280'
                                }
                            }, stat.label)
                        )
                    )
                ),
                
                // Achievements Section
                profile.privacy_settings?.show_achievements !== false && 
                profile.achievements && profile.achievements.length > 0 && h('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }
                },
                    h('h3', {
                        style: {
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            marginBottom: '1rem'
                        }
                    }, '🏆 Recent Achievements'),
                    h('div', {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '1rem'
                        }
                    },
                        profile.achievements.map((achievement, idx) =>
                            h('div', {
                                key: idx,
                                style: {
                                    textAlign: 'center',
                                    padding: '1rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '0.5rem',
                                    border: '2px solid #10b981'
                                }
                            },
                                h('div', {
                                    style: {
                                        fontSize: '2rem',
                                        marginBottom: '0.5rem'
                                    }
                                }, window.achievementIcons?.[achievement.achievement_id] || '🏆'),
                                h('div', {
                                    style: {
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, achievement.name || 'Achievement')
                            )
                        )
                    )
                )
            )
        );
    };
})();