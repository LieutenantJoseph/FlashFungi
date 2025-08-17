// Flash Fungi - Interactive Species Guide Component
// Detailed species information modal with multiple tabs

window.InteractiveSpeciesGuide = function InteractiveSpeciesGuide({ 
    specimen, 
    speciesHints, 
    photos, 
    referencePhotos, 
    onClose, 
    onTryAgain 
}) {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [comparisonMode, setComparisonMode] = React.useState(false);
    
    const h = React.createElement;
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

    return h('div', {
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
        h('div', {
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
            h('div', {
                style: {
                    background: 'linear-gradient(to right, #059669, #047857)',
                    color: 'white',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb'
                }
            },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' } },
                    h('div', null,
                        h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                            '📚 Interactive Species Guide'
                        ),
                        h('h3', { style: { fontSize: '1.25rem', marginBottom: '0.25rem' } }, specimen.species_name),
                        specimen.common_name && h('p', { style: { opacity: 0.9 } }, specimen.common_name)
                    ),
                    h('button', {
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
            h('div', {
                style: {
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0 1.5rem'
                }
            },
                h('div', { style: { display: 'flex', gap: '2rem' } },
                    ['overview', 'comparison', 'features', 'ecology'].map(tab =>
                        h('button', {
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
                        }, tab === 'comparison' ? '🔍 Photo Comparison' : tab)
                    )
                )
            ),
            
            // Content
            h('div', {
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem'
                }
            },
                // Overview Tab
                activeTab === 'overview' && h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                    h('div', null,
                        h('h4', { style: { fontWeight: '600', marginBottom: '0.5rem' } }, 'Classification'),
                        h('div', { style: { backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' } },
                            h('p', null, h('strong', null, 'Species: '), h('em', null, specimen.species_name)),
                            h('p', null, h('strong', null, 'Genus: '), specimen.genus),
                            h('p', null, h('strong', null, 'Family: '), specimen.family),
                            specimen.common_name && h('p', null, h('strong', null, 'Common: '), specimen.common_name)
                        ),
                        
                        h('h4', { style: { fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' } }, 'Location & Context'),
                        h('div', { style: { backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' } },
                            h('p', null, h('strong', null, 'Location: '), specimen.location),
                            specimen.description && h('p', null, h('strong', null, 'Notes: '), specimen.description)
                        )
                    ),
                    
                    // Reference Photos
                    h('div', null,
                        h('h4', { style: { fontWeight: '600', marginBottom: '0.5rem' } }, '📸 Reference Photos'),
                        adminPhotos.length > 0 ? 
                            h('div', null,
                                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                    adminPhotos.slice(0, 4).map((photo, idx) =>
                                        h('img', {
                                            key: idx,
                                            src: photo.medium_url || photo.url,
                                            alt: `Reference ${idx + 1}`,
                                            style: {
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer'
                                            }
                                        })
                                    )
                                ),
                                h('p', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280', 
                                        marginTop: '0.5rem',
                                        fontStyle: 'italic'
                                    } 
                                }, 'Admin-curated reference images for accurate identification')
                            ) :
                            h('div', { style: { backgroundColor: '#f3f4f6', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' } },
                                h('p', { style: { color: '#6b7280' } }, 'No reference photos available')
                            )
                    )
                ),
                
                // Photo Comparison Tab
                activeTab === 'comparison' && h('div', null,
                    h('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 
                        'Side-by-Side Comparison: Your Specimen vs. Reference'
                    ),
                    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                        // Your Specimen Photos
                        h('div', null,
                            h('h5', { 
                                style: { 
                                    fontWeight: '500', 
                                    marginBottom: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '0.25rem'
                                } 
                            }, '🔎 Your Specimen'),
                            photos.length > 0 ?
                                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                    photos.slice(0, 4).map((photo, idx) =>
                                        h('div', { key: idx, style: { position: 'relative' } },
                                            h('img', {
                                                src: photo.medium_url,
                                                alt: `Your specimen ${idx + 1}`,
                                                style: {
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '0.5rem',
                                                    border: '2px solid #fbbf24'
                                                }
                                            }),
                                            h('span', {
                                                style: {
                                                    position: 'absolute',
                                                    top: '0.25rem',
                                                    left: '0.25rem',
                                                    backgroundColor: '#fbbf24',
                                                    color: 'white',
                                                    fontSize: '0.625rem',
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: '0.25rem'
                                                }
                                            }, 'Your Photo')
                                        )
                                    )
                                ) :
                                h('p', { style: { color: '#6b7280' } }, 'No specimen photos')
                        ),
                        
                        // Reference Photos
                        h('div', null,
                            h('h5', { 
                                style: { 
                                    fontWeight: '500', 
                                    marginBottom: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: '#dcfce7',
                                    borderRadius: '0.25rem'
                                } 
                            }, '✅ Correct Identification'),
                            adminPhotos.length > 0 ?
                                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                    adminPhotos.slice(0, 4).map((photo, idx) =>
                                        h('div', { key: idx, style: { position: 'relative' } },
                                            h('img', {
                                                src: photo.medium_url || photo.url,
                                                alt: `Reference ${idx + 1}`,
                                                style: {
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '0.5rem',
                                                    border: '2px solid #10b981'
                                                }
                                            }),
                                            h('span', {
                                                style: {
                                                    position: 'absolute',
                                                    top: '0.25rem',
                                                    left: '0.25rem',
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    fontSize: '0.625rem',
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: '0.25rem'
                                                }
                                            }, 'Reference')
                                        )
                                    )
                                ) :
                                h('p', { style: { color: '#6b7280' } }, 'No reference photos')
                        )
                    ),
                    h('div', {
                        style: {
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                        }
                    },
                        h('p', { style: { marginBottom: '0.5rem' } },
                            h('strong', null, '💡 Comparison Tip: '),
                            'Look for key differences in cap shape, gill attachment, stem features, and overall coloration.'
                        ),
                        hints.filter(h => h.type === 'comparative').length > 0 &&
                            h('p', { style: { color: '#0369a1' } },
                                hints.find(h => h.type === 'comparative')?.text
                            )
                    )
                ),
                
                // Features Tab
                activeTab === 'features' && h('div', null,
                    h('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Diagnostic Features'),
                    hints.filter(h => h.type === 'morphological').length > 0 ?
                        hints.filter(h => h.type === 'morphological').map((hint, idx) =>
                            h('div', {
                                key: idx,
                                style: {
                                    backgroundColor: '#f0fdf4',
                                    border: '1px solid #86efac',
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    marginBottom: '1rem'
                                }
                            },
                                h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                    h('span', null, '🔍'),
                                    h('strong', { style: { color: '#059669' } }, 'Physical Characteristics')
                                ),
                                h('p', { style: { color: '#374151' } }, hint.text)
                            )
                        ) :
                        h('p', { style: { color: '#6b7280' } }, 
                            'Detailed morphological features will be added as more data becomes available.'
                        )
                ),
                
                // Ecology Tab
                activeTab === 'ecology' && h('div', null,
                    h('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Ecological Information'),
                    hints.filter(h => h.type === 'ecological').length > 0 ?
                        hints.filter(h => h.type === 'ecological').map((hint, idx) =>
                            h('div', {
                                key: idx,
                                style: {
                                    backgroundColor: '#f0fdf4',
                                    border: '1px solid #86efac',
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    marginBottom: '1rem'
                                }
                            },
                                h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                    h('span', null, '🌲'),
                                    h('strong', { style: { color: '#059669' } }, 'Habitat & Ecology')
                                ),
                                h('p', { style: { color: '#374151' } }, hint.text)
                            )
                        ) :
                        h('div', null,
                            h('p', { style: { color: '#6b7280' } }, 
                                'Ecological data will be added as the database grows.'
                            ),
                            h('div', { style: { marginTop: '1rem' } },
                                h('p', null, h('strong', null, 'Found in: '), specimen.location),
                                specimen.description && h('p', { style: { marginTop: '0.5rem' } }, 
                                    h('strong', null, 'Field Notes: '), specimen.description
                                )
                            )
                        )
                )
            ),
            
            // Footer
            h('div', {
                style: {
                    padding: '1.5rem',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            },
                h('p', { style: { color: '#6b7280', fontSize: '0.875rem' } },
                    'Use this guide to learn the key identification features'
                ),
                h('div', { style: { display: 'flex', gap: '0.5rem' } },
                    h('button', {
                        onClick: onTryAgain,
                        style: {
                            padding: '0.5rem 1.5rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }
                    }, 'Try Another Species'),
                    h('button', {
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
                )
            )
        )
    );
};

console.log('✅ InteractiveSpeciesGuide component loaded');