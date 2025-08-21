// InteractiveSpeciesGuide.js - Interactive Species Guide Component with Photo Expansion
// Flash Fungi - Complete species identification guide with expandable photos

(function() {
    'use strict';
    
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
                        background: 'linear-gradient(to right, #059669, #10b981)',
                        color: 'white',
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                },
                    React.createElement('div', null,
                        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, 
                            '🍄 Interactive Species Guide'
                        ),
                        React.createElement('p', { style: { fontSize: '1.125rem', marginTop: '0.25rem' } },
                            specimen.species_name || 'Unknown Species'
                        )
                    ),
                    React.createElement('button', {
                        onClick: onClose,
                        style: {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '1.25rem'
                        }
                    }, '×')
                ),
                
                // Tabs
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                    }
                },
                    ['overview', 'photos', 'features', 'ecology', 'comparison'].map(tab =>
                        React.createElement('button', {
                            key: tab,
                            onClick: () => setActiveTab(tab),
                            style: {
                                padding: '1rem 1.5rem',
                                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                                borderBottom: activeTab === tab ? '2px solid #059669' : 'none',
                                color: activeTab === tab ? '#059669' : '#6b7280',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: activeTab === tab ? '600' : '400',
                                transition: 'all 0.2s'
                            }
                        }, tab)
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
                    activeTab === 'overview' && React.createElement('div', null,
                        React.createElement('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Species Overview'),
                        speciesHints?.comprehensive_description ?
                            React.createElement('div', {
                                style: {
                                    backgroundColor: '#f0fdf4',
                                    border: '1px solid #86efac',
                                    borderRadius: '0.5rem',
                                    padding: '1rem'
                                }
                            },
                                React.createElement('p', { style: { lineHeight: '1.6' } }, speciesHints.comprehensive_description)
                            ) :
                            React.createElement('div', null,
                                React.createElement('p', { style: { color: '#374151', marginBottom: '1rem' } },
                                    `${specimen.species_name} is a mushroom species found in ${specimen.location || 'Arizona'}.`
                                ),
                                React.createElement('div', { style: { marginTop: '1rem' } },
                                    React.createElement('p', null, React.createElement('strong', null, 'Found in: '), specimen.location),
                                    specimen.description && React.createElement('p', { style: { marginTop: '0.5rem' } }, 
                                        React.createElement('strong', null, 'Field Notes: '), specimen.description
                                    )
                                )
                            )
                    ),
                    
                    // Photos Tab with Expansion Feature
                    activeTab === 'photos' && React.createElement('div', null,
                        React.createElement('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Specimen Photos'),
                        adminPhotos.length > 0 ?
                            React.createElement('div', {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '1rem'
                                }
                            },
                                adminPhotos.map((photo, idx) =>
                                    React.createElement('div', {
                                        key: idx,
                                        style: {
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '0.5rem',
                                            overflow: 'hidden',
                                            border: '1px solid #e5e7eb',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                        },
                                        onMouseEnter: (e) => e.currentTarget.style.transform = 'scale(1.02)',
                                        onMouseLeave: (e) => e.currentTarget.style.transform = 'scale(1)',
                                        onClick: () => setExpandedPhoto(photo)
                                    },
                                        React.createElement('img', {
                                            src: photo.medium_url || photo.url,
                                            alt: `Photo ${idx + 1}`,
                                            style: {
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover'
                                            }
                                        }),
                                        photo.attribution && React.createElement('p', {
                                            style: {
                                                padding: '0.5rem',
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                textAlign: 'center'
                                            }
                                        }, `© ${photo.attribution}`)
                                    )
                                )
                            ) :
                            React.createElement('p', { style: { color: '#6b7280', textAlign: 'center', padding: '2rem' } },
                                'No photos available for this specimen'
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
                    ),
                    
                    // Comparison Tab
                    activeTab === 'comparison' && React.createElement('div', null,
                        React.createElement('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Similar Species'),
                        hints.filter(h => h.type === 'comparative').length > 0 ?
                            hints.filter(h => h.type === 'comparative').map((hint, idx) =>
                                React.createElement('div', {
                                    key: idx,
                                    style: {
                                        backgroundColor: '#fef3c7',
                                        border: '1px solid #fcd34d',
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        marginBottom: '1rem'
                                    }
                                },
                                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                        React.createElement('span', null, '⚠️'),
                                        React.createElement('strong', { style: { color: '#d97706' } }, 'Look-Alike Warning')
                                    ),
                                    React.createElement('p', { style: { color: '#374151' } }, hint.text)
                                )
                            ) :
                            React.createElement('p', { style: { color: '#6b7280' } }, 
                                'Comparison data with similar species will be added as the database expands.'
                            )
                    )
                ),
                
                // Footer with single "Got It!" button
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
                        zIndex: 200,
                        cursor: 'pointer'
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
    
    console.log('✅ InteractiveSpeciesGuide component updated with photo expansion and single button');
    
})();