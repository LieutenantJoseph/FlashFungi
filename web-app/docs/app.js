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
    const [score, setScore] = React.useState({ correct: 0, total: 0, totalScore: 0 });
    const [hintsUsed, setHintsUsed] = React.useState(0);
    const [showHints, setShowHints] = React.useState(false);
    const [photosLoaded, setPhotosLoaded] = React.useState(false);
    const [selectedPhoto, setSelectedPhoto] = React.useState(null);
    const [validationResult, setValidationResult] = React.useState(null);

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

    // Enhanced Answer Validation System
    const validateAnswer = React.useCallback((userInput, specimen) => {
        if (!userInput || !specimen) {
            return {
                isCorrect: false,
                score: 0,
                feedback: 'No answer provided',
                matchType: 'none'
            };
        }

        const cleanInput = userInput.toLowerCase().trim();
        const speciesName = specimen.species_name.toLowerCase();
        const genus = specimen.genus.toLowerCase();
        const commonName = (specimen.common_name || '').toLowerCase();
        const family = specimen.family.toLowerCase();

        // Split input and target into parts for analysis
        const inputParts = cleanInput.split(/\s+/);
        const speciesParts = speciesName.split(/\s+/);
        
        // Perfect match - full species name
        if (cleanInput === speciesName || 
            cleanInput.includes(speciesName) || 
            speciesName.includes(cleanInput)) {
            return {
                isCorrect: true,
                score: 1.0,
                feedback: 'Perfect! You identified the complete species correctly.',
                matchType: 'perfect',
                details: {
                    matchedSpecies: true,
                    matchedGenus: true,
                    matchedCommon: false
                }
            };
        }

        // Common name match (if available)
        if (commonName && cleanInput === commonName) {
            return {
                isCorrect: true,
                score: 0.9,
                feedback: 'Excellent! You identified it by its common name.',
                matchType: 'common-name',
                details: {
                    matchedSpecies: false,
                    matchedGenus: true, // Assume genus is correct for common name
                    matchedCommon: true
                }
            };
        }

        // Genus-only match
        if (inputParts.length >= 1 && speciesParts.length >= 1) {
            const inputGenus = inputParts[0];
            const targetGenus = speciesParts[0];
            
            if (inputGenus === targetGenus || inputGenus === genus) {
                // Check if they attempted species epithet
                if (inputParts.length >= 2 && speciesParts.length >= 2) {
                    const inputSpecies = inputParts[1];
                    const targetSpecies = speciesParts[1];
                    
                    // Genus correct, species wrong
                    if (inputSpecies !== targetSpecies) {
                        return {
                            isCorrect: false,
                            score: 0.6,
                            feedback: `Good start! You got the genus ${specimen.genus} correct, but the species epithet should be "${speciesParts[1]}".`,
                            matchType: 'genus-only',
                            details: {
                                matchedSpecies: false,
                                matchedGenus: true,
                                matchedCommon: false,
                                attemptedSpecies: true
                            }
                        };
                    }
                } else {
                    // Only provided genus
                    return {
                        isCorrect: false,
                        score: 0.5,
                        feedback: `You're halfway there! The genus ${specimen.genus} is correct. Can you identify the complete species?`,
                        matchType: 'genus-only',
                        details: {
                            matchedSpecies: false,
                            matchedGenus: true,
                            matchedCommon: false,
                            attemptedSpecies: false
                        }
                    };
                }
            }
        }

        // Fuzzy matching for typos (simple implementation)
        const similarity = calculateSimilarity(cleanInput, speciesName);
        if (similarity > 0.8) {
            return {
                isCorrect: true,
                score: 0.85,
                feedback: 'Close enough! Check your spelling, but you have the right species.',
                matchType: 'fuzzy',
                details: {
                    similarity: similarity,
                    matchedSpecies: true,
                    matchedGenus: true,
                    matchedCommon: false
                }
            };
        }

        // Family-level understanding
        if (cleanInput.includes(family) || family.includes(cleanInput)) {
            return {
                isCorrect: false,
                score: 0.3,
                feedback: `You identified the family ${specimen.family} correctly! That's a good foundation - now try to narrow it down to the species.`,
                matchType: 'family-only',
                details: {
                    matchedSpecies: false,
                    matchedGenus: false,
                    matchedCommon: false,
                    matchedFamily: true
                }
            };
        }

        // No meaningful match
        return {
            isCorrect: false,
            score: 0,
            feedback: 'Not quite right. Try using the hints to guide your identification!',
            matchType: 'none',
            details: {
                matchedSpecies: false,
                matchedGenus: false,
                matchedCommon: false,
                matchedFamily: false
            }
        };
    }, []);

    // Simple similarity calculation (Levenshtein-like)
    const calculateSimilarity = (str1, str2) => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    };

    // Simple edit distance calculation
    const getEditDistance = (str1, str2) => {
        const matrix = Array(str2.length + 1).fill(null).map(() => 
            Array(str1.length + 1).fill(null)
        );
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1, // deletion
                    matrix[j - 1][i] + 1, // insertion
                    matrix[j - 1][i - 1] + substitutionCost // substitution
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    };

    const handleSubmit = () => {
        if (!userAnswer.trim()) return;
        
        const validation = validateAnswer(userAnswer, currentSpecimen);
        
        setScore(prev => ({
            correct: prev.correct + (validation.isCorrect ? 1 : 0),
            total: prev.total + 1,
            totalScore: (prev.totalScore || 0) + validation.score
        }));
        
        // Store validation result for display
        setValidationResult(validation);
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
            setValidationResult(null);
        } else {
            // Study complete - show detailed final score
            const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
            const avgScore = score.total > 0 ? Math.round((score.totalScore / score.total) * 100) : 0;
            
            alert(`Quick Study Complete!\n\nFinal Results:\n✅ Correct: ${score.correct}/${score.total} (${accuracy}%)\n📊 Average Score: ${avgScore}%\n\nGreat job studying Arizona mushrooms!`);
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
        // Header with Back Button and Progress
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
                                `${score.total > 0 ? Math.round((score.totalScore / score.total) * 100) : 0}%`
                            ),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Avg Score')
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

        // Main Flashcard Interface
        h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
                
                // Left Column - Photos and Specimen Info
                h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '1.5rem' } },
                    // Specimen Info
                    h('div', { style: { marginBottom: '1rem' } },
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Specimen Information'),
                        h('div', { style: { fontSize: '0.875rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' } },
                            h('p', null, h('strong', null, 'Location: '), currentSpecimen.location),
                            h('p', null, h('strong', null, 'Habitat: '), currentSpecimen.habitat?.substring(0, 100) + (currentSpecimen.habitat?.length > 100 ? '...' : '')),
                            h('p', null, h('strong', null, 'Quality Score: '), `${((currentSpecimen.quality_score || 0) * 100).toFixed(0)}%`)
                        )
                    ),

                    // Photo Display Section
                    h('div', { style: { marginBottom: '1rem' } },
                        h('h4', { style: { fontWeight: '500', marginBottom: '0.5rem' } }, 'Photos'),
                        !photosLoaded ? 
                            // Loading State
                            h('div', {
                                style: {
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '0.5rem',
                                    height: '16rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            },
                                h('div', { style: { textAlign: 'center', color: '#6b7280' } },
                                    h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '⏳'),
                                    h('p', { style: { fontSize: '0.875rem' } }, 'Loading photos...')
                                )
                            ) :
                        currentPhotos.length > 0 ?
                            // Photo Gallery
                            h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' } },
                                // Main Photo
                                h('div', { style: { position: 'relative' } },
                                    h('img', {
                                        src: currentPhotos[0].medium_url,
                                        alt: 'Main specimen view',
                                        style: {
                                            width: '100%',
                                            height: '16rem',
                                            objectFit: 'cover',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer'
                                        },
                                        onClick: () => setSelectedPhoto(currentPhotos[0])
                                    }),
                                    h('div', {
                                        style: {
                                            position: 'absolute',
                                            bottom: '0.5rem',
                                            right: '0.5rem',
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem'
                                        }
                                    }, 'Click to enlarge')
                                ),
                                // Thumbnail Gallery (if more than 1 photo)
                                currentPhotos.length > 1 && h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' } },
                                    ...currentPhotos.slice(1, 5).map((photo, index) =>
                                        h('img', {
                                            key: photo.id,
                                            src: photo.url,
                                            alt: `View ${index + 2}`,
                                            style: {
                                                width: '100%',
                                                height: '4rem',
                                                objectFit: 'cover',
                                                borderRadius: '0.25rem',
                                                cursor: 'pointer'
                                            },
                                            onClick: () => setSelectedPhoto(photo)
                                        })
                                    )
                                ),
                                h('p', { style: { fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' } },
                                    `📸 ${currentPhotos.length} photos available`
                                )
                            ) :
                            // No Photos Available
                            h('div', {
                                style: {
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '0.5rem',
                                    height: '16rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            },
                                h('div', { style: { textAlign: 'center', color: '#6b7280' } },
                                    h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '📸'),
                                    h('p', { style: { fontSize: '0.875rem' } }, 'No photos available'),
                                    h('a', {
                                        href: `https://www.inaturalist.org/observations/${currentSpecimen.inaturalist_id}`,
                                        target: '_blank',
                                        style: { color: '#3b82f6', fontSize: '0.75rem' }
                                    }, 'View on iNaturalist ↗')
                                )
                            )
                    )
                ),

                // Right Column - Answer Interface
                h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '1.5rem' } },
                    h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' } }, 'Identify This Mushroom'),
                    
                    !showAnswer ? 
                        // Question Mode
                        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
                            h('div', null,
                                h('label', { style: { display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' } },
                                    'What species is this mushroom?'
                                ),
                                h('input', {
                                    type: 'text',
                                    value: userAnswer,
                                    onChange: (e) => setUserAnswer(e.target.value),
                                    onKeyPress: handleKeyPress,
                                    placeholder: 'Enter genus and species (e.g., Agaricus campestris)',
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
                                    onClick: handleSubmit,
                                    disabled: !userAnswer.trim(),
                                    style: {
                                        flex: 1,
                                        backgroundColor: userAnswer.trim() ? '#10b981' : '#d1d5db',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                                        fontWeight: '500'
                                    }
                                }, 'Submit Answer'),
                                
                                h('button', {
                                    onClick: useHint,
                                    disabled: hintsUsed >= 4,
                                    style: {
                                        backgroundColor: hintsUsed < 4 ? '#f59e0b' : '#d1d5db',
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: hintsUsed < 4 ? 'pointer' : 'not-allowed',
                                        fontSize: '0.875rem'
                                    }
                                }, `💡 Hint (${hintsUsed}/4)`)
                            ),

                            // Hints Display
                            showHints && hintsUsed > 0 && h('div', {
                                style: {
                                    backgroundColor: '#fef3c7',
                                    border: '1px solid #f59e0b',
                                    borderRadius: '0.5rem',
                                    padding: '1rem'
                                }
                            },
                                h('h4', { style: { fontWeight: '500', color: '#92400e', marginBottom: '0.5rem' } }, 'Hints Used:'),
                                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' } },
                                    ...hints.slice(0, hintsUsed).map((hint, index) =>
                                        h('div', { key: index, style: { fontSize: '0.875rem', color: '#92400e' } },
                                            h('strong', null, `Level ${hint.level} (${hint.type}): `),
                                            hint.text
                                        )
                                    )
                                )
                            )
                        ) :
                        // Answer Mode
                        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
                            // Enhanced Answer Result
                            validationResult && h('div', {
                                style: {
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '2px solid',
                                    borderColor: validationResult.isCorrect ? '#10b981' : 
                                               validationResult.score > 0.3 ? '#f59e0b' : '#ef4444',
                                    backgroundColor: validationResult.isCorrect ? '#f0fdf4' : 
                                                   validationResult.score > 0.3 ? '#fef3c7' : '#fef2f2'
                                }
                            },
                                h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' } },
                                    h('span', { 
                                        style: { 
                                            color: validationResult.isCorrect ? '#10b981' : 
                                                  validationResult.score > 0.3 ? '#f59e0b' : '#ef4444',
                                            fontSize: '1.25rem'
                                        } 
                                    }, validationResult.isCorrect ? '✅' : 
                                        validationResult.score > 0.3 ? '🟡' : '❌'),
                                    h('span', { 
                                        style: { 
                                            fontWeight: '500', 
                                            color: validationResult.isCorrect ? '#065f46' : 
                                                  validationResult.score > 0.3 ? '#92400e' : '#991b1b'
                                        } 
                                    }, validationResult.feedback)
                                ),
                                
                                // Score display
                                validationResult.score > 0 && validationResult.score < 1 && 
                                h('div', { style: { marginBottom: '0.5rem' } },
                                    h('span', { 
                                        style: { 
                                            fontSize: '0.875rem', 
                                            fontWeight: '500',
                                            color: validationResult.score > 0.5 ? '#059669' : '#d97706'
                                        } 
                                    }, `Score: ${Math.round(validationResult.score * 100)}%`)
                                ),
                                
                                h('div', { style: { fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' } },
                                    h('p', null, h('strong', null, 'Correct Answer: '), h('em', null, currentSpecimen.species_name)),
                                    h('p', null, h('strong', null, 'Common Name: '), currentSpecimen.common_name || 'Unknown'),
                                    h('p', null, h('strong', null, 'Family: '), currentSpecimen.family),
                                    h('p', null, h('strong', null, 'Your Answer: '), userAnswer),
                                    hintsUsed > 0 && h('p', null, h('strong', null, 'Hints Used: '), `${hintsUsed}/4`),
                                    validationResult.matchType && h('p', null, h('strong', null, 'Match Type: '), validationResult.matchType)
                                )
                            ),
                            
                            h('button', {
                                onClick: handleNext,
                                style: {
                                    width: '100%',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 'Finish Study')
                        )
                )
            )
        ),

        // Photo Modal
        selectedPhoto && h('div', {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 50
            },
            onClick: () => setSelectedPhoto(null)
        },
            h('div', { style: { maxWidth: '64rem', maxHeight: '100%' } },
                h('img', {
                    src: selectedPhoto.large_url,
                    alt: 'Full size specimen view',
                    style: {
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '0.5rem'
                    }
                }),
                h('div', { style: { textAlign: 'center', marginTop: '1rem' } },
                    h('p', { style: { color: 'white', fontSize: '0.875rem' } }, selectedPhoto.attribution),
                    h('p', { style: { color: '#d1d5db', fontSize: '0.75rem', marginTop: '0.25rem' } }, 'Click anywhere to close')
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