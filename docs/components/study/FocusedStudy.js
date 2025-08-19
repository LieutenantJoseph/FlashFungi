// FocusedStudy.js - Enhanced Focused Study Mode with Touch Gestures
// Flash Fungi - Targeted practice with filters, performance tracking, and mobile gestures

(function() {
    'use strict';
    
    const { useState, useEffect, useCallback, useMemo } = React;
    
    window.FocusedStudy = function FocusedStudy({ 
        specimens, 
        speciesHints, 
        referencePhotos, 
        specimenPhotos, 
        user, 
        loadSpecimenPhotos, 
        onBack,
        saveProgress 
    }) {
        // State
        const [filters, setFilters] = useState({
            family: 'all',
            genus: 'all',
            difficulty: 'all',
            features: [],
            dnAVerified: false
        });
        const [showFilters, setShowFilters] = useState(true);
        const [studyStarted, setStudyStarted] = useState(false);
        const [performanceData, setPerformanceData] = useState({});
        const [savedPresets, setSavedPresets] = useState([]);
        const [presetName, setPresetName] = useState('');
        const [showSavePreset, setShowSavePreset] = useState(false);
        const [gestureHint, setGestureHint] = useState(null);

        // Touch gesture integration - NEW FEATURE
        const gestureHandlers = window.useTouchGestures ? window.useTouchGestures({
            onSwipeLeft: () => {
                // Swipe left in filters = start study
                if (showFilters && filteredSpecimens.length >= 5) {
                    setStudyStarted(true);
                    setShowFilters(false);
                    showGestureHint('🎯 Starting focused study');
                }
            },
            onSwipeRight: () => {
                // Swipe right = go back to filters or main menu
                if (studyStarted) {
                    setStudyStarted(false);
                    setShowFilters(true);
                    showGestureHint('⚙️ Returned to filters');
                } else if (showFilters) {
                    onBack();
                    showGestureHint('🏠 Returned to home');
                }
            },
            onDoubleTap: () => {
                // Double tap = toggle filter panel
                if (!studyStarted) {
                    setShowFilters(!showFilters);
                    showGestureHint(showFilters ? '🔽 Hidden filters' : '🔼 Showing filters');
                }
            },
            disabled: studyStarted && !showFilters // Only disable when study is active
        }) : {};

        // Show gesture hint temporarily
        const showGestureHint = (message) => {
            setGestureHint(message);
            setTimeout(() => setGestureHint(null), 2000);
        };

        // Get unique values for filter options
        const filterOptions = useMemo(() => {
            const families = [...new Set(specimens.map(s => s.family).filter(Boolean))].sort();
            const genera = [...new Set(specimens.map(s => s.genus).filter(Boolean))].sort();
            
            return { families, genera };
        }, [specimens]);

        // Feature options for filtering
        const featureOptions = [
            { id: 'dna_verified', label: 'DNA Verified' },
            { id: 'has_rings', label: 'Has Ring' },
            { id: 'has_volva', label: 'Has Volva' },
            { id: 'toxic', label: 'Toxic Species' },
            { id: 'edible', label: 'Edible Species' },
            { id: 'high_quality', label: 'High Quality Photos' }
        ];

        // Filter specimens based on current filters
        const filteredSpecimens = useMemo(() => {
            let filtered = specimens.filter(s => s.status === 'approved');
            
            if (filters.family !== 'all') {
                filtered = filtered.filter(s => s.family === filters.family);
            }
            
            if (filters.genus !== 'all') {
                filtered = filtered.filter(s => s.genus === filters.genus);
            }
            
            if (filters.difficulty !== 'all') {
                const difficultyMap = {
                    'easy': (s) => s.quality_score >= 80,
                    'medium': (s) => s.quality_score >= 60 && s.quality_score < 80,
                    'hard': (s) => s.quality_score < 60
                };
                filtered = filtered.filter(difficultyMap[filters.difficulty]);
            }
            
            // Apply feature filters
            filters.features.forEach(feature => {
                switch (feature) {
                    case 'dna_verified':
                        filtered = filtered.filter(s => s.dna_verified);
                        break;
                    case 'has_rings':
                        filtered = filtered.filter(s => s.has_ring);
                        break;
                    case 'has_volva':
                        filtered = filtered.filter(s => s.has_volva);
                        break;
                    case 'toxic':
                        filtered = filtered.filter(s => s.toxic_status === 'toxic');
                        break;
                    case 'edible':
                        filtered = filtered.filter(s => s.edible_status === 'edible');
                        break;
                    case 'high_quality':
                        filtered = filtered.filter(s => s.quality_score >= 85);
                        break;
                }
            });
            
            return filtered;
        }, [specimens, filters]);

        // Load saved presets on mount
        useEffect(() => {
            if (user?.id) {
                loadSavedPresets();
            }
        }, [user]);

        const loadSavedPresets = async () => {
            try {
                const response = await fetch(`${window.SUPABASE_URL}/rest/v1/user_preferences?user_id=eq.${user.id}&select=saved_filters`, {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0 && data[0].saved_filters) {
                        setSavedPresets(data[0].saved_filters);
                    }
                }
            } catch (error) {
                console.error('Error loading saved presets:', error);
            }
        };

        const savePreset = async () => {
            if (!presetName.trim() || !user?.id) return;
            
            const newPreset = {
                name: presetName.trim(),
                filters: filters,
                created_at: new Date().toISOString()
            };
            
            const updatedPresets = [...savedPresets, newPreset];
            
            try {
                // Save to database
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
                        saved_filters: updatedPresets
                    })
                });
                
                if (response.ok) {
                    setSavedPresets(updatedPresets);
                    setPresetName('');
                    setShowSavePreset(false);
                    showGestureHint('💾 Preset saved');
                }
            } catch (error) {
                console.error('Error saving preset:', error);
            }
        };

        const loadPreset = (preset) => {
            setFilters(preset.filters);
            showGestureHint(`📁 Loaded preset: ${preset.name}`);
        };

        const deletePreset = async (index) => {
            const updatedPresets = savedPresets.filter((_, i) => i !== index);
            setSavedPresets(updatedPresets);
            
            if (user?.id) {
                try {
                    await fetch(`${window.SUPABASE_URL}/rest/v1/user_preferences?user_id=eq.${user.id}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            saved_filters: updatedPresets
                        })
                    });
                } catch (error) {
                    console.error('Error deleting preset:', error);
                }
            }
        };

        const toggleFeature = (featureId) => {
            setFilters(prev => ({
                ...prev,
                features: prev.features.includes(featureId) 
                    ? prev.features.filter(f => f !== featureId)
                    : [...prev.features, featureId]
            }));
        };

        // Performance tracking
        const updatePerformance = useCallback(async (category, correct) => {
            const key = `${category.type}:${category.value}`;
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
        
        // Custom QuickStudy wrapper with performance tracking and achievement integration
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
                    
                    // Trigger achievement check for focused study - NEW INTEGRATION
                    if (window.checkAchievements) {
                        window.checkAchievements('focused_study_complete', {
                            ...data,
                            filters: filters,
                            category: filters.genus !== 'all' ? filters.genus : filters.family
                        });
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
            React.createElement('div', { className: 'flex justify-between items-center mb-6' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-800' }, 
                    '⚙️ Study Filters'
                ),
                React.createElement('button', {
                    onClick: () => setShowSavePreset(!showSavePreset),
                    className: 'px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
                }, '💾 Save Preset')
            ),
            
            // Save preset panel
            showSavePreset && React.createElement('div', { className: 'mb-6 p-4 bg-blue-50 rounded-lg' },
                React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('input', {
                        type: 'text',
                        placeholder: 'Preset name...',
                        value: presetName,
                        onChange: (e) => setPresetName(e.target.value),
                        className: 'flex-1 px-3 py-2 border rounded'
                    }),
                    React.createElement('button', {
                        onClick: savePreset,
                        disabled: !presetName.trim(),
                        className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300'
                    }, 'Save'),
                    React.createElement('button', {
                        onClick: () => setShowSavePreset(false),
                        className: 'px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                    }, 'Cancel')
                )
            ),
            
            // Filter controls
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                // Family filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 
                        'Family'
                    ),
                    React.createElement('select', {
                        value: filters.family,
                        onChange: (e) => setFilters(prev => ({ ...prev, family: e.target.value })),
                        className: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    },
                        React.createElement('option', { value: 'all' }, 'All Families'),
                        filterOptions.families.map(family =>
                            React.createElement('option', { key: family, value: family }, family)
                        )
                    )
                ),
                
                // Genus filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 
                        'Genus'
                    ),
                    React.createElement('select', {
                        value: filters.genus,
                        onChange: (e) => setFilters(prev => ({ ...prev, genus: e.target.value })),
                        className: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    },
                        React.createElement('option', { value: 'all' }, 'All Genera'),
                        filterOptions.genera.map(genus =>
                            React.createElement('option', { key: genus, value: genus }, genus)
                        )
                    )
                ),
                
                // Difficulty filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 
                        'Difficulty'
                    ),
                    React.createElement('select', {
                        value: filters.difficulty,
                        onChange: (e) => setFilters(prev => ({ ...prev, difficulty: e.target.value })),
                        className: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    },
                        React.createElement('option', { value: 'all' }, 'All Difficulties'),
                        React.createElement('option', { value: 'easy' }, 'Easy (High quality photos)'),
                        React.createElement('option', { value: 'medium' }, 'Medium (Good quality photos)'),
                        React.createElement('option', { value: 'hard' }, 'Hard (Lower quality photos)')
                    )
                )
            ),
            
            // Features section
            React.createElement('div', { className: 'mt-6' },
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-3' }, 
                    'Features'
                ),
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
                            React.createElement('span', { className: 'text-sm text-gray-700' }, 
                                feature.label
                            )
                        )
                    )
                )
            ),
            
            // Saved presets
            savedPresets.length > 0 && React.createElement('div', { className: 'mt-6' },
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-3' }, 
                    'Saved Presets'
                ),
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
            
            // Results summary
            React.createElement('div', { className: 'mt-6 p-4 bg-gray-50 rounded-lg' },
                React.createElement('div', { className: 'flex justify-between items-center' },
                    React.createElement('span', { className: 'text-sm text-gray-600' },
                        `Found ${filteredSpecimens.length} specimens`
                    ),
                    filteredSpecimens.length >= 5 && React.createElement('button', {
                        onClick: () => {
                            setStudyStarted(true);
                            setShowFilters(false);
                        },
                        className: `px-6 py-2 text-white rounded-lg font-medium transition-all ${ 
                            filteredSpecimens.length >= 10 ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl' : 
                            'bg-yellow-600 hover:bg-yellow-700'
                        }`
                    }, `Start Focused Study (${filteredSpecimens.length} specimens)`)
                ),
                filteredSpecimens.length < 5 && React.createElement('p', { 
                    className: 'text-sm text-red-600 mt-2' 
                }, 'Need at least 5 specimens to start study')
            ),
            
            // Weak areas recommendations
            weakAreas.length > 0 && React.createElement('div', { className: 'mt-6 p-4 bg-orange-50 rounded-lg' },
                React.createElement('h3', { className: 'text-sm font-medium text-orange-800 mb-2' }, 
                    '📊 Areas for Improvement'
                ),
                React.createElement('div', { className: 'space-y-1' },
                    weakAreas.slice(0, 3).map(area =>
                        React.createElement('div', { 
                            key: area.area,
                            className: 'text-xs text-orange-700'
                        }, `${area.area}: ${area.accuracy}% accuracy`)
                    )
                )
            )
        );
        
        // Main render
        return React.createElement('div', { 
            className: 'min-h-screen bg-gray-50',
            ...gestureHandlers // Apply gesture handlers to main container
        },
            // Gesture feedback overlay - NEW FEATURE
            gestureHint && React.createElement('div', {
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '2rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    zIndex: 40,
                    animation: 'fadeIn 0.3s ease-in-out'
                }
            }, gestureHint),

            // Header
            React.createElement('div', { className: 'bg-white border-b border-gray-200 px-4 py-4' },
                React.createElement('div', { className: 'max-w-6xl mx-auto flex items-center justify-between' },
                    React.createElement('div', { className: 'flex items-center space-x-4' },
                        React.createElement('button', {
                            onClick: onBack,
                            className: 'text-gray-600 hover:text-gray-800 text-lg'
                        }, '← Back'),
                        React.createElement('h1', { className: 'text-2xl font-bold text-gray-800' }, 
                            '🎯 Focused Study Mode'
                        ),
                        React.createElement(window.Phase3Badge)
                    ),
                    
                    !studyStarted && React.createElement('div', { className: 'flex items-center space-x-3' },
                        // Mobile gesture instructions - NEW FEATURE
                        window.isMobileDevice && window.isMobileDevice() && React.createElement('div', {
                            className: 'hidden md:block text-xs text-gray-500'
                        }, '👆 Double tap: Toggle filters • 👈 Swipe: Start study'),
                        
                        React.createElement('button', {
                            onClick: () => setShowFilters(!showFilters),
                            className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                        }, showFilters ? 'Hide Filters' : 'Show Filters')
                    )
                )
            ),
            
            // Main content
            React.createElement('div', { className: 'max-w-6xl mx-auto p-6' },
                // Show filters or study interface
                !studyStarted && showFilters && renderFilters(),
                
                // Study interface (reuse enhanced QuickStudy with filtered specimens)
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
                    },
                    saveProgress // Pass through enhanced save progress
                })
            )
        );
    };
    
    console.log('✅ Enhanced FocusedStudy component with touch gestures loaded');
    
})();