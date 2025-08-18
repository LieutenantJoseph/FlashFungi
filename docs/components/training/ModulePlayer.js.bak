// Flash Fungi - Module Player Component
// Interactive module content player with progression tracking

window.ModulePlayer = function ModulePlayer({ module, onComplete, onBack, saveProgress, user }) {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [completed, setCompleted] = React.useState(false);

    const h = React.createElement;

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
        },
        'foundation-2': {
            slides: [
                {
                    type: 'intro',
                    title: 'Spore Print Basics',
                    content: 'Spore prints are one of the most important tools for mushroom identification. Learn how to collect and interpret them correctly.',
                    image: '🎨'
                },
                {
                    type: 'content',
                    title: 'What is a Spore Print?',
                    content: 'A spore print is made by placing a mushroom cap gill-side down on paper and allowing the spores to fall naturally.\n\n**Key benefits:**\n- Reveals true spore color\n- Essential for identification\n- Easy to collect\n- Permanent record',
                    image: '🔬'
                },
                {
                    type: 'content',
                    title: 'How to Make a Spore Print',
                    content: '**Steps:**\n1. Cut the stem flush with the cap\n2. Place cap gill-side down on white paper\n3. Cover with a glass or bowl\n4. Wait 4-24 hours\n5. Lift cap carefully to reveal print',
                    image: '📋'
                },
                {
                    type: 'completion',
                    title: 'Spore Print Master!',
                    content: 'You now know how to create spore prints - a crucial skill for accurate mushroom identification!',
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

                currentSlideData.type === 'quiz' && h('div', null,
                    h('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '❓'),
                    h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                    h('p', { style: { fontSize: '1.125rem', marginBottom: '1.5rem' } }, currentSlideData.question),
                    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '24rem', margin: '0 auto' } },
                        currentSlideData.options.map((option, idx) =>
                            h('button', {
                                key: idx,
                                onClick: () => {
                                    if (idx === currentSlideData.correct) {
                                        alert('Correct! 🎉');
                                        handleNext();
                                    } else {
                                        alert('Not quite right. Try again! 🤔');
                                    }
                                },
                                style: {
                                    padding: '0.75rem',
                                    backgroundColor: '#f3f4f6',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e) => {
                                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                                    e.currentTarget.style.borderColor = '#10b981';
                                },
                                onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                }
                            }, `${String.fromCharCode(65 + idx)}. ${option}`)
                        )
                    )
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
                currentSlideData.type !== 'quiz' && h('button', {
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
};

console.log('✅ ModulePlayer component loaded');