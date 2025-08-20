// app.js - Updated Main Application 
// Preserves original design while fixing auth and using SharedFlashcard
// Version 3.1 - Restored UI with working authentication

console.log('🍄 Flash Fungi v3.1 - Restored Original Design with Fixes');

// Check React availability
if (typeof React === 'undefined') {
    console.error('❌ React not available');
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: React not loaded</h1></div>';
} else {
    console.log('✅ React loaded successfully');

// Configuration - matches original
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';

// Export configuration
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
const API_BASE = '/api';

const h = React.createElement;

// Initialize Supabase client immediately
if (!window.supabase) {
    console.log('🔌 Creating Supabase client...');
    window.supabase = window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');
}

// User Profile Management Hook (restored from original)
function useUserProfile(authUser, getAuthToken) {
    const [userProgress, setUserProgress] = React.useState({});
    
    console.log('📊 useUserProfile called with user:', authUser ? authUser.id : 'no user');

    const loadUserProgress = React.useCallback(async () => {
        if (!authUser?.id) {
            console.log('📊 No user ID, skipping user progress load');
            return;
        }
        
        console.log('📊 Loading user progress for user:', authUser.id);
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${authUser.id}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
                console.log('📊 User progress loaded:', Object.keys(progressMap).length, 'entries');
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }, [authUser]);

    const saveProgress = React.useCallback(async (progressData) => {
        if (!authUser?.id) return;

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/user_progress`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    user_id: authUser.id,
                    created_at: new Date().toISOString(),
                    ...progressData
                })
            });
            
            if (response.ok) {
                await loadUserProgress();
                return true;
            } else {
                const errorText = await response.text();
                console.error('Failed to save progress:', response.status, errorText);
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

// Loading Screen Component (original design)
function LoadingScreen() {
    console.log('⏳ LoadingScreen rendering');
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

// Training Modules Component (restored original design)
function TrainingModules({ onBack, onModuleSelect, userProgress, user }) {
    const [selectedCategory, setSelectedCategory] = React.useState('foundation');
    
    // Foundation modules data (original)
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
            icon: '🔬',
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
        // Header (original design)
        h('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                    h('button', { 
                        onClick: onBack, 
                        style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' } 
                    }, '← Back'),
                    h('div', null,
                        h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, '📚 Training Modules'),
                        h('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                            'Build your foundation with structured lessons'
                        )
                    )
                )
            )
        ),

        // Main Content (original design)
        h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
            // Progress overview (original)
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
                        `📖 ${foundationModules.filter(m => m.completed).length}/5 Complete`
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } },
                        `⏱️ ~90 min total`
                    )
                )
            ),

            // Foundation Modules Grid (original design)
            h('div', null,
                h('h3', { style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '🏗️ Foundation Modules'
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

            // Coming Soon Section (original)
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
                        { title: 'Regional Specialties', icon: '🏜️' },
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

// Module Player Component (original design)
function ModulePlayer({ module, onComplete, onBack, saveProgress, user }) {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [completed, setCompleted] = React.useState(false);

    // Sample module content structure (original)
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
                    image: '🏆'
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
                module_id: module.id,
                progress_type: 'training_module',
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
        // Header (original design)
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

        // Module Content (original design)
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
                    h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, completed ? '🎉' : currentSlideData.image),
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

// Enhanced Home Page (original design restored)
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
        // Header with Auth Status (original design)
        h('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    h('div', { style: { textAlign: 'center', flex: 1 } },
                        h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                        h('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold' } }, 'Flash Fungi'),
                        h('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                    ),
                    // Auth buttons (original design)
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

        // Main content (original design)
        h('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem' } },
            // User Profile Banner or Sign In Prompt (original)
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
                            `📚 ${completedModules}/${totalModules} Modules`
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
                        '🚀 Sign in to Track Your Progress'
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

            // Training Modules Section (original)
            h('div', { style: { marginBottom: '2rem' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '📚 Training Modules'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                    'Build your foundation with structured lessons before practicing'
                ),
                
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' } },
                    // Foundation Modules Card (original)
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
                        h('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, '🏗️'),
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

                    // Coming Soon Card (original)
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

            // Study Modes Section (original design)
            h('div', { style: { marginBottom: '2rem' } },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 
                    '🎯 Study Modes'
                ),
                h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                    'Practice identification with real specimens'
                ),
                
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' } },
                    // Quick Study (original)
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

                    // Focused Study (original)
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
                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            h('span', { style: { fontSize: '0.75rem', color: '#8b5cf6' } }, 
                                'Now Available!'
                            ),
                            h('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                '~25 min'
                            )
                        ),
                        !user && h('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                            '🔒 Sign in to access'
                        )
                    ),

                    // Marathon Mode (original)
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
                        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            h('span', { style: { fontSize: '0.75rem', color: '#f59e0b' } }, 
                                'Now Available!'
                            ),
                            h('span', { style: { fontSize: '0.75rem', color: '#6b7280' } }, 
                                'Unlimited'
                            )
                        ),
                        !user && h('div', { style: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' } }, 
                            '🔒 Sign in to access'
                        )
                    )
                )
            ),

            // Quick Stats Section (original)
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
                        { label: 'Arizona Families', value: new Set(specimens.map(s => s.family)).size, icon: '🏜️' },
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

// Main Authenticated App Component (updated for v3.1)
function AuthenticatedApp() {
    console.log('🍄 AuthenticatedApp rendering v3.1...');
    
    // Auth context with error handling
    let authContext;
    try {
        authContext = window.useAuth();
        console.log('🔐 Auth context from hook:', authContext);
    } catch (error) {
        console.error('🔐 Auth hook error:', error);
        authContext = { user: null, loading: false, signOut: null };
    }
    
    const { user, loading: authLoading, signOut } = authContext;
    console.log('🔐 Auth data:', { user: user ? user.email : 'none', authLoading });
    
    const { userProgress, saveProgress, loadUserProgress } = useUserProfile(user, () => '');
    
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
    const [authCheckComplete, setAuthCheckComplete] = React.useState(false);
    
    console.log('🍄 Component state:', { currentView, loading, authLoading, authCheckComplete });
    
    // Complete auth check after delay
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            console.log('🔐 Force completing auth check after 2 seconds');
            setAuthCheckComplete(true);
        }, 2000);
        
        return () => clearTimeout(timeout);
    }, []);
    
    // Mark auth as complete when authLoading becomes false
    React.useEffect(() => {
        if (!authLoading) {
            console.log('🔐 Auth loading complete');
            setAuthCheckComplete(true);
        }
    }, [authLoading]);
    
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
        console.log('📊 Data loading useEffect triggered, authCheckComplete:', authCheckComplete);
        
        const loadData = async () => {
            console.log('📊 Starting data load...');
            try {
                // Load specimens
                console.log('📊 Fetching specimens...');
                const specimensResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?select=*&order=created_at.desc`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                console.log('📊 Specimens response:', specimensResponse.ok, specimensResponse.status);

                if (specimensResponse.ok) {
                    const specimensData = await specimensResponse.json();
                    console.log('📊 Specimens loaded:', specimensData.length);
                    setSpecimens(specimensData);
                }

                // Load species hints
                console.log('📊 Fetching species hints...');
                const hintsResponse = await fetch(`${SUPABASE_URL}/rest/v1/species_hints?select=*`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                console.log('📊 Hints response:', hintsResponse.ok, hintsResponse.status);

                if (hintsResponse.ok) {
                    const hintsData = await hintsResponse.json();
                    console.log('📊 Hints loaded:', hintsData.length);
                    const hintsMap = {};
                    hintsData.forEach(hint => {
                        hintsMap[hint.species_name] = hint;
                    });
                    setSpeciesHints(hintsMap);
                }

                // Load field guides (for reference photos)
                console.log('📊 Fetching field guides...');
                const guidesResponse = await fetch(`${SUPABASE_URL}/rest/v1/field_guides?select=*`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                console.log('📊 Guides response:', guidesResponse.ok, guidesResponse.status);

                if (guidesResponse.ok) {
                    const guidesData = await guidesResponse.json();
                    console.log('📊 Guides loaded:', guidesData.length);
                    const photosMap = {};
                    guidesData.forEach(guide => {
                        if (guide.reference_photos && guide.reference_photos.length > 0) {
                            photosMap[guide.species_name] = guide.reference_photos;
                        }
                    });
                    setReferencePhotos(photosMap);
                }

                console.log('📊 Setting currentView to home...');
                setCurrentView('home');
            } catch (err) {
                console.error('📊 Error loading data:', err);
                setError('Failed to load application data');
            } finally {
                console.log('📊 Setting loading to false...');
                setLoading(false);
            }
        };

        if (authCheckComplete) {
            console.log('📊 Auth check complete, starting data load...');
            loadData();
        } else {
            console.log('📊 Auth check not complete, waiting...');
        }
    }, [authCheckComplete]);

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
    
    // Show loading while waiting for initial setup
    const shouldShowLoading = !authCheckComplete || loading || currentView === 'loading';
    
    if (shouldShowLoading) {
        console.log('⏳ Showing LoadingScreen - authCheckComplete:', authCheckComplete, 'loading:', loading, 'currentView:', currentView);
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
            return window.SharedFlashcard ? h(window.SharedFlashcard, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                mode: 'quick',
                onBack: handleBackToHome
            }) : handleBackToHome();

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

// Main App Component with Auth Wrapper (original pattern)
function App() {
    const [appReady, setAppReady] = React.useState(false);
    
    console.log('🍄 App component rendering, appReady:', appReady);
    console.log('🔐 window.AuthProvider available?', !!window.AuthProvider);
    console.log('🔐 window.useAuth available?', !!window.useAuth);
    console.log('🔐 window.supabase available?', !!window.supabase);
    
    // Wait for auth to be loaded
    React.useEffect(() => {
        let checkCount = 0;
        const checkReady = () => {
            checkCount++;
            console.log(`🔐 Checking auth availability (attempt ${checkCount})...`);
            console.log('  - Supabase client:', !!window.supabase);
            console.log('  - AuthProvider:', !!window.AuthProvider);
            console.log('  - useAuth:', !!window.useAuth);
            
            if (window.supabase && window.AuthProvider && window.useAuth) {
                console.log('🔐 Auth system ready!');
                setAppReady(true);
            } else {
                if (checkCount < 50) { // Max 5 seconds
                    setTimeout(checkReady, 100);
                } else {
                    console.error('🔐 Auth system failed to load after 5 seconds');
                    console.log('🔐 Final window state:', {
                        supabase: !!window.supabase,
                        AuthProvider: !!window.AuthProvider,
                        useAuth: !!window.useAuth
                    });
                    // Try to proceed anyway in case there's a timing issue
                    if (window.AuthProvider && window.useAuth) {
                        console.log('🔐 Auth functions available, proceeding anyway...');
                        setAppReady(true);
                    }
                }
            }
        };
        checkReady();
    }, []);
    
    if (!appReady) {
        console.log('⏳ App not ready, showing LoadingScreen');
        return h(LoadingScreen);
    }
    
    console.log('🍄 App ready, rendering AuthProvider with AuthenticatedApp');
    // Directly render AuthenticatedApp inside AuthProvider
    return h(window.AuthProvider, null,
        h(AuthenticatedApp)
    );
}

// Initialize the app
console.log('🚀 Initializing Flash Fungi App v3.1...');

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
        
        console.log('✅ Flash Fungi v3.1 initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;"><h1>Error initializing app</h1><p>${error.message}</p></div>`;
    }
}
}