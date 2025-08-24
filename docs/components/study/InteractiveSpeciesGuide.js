// InteractiveSpeciesGuide.js - Updated with Living Mycology Dark Theme
(function() {
    'use strict';
    
    // Design constants matching the established dark theme
    const COLORS = {
        // Dark theme backgrounds
        BG_PRIMARY: '#1A1A19',
        BG_CARD: '#2A2826',
        BG_HOVER: '#323230',
        BG_MODAL: '#212120',
        
        // Text colors
        TEXT_PRIMARY: '#E8E2D5',
        TEXT_SECONDARY: '#B8B2A5',
        TEXT_MUTED: '#888478',
        
        // Accent colors
        ACCENT_PRIMARY: '#8B7355',
        ACCENT_SUCCESS: '#7C8650',
        ACCENT_WARNING: '#D4A574',
        ACCENT_ERROR: '#B85C5C',
        ACCENT_INFO: '#6B8CAE',
        
        // Borders
        BORDER_DEFAULT: 'rgba(139, 115, 85, 0.2)',
        BORDER_HOVER: 'rgba(139, 115, 85, 0.4)',
        BORDER_ACTIVE: 'rgba(139, 115, 85, 0.6)'
    };
    
    // Gradient definitions
    const GRADIENTS = {
        EARTH: 'linear-gradient(135deg, #8B7355 0%, #6B5745 100%)',
        FOREST: 'linear-gradient(135deg, #7C8650 0%, #5C6640 100%)',
        SUNSET: 'linear-gradient(135deg, #D4A574 0%, #B48554 100%)',
        MUSHROOM: 'linear-gradient(135deg, #8B7355 0%, #A0826D 50%, #6B5745 100%)'
    };
    
    window.InteractiveSpeciesGuide = function InteractiveSpeciesGuide({ specimen, speciesHints, photos, referencePhotos, onClose, onTryAgain }) {
        const [activeTab, setActiveTab] = React.useState('overview');
        const [comparisonMode, setComparisonMode] = React.useState(false);
        const [expandedPhoto, setExpandedPhoto] = React.useState(null);
        
        const hints = speciesHints?.hints || [];
        
        // Get admin-selected reference photos if available
        const adminPhotos = React.useMemo(() => {
            if (referencePhotos && referencePhotos.length > 0) {
                return referencePhotos;
            }
            // Fallback to specimen's selected photos if no reference photos
            return specimen.selected_photos ? 
                photos.filter(p => specimen.selected_photos.includes(p.id)) : 
                photos;
        }, [referencePhotos, specimen.selected_photos, photos]);

        return React.createElement('div', {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 100,
                backdropFilter: 'blur(4px)'
            }
        },
            React.createElement('div', {
                style: {
                    backgroundColor: COLORS.BG_MODAL,
                    borderRadius: '1rem',
                    maxWidth: '64rem',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }
            },
                // Header
                React.createElement('div', {
                    style: {
                        background: GRADIENTS.FOREST,
                        color: 'white',
                        padding: '1.5rem',
                        borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}`
                    }
                },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' } },
                        React.createElement('div', null,
                            React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                                '🔍 Interactive Species Guide'
                            ),
                            React.createElement('h3', { style: { fontSize: '1.25rem', marginBottom: '0.25rem' } }, specimen.species_name),
                            specimen.common_name && React.createElement('p', { style: { opacity: 0.9 } }, specimen.common_name)
                        ),
                        React.createElement('button', {
                            onClick: onClose,
                            style: {
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.background = 'rgba(255,255,255,0.3)',
                            onMouseLeave: (e) => e.target.style.background = 'rgba(255,255,255,0.2)'
                        }, '×')
                    )
                ),
                
                // Tabs
                React.createElement('div', {
                    style: {
                        backgroundColor: COLORS.BG_CARD,
                        borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}`,
                        padding: '0 1.5rem'
                    }
                },
                    React.createElement('div', { style: { display: 'flex', gap: '2rem' } },
                        ['overview', 'comparison', 'features', 'ecology'].map(tab =>
                            React.createElement('button', {
                                key: tab,
                                onClick: () => setActiveTab(tab),
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    padding: '1rem 0',
                                    textTransform: 'capitalize',
                                    fontWeight: activeTab === tab ? '600' : '400',
                                    color: activeTab === tab ? COLORS.ACCENT_SUCCESS : COLORS.TEXT_SECONDARY,
                                    borderBottom: activeTab === tab ? `2px solid ${COLORS.ACCENT_SUCCESS}` : 'none',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s'
                                },
                                onMouseEnter: (e) => {
                                    if (activeTab !== tab) e.target.style.color = COLORS.TEXT_PRIMARY;
                                },
                                onMouseLeave: (e) => {
                                    if (activeTab !== tab) e.target.style.color = COLORS.TEXT_SECONDARY;
                                }
                            }, tab === 'comparison' ? '🔸 Photo Comparison' : tab)
                        )
                    )
                ),
                
                // Content
                React.createElement('div', {
                    style: {
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.5rem',
                        backgroundColor: COLORS.BG_CARD
                    }
                },
                    // Overview Tab
                    activeTab === 'overview' && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                        React.createElement('div', null,
                            React.createElement('h4', { 
                                style: { 
                                    fontWeight: '600', 
                                    marginBottom: '0.5rem',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, 'Classification'),
                            React.createElement('div', { 
                                style: { 
                                    backgroundColor: COLORS.BG_PRIMARY, 
                                    padding: '1rem', 
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${COLORS.BORDER_DEFAULT}`
                                } 
                            },
                                React.createElement('p', { style: { color: COLORS.TEXT_SECONDARY } }, 
                                    React.createElement('strong', { style: { color: COLORS.TEXT_PRIMARY } }, 'Species: '), 
                                    React.createElement('em', null, specimen.species_name)
                                ),
                                React.createElement('p', { style: { color: COLORS.TEXT_SECONDARY } }, 
                                    React.createElement('strong', { style: { color: COLORS.TEXT_PRIMARY } }, 'Genus: '), 
                                    specimen.genus
                                ),
                                React.createElement('p', { style: { color: COLORS.TEXT_SECONDARY } }, 
                                    React.createElement('strong', { style: { color: COLORS.TEXT_PRIMARY } }, 'Family: '), 
                                    specimen.family
                                ),
                                specimen.common_name && React.createElement('p', { style: { color: COLORS.TEXT_SECONDARY } }, 
                                    React.createElement('strong', { style: { color: COLORS.TEXT_PRIMARY } }, 'Common: '), 
                                    specimen.common_name
                                )
                            ),
                            
                            React.createElement('h4', { 
                                style: { 
                                    fontWeight: '600', 
                                    marginTop: '1rem', 
                                    marginBottom: '0.5rem',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, 'Location & Context'),
                            React.createElement('div', { 
                                style: { 
                                    backgroundColor: COLORS.BG_PRIMARY, 
                                    padding: '1rem', 
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${COLORS.BORDER_DEFAULT}`
                                } 
                            },
                                React.createElement('p', { style: { color: COLORS.TEXT_SECONDARY } }, 
                                    React.createElement('strong', { style: { color: COLORS.TEXT_PRIMARY } }, 'Location: '), 
                                    specimen.location
                                ),
                                specimen.description && React.createElement('p', { style: { color: COLORS.TEXT_SECONDARY } }, 
                                    React.createElement('strong', { style: { color: COLORS.TEXT_PRIMARY } }, 'Notes: '), 
                                    specimen.description
                                )
                            )
                        ),
                        
                        // Reference Photos
                        React.createElement('div', null,
                            React.createElement('h4', { 
                                style: { 
                                    fontWeight: '600', 
                                    marginBottom: '0.5rem',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, '📸 Reference Photos'),
                            adminPhotos.length > 0 ?
                                React.createElement('div', {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '0.5rem'
                                    }
                                },
                                    adminPhotos.slice(0, 4).map((photo, idx) =>
                                        React.createElement('img', {
                                            key: idx,
                                            src: photo.medium_url || photo.url,
                                            alt: `Reference ${idx + 1}`,
                                            style: {
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                border: `2px solid ${COLORS.BORDER_DEFAULT}`,
                                                transition: 'border-color 0.2s'
                                            },
                                            onClick: () => setExpandedPhoto(photo),
                                            onMouseEnter: (e) => e.target.style.borderColor = COLORS.ACCENT_PRIMARY,
                                            onMouseLeave: (e) => e.target.style.borderColor = COLORS.BORDER_DEFAULT
                                        })
                                    )
                                ) :
                                React.createElement('p', { 
                                    style: { 
                                        color: COLORS.TEXT_MUTED,
                                        padding: '1rem',
                                        backgroundColor: COLORS.BG_PRIMARY,
                                        borderRadius: '0.5rem',
                                        border: `1px solid ${COLORS.BORDER_DEFAULT}`
                                    } 
                                }, 'No reference photos available')
                        )
                    ),
                    
                    // Comparison Tab
                    activeTab === 'comparison' && React.createElement('div', null,
                        React.createElement('h4', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, 'Visual Comparison'),
                        adminPhotos.length >= 2 ?
                            React.createElement('div', {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '1rem'
                                }
                            },
                                adminPhotos.map((photo, idx) =>
                                    React.createElement('div', {
                                        key: idx,
                                        style: {
                                            backgroundColor: COLORS.BG_PRIMARY,
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem',
                                            border: `1px solid ${COLORS.BORDER_DEFAULT}`
                                        }
                                    },
                                        React.createElement('img', {
                                            src: photo.medium_url || photo.url,
                                            alt: `Comparison ${idx + 1}`,
                                            style: {
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover',
                                                borderRadius: '0.25rem',
                                                cursor: 'pointer'
                                            },
                                            onClick: () => setExpandedPhoto(photo)
                                        }),
                                        photo.attribution && React.createElement('p', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                color: COLORS.TEXT_MUTED, 
                                                marginTop: '0.5rem' 
                                            } 
                                        }, `© ${photo.attribution}`)
                                    )
                                )
                            ) :
                            React.createElement('p', { 
                                style: { 
                                    color: COLORS.TEXT_MUTED,
                                    padding: '1rem',
                                    backgroundColor: COLORS.BG_PRIMARY,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${COLORS.BORDER_DEFAULT}`
                                } 
                            }, 'Multiple photos needed for comparison view')
                    ),
                    
                    // Features Tab
                    activeTab === 'features' && React.createElement('div', null,
                        React.createElement('h4', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, 'Identifying Features'),
                        hints.filter(h => h.type === 'morphological').length > 0 ?
                            hints.filter(h => h.type === 'morphological').map((hint, idx) =>
                                React.createElement('div', {
                                    key: idx,
                                    style: {
                                        backgroundColor: COLORS.ACCENT_SUCCESS + '20',
                                        border: `1px solid ${COLORS.ACCENT_SUCCESS}`,
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        marginBottom: '1rem'
                                    }
                                },
                                    React.createElement('div', { 
                                        style: { 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            marginBottom: '0.5rem' 
                                        } 
                                    },
                                        React.createElement('span', null, '🔬'),
                                        React.createElement('strong', { 
                                            style: { 
                                                color: COLORS.ACCENT_SUCCESS 
                                            } 
                                        }, 'Physical Characteristics')
                                    ),
                                    React.createElement('p', { 
                                        style: { 
                                            color: COLORS.TEXT_PRIMARY 
                                        } 
                                    }, hint.text)
                                )
                            ) :
                            React.createElement('p', { 
                                style: { 
                                    color: COLORS.TEXT_MUTED,
                                    padding: '1rem',
                                    backgroundColor: COLORS.BG_PRIMARY,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${COLORS.BORDER_DEFAULT}`
                                } 
                            }, 'Detailed morphological features will be added as more data becomes available.')
                    ),
                    
                    // Ecology Tab
                    activeTab === 'ecology' && React.createElement('div', null,
                        React.createElement('h4', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '1rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, 'Ecological Information'),
                        hints.filter(h => h.type === 'ecological').length > 0 ?
                            hints.filter(h => h.type === 'ecological').map((hint, idx) =>
                                React.createElement('div', {
                                    key: idx,
                                    style: {
                                        backgroundColor: COLORS.ACCENT_INFO + '20',
                                        border: `1px solid ${COLORS.ACCENT_INFO}`,
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        marginBottom: '1rem'
                                    }
                                },
                                    React.createElement('div', { 
                                        style: { 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            marginBottom: '0.5rem' 
                                        } 
                                    },
                                        React.createElement('span', null, '🌿'),
                                        React.createElement('strong', { 
                                            style: { 
                                                color: COLORS.ACCENT_INFO 
                                            } 
                                        }, 'Habitat & Ecology')
                                    ),
                                    React.createElement('p', { 
                                        style: { 
                                            color: COLORS.TEXT_PRIMARY 
                                        } 
                                    }, hint.text)
                                )
                            ) :
                            React.createElement('p', { 
                                style: { 
                                    color: COLORS.TEXT_MUTED,
                                    padding: '1rem',
                                    backgroundColor: COLORS.BG_PRIMARY,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${COLORS.BORDER_DEFAULT}`
                                } 
                            }, 'Ecological information will be added as more field data becomes available.')
                    )
                ),
                
                // Footer with Actions
                React.createElement('div', {
                    style: {
                        padding: '1rem 1.5rem',
                        backgroundColor: COLORS.BG_CARD,
                        borderTop: `1px solid ${COLORS.BORDER_DEFAULT}`,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem'
                    }
                },
                    React.createElement('button', {
                        onClick: onTryAgain,
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: GRADIENTS.FOREST,
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                        }
                    }, 'Try Another'),
                    React.createElement('button', {
                        onClick: onClose,
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: GRADIENTS.EARTH,
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                        }
                    }, 'Close Guide')
                ),
                
                // Photo Expansion Modal
                expandedPhoto && React.createElement('div', {
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200
                    },
                    onClick: () => setExpandedPhoto(null)
                },
                    React.createElement('div', {
                        style: {
                            position: 'relative',
                            maxWidth: '90%',
                            maxHeight: '90%'
                        }
                    },
                        React.createElement('img', {
                            src: expandedPhoto.large_url || expandedPhoto.medium_url || expandedPhoto.url,
                            alt: 'Expanded photo',
                            style: {
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: '0.5rem'
                            }
                        }),
                        React.createElement('button', {
                            onClick: (e) => {
                                e.stopPropagation();
                                setExpandedPhoto(null);
                            },
                            style: {
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '50%',
                                width: '2.5rem',
                                height: '2.5rem',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.backgroundColor = 'rgba(255,255,255,1)',
                            onMouseLeave: (e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'
                        }, '×')
                    )
                )
            )
        );
    };
    
    console.log('✅ InteractiveSpeciesGuide component loaded with dark theme');
    
})();