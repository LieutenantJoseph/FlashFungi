// Focused Study Mode - Phase 3 Complete Implementation
// Allows filtering specimens by various criteria for targeted practice

(function() {
    'use strict';
    
    const { useState, useEffect, useCallback, useMemo } = React;
    
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
                customSetName: '',
                minQualityScore: 0
            };
        });
        
        const [showFilters, setShowFilters] = useState(true);
        const [studyStarted, setStudyStarted] = useState(false);
        const [savedPresets, setSavedPresets] = useState([]);
        const [performanceData, setPerformanceData] = useState({});
        const [newPresetName, setNewPresetName] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        
        // Extract unique families and genera
        const families = useMemo(() => {
            const uniqueFamilies = new Set(specimens.map(s => s.family).filter(Boolean));
            return Array.from(uniqueFamilies).sort();
        }, [specimens]);
        
        const genera = useMemo(() => {
            const uniqueGenera = new Set(specimens.map(s => s.genus).filter(Boolean));
            return Array.from(uniqueGenera).sort();
        }, [specimens]);
        
        // Feature options for filtering
        const featureOptions = [
            { id: 'dna_verified', label: 'DNA Verified', field: 'dna_sequenced' },
            { id: 'has_ring', label: 'Has Ring', field: 'has_ring' },
            { id: 'free_gills', label: 'Free Gills', field: 'gill_attachment', value: 'free' },
            { id: 'pores', label: 'Has Pores', field: 'spore_bearing_surface', value: 'pores' },
            { id: 'high_quality', label: 'High Quality Photos', field: 'quality_score', min: 0.8 },
            { id: 'toxic', label: 'Toxic Species', field: 'edibility', value: 'toxic' },
            { id: 'edible', label: 'Edible Species', field: 'edibility', value: 'edible' }
        ];
        
        // Apply filters to specimens
        const filteredSpecimens = useMemo(() => {
            if (!specimens || specimens.length === 0) return [];
            
            return specimens.filter(specimen => {
                // Family filter
                if (filters.family !== 'all' && specimen.family !== filters.family) {
                    return false;
                }
                
                // Genus filter
                if (filters.genus !== 'all' && specimen.genus !== filters.genus) {
                    return false;
                }
                
                // Difficulty filter based on quality score and identification success
                if (filters.difficulty !== 'all') {
                    const score = specimen.quality_score || 0;
                    if (filters.difficulty === 'easy' && score < 0.7) return false;
                    if (filters.difficulty === 'medium' && (score < 0.4 || score > 0.8)) return false;
                    if (filters.difficulty === 'hard' && score > 0.4) return false;
                }
                
                // Quality score minimum
                if (specimen.quality_score < filters.minQualityScore) {
                    return false;
                }
                
                // DNA only filter
                if (filters.dnaOnly && !specimen.dna_sequenced) {
                    return false;
                }
                
                // Feature filters
                for (const featureId of filters.features) {
                    const featureOption = featureOptions.find(f => f.id === featureId);
                    if (!featureOption) continue;
                    
                    if (featureOption.min) {
                        if ((specimen[featureOption.field] || 0) < featureOption.min) return false;
                    } else if (featureOption.value) {
                        if (specimen[featureOption.field] !== featureOption.value) return false;
                    } else {
                        if (!specimen[featureOption.field]) return false;
                    }
                }
                
                return true;
            });
        }, [specimens, filters, featureOptions]);
        
        // Load user preferences on mount
        useEffect(() => {
            if (!user?.id) return;
            
            const loadUserData = async () => {
                try {
                    // Load saved presets
                    const response = await fetch(`${window.SUPABASE_URL}/rest/v1/user_preferences?user_id=eq.${user.id}&select=*`, {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data[0]?.saved_filters) {
                            setSavedPresets(data[0].saved_filters);
                        }
                    }
                    
                    // Load performance data
                    const perfResponse = await fetch(`${window.SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${user.id}&progress_type=eq.focused_study&select=*`, {
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                        }
                    });
                    
                    if (perfResponse.ok) {
                        const perfData = await perfResponse.json();
                        const performance = {};
                        perfData.forEach(record => {
                            if (record.metadata?.category) {
                                performance[record.metadata.category] = {
                                    correct: record.metadata.correct || 0,
                                    attempts: 1
                                };
                            }
                        });
                        setPerformanceData(performance);
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            };
            
            loadUserData();
        }, [user]);
        
        // Save filter preset
        const saveFilterPreset = async () => {
            if (!user?.id || !newPresetName.trim()) return;
            
            const preset = {
                name: newPresetName.trim(),
                filters: { ...filters },
                created_at: new Date().toISOString()
            };
            
            const newPresets = [...savedPresets, preset];
            setSavedPresets(newPresets);
            setNewPresetName('');
            
            // Save to database
            try {
                const response = await fetch(`${window.SUPABASE_URL}/rest/v1/user_preferences`, {
                    method: 'POST',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        saved_filters: newPresets,
                        updated_at: new Date().toISOString()
                    })
                });
                
                if (response.ok) {
                    // Also save to localStorage as backup
                    localStorage.setItem(`focusedStudyFilters_${user.id}`, JSON.stringify(filters));
                    window.showToast && window.showToast('Filter preset saved!', 'success');
                }
            } catch (error) {
                console.error('Error saving preset:', error);
                window.showToast && window.showToast('Failed to save preset', 'error');
            }
        };
        
        // Load a saved preset
        const loadPreset = (preset) => {
            setFilters(preset.filters);
            window.showToast && window.showToast(`Loaded preset: ${preset.name}`, 'success');
        };
        
        // Delete a preset
        const deletePreset = async (presetIndex) => {
            const newPresets = savedPresets.filter((_, index) => index !== presetIndex);
            setSavedPresets(newPresets);
            
            if (user?.id) {
                try {
                    await fetch(`${window.SUPABASE_URL}/rest/v1/user_preferences`, {
                        method: 'POST',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'resolution=merge-duplicates'
                        },
                        body: JSON.stringify({
                            user_id: user.id,
                            saved_filters: newPresets,
                            updated_at: new Date().toISOString()
                        })
                    });
                } catch (error) {
                    console.error('Error deleting preset:', error);
                }
            }
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
        
        // Reset filters
        const resetFilters = () => {
            setFilters({
                family: 'all',
                genus: 'all',
                difficulty: 'all',
                features: [],
                dnaOnly: false,
                customSetName: '',
                minQualityScore: 0
            });
        };
        
        // Start study session
        const startStudy = () => {
            if (filteredSpecimens.length < 5) {
                window.showToast && window.showToast(
                    'Please adjust filters to have at least 5 specimens to study.',
                    'warning'
                );
                return;
            }
            setStudyStarted(true);
            setShowFilters(false);
        };
        
        // Track performance for categories
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
        
        // Custom QuickStudy wrapper with performance tracking
        const FocusedQuickStudy = (props) => {
            return React.createElement(window.QuickStudy, {
                ...props,
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
                }
            });
        };
        
        // Get weak areas recommendations
        const getWeakAreas = () => {
            return Object.entries(performanceData)
                .filter(([key, data]) => data.attempts >= 3 && (data.correct / data.attempts) < 0.7)
                .map(([key, data]) => ({
                    area: key,
                    accuracy: Math.round((data.correct / data.attempts) * 100)
                }))
                .sort((a, b) => a.accuracy - b.accuracy);
        };
        
        const weakAreas = getWeakAreas();
        
        // Render filters panel
        const renderFilters = () => React.createElement('div', {
            className: 'bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200'
        },
            React.createElement('div', { className: 'flex items-center justify-between mb-6' },
                React.createElement('h3', { 
                    className: 'text-xl font-semibold text-gray-800'
                }, '🎯 Focus Your Study'),
                React.createElement('button', {
                    onClick: resetFilters,
                    className: 'text-sm text-blue-600 hover:text-blue-700 font-medium'
                }, 'Reset All')
            ),
            
            // Filter controls grid
            React.createElement('div', { 
                className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'
            },
                // Family filter
                React.createElement('div', null,
                    React.createElement('label', { 
                        className: 'block text-sm font-medium text-gray-700 mb-2'
                    }, 'Family'),
                    React.createElement('select', {
                        value: filters.family,
                        onChange: (e) => handleFilterChange('family', e.target.value),
                        className: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    },
                        React.createElement('option', { value: 'all' }, 'All Families'),
                        families.map(family =>
                            React.createElement('option', { key: family, value: family }, family)
                        )
                    )
                ),
                
                // Genus filter
                React.createElement('div', null,
                    React.createElement('label', { 
                        className: 'block text-sm font-medium text-gray-700 mb-2'
                    }, 'Genus'),
                    React.createElement('select', {
                        value: filters.genus,
                        onChange: (e) => handleFilterChange('genus', e.target.value),
                        className: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    },
                        React.createElement('option', { value: 'all' }, 'All Genera'),
                        genera.map(genus =>
                            React.createElement('option', { key: genus, value: genus }, genus)
                        )
                    )
                ),
                
                // Difficulty filter
                React.createElement('div', null,
                    React.createElement('label', { 
                        className: 'block text-sm font-medium text-gray-700 mb-2'
                    }, 'Difficulty'),
                    React.createElement('select', {
                        value: filters.difficulty,
                        onChange: (e) => handleFilterChange('difficulty', e.target.value),
                        className: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    },
                        React.createElement('option', { value: 'all' }, 'All Levels'),
                        React.createElement('option', { value: 'easy' }, 'Easy (High Quality)'),
                        React.createElement('option', { value: 'medium' }, 'Medium'),
                        React.createElement('option', { value: 'hard' }, 'Hard (Low Quality)')
                    )
                )
            ),
            
            // Quality score slider
            React.createElement('div', { className: 'mb-6' },
                React.createElement('label', { 
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                }, `Minimum Quality Score: ${Math.round(filters.minQualityScore * 100)}%`),
                React.createElement('input', {
                    type: 'range',
                    min: 0,
                    max: 1,
                    step: 0.1,
                    value: filters.minQualityScore,
                    onChange: (e) => handleFilterChange('minQualityScore', parseFloat(e.target.value)),
                    className: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                })
            ),
            
            // Feature checkboxes
            React.createElement('div', { className: 'mb-6' },
                React.createElement('label', { 
                    className: 'block text-sm font-medium text-gray-700 mb-3'
                }, 'Features'),
                React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-3' },
                    featureOptions.map(feature =>
                        React.createElement('label', { 
                            key: feature.id,
                            className: 'flex items-center space-x-2 cursor-pointer'
                        },
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: filters.features.includes(feature.id),
                                onChange: () => toggleFeature(feature.id),
                                className: 'rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                            }),
                            React.createElement('span', { 
                                className: 'text-sm text-gray-700'
                            }, feature.label)
                        )
                    )
                )
            ),
            
            // Saved presets
            savedPresets.length > 0 && React.createElement('div', { className: 'mb-6' },
                React.createElement('label', { 
                    className: 'block text-sm font-medium text-gray-700 mb-3'
                }, 'Saved Presets'),
                React.createElement('div', { className: 'flex flex-wrap gap-2' },
                    savedPresets.map((preset, index) =>
                        React.createElement('div', { 
                            key: index,
                            className: 'flex items-center bg-gray-100 rounded-lg px-3 py-2'
                        },
                            React.createElement('button', {
                                onClick: () => loadPreset(preset),
                                className: 'text-sm font-medium text-blue-600 hover:text-blue-700 mr-2'
                            }, preset.name),
                            React.createElement('button', {
                                onClick: () => deletePreset(index),
                                className: 'text-red-500 hover:text-red-700 text-xs'
                            }, '×')
                        )
                    )
                )
            ),
            
            // Save new preset
            React.createElement('div', { className: 'mb-6' },
                React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('input', {
                        type: 'text',
                        placeholder: 'Preset name',
                        value: newPresetName,
                        onChange: (e) => setNewPresetName(e.target.value),
                        className: 'flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    }),
                    React.createElement('button', {
                        onClick: saveFilterPreset,
                        disabled: !newPresetName.trim(),
                        className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                    }, 'Save')
                )
            ),
            
            // Results summary and weak areas
            React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('div', { className: 'text-sm text-gray-600' },
                    `${filteredSpecimens.length} specimens match your filters`,
                    filteredSpecimens.length < 5 && React.createElement('span', { 
                        className: 'text-amber-600 ml-2'
                    }, '(minimum 5 needed)')
                ),
                
                weakAreas.length > 0 && React.createElement('div', { className: 'text-sm' },
                    React.createElement('span', { className: 'text-gray-600' }, 'Weak areas: '),
                    weakAreas.slice(0, 2).map((area, index) =>
                        React.createElement('span', { 
                            key: area.area,
                            className: 'text-red-600 font-medium'
                        }, `${area.area} (${area.accuracy}%)${index < 1 ? ', ' : ''}`)
                    )
                )
            ),
            
            // Start study button
            React.createElement('div', { className: 'mt-6 flex justify-center' },
                React.createElement('button', {
                    onClick: startStudy,
                    disabled: filteredSpecimens.length < 5,
                    className: `px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 
                               disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                               ${filteredSpecimens.length >= 5 ? 'shadow-lg hover:shadow-xl' : ''}`
                }, `Start Focused Study (${filteredSpecimens.length} specimens)`)
            )
        );
        
        // Main render
        return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
            // Header
            React.createElement('div', { 
                className: 'bg-white border-b border-gray-200 px-4 py-4'
            },
                React.createElement('div', { className: 'max-w-6xl mx-auto flex items-center justify-between' },
                    React.createElement('div', { className: 'flex items-center space-x-4' },
                        React.createElement('button', {
                            onClick: onBack,
                            className: 'text-gray-600 hover:text-gray-800 text-lg'
                        }, '← Back'),
                        React.createElement('h1', { 
                            className: 'text-2xl font-bold text-gray-800'
                        }, '🎯 Focused Study Mode'),
                        React.createElement(window.Phase3Badge)
                    ),
                    
                    !studyStarted && React.createElement('button', {
                        onClick: () => setShowFilters(!showFilters),
                        className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                    }, showFilters ? 'Hide Filters' : 'Show Filters')
                )
            ),
            
            // Main content
            React.createElement('div', { className: 'max-w-6xl mx-auto p-6' },
                // Show filters or study interface
                !studyStarted && showFilters && renderFilters(),
                
                // Study interface (reuse QuickStudy with filtered specimens)
                studyStarted && window.QuickStudy && React.createElement(FocusedQuickStudy, {
                    specimens: filteredSpecimens.slice(0, 20), // Limit for performance
                    speciesHints,
                    referencePhotos,
                    specimenPhotos,
                    user,
                    loadSpecimenPhotos,
                    onBack: () => {
                        setStudyStarted(false);
                        setShowFilters(true);
                    }
                })
            )
        );
    };
    
    console.log('✅ FocusedStudy component loaded successfully');
    
})();