(function() {
    'use strict';
    
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
        
        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: 'white', 
                    borderBottom: '1px solid #e5e7eb', 
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
                                color: '#6b7280'
                            } 
                        }, '← Back'),
                        React.createElement('div', null,
                            React.createElement('h1', { 
                                style: { 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold' 
                                } 
                            }, '🎯 Focused Study'),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem', 
                                    color: '#6b7280' 
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
                    padding: '2rem' 
                } 
            },
                React.createElement('div', { 
                    style: { 
                        backgroundColor: 'white', 
                        borderRadius: '0.75rem', 
                        padding: '2rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    } 
                },
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.25rem', 
                            fontWeight: 'bold', 
                            marginBottom: '1rem' 
                        } 
                    }, 'Study Filters'),
                    React.createElement('p', { 
                        style: { 
                            color: '#6b7280', 
                            marginBottom: '2rem' 
                        } 
                    }, 'Select criteria to focus your study session. Mix and match filters to target specific areas.'),
                    
                    // Family Filter
                    React.createElement('div', { style: { marginBottom: '2rem' } },
                        React.createElement('h3', { 
                            style: { 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                marginBottom: '0.75rem' 
                            } 
                        }, '🏛️ Family'),
                        React.createElement('div', { 
                            style: { 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                                gap: '0.5rem' 
                            } 
                        },
                            availableOptions.families.map(family => {
                                const count = specimens.filter(s => s.family === family && s.status === 'approved').length;
                                const isSelected = filters.family.includes(family);
                                
                                return React.createElement('label', {
                                    key: family,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: isSelected ? '#f0f9ff' : '#f9fafb',
                                        border: `1px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer'
                                    }
                                },
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: isSelected,
                                        onChange: () => handleFilterChange('family', family),
                                        style: { margin: 0 }
                                    }),
                                    React.createElement('span', { style: { fontSize: '0.875rem' } }, 
                                        `${family} (${count})`
                                    )
                                );
                            })
                        )
                    ),
                    
                    // Genus Filter
                    React.createElement('div', { style: { marginBottom: '2rem' } },
                        React.createElement('h3', { 
                            style: { 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                marginBottom: '0.75rem' 
                            } 
                        }, '🧬 Genus'),
                        React.createElement('div', { 
                            style: { 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                                gap: '0.5rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                padding: '0.5rem',
                                border: '1px solid #e5e7eb',
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
                                        padding: '0.25rem',
                                        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
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
                                marginBottom: '0.75rem' 
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
                                        backgroundColor: isSelected ? '#f0f9ff' : '#f9fafb',
                                        border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer'
                                    }
                                },
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: isSelected,
                                        onChange: () => handleFilterChange('features', feature.id),
                                        style: { margin: 0 }
                                    }),
                                    React.createElement('div', null,
                                        React.createElement('div', { style: { fontWeight: '500' } }, feature.label),
                                        React.createElement('div', { 
                                            style: { 
                                                fontSize: '0.75rem', 
                                                color: '#6b7280' 
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
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '2rem'
                        }
                    },
                        React.createElement('h4', { 
                            style: { 
                                fontWeight: '600', 
                                marginBottom: '0.5rem' 
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
                                        color: filteredCount >= 5 ? '#10b981' : '#ef4444'
                                    } 
                                }, filteredCount),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280' 
                                    } 
                                }, 'Total Specimens')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem', 
                                        fontWeight: 'bold',
                                        color: '#3b82f6'
                                    } 
                                }, Math.min(20, filteredCount)),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280' 
                                    } 
                                }, 'Questions')
                            ),
                            React.createElement('div', { style: { textAlign: 'center' } },
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '2rem', 
                                        fontWeight: 'bold',
                                        color: '#8b5cf6'
                                    } 
                                }, `~${Math.ceil(Math.min(20, filteredCount) * 1.5)}`),
                                React.createElement('div', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280' 
                                    } 
                                }, 'Est. Minutes')
                            )
                        ),
                        filteredCount < 5 && React.createElement('div', {
                            style: {
                                marginTop: '0.75rem',
                                padding: '0.5rem',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem',
                                textAlign: 'center'
                            }
                        }, '⚠️ Need at least 5 specimens for effective study. Adjust your filters.')
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
                                backgroundColor: '#6b7280',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }
                        }, 'Clear All'),
                        React.createElement('button', {
                            onClick: handleStartStudy,
                            disabled: filteredCount < 5,
                            style: {
                                padding: '0.75rem 2rem',
                                backgroundColor: filteredCount >= 5 ? '#10b981' : '#d1d5db',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: filteredCount >= 5 ? 'pointer' : 'not-allowed',
                                fontWeight: '500',
                                fontSize: '1rem'
                            }
                        }, `🎯 Start Focused Study (${filteredCount} specimens)`)
                    )
                )
            )
        );
    };
    
    console.log('✅ FocusedStudy component loaded');
    
})();