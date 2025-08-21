// InteractiveSpeciesGuide.js - Interactive Species Guide Component
// Flash Fungi - Complete species identification guide with tabs

(function() {
    'use strict';
    
    window.InteractiveSpeciesGuide = function InteractiveSpeciesGuide({ specimen, speciesHints, photos, referencePhotos, onClose, onTryAgain }) {
        const [activeTab, setActiveTab] = React.useState('overview');
        const [comparisonMode, setComparisonMode] = React.useState(false);
        const [expandedPhoto, setExpandedPhoto] = React.useState(null); // Added for photo expansion
        
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
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 100
            }
        },
            React.createElement('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    maxWidth: '64rem',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }
            },
                // Header
                React.createElement('div', {
                    style: {
                        background: 'linear-gradient(to right, #059669, #047857)',
                        color: 'white',
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb'
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
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }
                        }, '×')
                    )
                ),
                
                // Tabs
                React.createElement('div', {
                    style: {
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
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
                                    color: activeTab === tab ? '#059669' : '#6b7280',
                                    borderBottom: activeTab === tab ? '2px solid #059669' : 'none',
                                    cursor: 'pointer'
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
                        padding: '1.5rem'
                    }
                },
                    // Overview Tab
                    activeTab === 'overview' && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                        React.createElement('div', null,
                            React.createElement('h4', { style: { fontWeight: '600', marginBottom: '0.5rem' } }, 'Classification'),
                            React.createElement('div', { style: { backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' } },
                                React.createElement('p', null, React.createElement('strong', null, 'Species: '), React.createElement('em', null, specimen.species_name)),
                                React.createElement('p', null, React.createElement('strong', null, 'Genus: '), specimen.genus),
                                React.createElement('p', null, React.createElement('strong', null, 'Family: '), specimen.family),
                                specimen.common_name && React.createElement('p', null, React.createElement('strong', null, 'Common: '), specimen.common_name)
                            ),
                            
                            React.createElement('h4', { style: { fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' } }, 'Location & Context'),
                            React.createElement('div', { style: { backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' } },
                                React.createElement('p', null, React.createElement('strong', null, 'Location: '), specimen.location),
                                specimen.description && React.createElement('p', null, React.createElement('strong', null, 'Notes: '), specimen.description)
                            )
                        ),
                        
                        // Reference Photos
                        React.createElement('div', null,
                            React.createElement('h4', { style: { fontWeight: '600', marginBottom: '0.5rem' } }, '📸 Reference Photos'),
                            adminPhotos.length > 0 ?
                                React.createElement('div', null,
                                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
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
                                                    cursor: 'pointer'
                                                },
                                                onClick: () => setExpandedPhoto(photo) // Added click handler
                                            })
                                        )
                                    ),
                                    React.createElement('p', { 
                                        style: { 
                                            fontSize: '0.75rem', 
                                            color: '#6b7280', 
                                            marginTop: '0.5rem',
                                            fontStyle: 'italic'
                                        } 
                                    }, 'Admin-curated reference images for accurate identification')
                                ) :
                                React.createElement('div', { style: { backgroundColor: '#f3f4f6', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' } },
                                    React.createElement('p', { style: { color: '#6b7280' } }, 'No reference photos available')
                                )
                        )
                    ),
                    
                    // Photo Comparison Tab
                    activeTab === 'comparison' && React.createElement('div', null,
                        React.createElement('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 
                            'Side-by-Side Comparison: Your Specimen vs. Reference'
                        ),
                        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                            // Your Specimen Photos
                            React.createElement('div', null,
                                React.createElement('h5', { 
                                    style: { 
                                        fontWeight: '500', 
                                        marginBottom: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#fef3c7',
                                        borderRadius: '0.25rem'
                                    } 
                                }, '🔬 Your Specimen'),
                                photos.length > 0 ?
                                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                        photos.slice(0, 4).map((photo, idx) =>
                                            React.createElement('img', {
                                                key: idx,
                                                src: photo.medium_url || photo.url,
                                                alt: `Specimen ${idx + 1}`,
                                                style: {
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    borderRadius: '0.25rem',
                                                    border: '2px solid #fbbf24',
                                                    cursor: 'pointer'
                                                },
                                                onClick: () => setExpandedPhoto(photo) // Added click handler
                                            })
                                        )
                                    ) :
                                    React.createElement('p', { style: { color: '#6b7280' } }, 'No specimen photos')
                            ),
                            
                            // Reference Photos
                            React.createElement('div', null,
                                React.createElement('h5', { 
                                    style: { 
                                        fontWeight: '500', 
                                        marginBottom: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#dcfce7',
                                        borderRadius: '0.25rem'
                                    } 
                                }, '✅ Reference Photos'),
                                adminPhotos.length > 0 ?
                                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                        adminPhotos.slice(0, 4).map((photo, idx) =>
                                            React.createElement('img', {
                                                key: idx,
                                                src: photo.medium_url || photo.url,
                                                alt: `Reference ${idx + 1}`,
                                                style: {
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    borderRadius: '0.25rem',
                                                    border: '2px solid #22c55e',
                                                    cursor: 'pointer'
                                                },
                                                onClick: () => setExpandedPhoto(photo) // Added click handler
                                            })
                                        )
                                    ) :
                                    React.createElement('p', { style: { color: '#6b7280' } }, 'No reference photos')
                            )
                        ),
                        React.createElement('div', {
                            style: {
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                            }
                        },
                            React.createElement('p', { style: { marginBottom: '0.5rem' } },
                                React.createElement('strong', null, '💡 Comparison Tip: '),
                                'Look for key differences in cap shape, gill attachment, stem features, and overall coloration.'
                            ),
                            hints.filter(h => h.type === 'comparative').length > 0 &&
                                React.createElement('p', { style: { color: '#0369a1' } },
                                    hints.find(h => h.type === 'comparative')?.text
                                )
                        )
                    ),
                    
                    // Features Tab
                    activeTab === 'features' && React.createElement('div', null,
                        React.createElement('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Diagnostic Features'),
                        hints.filter(h => h.type === 'morphological').length > 0 ?
                            hints.filter(h => h.type === 'morphological').map((hint, idx) =>
                                React.createElement('div', {
                                    key: idx,
                                    style: {
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        marginBottom: '1rem'
                                    }
                                },
                                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                        React.createElement('span', null, '🔬'),
                                        React.createElement('strong', { style: { color: '#059669' } }, 'Physical Characteristics')
                                    ),
                                    React.createElement('p', { style: { color: '#374151' } }, hint.text)
                                )
                            ) :
                            React.createElement('p', { style: { color: '#6b7280' } }, 
                                'Detailed morphological features will be added as more data becomes available.'
                            )
                    ),
                    
                    // Ecology Tab
                    activeTab === 'ecology' && React.createElement('div', null,
                        React.createElement('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Ecological Information'),
                        hints.filter(h => h.type === 'ecological').length > 0 ?
                            hints.filter(h => h.type === 'ecological').map((hint, idx) =>
                                React.createElement('div', {
                                    key: idx,
                                    style: {
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        marginBottom: '1rem'
                                    }
                                },
                                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                        React.createElement('span', null, '🌲'),
                                        React.createElement('strong', { style: { color: '#059669' } }, 'Habitat & Ecology')
                                    ),
                                    React.createElement('p', { style: { color: '#374151' } }, hint.text)
                                )
                            ) :
                            React.createElement('div', null,
                                React.createElement('p', { style: { color: '#6b7280' } }, 
                                    'Ecological data will be added as the database grows.'
                                ),
                                React.createElement('div', { style: { marginTop: '1rem' } },
                                    React.createElement('p', null, React.createElement('strong', null, 'Found in: '), specimen.location),
                                    specimen.description && React.createElement('p', { style: { marginTop: '0.5rem' } }, 
                                        React.createElement('strong', null, 'Field Notes: '), specimen.description
                                    )
                                )
                            )
                    )
                ),
                
                // Footer - Changed to single button
                React.createElement('div', {
                    style: {
                        padding: '1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                },
                    React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem' } },
                        'Use this guide to learn the key identification features'
                    ),
                    React.createElement('button', {
                        onClick: onClose,
                        style: {
                            padding: '0.5rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }
                    }, 'Got It!')
                ),
                
                // Photo Expansion Modal
                expandedPhoto && React.createElement('div', {
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
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
                                objectFit: 'contain'
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
                                justifyContent: 'center'
                            }
                        }, '×')
                    )
                )
            )
        );
    };
    
    console.log('✅ InteractiveSpeciesGuide component loaded successfully');
    
})();