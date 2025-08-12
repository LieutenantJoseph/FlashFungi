// Enhanced Arizona Mushroom Study App - Phase 1 Complete
console.log('🔥 app.js executing - Phase 1 Complete version');

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';

// Helper function to create elements
const h = React.createElement;

// Loading Screen Component
function LoadingScreen() {
    return h('div', {
        style: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
        h('div', { style: { textAlign: 'center' } },
            h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
            h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' } }, 'Arizona Mushroom Study'),
            h('p', { style: { color: '#6b7280' } }, 'Loading specimens...')
        )
    );
}

// Interactive Species Guide Component (New for Phase 1)
function InteractiveSpeciesGuide({ specimen, speciesHints, photos, onClose, onTryAgain }) {
    const [activeTab, setActiveTab] = React.useState('overview');
    
    // Parse hints if they exist
    const hints = speciesHints?.hints || [];
    
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
                maxWidth: '56rem',
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
                    ['overview', 'features', 'ecology', 'comparison'].map(tab =>
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
                        }, tab)
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
                        
                        h('h4', { style: { fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' } }, 'Location & Habitat'),
                        h('div', { style: { backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' } },
                            h('p', null, h('strong', null, 'Location: '), specimen.location),
                            specimen.description && h('p', null, h('strong', null, 'Notes: '), specimen.description)
                        )
                    ),
                    
                    // Photos section
                    h('div', null,
                        h('h4', { style: { fontWeight: '600', marginBottom: '0.5rem' } }, 'Reference Photos'),
                        photos.length > 0 ? 
                            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                photos.slice(0, 4).map((photo, idx) =>
                                    h('img', {
                                        key: idx,
                                        src: photo.medium_url,
                                        alt: `Reference ${idx + 1}`,
                                        style: {
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '0.5rem'
                                        }
                                    })
                                )
                            ) :
                            h('div', { style: { backgroundColor: '#f3f4f6', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' } },
                                h('p', { style: { color: '#6b7280' } }, 'No photos available')
                            )
                    )
                ),
                
                // Features Tab
                activeTab === 'features' && h('div', null,
                    h('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Diagnostic Features'),
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
                    ),
                    hints.length === 0 && h('p', { style: { color: '#6b7280' } }, 
                        'Detailed morphological features will be added as more data becomes available.'
                    )
                ),
                
                // Ecology Tab
                activeTab === 'ecology' && h('div', null,
                    h('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Ecological Information'),
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
                    ),
                    h('div', { style: { marginTop: '1rem' } },
                        h('p', null, h('strong', null, 'Found in: '), specimen.location),
                        specimen.description && h('p', { style: { marginTop: '0.5rem' } }, 
                            h('strong', null, 'Field Notes: '), specimen.description
                        )
                    )
                ),
                
                // Comparison Tab
                activeTab === 'comparison' && h('div', null,
                    h('h4', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Similar Species & Comparisons'),
                    hints.filter(h => h.type === 'comparative').map((hint, idx) =>
                        h('div', {
                            key: idx,
                            style: {
                                backgroundColor: '#fef3c7',
                                border: '1px solid #fde047',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }
                        },
                            h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                h('span', null, '⚖️'),
                                h('strong', { style: { color: '#a16207' } }, 'Distinguishing Features')
                            ),
                            h('p', { style: { color: '#374151' } }, hint.text)
                        )
                    ),
                    hints.length === 0 && h('p', { style: { color: '#6b7280' } }, 
                        'Comparison data will be added as the database grows.'
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
}

// Enhanced Quick Study Component with Progressive Hints (Phase 1 Complete)
function QuickStudy(props) {
    const specimens = props.specimens || [];
    const speciesHints = props.speciesHints || {};
    const onBack = props.onBack;
    const loadSpecimenPhotos = props.loadSpecimenPhotos;
    const specimenPhotos = props.specimenPhotos || {};
    
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [userAnswer, setUserAnswer] = React.useState('');
    const [currentHintLevel, setCurrentHintLevel] = React.useState(0);
    const [attemptCount, setAttemptCount] = React.useState(0);
    const [showResult, setShowResult] = React.useState(false);
    const [showGuide, setShowGuide] = React.useState(false);
    const [score, setScore] = React.useState({ correct: 0, total: 0 });
    const [lastAttemptFeedback, setLastAttemptFeedback] = React.useState(null);
    const [photosLoaded, setPhotosLoaded] = React.useState(false);
    const [selectedPhoto, setSelectedPhoto] = React.useState(null);

    // Get 10 random approved specimens for study
    const studySpecimens = React.useMemo(() => {
        const approved = specimens.filter(s => s.status === 'approved');
        const shuffled = [...approved].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(10, approved.length));
    }, [specimens]);

    const currentSpecimen = studySpecimens[currentIndex];
    const currentPhotos = currentSpecimen ? specimenPhotos[currentSpecimen.inaturalist_id] || [] : [];
    const currentSpeciesHints = currentSpecimen ? speciesHints[currentSpecimen.species_name] : null;

    // Load photos when specimen changes
    React.useEffect(() => {
        if (currentSpecimen && !specimenPhotos[currentSpecimen.inaturalist_id]) {
            setPhotosLoaded(false);
            loadSpecimenPhotos(currentSpecimen.inaturalist_id).then(() => {
                setPhotosLoaded(true);
            });
        } else {
            setPhotosLoaded(true);
        }
    }, [currentSpecimen, loadSpecimenPhotos, specimenPhotos]);

    // Get hints from database or generate fallback
    const getHints = React.useCallback(() => {
        if (currentSpeciesHints && currentSpeciesHints.hints) {
            return currentSpeciesHints.hints;
        }
        
        // Fallback hints if none in database
        return [
            {
                type: 'morphological',
                level: 1,
                text: `Look at the physical features of this ${currentSpecimen?.family || 'mushroom'} specimen - cap shape, gill structure, and stem characteristics.`
            },
            {
                type: 'comparative',
                level: 2,
                text: `Compare this to other ${currentSpecimen?.genus || 'similar'} species by examining distinguishing features.`
            },
            {
                type: 'ecological',
                level: 3,
                text: `Consider the habitat: ${currentSpecimen?.location || 'Arizona'}. Note the substrate and environmental conditions.`
            },
            {
                type: 'taxonomic',
                level: 4,
                text: `This belongs to genus ${currentSpecimen?.genus || '[Unknown]'} in family ${currentSpecimen?.family || '[Unknown]'}.`
            }
        ];
    }, [currentSpeciesHints, currentSpecimen]);

    const hints = getHints();

    // Check if answer is correct
    const checkAnswer = (answer) => {
        if (!answer || !currentSpecimen) return { isCorrect: false, feedback: '' };
        
        const cleaned = answer.toLowerCase().trim();
        const species = currentSpecimen.species_name.toLowerCase();
        const genus = currentSpecimen.genus.toLowerCase();
        const common = (currentSpecimen.common_name || '').toLowerCase();
        
        if (cleaned === species || species.includes(cleaned) || cleaned.includes(species)) {
            return { isCorrect: true, feedback: 'Perfect! Complete species identification!' };
        }
        
        if (common && cleaned === common) {
            return { isCorrect: true, feedback: 'Correct! You identified it by common name!' };
        }
        
        if (cleaned === genus || cleaned.includes(genus)) {
            return { isCorrect: false, feedback: `Good! You got the genus "${currentSpecimen.genus}" correct. Can you get the full species?` };
        }
        
        return { isCorrect: false, feedback: 'Not quite. Try again with the hint!' };
    };

    // Handle answer submission
    const handleSubmitAnswer = () => {
        if (!userAnswer.trim()) return;
        
        const result = checkAnswer(userAnswer);
        setAttemptCount(prev => prev + 1);
        setLastAttemptFeedback(result.feedback);
        
        if (result.isCorrect) {
            // Correct answer
            setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
            setShowResult(true);
        } else {
            // Wrong answer - show next hint
            if (currentHintLevel < 4) {
                setCurrentHintLevel(prev => prev + 1);
                setUserAnswer(''); // Clear for retry
            } else {
                // All hints exhausted - show guide
                setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
                setShowGuide(true);
            }
        }
    };

    // Handle "I Don't Know" button
    const handleIDontKnow = () => {
        setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
        setShowGuide(true);
    };

    // Move to next question
    const handleNext = () => {
        if (currentIndex < studySpecimens.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setCurrentHintLevel(0);
            setAttemptCount(0);
            setShowResult(false);
            setShowGuide(false);
            setLastAttemptFeedback(null);
            setSelectedPhoto(null);
        } else {
            // Study complete
            const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
            alert(`Study Complete!\n\n✅ Correct: ${score.correct}/${score.total} (${accuracy}%)\n\nGreat job!`);
            onBack();
        }
    };

    if (!currentSpecimen) {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h2', null, 'No specimens available for study'),
            h('button', { onClick: onBack }, 'Back to Home')
        );
    }

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header
        h('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        h('button', { onClick: onBack, style: { background: 'none', border: 'none', cursor: 'pointer' } }, '← Back'),
                        h('div', null,
                            h('h1', { style: { fontSize: '1.25rem', fontWeight: 'bold' } }, 'Quick Study'),
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                                `Question ${currentIndex + 1} of ${studySpecimens.length}`
                            )
                        )
                    ),
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        h('div', { style: { textAlign: 'center' } },
                            h('div', { style: { fontSize: '1.125rem', fontWeight: 'bold' } },
                                `${score.correct}/${score.total}`
                            ),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Score')
                        ),
                        currentSpecimen.dna_sequenced && h('span', {
                            style: {
                                backgroundColor: '#f3e8ff',
                                color: '#7c3aed',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem'
                            }
                        }, '🧬 DNA')
                    )
                ),
                // Progress bar
                h('div', { style: { marginTop: '0.5rem', backgroundColor: '#e5e7eb', height: '0.25rem', borderRadius: '9999px' } },
                    h('div', {
                        style: {
                            width: `${((currentIndex + 1) / studySpecimens.length) * 100}%`,
                            height: '100%',
                            backgroundColor: '#10b981',
                            borderRadius: '9999px',
                            transition: 'width 0.3s'
                        }
                    })
                )
            )
        ),

        // Main Content
        h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                // Left: Photos
                h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' } },
                    h('h3', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Specimen Photos'),
                    
                    // Specimen info
                    h('div', { style: { marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' } },
                        h('p', { style: { fontSize: '0.875rem' } },
                            h('strong', null, 'Location: '), currentSpecimen.location
                        ),
                        currentSpecimen.description && h('p', { style: { fontSize: '0.875rem', marginTop: '0.25rem' } },
                            h('strong', null, 'Notes: '), currentSpecimen.description.substring(0, 100) + '...'
                        )
                    ),
                    
                    // Photos grid
                    !photosLoaded ? 
                        h('div', { style: { textAlign: 'center', padding: '2rem' } }, 'Loading photos...') :
                    currentPhotos.length > 0 ?
                        h('div', null,
                            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' } },
                                currentPhotos.slice(0, 4).map((photo, idx) =>
                                    h('img', {
                                        key: idx,
                                        src: photo.medium_url,
                                        alt: `Photo ${idx + 1}`,
                                        onClick: () => setSelectedPhoto(photo),
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
                            h('p', { style: { fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' } },
                                'Click any photo to enlarge'
                            )
                        ) :
                        h('div', { style: { textAlign: 'center', padding: '2rem' } }, 'No photos available')
                ),

                // Right: Answer Interface
                h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' } },
                    h('h3', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Identify This Mushroom'),
                    
                    // Show progressive hints if wrong answer
                    currentHintLevel > 0 && !showResult && !showGuide && h('div', {
                        style: {
                            backgroundColor: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }
                    },
                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } },
                            h('h4', { style: { fontWeight: '500', color: '#92400e' } }, 
                                `💡 Hint ${currentHintLevel} of 4`
                            ),
                            h('span', { style: { fontSize: '0.75rem', color: '#92400e' } }, 
                                `Attempt ${attemptCount}`
                            )
                        ),
                        
                        // Show only current hint
                        hints.slice(0, currentHintLevel).map((hint, idx) => {
                            const isLatest = idx === currentHintLevel - 1;
                            return h('div', {
                                key: idx,
                                style: {
                                    marginBottom: idx < currentHintLevel - 1 ? '0.5rem' : 0,
                                    padding: '0.5rem',
                                    backgroundColor: isLatest ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                                    borderRadius: '0.25rem',
                                    opacity: isLatest ? 1 : 0.7
                                }
                            },
                                h('p', { style: { fontSize: '0.875rem', color: '#374151', margin: 0 } }, 
                                    `${idx + 1}. ${hint.text}`
                                )
                            );
                        }),
                        
                        lastAttemptFeedback && h('div', {
                            style: {
                                marginTop: '0.75rem',
                                padding: '0.5rem',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem'
                            }
                        }, lastAttemptFeedback)
                    ),
                    
                    // Answer input or result
                    !showResult && !showGuide ? h('div', null,
                        h('div', { style: { marginBottom: '1rem' } },
                            h('input', {
                                type: 'text',
                                value: userAnswer,
                                onChange: (e) => setUserAnswer(e.target.value),
                                onKeyPress: (e) => e.key === 'Enter' && handleSubmitAnswer(),
                                placeholder: 'Enter species name (e.g., Agaricus campestris)',
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box'
                                }
                            })
                        ),
                        
                        h('div', { style: { display: 'flex', gap: '0.5rem' } },
                            h('button', {
                                onClick: handleSubmitAnswer,
                                disabled: !userAnswer.trim(),
                                style: {
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: userAnswer.trim() ? '#10b981' : '#d1d5db',
                                    color: 'white',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                                    fontWeight: '500'
                                }
                            }, currentHintLevel > 0 ? 'Try Again' : 'Submit Answer'),
                            
                            h('button', {
                                onClick: handleIDontKnow,
                                style: {
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, "I Don't Know")
                        )
                    ) : showResult ? h('div', null,
                        // Correct answer display
                        h('div', {
                            style: {
                                padding: '1rem',
                                backgroundColor: '#f0fdf4',
                                border: '2px solid #10b981',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem'
                            }
                        },
                            h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                h('span', { style: { fontSize: '1.5rem' } }, '✅'),
                                h('strong', { style: { color: '#065f46' } }, lastAttemptFeedback || 'Correct!')
                            ),
                            h('p', null, h('strong', null, 'Species: '), h('em', null, currentSpecimen.species_name)),
                            currentSpecimen.common_name && h('p', null, h('strong', null, 'Common: '), currentSpecimen.common_name),
                            h('p', null, h('strong', null, 'Family: '), currentSpecimen.family),
                            attemptCount > 1 && h('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' } },
                                `Solved in ${attemptCount} attempts with ${currentHintLevel} hints`
                            )
                        ),
                        
                        h('button', {
                            onClick: handleNext,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }
                        }, currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 'Finish Study')
                    ) : null
                )
            )
        ),

        // Interactive Species Guide Modal
        showGuide && h(InteractiveSpeciesGuide, {
            specimen: currentSpecimen,
            speciesHints: currentSpeciesHints,
            photos: currentPhotos,
            onClose: () => {
                setShowGuide(false);
                handleNext();
            },
            onTryAgain: () => {
                setShowGuide(false);
                handleNext();
            }
        }),

        // Photo enlargement modal
        selectedPhoto && h('div', {
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
                zIndex: 50
            },
            onClick: () => setSelectedPhoto(null)
        },
            h('img', {
                src: selectedPhoto.large_url || selectedPhoto.medium_url,
                alt: 'Enlarged photo',
                style: {
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain'
                }
            })
        )
    );
}

// Home Page Component
function HomePage(props) {
    const specimens = props.specimens || [];
    const user = props.user || { name: 'Guest' };
    const onStudyModeSelect = props.onStudyModeSelect;
    
    const approvedCount = specimens.filter(s => s.status === 'approved').length;
    const dnaCount = specimens.filter(s => s.dna_sequenced).length;

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header
        h('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                h('div', { style: { textAlign: 'center' } },
                    h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                    h('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold' } }, 'Arizona Mushroom Study'),
                    h('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                )
            )
        ),

        // Main content
        h('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
            // Stats banner
            h('div', {
                style: {
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }
            },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                    `Welcome, ${user.name}! 🍄`
                ),
                h('p', { style: { marginBottom: '1rem' } }, 'Choose your study mode below'),
                h('div', { style: { display: 'flex', gap: '1rem' } },
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `📊 ${specimens.length} Total`
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `✅ ${approvedCount} Approved`
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `🧬 ${dnaCount} DNA Verified`
                    )
                )
            ),

            // Study modes
            approvedCount > 0 ? h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' } },
                // Quick Study
                h('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer'
                    },
                    onClick: () => onStudyModeSelect('quick-study')
                },
                    h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '⚡'),
                    h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Quick Study'),
                    h('p', { style: { color: '#6b7280' } }, '10 questions with progressive hints')
                ),

                // Focused Study (disabled for now)
                h('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        opacity: 0.5,
                        cursor: 'not-allowed'
                    }
                },
                    h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎯'),
                    h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Focused Study'),
                    h('p', { style: { color: '#6b7280' } }, 'Coming in Phase 2')
                ),

                // Marathon Mode (disabled for now)
                h('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        opacity: 0.5,
                        cursor: 'not-allowed'
                    }
                },
                    h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '♾️'),
                    h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Marathon Mode'),
                    h('p', { style: { color: '#6b7280' } }, 'Coming in Phase 2')
                )
            ) : h('div', { style: { textAlign: 'center', padding: '3rem' } },
                h('p', null, 'No approved specimens available. Check the admin portal.')
            )
        )
    );
}

// Main App Component
function App() {
    const [currentView, setCurrentView] = React.useState('home');
    const [specimens, setSpecimens] = React.useState([]);
    const [speciesHints, setSpeciesHints] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState({ id: 'demo-user', name: 'Demo User' });
    const [specimenPhotos, setSpecimenPhotos] = React.useState({});

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load specimens
            const specResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (specResponse.ok) {
                const specData = await specResponse.json();
                setSpecimens(specData || []);
            }

            // Load species hints
            const hintsResponse = await fetch(`${SUPABASE_URL}/rest/v1/species_hints?select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (hintsResponse.ok) {
                const hintsData = await hintsResponse.json();
                // Convert to object keyed by species_name for easy lookup
                const hintsMap = {};
                hintsData.forEach(hint => {
                    hintsMap[hint.species_name] = hint;
                });
                setSpeciesHints(hintsMap);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSpecimenPhotos = async (inaturalistId) => {
        if (specimenPhotos[inaturalistId]) {
            return specimenPhotos[inaturalistId];
        }

        try {
            const response = await fetch(`https://api.inaturalist.org/v1/observations/${inaturalistId}`);
            const data = await response.json();
            
            if (data.results && data.results[0] && data.results[0].photos) {
                const photos = data.results[0].photos.map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    medium_url: photo.url.replace('square', 'medium'),
                    large_url: photo.url.replace('square', 'large'),
                    attribution: photo.attribution
                }));
                
                setSpecimenPhotos(prev => ({
                    ...prev,
                    [inaturalistId]: photos
                }));
                
                return photos;
            }
        } catch (error) {
            console.error('Error loading photos:', error);
        }
        
        return [];
    };

    if (loading) {
        return h(LoadingScreen);
    }

    if (currentView === 'quick-study') {
        return h(QuickStudy, {
            specimens: specimens,
            speciesHints: speciesHints,
            onBack: () => setCurrentView('home'),
            loadSpecimenPhotos: loadSpecimenPhotos,
            specimenPhotos: specimenPhotos
        });
    }

    return h(HomePage, {
        specimens: specimens,
        user: user,
        onStudyModeSelect: setCurrentView
    });
}

// Render the app
try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(h(App));
    console.log('✅ Phase 1 Complete - App rendered successfully');
} catch (error) {
    console.error('❌ Failed to render app:', error);
}