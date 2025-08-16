// Flash Fungi - Complete Implementation with Authentication Integration
// Version 3.0 - Authentication, Training Modules, and Public Profiles
console.log('🍄 Flash Fungi v3.0 - Authentication Integration');

// Check React availability
if (typeof React === 'undefined') {
    console.error('❌ React not available');
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React not loaded</h1></div>';
} else {
    console.log('✅ React loaded successfully');

// Load auth system
const authScript = document.createElement('script');
authScript.src = './auth.js';
document.head.appendChild(authScript);

// Load public profile component
const profileScript = document.createElement('script');
profileScript.src = './public-profile.js';
document.head.appendChild(profileScript);

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
// Export configuration for use by Phase 3 components
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
const API_BASE = '/api';

const h = React.createElement;

// User Profile Management Hook (Updated for SupabaseAuth)
// Replace the useUserProfile hook
function useUserProfile(authUser, getAuthToken) {
    const [userProgress, setUserProgress] = React.useState({});

    const loadUserProgress = React.useCallback(async () => {
        if (!authUser?.id) return;
        const token = getAuthToken();
        
        try {
            const response = await fetch(`${API_BASE}/user-progress-api?userId=${authUser.id}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                const progressMap = {};
                data.forEach(p => {
                    if (p.module_id) {
                        progressMap[p.module_id] = p;
                    }
                });
                setUserProgress(progressMap);
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }, [authUser, getAuthToken]);

    const saveProgress = React.useCallback(async (progressData) => {
        if (!authUser?.id) return;
        const token = getAuthToken();

        try {
            const response = await fetch(`${API_BASE}/user-progress-api`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    userId: authUser.id,
                    ...progressData
                })
            });
            
            if (response.ok) {
                await loadUserProgress();
                return true;
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
        return false;
    }, [authUser, loadUserProgress, getAuthToken]);

    React.useEffect(() => {
        loadUserProgress();
    }, [loadUserProgress]);

    return { userProgress, saveProgress, loadUserProgress };
}

// In AuthenticatedApp component, update the profile update call
const handleProfileClick = () => {
    if (window.ProfilePage) {
        setCurrentView('profile');
    }
};

    // Save progress
    const saveProgress = React.useCallback(async (progressData) => {
        if (!authUser?.id) return;

        try {
            const response = await fetch(`${API_BASE}/user-progress-api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: authUser.id,
                    ...progressData
                })
            });
            
            if (response.ok) {
                await loadUserProgress(); // Reload progress
                return true;
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
        return false;
    }, [authUser, loadUserProgress]);

    React.useEffect(() => {
        loadUserProgress();
    }, [loadUserProgress]);

    return { userProgress, saveProgress, loadUserProgress };
}

// Utility Functions for Fuzzy Matching
const calculateLevenshteinDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
        Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + substitutionCost
            );
        }
    }
    
    return matrix[str2.length][str1.length];
};

const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = calculateLevenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
};

// Loading Screen Component
function LoadingScreen() {
    return h('div', {
        style: { 
            minHeight: '100vh', 
            backgroundColor: '#f9fafb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }
    },
        h('div', { style: { textAlign: 'center' } },
            h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
            h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' } }, 
                'Flash Fungi'
            ),
            h('p', { style: { color: '#6b7280' } }, 'Loading educational content...')
        )
    );
}

// Enhanced Interactive Species Guide with Reference Photos
function InteractiveSpeciesGuide({ specimen, speciesHints, photos, referencePhotos, onClose, onTryAgain }) {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [comparisonMode, setComparisonMode] = React.useState(false);
    
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
                            }, '🔍 Your Specimen'),
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
}

// Enhanced Quick Study Component with Proper Scoring and Get Hint Button
function QuickStudy(props) {
    const specimens = props.specimens || [];
    const speciesHints = props.speciesHints || {};
    const onBack = props.onBack;
    const loadSpecimenPhotos = props.loadSpecimenPhotos;
    const specimenPhotos = props.specimenPhotos || {};
    const speciesHintsMap = props.speciesHints || {};
    const referencePhotos = props.referencePhotos || {};
    const user = props.user;
    const saveProgress = props.saveProgress;
    
    // State
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [userAnswer, setUserAnswer] = React.useState('');
    const [currentHintLevel, setCurrentHintLevel] = React.useState(0);
    const [hintsRevealedManually, setHintsRevealedManually] = React.useState(0);
    const [attemptCount, setAttemptCount] = React.useState(0);
    const [showResult, setShowResult] = React.useState(false);
    const [showGuide, setShowGuide] = React.useState(false);
    const [score, setScore] = React.useState({ correct: 0, total: 0, totalScore: 0 });
    const [lastAttemptScore, setLastAttemptScore] = React.useState(null);
    const [photosLoaded, setPhotosLoaded] = React.useState(false);
    const [selectedPhoto, setSelectedPhoto] = React.useState(null);

    // Get 10 random approved specimens
    const studySpecimens = React.useMemo(() => {
        const approved = specimens.filter(s => s.status === 'approved');
        const shuffled = [...approved].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(10, approved.length));
    }, [specimens]);

    const currentSpecimen = studySpecimens[currentIndex];
    const currentPhotos = currentSpecimen ? specimenPhotos[currentSpecimen.inaturalist_id] || [] : [];
    const currentSpeciesHints = currentSpecimen ? speciesHintsMap[currentSpecimen.species_name] : null;
    const currentReferencePhotos = currentSpecimen ? referencePhotos[currentSpecimen.species_name] || [] : [];

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
        if (currentSpeciesHints && currentSpeciesHints.hints && currentSpeciesHints.hints.length > 0) {
            return currentSpeciesHints.hints;
        }
        
        // Fallback hints
        return [
            {
                type: 'morphological',
                level: 1,
                text: `Examine the physical features of this ${currentSpecimen?.family || 'mushroom'} specimen.`
            },
            {
                type: 'comparative',
                level: 2,
                text: `Compare to other ${currentSpecimen?.genus || 'similar'} species for distinguishing features.`
            },
            {
                type: 'ecological',
                level: 3,
                text: `Consider the habitat: ${currentSpecimen?.location || 'Arizona'}.`
            },
            {
                type: 'taxonomic',
                level: 4,
                text: `This belongs to genus ${currentSpecimen?.genus || '[Unknown]'} in family ${currentSpecimen?.family || '[Unknown]'}.`
            }
        ];
    }, [currentSpeciesHints, currentSpecimen]);

    const hints = getHints();

    // Enhanced answer validation with fuzzy matching and scoring
    const validateAnswer = (answer) => {
        if (!answer || !currentSpecimen) return { isCorrect: false, score: 0, feedback: '' };
        
        const cleaned = answer.toLowerCase().trim();
        const species = currentSpecimen.species_name.toLowerCase();
        const genus = currentSpecimen.genus.toLowerCase();
        const family = currentSpecimen.family.toLowerCase();
        const common = (currentSpecimen.common_name || '').toLowerCase();
        
        // Calculate base score based on match type
        let baseScore = 0;
        let feedback = '';
        let isCorrect = false;
        
        // Perfect species match
        if (cleaned === species) {
            baseScore = 100;
            feedback = 'Perfect! Complete species identification!';
            isCorrect = true;
        }
        // Fuzzy species match (typos)
        else if (calculateSimilarity(cleaned, species) > 0.85) {
            baseScore = 95;
            feedback = 'Correct! (Minor spelling variation accepted)';
            isCorrect = true;
        }
        // Common name match
        else if (common && cleaned === common) {
            baseScore = 90;
            feedback = 'Correct! You identified it by common name!';
            isCorrect = true;
        }
        // Genus + wrong species
        else if (cleaned.includes(genus) && cleaned.split(' ').length > 1) {
            baseScore = 60;
            feedback = `Good! Genus "${currentSpecimen.genus}" is correct, but wrong species epithet.`;
        }
        // Genus only
        else if (cleaned === genus) {
            baseScore = 50;
            feedback = `Partial credit: Genus "${currentSpecimen.genus}" is correct. Need full species name.`;
        }
        // Family only
        else if (cleaned === family || cleaned.includes(family)) {
            baseScore = 30;
            feedback = `You identified the family "${currentSpecimen.family}". Try to get more specific.`;
        }
        // No match
        else {
            baseScore = 0;
            feedback = 'Not quite. Try using the hints!';
        }
        
        // Apply hint penalty (-5% per hint used)
        const totalHintsUsed = currentHintLevel + hintsRevealedManually;
        const hintPenalty = Math.min(totalHintsUsed * 5, 40); // Max 40% penalty
        const finalScore = Math.max(baseScore - hintPenalty, 0);
        
        return {
            isCorrect: isCorrect,
            baseScore: baseScore,
            finalScore: finalScore,
            hintPenalty: hintPenalty,
            feedback: feedback
        };
    };

    // Handle answer submission with progressive hints
    const handleSubmitAnswer = () => {
        if (!userAnswer.trim()) return;
        
        const validation = validateAnswer(userAnswer);
        setAttemptCount(prev => prev + 1);
        
        if (validation.isCorrect) {
            // Correct answer
            setLastAttemptScore(validation);
            setScore(prev => ({ 
                correct: prev.correct + 1, 
                total: prev.total + 1,
                totalScore: prev.totalScore + validation.finalScore
            }));
            setShowResult(true);
            
            // Save progress
            if (saveProgress) {
                saveProgress({
                    specimenId: currentSpecimen.id,
                    progressType: 'flashcard',
                    score: validation.finalScore,
                    hintsUsed: currentHintLevel + hintsRevealedManually,
                    completed: true
                });
            }
        } else {
            // Wrong answer - show next hint progressively if not all revealed
            setLastAttemptScore(validation);
            if (currentHintLevel < 4) {
                setCurrentHintLevel(prev => prev + 1);
                setUserAnswer(''); // Clear for retry
            } else {
                // All hints exhausted
                setScore(prev => ({ 
                    correct: prev.correct, 
                    total: prev.total + 1,
                    totalScore: prev.totalScore + validation.finalScore
                }));
                setShowGuide(true);
            }
        }
    };

    // Handle "Get Hint" button
    const handleGetHint = () => {
        if (currentHintLevel + hintsRevealedManually < 4) {
            if (currentHintLevel === 0) {
                setCurrentHintLevel(1);
            } else if (currentHintLevel + hintsRevealedManually < 4) {
                setHintsRevealedManually(prev => prev + 1);
            }
        }
    };

    // Handle "I Don't Know" button
    const handleIDontKnow = () => {
        setScore(prev => ({ 
            correct: prev.correct, 
            total: prev.total + 1,
            totalScore: prev.totalScore + 0 // No points for giving up
        }));
        setShowGuide(true);
    };

    // Move to next question
    const handleNext = () => {
        if (currentIndex < studySpecimens.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setCurrentHintLevel(0);
            setHintsRevealedManually(0);
            setAttemptCount(0);
            setShowResult(false);
            setShowGuide(false);
            setLastAttemptScore(null);
            setSelectedPhoto(null);
        } else {
            // Study complete
            const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;
            const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
            
            alert(
                `🍄 Study Complete!\n\n` +
                `✅ Correct: ${score.correct}/${score.total} (${accuracy}%)\n` +
                `📊 Average Score: ${avgScore}%\n` +
                `${avgScore >= 80 ? '🌟 Excellent work!' : avgScore >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}`
            );
            onBack();
        }
    };

    if (!currentSpecimen) {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h2', null, 'No specimens available for study'),
            h('button', { onClick: onBack }, 'Back to Home')
        );
    }

    // Calculate current score display
    const avgScore = score.total > 0 ? Math.round(score.totalScore / score.total) : 0;

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header with enhanced scoring display
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
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 'Correct')
                        ),
                        h('div', { style: { textAlign: 'center' } },
                            h('div', { 
                                style: { 
                                    fontSize: '1.125rem', 
                                    fontWeight: 'bold',
                                    color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444'
                                } 
                            },
                                `${avgScore}%`
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

                // Right: Answer Interface with Hints
                h('div', { style: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem' } },
                    h('h3', { style: { fontWeight: '600', marginBottom: '1rem' } }, 'Identify This Mushroom'),
                    
                    // Show hints if any revealed
                    (currentHintLevel > 0 || hintsRevealedManually > 0) && !showResult && !showGuide && h('div', {
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
                                `💡 Hints (${currentHintLevel + hintsRevealedManually}/4)`
                            ),
                            (currentHintLevel + hintsRevealedManually) > 0 && h('span', { 
                                style: { 
                                    fontSize: '0.75rem', 
                                    color: '#dc2626',
                                    backgroundColor: '#fee2e2',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '0.25rem'
                                } 
                            }, `-${(currentHintLevel + hintsRevealedManually) * 5}% penalty`)
                        ),
                        
                        // Show all revealed hints
                        hints.slice(0, currentHintLevel + hintsRevealedManually).map((hint, idx) => {
                            const isLatest = idx === currentHintLevel + hintsRevealedManually - 1;
                            return h('div', {
                                key: idx,
                                style: {
                                    marginBottom: idx < currentHintLevel + hintsRevealedManually - 1 ? '0.5rem' : 0,
                                    padding: '0.5rem',
                                    backgroundColor: isLatest ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                                    borderRadius: '0.25rem',
                                    borderLeft: `3px solid ${isLatest ? '#f59e0b' : 'transparent'}`
                                }
                            },
                                h('p', { style: { fontSize: '0.875rem', color: '#374151', margin: 0 } }, 
                                    `${idx + 1}. ${hint.text}`
                                )
                            );
                        }),
                        
                        lastAttemptScore && !lastAttemptScore.isCorrect && h('div', {
                            style: {
                                marginTop: '0.75rem',
                                padding: '0.5rem',
                                backgroundColor: lastAttemptScore.baseScore > 0 ? '#059669' : '#dc2626',
                                color: 'white',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem'
                            }
                        }, lastAttemptScore.feedback)
                    ),
                    
                    !showResult && !showGuide ? 
                        // Question Mode
                        h('div', null,
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
                                    onClick: handleGetHint,
                                    disabled: currentHintLevel + hintsRevealedManually >= 4,
                                    style: {
                                        padding: '0.75rem 1rem',
                                        backgroundColor: currentHintLevel + hintsRevealedManually < 4 ? '#3b82f6' : '#d1d5db',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: currentHintLevel + hintsRevealedManually < 4 ? 'pointer' : 'not-allowed',
                                        fontWeight: '500'
                                    }
                                }, `💡 Get Hint`),
                                
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
                        ) :
                        showResult ?
                        // Result Display with Scoring Details
                        h('div', null,
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
                                    h('strong', { style: { color: '#065f46' } }, 'Correct!')
                                ),
                                h('p', null, h('strong', null, 'Species: '), h('em', null, currentSpecimen.species_name)),
                                currentSpecimen.common_name && h('p', null, h('strong', null, 'Common: '), currentSpecimen.common_name),
                                h('p', null, h('strong', null, 'Family: '), currentSpecimen.family),
                                
                                // Score breakdown
                                h('div', {
                                    style: {
                                        marginTop: '0.75rem',
                                        padding: '0.5rem',
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        borderRadius: '0.25rem'
                                    }
                                },
                                    h('p', { style: { fontSize: '0.875rem', marginBottom: '0.25rem' } },
                                        h('strong', null, 'Score Breakdown:')
                                    ),
                                    h('div', { style: { fontSize: '0.75rem', color: '#374151' } },
                                        h('p', null, `Base Score: ${lastAttemptScore.baseScore}%`),
                                        lastAttemptScore.hintPenalty > 0 && h('p', null, 
                                            `Hint Penalty: -${lastAttemptScore.hintPenalty}%`
                                        ),
                                        h('p', { style: { fontWeight: 'bold', marginTop: '0.25rem' } }, 
                                            `Final Score: ${lastAttemptScore.finalScore}%`
                                        )
                                    )
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

        // Enhanced Interactive Species Guide with Reference Photos
        showGuide && h(InteractiveSpeciesGuide, {
            specimen: currentSpecimen,
            speciesHints: currentSpeciesHints,
            photos: currentPhotos,
            referencePhotos: currentReferencePhotos,
            onClose: () => {
                setShowGuide(false);
                handleNext();
            },
            onTryAgain: () => {
                setShowGuide(false);
                handleNext();
            }
        }),

        // Photo modal
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

// Training Modules Component (Integrated)
function TrainingModules({ onBack, onModuleSelect, userProgress, user }) {
    const [selectedCategory, setSelectedCategory] = React.useState('foundation');
    
    // Foundation modules data
    const foundationModules = [
        {
            id: 'foundation-1',
            title: 'Basic Diagnostic Features',
            description: 'Learn to identify key mushroom parts: cap, stem, gills, and spores',
            duration: '20 min',
            difficulty: 'Beginner',
            icon: '🔍',
            completed: userProgress['foundation-1']?.completed || false
        },
        {
            id: 'foundation-2',
            title: 'Spore Print Basics',
            description: 'Master the essential skill of collecting and interpreting spore prints',
            duration: '15 min',
            difficulty: 'Beginner',
            icon: '🎨',
            completed: userProgress['foundation-2']?.completed || false
        },
        {
            id: 'foundation-3',
            title: 'Safety First: Deadly Species',
            description: 'Critical knowledge about poisonous mushrooms in Arizona',
            duration: '25 min',
            difficulty: 'Beginner',
            icon: '⚠️',
            completed: userProgress['foundation-3']?.completed || false
        },
        {
            id: 'foundation-4',
            title: 'Mycological Terminology',
            description: 'Essential vocabulary for accurate mushroom identification',
            duration: '18 min',
            difficulty: 'Beginner',
            icon: '📚',
            completed: userProgress['foundation-4']?.completed || false
        },
        {
            id: 'foundation-5',
            title: 'Arizona Fungal Families',
            description: 'Overview of major mushroom families found in Arizona',
            duration: '22 min',
            difficulty: 'Beginner',
            icon: '🌵',
            completed: userProgress['foundation-5']?.completed || false
        }
    ];

    const handleStartModule = (module) => {
        onModuleSelect(module);
    };

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header
        h('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                    h('button', { 
                        onClick: onBack, 
                        style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' } 
                    }, '← Back'),
                    h('div', null,
                        h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, '🎓 Training Modules'),
                        h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                            'Build your foundation with structured lessons'
                        )
                    )
                )
            )
        ),

        // Main Content
        h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
            // Progress overview
            h('div', {
                style: {
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }
            },
                h('h2', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                    'Your Learning Progress'
                ),
                h('p', { style: { marginBottom: '1rem', opacity: 0.9 } }, 
                    `Welcome, ${user?.display_name || user?.username || 'Learner'}! Complete foundation modules to unlock advanced features.`
                ),
                h('div', { style: { display: 'flex', gap: '1rem' } },
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `📊 ${foundationModules.filter(m => m.completed).length}/5 Complete`
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `⏱️ ~90 min total`
                    )
                )
            ),

            // Foundation Modules Grid
            h('div', null,
                h('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '🗿 Foundation Modules'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1.5rem' } }, 
                    'Essential knowledge for safe and accurate mushroom identification'
                ),
                
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' } },
                    foundationModules.map((module, idx) =>
                        h('div', {
                            key: module.id,
                            style: {
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative'
                            },
                            onClick: () => handleStartModule(module),
                            onMouseEnter: (e) => e.currentTarget.style.borderColor = '#10b981',
                            onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                        },
                            // Completion indicator
                            module.completed && h('div', {
                                style: {
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem'
                                }
                            }, '✓'),

                            h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' } },
                                h('div', { style: { fontSize: '2rem' } }, module.icon),
                                h('div', null,
                                    h('h4', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' } }, 
                                        module.title
                                    ),
                                    h('div', { style: { display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' } },
                                        h('span', null, module.duration),
                                        h('span', null, '•'),
                                        h('span', null, module.difficulty)
                                    )
                                )
                            ),
                            
                            h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' } }, 
                                module.description
                            ),
                            
                            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                h('span', { 
                                    style: { 
                                        fontSize: '0.75rem', 
                                        color: module.completed ? '#059669' : '#6b7280',
                                        fontWeight: module.completed ? '600' : '400'
                                    } 
                                }, 
                                    module.completed ? 'Completed ✓' : 'Not Started'
                                ),
                                h('button', {
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: module.completed ? '#059669' : '#3b82f6',
                                        color: 'white',
                                        borderRadius: '0.375rem',
                                        border: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }
                                }, module.completed ? 'Review' : 'Start')
                            )
                        )
                    )
                )
            ),

            // Coming Soon Section
            h('div', { style: { marginTop: '3rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' } },
                h('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#64748b' } }, 
                    '🚀 Coming Soon'
                ),
                h('p', { style: { color: '#64748b', marginBottom: '1rem' } }, 
                    'Advanced modules will be unlocked as you complete the foundation'
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' } },
                    [
                        { title: 'Genus-Specific Modules', icon: '🧬' },
                        { title: 'Advanced Techniques', icon: '🔬' },
                        { title: 'Regional Specialties', icon: '🏔️' },
                        { title: 'Chemical Testing', icon: '⚗️' }
                    ].map((item, idx) =>
                        h('div', {
                            key: idx,
                            style: {
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                opacity: 0.7
                            }
                        },
                            h('div', { style: { fontSize: '1.5rem', marginBottom: '0.5rem' } }, item.icon),
                            h('p', { style: { fontSize: '0.875rem', color: '#64748b' } }, item.title)
                        )
                    )
                )
            )
        )
    );
}

// Module Player Component (Placeholder for future development)
function ModulePlayer({ module, onComplete, onBack, saveProgress, user }) {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [completed, setCompleted] = React.useState(false);

    // Sample module content structure
    const moduleContent = {
        'foundation-1': {
            slides: [
                {
                    type: 'intro',
                    title: 'Basic Diagnostic Features',
                    content: 'Welcome to mushroom identification! In this module, you\'ll learn to identify the key parts of a mushroom that are essential for accurate identification.',
                    image: '🍄'
                },
                {
                    type: 'content',
                    title: 'The Four Main Parts',
                    content: 'Every mushroom has four main diagnostic areas:\n\n1. **Cap (Pileus)** - The top part\n2. **Stem (Stipe)** - The stalk\n3. **Gills/Pores** - Under the cap\n4. **Spore Print** - The reproductive dust',
                    image: '🔍'
                },
                {
                    type: 'quiz',
                    title: 'Quick Check',
                    question: 'What are the four main diagnostic parts of a mushroom?',
                    options: [
                        'Cap, Stem, Gills, Spores',
                        'Top, Bottom, Middle, Side',
                        'Head, Body, Arms, Legs',
                        'Color, Size, Shape, Smell'
                    ],
                    correct: 0
                },
                {
                    type: 'completion',
                    title: 'Module Complete!',
                    content: 'Congratulations! You\'ve learned the basic diagnostic features. You\'re now ready to start identifying mushrooms with confidence.',
                    image: '🎉'
                }
            ]
        }
        // Add more modules here as needed
    };

    const content = moduleContent[module.id] || {
        slides: [
            {
                type: 'placeholder',
                title: 'Module Coming Soon',
                content: `The ${module.title} module is currently under development. Check back soon for comprehensive content!`,
                image: '🚧'
            }
        ]
    };

    const handleNext = () => {
        if (currentSlide < content.slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setCompleted(true);
        
        // Save progress
        if (saveProgress) {
            await saveProgress({
                moduleId: module.id,
                progressType: 'training_module',
                score: 100,
                completed: true
            });
        }
        
        setTimeout(() => {
            onComplete(module);
        }, 2000);
    };

    const currentSlideData = content.slides[currentSlide];

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header
        h('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                        h('button', { 
                            onClick: onBack, 
                            style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' } 
                        }, '← Back to Modules'),
                        h('div', null,
                            h('h1', { style: { fontSize: '1.25rem', fontWeight: 'bold' } }, module.title),
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                                `${module.icon} ${module.duration} • ${module.difficulty}`
                            )
                        )
                    ),
                    h('div', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                        `${currentSlide + 1} / ${content.slides.length}`
                    )
                ),
                // Progress bar
                h('div', { style: { marginTop: '0.5rem', backgroundColor: '#e5e7eb', height: '0.25rem', borderRadius: '9999px' } },
                    h('div', {
                        style: {
                            width: `${((currentSlide + 1) / content.slides.length) * 100}%`,
                            height: '100%',
                            backgroundColor: '#10b981',
                            borderRadius: '9999px',
                            transition: 'width 0.3s'
                        }
                    })
                )
            )
        ),

        // Module Content
        h('div', { style: { maxWidth: '48rem', margin: '0 auto', padding: '2rem' } },
            h('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '3rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }
            },
                // Slide content based on type
                currentSlideData.type === 'intro' && h('div', null,
                    h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, currentSlideData.image),
                    h('h2', { style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                    h('p', { style: { fontSize: '1.125rem', color: '#6b7280', lineHeight: '1.6' } }, currentSlideData.content)
                ),

                currentSlideData.type === 'content' && h('div', null,
                    h('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, currentSlideData.image),
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                    h('div', { 
                        style: { 
                            fontSize: '1rem', 
                            color: '#374151', 
                            lineHeight: '1.6', 
                            textAlign: 'left', 
                            maxWidth: '32rem', 
                            margin: '0 auto',
                            whiteSpace: 'pre-line'
                        } 
                    }, currentSlideData.content)
                ),

                currentSlideData.type === 'completion' && h('div', null,
                    h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, completed ? '🏆' : currentSlideData.image),
                    h('h2', { style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#059669' } }, 
                        completed ? 'Module Completed!' : currentSlideData.title
                    ),
                    h('p', { style: { fontSize: '1.125rem', color: '#6b7280', lineHeight: '1.6' } }, 
                        completed ? `Great job! You've completed the ${module.title} module.` : currentSlideData.content
                    )
                ),

                currentSlideData.type === 'placeholder' && h('div', null,
                    h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, currentSlideData.image),
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                    h('p', { style: { fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' } }, currentSlideData.content)
                )
            ),

            // Navigation
            h('div', { style: { display: 'flex', justifyContent: 'center', marginTop: '2rem' } },
                h('button', {
                    onClick: handleNext,
                    disabled: completed,
                    style: {
                        padding: '0.75rem 2rem',
                        backgroundColor: completed ? '#10b981' : '#3b82f6',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: completed ? 'default' : 'pointer',
                        fontWeight: '500',
                        fontSize: '1rem'
                    }
                }, 
                    completed ? 'Returning to modules...' :
                    currentSlide < content.slides.length - 1 ? 'Next →' : 'Complete Module'
                )
            )
        )
    );
}

// Enhanced Home Page with Training Modules Section and Auth
function HomePage(props) {
    const specimens = props.specimens || [];
    const user = props.user;
    const userProgress = props.userProgress || {};
    const onStudyModeSelect = props.onStudyModeSelect;
    const onTrainingModuleSelect = props.onTrainingModuleSelect;
    const onAuthRequired = props.onAuthRequired;
    const onProfileClick = props.onProfileClick;
    const onSignOut = props.onSignOut;
    
    const approvedCount = specimens.filter(s => s.status === 'approved').length;
    const dnaCount = specimens.filter(s => s.dna_sequenced).length;
    const speciesWithHints = props.speciesWithHints || 0;
    
    // Calculate training progress
    const completedModules = Object.values(userProgress).filter(p => p.completed).length;
    const totalModules = 5; // Foundation modules count

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header with Auth Status
        h('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { textAlign: 'center', flex: 1 } },
                        h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                        h('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                        h('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                    ),
                    // Auth buttons
                    h('div', { style: { position: 'absolute', right: '1.5rem' } },
                        user ? 
                            h('div', { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' } },
                                h('button', {
                                    onClick: onProfileClick,
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }
                                }, '👤 Profile'),
                                h('button', {
                                    onClick: onSignOut,
                                    style: {
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }
                                }, 'Sign Out')
                            ) :
                            h('button', {
                                onClick: onAuthRequired,
                                style: {
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, 'Sign In / Sign Up')
                    )
                )
            )
        ),

        // Main content
        h('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
            // User Profile Banner or Sign In Prompt
            user ? 
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
                        `Welcome, ${user.display_name || user.username}! 🍄`
                    ),
                    h('p', { style: { marginBottom: '1rem' } }, 'Your learning journey continues...'),
                    h('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } },
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `📊 ${specimens.length} Total`
                        ),
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `✅ ${approvedCount} Approved`
                        ),
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `🧬 ${dnaCount} DNA Verified`
                        ),
                        h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                            `🎓 ${completedModules}/${totalModules} Modules`
                        )
                    )
                ) :
                h('div', {
                    style: {
                        background: 'linear-gradient(to right, #f59e0b, #dc2626)',
                        borderRadius: '0.75rem',
                        color: 'white',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }
                },
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 
                        '🔒 Sign in to Track Your Progress'
                    ),
                    h('p', { style: { marginBottom: '1rem' } }, 
                        'Create an account to save your learning progress and unlock all features'
                    ),
                    h('button', {
                        onClick: onAuthRequired,
                        style: {
                            padding: '0.75rem 2rem',
                            backgroundColor: 'white',
                            color: '#dc2626',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                        }
                    }, 'Get Started Free')
                ),

            // Training Modules Section
            h('div', { style: { marginBottom: '2rem' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '🎓 Training Modules'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                    'Build your foundation with structured lessons before practicing'
                ),
                
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' } },
                    // Foundation Modules Card
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => user ? onTrainingModuleSelect('foundation') : onAuthRequired(),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#10b981',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🗿'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Foundation Modules'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Essential knowledge for beginners'
                        ),
                        user ? 
                            h('div', null,
                                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                    h('span', { style: { fontSize: '0.75rem', color: '#059669' } }, 
                                        `${completedModules}/5 Complete`
                                    ),
                                    h('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                        '20-25 min each'
                                    )
                                ),
                                // Progress bar
                                h('div', { 
                                    style: { 
                                        marginTop: '0.5rem', 
                                        height: '4px', 
                                        backgroundColor: '#e5e7eb', 
                                        borderRadius: '2px' 
                                    } 
                                },
                                    h('div', {
                                        style: {
                                            width: `${(completedModules / 5) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#10b981',
                                            borderRadius: '2px',
                                            transition: 'width 0.3s'
                                        }
                                    })
                                )
                            ) :
                            h('div', { style: { fontSize: '0.75rem', color: '#f59e0b' } }, 
                                '🔒 Sign in to access'
                            )
                    ),

                    // Coming Soon Card
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            border: '2px dashed #e5e7eb',
                            opacity: 0.7
                        }
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🚀'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Advanced Modules'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Genus-specific and advanced techniques'
                        ),
                        h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                            'Unlocked after foundation completion'
                        )
                    )
                )
            ),

            // Study Modes Section
            h('div', { style: { marginBottom: '2rem' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '📚 Study Modes'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                    'Practice identification with real specimens'
                ),
                
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' } },
                    // Quick Study
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => user ? onStudyModeSelect('quick') : onAuthRequired(),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#3b82f6',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '⚡'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Quick Study'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            '10 random specimens with progressive hints'
                        ),
                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            h('span', { style: { fontSize: '0.75rem', color: '#3b82f6' } }, 
                                `${approvedCount} Available`
                            ),
                            h('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                '~15 min'
                            )
                        ),
                        !user && h('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                            '🔒 Sign in to play'
                        )
                    ),

                    // Focused Study
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => user ? onStudyModeSelect('focused') : onAuthRequired(),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#8b5cf6',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🎯'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Focused Study'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Filter by family, genus, or features'
                        ),
                        h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                            'Coming in Phase 3'
                        )
                    ),

                    // Marathon Mode
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => user ? onStudyModeSelect('marathon') : onAuthRequired(),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#f59e0b',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
                    },
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🏃'),
                        h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 
                            'Marathon Mode'
                        ),
                        h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 
                            'Unlimited questions with spaced repetition'
                        ),
                        h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                            'Coming in Phase 3'
                        )
                    )
                )
            ),

            // Quick Stats Section
            h('div', {
                style: {
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }
            },
                h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' } }, 
                    '📊 Database Statistics'
                ),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' } },
                    [
                        { label: 'Total Specimens', value: specimens.length, icon: '🔬' },
                        { label: 'DNA Verified', value: dnaCount, icon: '🧬' },
                        { label: 'Arizona Families', value: new Set(specimens.map(s => s.family)).size, icon: '🏔️' },
                        { label: 'Species Available', value: new Set(specimens.map(s => s.species_name)).size, icon: '🍄' }
                    ].map((stat, idx) =>
                        h('div', {
                            key: idx,
                            style: {
                                textAlign: 'center',
                                padding: '1rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '0.5rem'
                            }
                        },
                            h('div', { style: { fontSize: '1.5rem', marginBottom: '0.25rem' } }, stat.icon),
                            h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' } }, stat.value),
                            h('div', { style: { fontSize: '0.75rem', color: '#6b7280' } }, stat.label)
                        )
                    )
                )
            )
        )
    );
}

// Main Authenticated App Component
function AuthenticatedApp() {
    const { user, loading: authLoading, signOut } = window.useAuth ? window.useAuth() : { user: null, loading: true };
    const { userProgress, saveProgress, loadUserProgress } = useUserProfile(user);
    
    const [currentView, setCurrentView] = React.useState('loading');
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [profileUsername, setProfileUsername] = React.useState(null);
    const [specimens, setSpecimens] = React.useState([]);
    const [speciesHints, setSpeciesHints] = React.useState({});
    const [referencePhotos, setReferencePhotos] = React.useState({});
    const [specimenPhotos, setSpecimenPhotos] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [currentModule, setCurrentModule] = React.useState(null);
    
    // Handle URL routing for public profiles
    React.useEffect(() => {
        const handleRoute = () => {
            const path = window.location.pathname;
            const match = path.match(/^\/profile\/(.+)$/);
            
            if (match) {
                const username = match[1];
                setProfileUsername(username);
                setCurrentView('public-profile');
            }
        };
        
        handleRoute();
        window.addEventListener('popstate', handleRoute);
        
        return () => window.removeEventListener('popstate', handleRoute);
    }, []);
    
    // Load initial data
    React.useEffect(() => {
        const loadData = async () => {
            try {
                // Load specimens
                const specimensResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?select=*&order=created_at.desc`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });

                if (specimensResponse.ok) {
                    const specimensData = await specimensResponse.json();
                    setSpecimens(specimensData);
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
                    const hintsMap = {};
                    hintsData.forEach(hint => {
                        hintsMap[hint.species_name] = hint;
                    });
                    setSpeciesHints(hintsMap);
                }

                // Load field guides (for reference photos)
                const guidesResponse = await fetch(`${SUPABASE_URL}/rest/v1/field_guides?select=*`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });

                if (guidesResponse.ok) {
                    const guidesData = await guidesResponse.json();
                    const photosMap = {};
                    guidesData.forEach(guide => {
                        if (guide.reference_photos && guide.reference_photos.length > 0) {
                            photosMap[guide.species_name] = guide.reference_photos;
                        }
                    });
                    setReferencePhotos(photosMap);
                }

                setCurrentView('home');
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load application data');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            loadData();
        }
    }, [authLoading]);

    // Load specimen photos on demand
    const loadSpecimenPhotos = React.useCallback(async (inaturalistId) => {
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
                    large_url: photo.url.replace('square', 'large')
                }));
                
                setSpecimenPhotos(prev => ({
                    ...prev,
                    [inaturalistId]: photos
                }));
                
                return photos;
            }
        } catch (error) {
            console.error(`Error loading photos for ${inaturalistId}:`, error);
        }
        
        return [];
    }, [specimenPhotos]);

    const handleStudyModeSelect = (mode) => {
        setCurrentView(`study-${mode}`);
    };

    const handleTrainingModuleSelect = (category) => {
        if (category === 'foundation') {
            setCurrentView('training-modules');
        }
    };

    const handleModuleSelect = (module) => {
        setCurrentModule(module);
        setCurrentView('module-player');
    };

    const handleModuleComplete = async (module) => {
        console.log(`Module ${module.id} completed!`);
        await loadUserProgress(); // Refresh progress
        setCurrentView('training-modules');
        setCurrentModule(null);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
        setCurrentModule(null);
    };

    const handleAuthRequired = () => {
        setShowAuthModal(true);
    };

    const handleProfileClick = () => {
        if (window.ProfilePage) {
            setCurrentView('profile');
        }
    };

    const handleSignOut = async () => {
        if (signOut) {
            await signOut();
            setCurrentView('home');
        }
    };
    
    // Show loading while auth is loading
    if (authLoading) {
        return h(LoadingScreen);
    }
    
    // Show public profile if viewing one
    if (currentView === 'public-profile' && profileUsername && window.PublicProfile) {
        return h(window.PublicProfile, {
            username: profileUsername,
            onBack: () => {
                window.history.pushState({}, '', '/');
                setCurrentView('home');
                setProfileUsername(null);
            },
            onClose: () => {
                if (user && user.username === profileUsername) {
                    setCurrentView('profile');
                }
            }
        });
    }

    // Error state
    if (error) {
        return h('div', { style: { padding: '2rem', textAlign: 'center' } },
            h('h1', { style: { color: '#ef4444' } }, 'Error'),
            h('p', null, error),
            h('button', { 
                onClick: () => window.location.reload(),
                style: {
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                }
            }, 'Retry')
        );
    }

    // Loading state
    if (loading || currentView === 'loading') {
        return h(LoadingScreen);
    }

    // Show auth modal over current content
    if (showAuthModal && window.AuthModal) {
        return h('div', null,
            currentView === 'home' && h(HomePage, {
                specimens,
                user,
                userProgress,
                speciesWithHints: Object.keys(speciesHints).length,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: handleTrainingModuleSelect,
                onAuthRequired: handleAuthRequired,
                onProfileClick: handleProfileClick,
                onSignOut: handleSignOut
            }),
            h(window.AuthModal, {
                onClose: () => setShowAuthModal(false)
            })
        );
    }

    // Route to appropriate component
    switch (currentView) {
        case 'home':
            return h(HomePage, {
                specimens,
                user,
                userProgress,
                speciesWithHints: Object.keys(speciesHints).length,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: handleTrainingModuleSelect,
                onAuthRequired: handleAuthRequired,
                onProfileClick: handleProfileClick,
                onSignOut: handleSignOut
            });

        case 'profile':
            return window.ProfilePage ? h(window.ProfilePage, {
                user,
                userProgress,
                onBack: handleBackToHome
            }) : handleBackToHome();

        case 'study-quick':
            return h(QuickStudy, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            });

        case 'study-focused':
            return window.FocusedStudy ? h(window.FocusedStudy, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            }) : handleBackToHome();

        case 'study-marathon':
            return window.MarathonMode ? h(window.MarathonMode, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            }) : handleBackToHome();

        case 'training-modules':
            return h(TrainingModules, {
                userProgress,
                user,
                onBack: handleBackToHome,
                onModuleSelect: handleModuleSelect
            });

        case 'module-player':
            return h(ModulePlayer, {
                module: currentModule,
                user,
                saveProgress,
                onComplete: handleModuleComplete,
                onBack: () => setCurrentView('training-modules')
            });

        default:
            return h(HomePage, {
                specimens,
                user,
                userProgress,
                speciesWithHints: Object.keys(speciesHints).length,
                onStudyModeSelect: handleStudyModeSelect,
                onTrainingModuleSelect: handleTrainingModuleSelect,
                onAuthRequired: handleAuthRequired,
                onProfileClick: handleProfileClick,
                onSignOut: handleSignOut
            });
    }
}

// Main App Component with Auth Wrapper
function App() {
    const [appReady, setAppReady] = React.useState(false);
    
    // Wait for auth to be loaded
    React.useEffect(() => {
        const checkReady = () => {
            if (window.AuthProvider && window.useAuth) {
                setAppReady(true);
            } else {
                setTimeout(checkReady, 100);
            }
        };
        checkReady();
    }, []);
    
    if (!appReady) {
        return h(LoadingScreen);
    }
    
    return h(window.AuthProvider, null,
        h(AuthenticatedApp)
    );
}

// Initialize the app
console.log('🚀 Initializing Flash Fungi App with Authentication...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        console.error('❌ Root element not found');
        return;
    }

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('❌ React not available');
        rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React libraries not loaded</h1></div>';
        return;
    }

    try {
        // Use React 18 createRoot API
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(h(App));
        } else {
            // Fallback for older React versions
            ReactDOM.render(h(App), rootElement);
        }
        
        console.log('✅ Flash Fungi initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;"><h1>Error initializing app</h1><p>${error.message}</p></div>`;
    }
}