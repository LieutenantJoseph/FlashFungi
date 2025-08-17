// Focused Study Mode - Phase 3 Implementation
// Allows filtering specimens by various criteria for targeted practice

(function() {
    'use strict';
    
    const { useState, useEffect, useCallback, useMemo } = React;
    const h = React.createElement;
    
    // Focused Study Component
    window.FocusedStudy = function FocusedStudy(props) {
        const {
            specimens = [],
            speciesHints = {},
            referencePhotos = {},
            specimenPhotos = {},
            user,
            saveProgress,
            loadSpecimenPhotos,
            onBack
        } = props;
        
        // Filter state
        const [filters, setFilters] = useState(() => {
            // Try to load saved filters from user preferences
            const saved = localStorage.getItem(`focusedStudyFilters_${user?.id}`);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.warn('Could not parse saved filters');
                }
            }
            return {
                family: 'all',
                genus: 'all',
                difficulty: 'all',
                features: [],
                dnaOnly: false,
                customSetName: ''
            };
        });
        
        const [showFilters, setShowFilters] = useState(true);
        const [studyStarted, setStudyStarted] = useState(false);
        const [savedPresets, setSavedPresets] = useState([]);
        const [performanceData, setPerformanceData] = useState({});
        
        // Extract unique families and genera
        const families = useMemo(() => {
            const uniqueFamilies = new Set(specimens.map(s => s.family).filter(Boolean));
            return Array.from(uniqueFamilies).sort();
        }, [specimens]);
        
        const genera = useMemo(() => {
            const uniqueGenera = new Set(specimens.map(s => s.genus).filter(Boolean));
            return Array.from(uniqueGenera).sort();
        }, [specimens]);
        
        // Feature options
        const featureOptions = [
            { id: 'rings', label: 'Has Ring', filter: (s) => s.description?.toLowerCase().includes('ring') },
            { id: 'gills', label: 'Has Gills', filter: (s) => s.description?.toLowerCase().includes('gill') },
            { id: 'pores', label: 'Has Pores', filter: (s) => s.description?.toLowerCase().includes('pore') },
            { id: 'edible', label: 'Edible', filter: (s) => s.common_name?.toLowerCase().includes('edible') },
            { id: 'toxic', label: 'Toxic/Poisonous', filter: (s) => 
                s.common_name?.toLowerCase().includes('poison') || 
                s.common_name?.toLowerCase().includes('toxic') ||
                s.description?.toLowerCase().includes('toxic')
            }
        ];
        
        // Filter specimens based on current filters
        const filteredSpecimens = useMemo(() => {
            let filtered = specimens.filter(s => s.status === 'approved');
            
            // Family filter
            if (filters.family !== 'all') {
                filtered = filtered.filter(s => s.family === filters.family);
            }
            
            // Genus filter
            if (filters.genus !== 'all') {
                filtered = filtered.filter(s => s.genus === filters.genus);
            }
            
            // DNA only filter
            if (filters.dnaOnly) {
                filtered = filtered.filter(s => s.dna_sequenced);
            }
            
            // Feature filters
            if (filters.features.length > 0) {
                filters.features.forEach(featureId => {
                    const feature = featureOptions.find(f => f.id === featureId);
                    if (feature) {
                        filtered = filtered.filter(feature.filter);
                    }
                });
            }
            
            // Difficulty filter (based on quality score)
            if (filters.difficulty !== 'all') {
                switch (filters.difficulty) {
                    case 'easy':
                        filtered = filtered.filter(s => s.quality_score >= 0.7);
                        break;
                    case 'medium':
                        filtered = filtered.filter(s => s.quality_score >= 0.4 && s.quality_score < 0.7);
                        break;
                    case 'hard':
                        filtered = filtered.filter(s => s.quality_score < 0.4);
                        break;
                }
            }
            
            // Shuffle for variety
            return filtered.sort(() => Math.random() - 0.5);
        }, [specimens, filters, featureOptions]);
        
        // Calculate weak areas based on performance
        const weakAreas = useMemo(() => {
            const areas = {};
            
            // Analyze performance by family
            families.forEach(family => {
                const familyPerf = performanceData[`family_${family}`];
                if (familyPerf && familyPerf.attempts > 3) {
                    areas[family] = {
                        type: 'family',
                        accuracy: (familyPerf.correct / familyPerf.attempts) * 100,
                        attempts: familyPerf.attempts
                    };
                }
            });
            
            // Sort by accuracy (lowest first)
            return Object.entries(areas)
                .filter(([_, data]) => data.accuracy < 70)
                .sort((a, b) => a[1].accuracy - b[1].accuracy)
                .slice(0, 3);
        }, [performanceData, families]);
        
        // Load saved presets and performance data
        useEffect(() => {
            const loadUserData = async () => {
                if (!user?.id) return;
                
                try {
                    // Load saved filter presets from user_preferences
                    const prefsResponse = await fetch(
                        `${window.SUPABASE_URL}/rest/v1/user_preferences?user_id=eq.${user.id}`,
                        {
                            headers: {
                                'apikey': window.SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                            }
                        }
                    );
                    
                    if (prefsResponse.ok) {
                        const prefs = await prefsResponse.json();
                        if (prefs[0]?.saved_filters) {
                            setSavedPresets(prefs[0].saved_filters);
                        }
                    }
                    
                    // Load performance data from user_progress
                    const progressResponse = await fetch(
                        `${window.SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${user.id}&progress_type=eq.focused_study`,
                        {
                            headers: {
                                'apikey': window.SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                            }
                        }
                    );
                    
                    if (progressResponse.ok) {
                        const progress = await progressResponse.json();
                        const perfData = {};
                        progress.forEach(p => {
                            if (p.metadata?.category) {
                                perfData[p.metadata.category] = {
                                    correct: p.metadata.correct || 0,
                                    attempts: p.attempts || 0
                                };
                            }
                        });
                        setPerformanceData(perfData);
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            };
            
            loadUserData();
        }, [user]);
        
        // Save filter preset
        const saveFilterPreset = async (name) => {
            if (!user?.id || !name) return;
            
            const preset = {
                name,
                filters: { ...filters },
                created_at: new Date().toISOString()
            };
            
            const newPresets = [...savedPresets, preset];
            setSavedPresets(newPresets);
            
            // Save to database
            try {
                await fetch(`${window.SUPABASE_URL}/rest/v1/user_preferences`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        saved_filters: newPresets,
                        updated_at: new Date().toISOString()
                    })
                });
                
                // Also save to localStorage
                localStorage.setItem(`focusedStudyFilters_${user.id}`, JSON.stringify(filters));
            } catch (error) {
                console.error('Error saving preset:', error);
            }
        };
        
        // Load a saved preset
        const loadPreset = (preset) => {
            setFilters(preset.filters);
        };
        
        // Handle filter changes
        const handleFilterChange = (key, value) => {
            setFilters(prev => ({ ...prev, [key]: value }));
        };
        
        // Toggle feature filter
        const toggleFeature = (featureId) => {
            setFilters(prev => ({
                ...prev,
                features: prev.features.includes(featureId)
                    ? prev.features.filter(f => f !== featureId)
                    : [...prev.features, featureId]
            }));
        };
        
        // Start study session
        const startStudy = () => {
            if (filteredSpecimens.length < 5) {
                alert('Please adjust filters to have at least 5 specimens to study.');
                return;
            }
            setStudyStarted(true);
            setShowFilters(false);
        };
        
        // Track performance
        const updatePerformance = useCallback(async (category, correct) => {
            const key = `${category.type}_${category.value}`;
            setPerformanceData(prev => {
                const current = prev[key] || { correct: 0, attempts: 0 };
                return {
                    ...prev,
                    [key]: {
                        correct: current.correct + (correct ? 1 : 0),
                        attempts: current.attempts + 1
                    }
                };
            });
            
            // Save to database
            if (user?.id && saveProgress) {
                await saveProgress({
                    progressType: 'focused_study',
                    metadata: {
                        category: key,
                        correct: correct ? 1 : 0
                    }
                });
            }
        }, [user, saveProgress]);
        
        // Render filters panel
        const renderFilters = () => h('div', {
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
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '1rem' 
                } 
            }, '🎯 Focus Your Study'),
            
            // Filter controls grid
            h('div', { 
                style: { 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1rem'
                } 
            },
                // Family filter
                h('div', null,
                    h('label', { 
                        style: { 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '500', 
                            marginBottom: '0.25rem' 
                        } 
                    }, 'Family'),
                    h('select', {
                        value: filters.family,
                        onChange: (e) => handleFilterChange('family', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                        }
                    },
                        h('option', { value: 'all' }, 'All Families'),
                        families.map(family =>
                            h('option', { key: family, value: family }, family)
                        )
                    )
                ),
                
                // Genus filter
                h('div', null,
                    h('label', { 
                        style: { 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '500', 
                            marginBottom: '0.25rem' 
                        } 
                    }, 'Genus'),
                    h('select', {
                        value: filters.genus,
                        onChange: (e) => handleFilterChange('genus', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                        }
                    },
                        h('option', { value: 'all' }, 'All Genera'),
                        genera.map(genus =>
                            h('option', { key: genus, value: genus }, genus)
                        )
                    )
                ),
                
                // Difficulty filter
                h('div', null,
                    h('label', { 
                        style: { 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '500', 
                            marginBottom: '0.25rem' 
                        } 
                    }, 'Difficulty'),
                    h('select', {
                        value: filters.difficulty,
                        onChange: (e) => handleFilterChange('difficulty', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                        }
                    },
                        h('option', { value: 'all' }, 'All Difficulties'),
                        h('option', { value: 'easy' }, 'Easy (High Quality)'),
                        h('option', { value: 'medium' }, 'Medium'),
                        h('option', { value: 'hard' }, 'Hard (Low Quality)')
                    )
                )
            ),
            
            // Feature filters
            h('div', { style: { marginBottom: '1rem' } },
                h('label', { 
                    style: { 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        marginBottom: '0.5rem' 
                    } 
                }, 'Features'),
                h('div', { 
                    style: { 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem' 
                    } 
                },
                    featureOptions.map(feature =>
                        h('button', {
                            key: feature.id,
                            onClick: () => toggleFeature(feature.id),
                            style: {
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid',
                                borderColor: filters.features.includes(feature.id) ? '#3b82f6' : '#d1d5db',
                                backgroundColor: filters.features.includes(feature.id) ? '#dbeafe' : 'white',
                                color: filters.features.includes(feature.id) ? '#1e40af' : '#6b7280',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }
                        }, feature.label)
                    ),
                    
                    // DNA only toggle
                    h('button', {
                        onClick: () => handleFilterChange('dnaOnly', !filters.dnaOnly),
                        style: {
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid',
                            borderColor: filters.dnaOnly ? '#7c3aed' : '#d1d5db',
                            backgroundColor: filters.dnaOnly ? '#ede9fe' : 'white',
                            color: filters.dnaOnly ? '#5b21b6' : '#6b7280',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }
                    }, '🧬 DNA Only')
                )
            ),
            
            // Results summary
            h('div', {
                style: {
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    marginBottom: '1rem'
                }
            },
                h('p', { style: { fontSize: '0.875rem', color: '#374151' } },
                    `${filteredSpecimens.length} specimens match your criteria`,
                    filteredSpecimens.length < 5 && h('span', { 
                        style: { color: '#dc2626', marginLeft: '0.5rem' } 
                    }, '(Minimum 5 required)')
                )
            ),
            
            // Weak areas recommendations
            weakAreas.length > 0 && h('div', {
                style: {
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '0.375rem',
                    marginBottom: '1rem'
                }
            },
                h('h4', { 
                    style: { 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        marginBottom: '0.5rem' 
                    } 
                }, '💡 Recommended Focus Areas'),
                h('p', { style: { fontSize: '0.75rem', color: '#92400e', marginBottom: '0.5rem' } },
                    'Based on your performance, consider focusing on:'
                ),
                h('ul', { style: { fontSize: '0.875rem', paddingLeft: '1.25rem', listStyleType: 'disc' } },
                    weakAreas.map(([name, data]) =>
                        h('li', { key: name },
                            `${name} (${Math.round(data.accuracy)}% accuracy)`
                        )
                    )
                )
            ),
            
            // Saved presets
            savedPresets.length > 0 && h('div', { style: { marginBottom: '1rem' } },
                h('label', { 
                    style: { 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        marginBottom: '0.5rem' 
                    } 
                }, 'Saved Presets'),
                h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' } },
                    savedPresets.map((preset, idx) =>
                        h('button', {
                            key: idx,
                            onClick: () => loadPreset(preset),
                            style: {
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '0.375rem',
                                border: '1px solid #d1d5db',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }
                        }, preset.name)
                    )
                )
            ),
            
            // Action buttons
            h('div', { style: { display: 'flex', gap: '0.5rem' } },
                h('button', {
                    onClick: startStudy,
                    disabled: filteredSpecimens.length < 5,
                    style: {
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: filteredSpecimens.length >= 5 ? '#10b981' : '#d1d5db',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: filteredSpecimens.length >= 5 ? 'pointer' : 'not-allowed',
                        fontWeight: '500'
                    }
                }, 'Start Focused Study'),
                
                h('button', {
                    onClick: () => {
                        const name = prompt('Save this filter preset as:');
                        if (name) saveFilterPreset(name);
                    },
                    style: {
                        padding: '0.75rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }
                }, 'Save Preset')
            )
        );
        
        // Main render
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
                            h('div', null,
                                h('h1', { 
                                    style: { 
                                        fontSize: '1.25rem', 
                                        fontWeight: 'bold' 
                                    } 
                                }, '🎯 Focused Study'),
                                h('p', { 
                                    style: { 
                                        fontSize: '0.875rem', 
                                        color: '#6b7280' 
                                    } 
                                }, 'Practice with targeted specimen selection')
                            )
                        ),
                        
                        !studyStarted && h('button', {
                            onClick: () => setShowFilters(!showFilters),
                            style: {
                                padding: '0.5rem 1rem',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }
                        }, showFilters ? 'Hide Filters' : 'Show Filters')
                    )
                )
            ),
            
            // Main content
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                // Show filters or study interface
                !studyStarted && showFilters && renderFilters(),
                
                // Study interface (reuse QuickStudy with filtered specimens)
                studyStarted && window.QuickStudy && h(window.QuickStudy, {
                    specimens: filteredSpecimens.slice(0, 10), // Limit to 10 for focused practice
                    speciesHints,
                    referencePhotos,
                    specimenPhotos,
                    user,
                    saveProgress: async (data) => {
                        // Track category performance
                        if (data.specimenId) {
                            const specimen = filteredSpecimens.find(s => s.id === data.specimenId);
                            if (specimen) {
                                if (filters.family !== 'all') {
                                    await updatePerformance(
                                        { type: 'family', value: filters.family },
                                        data.score > 50
                                    );
                                }
                                if (filters.genus !== 'all') {
                                    await updatePerformance(
                                        { type: 'genus', value: filters.genus },
                                        data.score > 50
                                    );
                                }
                            }
                        }
                        
                        // Call original save progress
                        if (saveProgress) {
                            await saveProgress(data);
                        }
                    },
                    loadSpecimenPhotos,
                    onBack: () => {
                        setStudyStarted(false);
                        setShowFilters(true);
                    }
                })
            )
        );
    };
})();