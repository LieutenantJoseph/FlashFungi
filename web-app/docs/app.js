// Plain JavaScript React App - Final Reviewed Version
console.log('🔥 app.js executing - plain JavaScript version');

// Check if React is available immediately
if (typeof React === 'undefined') {
    console.error('❌ React not available in app.js');
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React not loaded</h1><p>Please check if React libraries are loading correctly.</p></div>';
} else {
    console.log('✅ React available in app.js');
}

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';

// Helper function to create elements easily
const h = React.createElement;

// Loading Screen Component
function LoadingScreen() {
    console.log('🔄 LoadingScreen rendering');
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

// Home Page Component
function HomePage(props) {
    console.log('🏠 HomePage rendering with props:', props);
    
    // Safely extract props with fallbacks
    const specimens = props.specimens || [];
    const user = props.user || { name: 'Guest' };
    const onStudyModeSelect = props.onStudyModeSelect;
    
    console.log('🔍 onStudyModeSelect type:', typeof onStudyModeSelect);
    console.log('🔍 onStudyModeSelect value:', onStudyModeSelect);
    
    if (typeof onStudyModeSelect !== 'function') {
        console.error('❌ onStudyModeSelect is not a function!', onStudyModeSelect);
        return h('div', { style: { padding: '20px', color: 'red' } }, 
            'Error: onStudyModeSelect prop is missing or not a function'
        );
    }
    
    const approvedCount = specimens.filter(s => s.status === 'approved').length;
    const dnaCount = specimens.filter(s => s.dna_sequenced).length;

    console.log(`📊 Specimens: ${specimens.length}, Approved: ${approvedCount}, DNA: ${dnaCount}`);

    // Create click handler with logging
    const handleQuickStudyClick = () => {
        console.log('🚀 Quick Study clicked!');
        try {
            onStudyModeSelect('quick-study');
            console.log('✅ onStudyModeSelect called successfully');
        } catch (error) {
            console.error('❌ Error calling onStudyModeSelect:', error);
        }
    };

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header
        h('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem 1rem' } },
                h('div', { style: { textAlign: 'center' } },
                    h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                    h('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' } }, 'Arizona Mushroom Study'),
                    h('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                )
            )
        ),

        // Main content
        h('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem 1rem' } },
            // Welcome section
            h('div', { 
                style: { 
                    background: 'linear-gradient(to right, #10b981, #059669)', 
                    borderRadius: '0.75rem', 
                    color: 'white', 
                    padding: '1.5rem', 
                    marginBottom: '2rem' 
                } 
            },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, `Welcome, ${user.name || 'Mycologist'}! 🍄`),
                h('p', { style: { opacity: 0.9, marginBottom: '1rem' } }, 'Ready to improve your mushroom identification skills?'),
                h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '1rem' } },
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' } },
                        h('span', { style: { fontSize: '0.875rem' } }, `📊 ${specimens.length} Total Specimens`)
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' } },
                        h('span', { style: { fontSize: '0.875rem' } }, `🧬 ${dnaCount} DNA-Verified`)
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' } },
                        h('span', { style: { fontSize: '0.875rem' } }, `✅ ${approvedCount} Ready for Study`)
                    )
                )
            ),

            // Content based on specimens
            approvedCount === 0 ? 
                // No specimens message
                h('div', { style: { textAlign: 'center', padding: '3rem 0' } },
                    h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🔬'),
                    h('h3', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 'Study Content Coming Soon'),
                    h('div', { 
                        style: { 
                            backgroundColor: 'white', 
                            borderRadius: '0.75rem', 
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                            padding: '1.5rem', 
                            maxWidth: '32rem', 
                            margin: '0 auto' 
                        } 
                    },
                        h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                            `The data pipeline has found ${specimens.length} specimens, with specimens awaiting admin review.`
                        ),
                        h('div', { style: { textAlign: 'left', marginBottom: '1rem' } },
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' } }, 
                                h('strong', null, '📋 Pipeline Status:'), ' Active and processing'
                            ),
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' } }, 
                                h('strong', null, '🔄 Next Update:'), ' Monthly (1st of each month)'
                            )
                        ),
                        h('div', { style: { padding: '0.75rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' } },
                            h('p', { style: { fontSize: '0.875rem', color: '#1e40af' } },
                                h('strong', null, 'Admin:'), ' Visit the admin portal to review and approve specimens for study.'
                            )
                        )
                    )
                ) :
                // Study mode selection
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2rem' } },
                    h('div', { style: { textAlign: 'center' } },
                        h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'Choose Your Study Mode'),
                        h('p', { style: { color: '#6b7280' } }, `${approvedCount} specimens available for study`)
                    ),
                    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' } },
                        // Quick Study Card
                        h('div', { 
                            style: { 
                                backgroundColor: 'white', 
                                borderRadius: '0.75rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px solid transparent',
                                cursor: approvedCount >= 1 ? 'pointer' : 'not-allowed',
                                opacity: approvedCount >= 1 ? 1 : 0.5,
                                transition: 'all 0.2s'
                            },
                            onClick: approvedCount >= 1 ? handleQuickStudyClick : undefined
                        },
                            h('div', { 
                                style: { 
                                    backgroundColor: '#3b82f6', 
                                    color: 'white', 
                                    width: '3rem', 
                                    height: '3rem', 
                                    borderRadius: '0.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '1rem', 
                                    fontSize: '1.25rem' 
                                } 
                            }, '⚡'),
                            h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Quick Study'),
                            h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, '10 questions, fast-paced review'),
                            approvedCount < 1 && h('div', { style: { fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.25rem', padding: '0.5rem' } },
                                'Need more approved specimens'
                            )
                        ),
                        
                        // Focused Study Card  
                        h('div', { 
                            style: { 
                                backgroundColor: 'white', 
                                borderRadius: '0.75rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px solid transparent',
                                cursor: approvedCount >= 5 ? 'pointer' : 'not-allowed',
                                opacity: approvedCount >= 5 ? 1 : 0.5
                            },
                            onClick: approvedCount >= 5 ? () => {
                                console.log('🎯 Focused Study clicked');
                                alert('Focused Study mode coming soon!');
                            } : undefined
                        },
                            h('div', { 
                                style: { 
                                    backgroundColor: '#8b5cf6', 
                                    color: 'white', 
                                    width: '3rem', 
                                    height: '3rem', 
                                    borderRadius: '0.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '1rem', 
                                    fontSize: '1.25rem' 
                                } 
                            }, '🎯'),
                            h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Focused Study'),
                            h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 'Customize topics and difficulty'),
                            approvedCount < 5 && h('div', { style: { fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.25rem', padding: '0.5rem' } },
                                'Need more approved specimens'
                            )
                        ),

                        // Marathon Study Card
                        h('div', { 
                            style: { 
                                backgroundColor: 'white', 
                                borderRadius: '0.75rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px solid transparent',
                                cursor: approvedCount >= 20 ? 'pointer' : 'not-allowed',
                                opacity: approvedCount >= 20 ? 1 : 0.5
                            },
                            onClick: approvedCount >= 20 ? () => {
                                console.log('♾️ Marathon Study clicked');
                                alert('Marathon Study mode coming soon!');
                            } : undefined
                        },
                            h('div', { 
                                style: { 
                                    backgroundColor: '#ef4444', 
                                    color: 'white', 
                                    width: '3rem', 
                                    height: '3rem', 
                                    borderRadius: '0.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '1rem', 
                                    fontSize: '1.25rem' 
                                } 
                            }, '♾️'),
                            h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Marathon Mode'),
                            h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 'Unlimited questions, test endurance'),
                            approvedCount < 20 && h('div', { style: { fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.25rem', padding: '0.5rem' } },
                                'Need more approved specimens'
                            )
                        )
                    )
                )
        )
    );
}

// Quick Study Component
function QuickStudy(props) {
    console.log('🎮 QuickStudy rendering with props:', props);
    
    const specimens = props.specimens || [];
    const onBack = props.onBack;
    const loadSpecimenPhotos = props.loadSpecimenPhotos;
    const specimenPhotos = props.specimenPhotos || {};
    
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [userAnswer, setUserAnswer] = React.useState('');
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [score, setScore] = React.useState({ correct: 0, total: 0 });
    const [hintsUsed, setHintsUsed] = React.useState(0);
    const [showHints, setShowHints] = React.useState(false);
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

    // Generate hints for current specimen
    const hints = React.useMemo(() => {
        if (!currentSpecimen) return [];
        return [
            { level: 1, type: 'family', text: `This mushroom belongs to the family ${currentSpecimen.family}.` },
            { level: 2, type: 'morphological', text: `Look for key features typical of ${currentSpecimen.genus} species.` },
            { level: 3, type: 'ecological', text: `Habitat: ${currentSpecimen.habitat?.substring(0, 100)}${currentSpecimen.habitat?.length > 100 ? '...' : ''}` },
            { level: 4, type: 'genus', text: `The genus is ${currentSpecimen.genus}.` }
        ];
    }, [currentSpecimen]);

    const handleSubmit = () => {
        if (!userAnswer.trim()) return;
        
        const isCorrect = userAnswer.toLowerCase().includes(currentSpecimen.species_name.toLowerCase()) ||
                         currentSpecimen.species_name.toLowerCase().includes(userAnswer.toLowerCase());
        
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
        setShowAnswer(true);
    };

    const handleNext = () => {
        if (currentIndex < studySpecimens.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setShowAnswer(false);
            setHintsUsed(0);
            setShowHints(false);
            setSelectedPhoto(null);
        } else {
            // Study complete
            const finalScore = Math.round((score.correct / score.total) * 100);
            alert(`Quick Study Complete!\n\nFinal Score: ${score.correct}/${score.total} (${finalScore}%)\n\nGreat job studying Arizona mushrooms!`);
            onBack();
        }
    };

    const useHint = () => {
        if (hintsUsed < 4) {
            setHintsUsed(prev => prev + 1);
            setShowHints(true);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !showAnswer && userAnswer.trim()) {
            handleSubmit();
        }
    };

    if (!currentSpecimen) {
        return h('div', {
            style: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        },
            h('div', { style: { textAlign: 'center' } },
                h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '📭'),
                h('h2', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'No Specimens Available'),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 'No approved specimens found for study.'),
                h('button', {
                    onClick: onBack,
                    style: {
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer'
                    }
                }, 'Back to Home')
            )
        );
    }

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header with Back Button
        h('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1rem' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        h('button', {
                            onClick: onBack,
                            style: {
                                color: '#6b7280',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }
                        }, '← Back'),
                        h('div', null,
                            h('h1', { style: { fontSize: '1.25rem', fontWeight: 'bold' } }, 'Quick Study'),
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } }, 
                                `Question ${currentIndex + 1} of ${studySpecimens.length}`
                            )
                        )
                    ),
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '1.5rem' } },
                        h('div', { style: { textAlign: 'center' } },
                            h('div', { style: { fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981' } },
                                `${score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%`
                            ),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Accuracy')
                        ),
                        currentSpecimen.dna_sequenced && h('div', {
                            style: {
                                backgroundColor: '#f3f4f6',
                                color: '#7c3aed',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }
                        }, '🧬 DNA Verified')
                    )
                ),
                // Progress Bar
                h('div', { style: { marginTop: '1rem' } },
                    h('div', { style: { width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem' } },
                        h('div', {
                            style: {
                                backgroundColor: '#10b981',
                                height: '0.5rem',
                                borderRadius: '9999px',
                                width: `${((currentIndex + 1) / studySpecimens.length) * 100}%`,
                                transition: 'width 0.3s'
                            }
                        })
                    )
                )
            )
        ),

        // Simple placeholder for now - just show current specimen info
        h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem', textAlign: 'center' } },
            h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 'Quick Study Mode'),
                h('p', { style: { fontSize: '1.125rem', marginBottom: '0.5rem' } }, `Current Specimen: ${currentSpecimen.species_name}`),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, `Location: ${currentSpecimen.location}`),
                h('p', { style: { color: '#6b7280', marginBottom: '2rem' } }, `Habitat: ${currentSpecimen.habitat}`),
                h('div', { style: { display: 'flex', gap: '1rem', justifyContent: 'center' } },
                    h('button', {
                        onClick: handleNext,
                        style: {
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }
                    }, currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 'Finish Study'),
                    h('button', {
                        onClick: onBack,
                        style: {
                            backgroundColor: '#6b7280',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer'
                        }
                    }, 'Back to Home')
                )
            )
        )
    );
}

// Main App Component
function App() {
    console.log('🏁 App component rendering');
    
    const [currentView, setCurrentView] = React.useState('home');
    const [specimens, setSpecimens] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);
    const [specimenPhotos, setSpecimenPhotos] = React.useState({});

    console.log('📊 App state:', { currentView, specimensCount: specimens.length, loading });

    React.useEffect(() => {
        console.log('🚀 useEffect triggered - loading specimens');
        loadSpecimens();
        setUser({ id: 'demo-user', name: 'Demo User' });
    }, []);

    const loadSpecimens = async () => {
        try {
            console.log('🔍 Loading specimens from Supabase...');
            const response = await fetch(`${SUPABASE_URL}/rest/v1/specimens?status=eq.approved&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`📊 Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Supabase error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const responseText = await response.text();
            console.log('📝 Raw response length:', responseText.length);
            
            let data = [];
            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                    console.log(`✅ Loaded ${data.length} specimens`);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Invalid JSON response from server');
                }
            }
            
            setSpecimens(data || []);
        } catch (error) {
            console.error('❌ Error loading specimens:', error);
            setSpecimens([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSpecimenPhotos = async (inaturalistId) => {
        if (specimenPhotos[inaturalistId]) {
            return specimenPhotos[inaturalistId];
        }

        try {
            console.log(`📸 Loading photos for specimen: ${inaturalistId}`);
            const response = await fetch(`https://api.inaturalist.org/v1/observations/${inaturalistId}`);
            const data = await response.json();
            
            if (data.results && data.results[0] && data.results[0].photos) {
                const photos = data.results[0].photos.map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    medium_url: photo.url.replace('square', 'medium'),
                    large_url: photo.url.replace('square', 'large'),
                    attribution: photo.attribution || 'iNaturalist user'
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

    // Create a safe function reference
    const handleViewChange = React.useCallback((newView) => {
        console.log(`🔄 Changing view from ${currentView} to ${newView}`);
        setCurrentView(newView);
    }, [currentView]);

    // Route to different views
    if (loading) {
        return h(LoadingScreen);
    }

    if (currentView === 'quick-study') {
        console.log('🎮 Rendering QuickStudy component');
        return h(QuickStudy, {
            specimens: specimens,
            onBack: () => handleViewChange('home'),
            loadSpecimenPhotos: loadSpecimenPhotos,
            specimenPhotos: specimenPhotos
        });
    }

    console.log('🏠 Rendering HomePage component');
    return h(HomePage, {
        specimens: specimens,
        user: user,
        onStudyModeSelect: handleViewChange
    });
}

// Render the app using React 18 API
console.log('🎬 About to render React app');
try {
    if (typeof ReactDOM === 'undefined') {
        throw new Error('ReactDOM not available');
    }
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error('Root element not found');
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(h(App));
    console.log('✅ React app render called successfully');
} catch (error) {
    console.error('❌ Failed to render React app:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                <h1>App Rendering Error</h1>
                <p>Error: ${error.message}</p>
                <p>Please check the browser console for more details.</p>
            </div>
        `;
    }
}