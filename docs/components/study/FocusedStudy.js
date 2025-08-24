// FocusedStudy.js - Updated with Living Mycology Dark Theme
(function() {
    'use strict';
    
    // Design constants matching the established dark theme
    const COLORS = {
        // Dark theme backgrounds
        BG_PRIMARY: '#1A1A19',
        BG_CARD: '#2A2826',
        BG_HOVER: '#323230',
        
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
    
    window.FocusedStudy = function FocusedStudy(props) {
        const specimens = props.specimens || [];
        const onBack = props.onBack;
        
        // State
        const [showFilters, setShowFilters] = React.useState(true);
        const [filters, setFilters] = React.useState({
            family: [],
            genus: [],
            features: []
        });
        const [studyStarted, setStudyStarted] = React.useState(false);
        
        // Extract available options from specimens
        const availableOptions = React.useMemo(() => {
            const families = [...new Set(specimens.map(s => s.family))].filter(f => f).sort();
            const genera = [...new Set(specimens.map(s => s.genus))].filter(g => g).sort();
            const features = [
                { id: 'dna_verified', label: 'DNA Verified Only', count: specimens.filter(s => s.dna_sequenced).length },
                { id: 'has_common_name', label: 'Has Common Name', count: specimens.filter(s => s.common_name).length }
            ];
            
            return { families, genera, features };
        }, [specimens]);
        
        // Count specimens that match current filters
        const filteredCount = React.useMemo(() => {
            let filtered = specimens.filter(s => s.status === 'approved');
            
            if (filters.family.length > 0) {
                filtered = filtered.filter(s => filters.family.includes(s.family));
            }
            if (filters.genus.length > 0) {
                filtered = filtered.filter(s => filters.genus.includes(s.genus));
            }
            if (filters.features.includes('dna_verified')) {
                filtered = filtered.filter(s => s.dna_sequenced);
            }
            if (filters.features.includes('has_common_name')) {
                filtered = filtered.filter(s => s.common_name);
            }
            
            return filtered.length;
        }, [specimens, filters]);
        
        const handleFilterChange = (type, value) => {
            setFilters(prev => ({
                ...prev,
                [type]: prev[type].includes(value) 
                    ? prev[type].filter(item => item !== value)
                    : [...prev[type], value]
            }));
        };
        
        const handleStartStudy = () => {
            if (filteredCount < 5) {
                alert('Please select filters that include at least 5 specimens for effective study.');
                return;
            }
            setStudyStarted(true);
        };
        
        const handleBackToFilters = () => {
            setStudyStarted(false);
        };
        
        if (studyStarted) {
            return React.createElement(window.SharedFlashcard, {
                ...props,
                mode: 'focused',
                filters: filters,
                onBack: handleBackToFilters
            });
        }
        
        return React.createElement('div', { 
            style: { 
                minHeight: '100vh', 
                backgroundColor: COLORS.BG_PRIMARY 
            } 
        },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: COLORS.BG_CARD, 
                    borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}`, 
                    padding: '1rem' 
                } 
            },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                    React.createElement('div', { 
                        style: { 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem' 
                        } 
                    },
                        React.createElement('button', { 
                            onClick: onBack, 
                            style: { 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontSize: '1rem',
                                color: COLORS.TEXT_SECONDARY,
                                transition: 'color 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.color = COLORS.TEXT_PRIMARY,
                            onMouseLeave: (e) => e.target.style.color = COLORS.TEXT_SECONDARY
                        }, '← Back'),
                        React.createElement('div', null,
                            React.createElement('h1', { 
                                style: { 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, '🎯 Focused Study'),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem', 
                                    color: COLORS.TEXT_SECONDARY
                                } 
                            }, 'Customize your study session with filters')
                        )
                    )
                )
            ),
            
            // Main Content
            React.createElement('div', { 
                style: { 
                    maxWidth: '72rem', 
                    margin: '0 auto', 
                    padding: '2rem 1rem' 
                } 
            },
                React.createElement('div', { 
                    style: { 
                        backgroundColor: COLORS.BG_CARD,
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    } 
                },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.25rem', 
                            fontWeight: 'bold', 
                            marginBottom: '2rem',
                            color: COLORS.TEXT_PRIMARY
                        } 
                    }, '🔧 Filter Options'),
                    
                    // Family Filter
                    React.createElement('div', { style: { marginBottom: '2rem' } },
                        React.createElement('h3', { 
                            style: { 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                marginBottom: '0.75rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, '🌿 Family'),
                        React.createElement('div', { 
                            style: { 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '0.5rem' 
                            } 
                        },
                            availableOptions.families.map(family => {
                                const isSelected = filters.family.includes(family);
                                return React.createElement('label', {
                                    key: family,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        backgroundColor: isSelected ? COLORS.ACCENT_PRIMARY : COLORS.BG_PRIMARY,
                                        color: isSelected ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY,
                                        border: `1px solid ${isSelected ? COLORS.BORDER_ACTIVE : COLORS.BORDER_DEFAULT}`,
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_HOVER;
                                        }
                                    },
                                    onMouseLeave: (e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_PRIMARY;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_DEFAULT;
                                        }
                                    }
                                },
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: isSelected,
                                        onChange: () => handleFilterChange('family', family),
                                        style: { margin: 0 }
                                    }),
                                    React.createElement('span', null, family)
                                );
                            })
                        )
                    ),
                    
                    // Genus Filter with counts
                    React.createElement('div', { style: { marginBottom: '2rem' } },
                        React.createElement('h3', { 
                            style: { 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                marginBottom: '0.75rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, '🍄 Genus'),
                        React.createElement('div', { 
                            style: { 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                                gap: '0.5rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                padding: '0.5rem',
                                backgroundColor: COLORS.BG_PRIMARY,
                                borderRadius: '0.5rem'
                            } 
                        },
                            availableOptions.genera.map(genus => {
                                const count = specimens.filter(s => s.genus === genus && s.status === 'approved').length;
                                const isSelected = filters.genus.includes(genus);
                                
                                return React.createElement('label', {
                                    key: genus,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: isSelected ? COLORS.ACCENT_PRIMARY : 'transparent',
                                        color: isSelected ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY,
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                                        }
                                    },
                                    onMouseLeave: (e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }
                                },
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: isSelected,
                                        onChange: () => handleFilterChange('genus', genus),
                                        style: { margin: 0, transform: 'scale(0.8)' }
                                    }),
                                    React.createElement('span', null, `${genus} (${count})`)
                                );
                            })
                        )
                    ),
                    
                    // Features Filter
                    React.createElement('div', { style: { marginBottom: '2rem' } },
                        React.createElement('h3', { 
                            style: { 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                marginBottom: '0.75rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, '⚡ Features'),
                        React.createElement('div', { 
                            style: { 
                                display: 'flex', 
                                gap: '1rem' 
                            } 
                        },
                            availableOptions.features.map(feature => {
                                const isSelected = filters.features.includes(feature.id);
                                
                                return React.createElement('label', {
                                    key: feature.id,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: isSelected ? COLORS.ACCENT_SUCCESS : COLORS.BG_PRIMARY,
                                        color: isSelected ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY,
                                        border: `2px solid ${isSelected ? COLORS.ACCENT_SUCCESS : COLORS.BORDER_DEFAULT}`,
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_HOVER;
                                        }
                                    },
                                    onMouseLeave: (e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_PRIMARY;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_DEFAULT;
                                        }
                                    }
                                },
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: isSelected,
                                        onChange: () => handleFilterChange('features', feature.id),
                                        style: { margin: 0 }
                                    }),
                                    React.createElement('div', null,
                                        React.createElement('div', { 
                                            style: { 
                                                fontWeight: '500',
                                                color: COLORS.TEXT_PRIMARY
                                            } 
                                        }, feature.label),
                                        React.createElement('div', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                color: COLORS.TEXT_MUTED
                                            } 
                                        }, `${feature.count} specimens`)
                                    )
                                );
                            })
                        )
                    ),
                    
                    // Study Session Summary
                    React.createElement('div', {
                        style: {
                            background: GRADIENTS.MUSHROOM,
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '2rem',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }
                    },
                        React.createElement('h4', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '0.5rem',
                                color: '#FFFFFF'
                            } 
                        }, '📊 Study Session Preview'),
                        React.createElement('div', { 
                            style: { 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                                gap: '1rem' 
                            } 
                        },
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem', 
                                        fontWeight: 'bold',
                                        color: filteredCount >= 5 ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
                                    } 
                                }, filteredCount),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: 'rgba(255,255,255,0.9)'
                                    } 
                                }, 'Specimens')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem', 
                                        fontWeight: 'bold',
                                        color: filters.family.length > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
                                    } 
                                }, filters.family.length),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: 'rgba(255,255,255,0.9)'
                                    } 
                                }, 'Families')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem', 
                                        fontWeight: 'bold',
                                        color: filters.genus.length > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
                                    } 
                                }, filters.genus.length),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: 'rgba(255,255,255,0.9)'
                                    } 
                                }, 'Genera')
                            )
                        )
                    ),
                    
                    // Minimum requirement notice
                    filteredCount < 5 && React.createElement('div', {
                        style: {
                            padding: '1rem',
                            backgroundColor: COLORS.ACCENT_ERROR,
                            color: COLORS.TEXT_PRIMARY,
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }
                    },
                        React.createElement('p', null, 
                            `⚠️ At least 5 specimens required (currently ${filteredCount}). Adjust your filters.`)
                    ),
                    
                    // Action Buttons
                    React.createElement('div', { 
                        style: { 
                            display: 'flex', 
                            gap: '1rem', 
                            justifyContent: 'center' 
                        } 
                    },
                        React.createElement('button', {
                            onClick: () => setFilters({ family: [], genus: [], features: [] }),
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
                        }, 'Clear All'),
                        React.createElement('button', {
                            onClick: handleStartStudy,
                            disabled: filteredCount < 5,
                            style: {
                                padding: '0.75rem 2rem',
                                background: filteredCount >= 5 ? GRADIENTS.EARTH : COLORS.BG_HOVER,
                                color: filteredCount >= 5 ? 'white' : COLORS.TEXT_MUTED,
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: filteredCount >= 5 ? 'pointer' : 'not-allowed',
                                fontWeight: '500',
                                fontSize: '1rem',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: filteredCount >= 5 ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none'
                            },
                            onMouseEnter: (e) => {
                                if (filteredCount >= 5) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                                }
                            },
                            onMouseLeave: (e) => {
                                if (filteredCount >= 5) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                                }
                            }
                        }, `🎯 Start Focused Study (${filteredCount} specimens)`)
                    )
                )
            )
        );
    };
    
    console.log('✅ FocusedStudy component loaded with dark theme');
    
})();