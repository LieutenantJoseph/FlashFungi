// ModulePlayer.js - Interactive Module Learning System
// Flash Fungi - Complete module player with slides, quizzes, and progress tracking

(function() {
    'use strict';
    
    window.ModulePlayer = function ModulePlayer({ module, onComplete, onBack, saveProgress, user }) {
        const [currentSlide, setCurrentSlide] = React.useState(0);
        const [completed, setCompleted] = React.useState(false);
        const [quizAnswers, setQuizAnswers] = React.useState({});
        const [quizSubmitted, setQuizSubmitted] = React.useState({});

        // Complete module content structure
        const moduleContent = {
            'foundation-1': {
                slides: [
                    {
                        type: 'intro',
                        title: 'Basic Diagnostic Features',
                        content: 'Welcome to mushroom identification! In this module, you\'ll learn to identify the key parts of a mushroom that are essential for accurate identification.',
                        image: '🍄',
                        subtitle: 'Foundation Module 1'
                    },
                    {
                        type: 'content',
                        title: 'The Four Main Parts',
                        content: 'Every mushroom has four main diagnostic areas:\n\n• **Cap (Pileus)** - The top part that houses the spores\n• **Stem (Stipe)** - The stalk that supports the cap\n• **Gills/Pores** - Under the cap where spores are produced\n• **Spore Print** - The reproductive dust released by the mushroom',
                        image: '🔬',
                        note: 'These four parts provide the most important identification clues'
                    },
                    {
                        type: 'content',
                        title: 'Cap Characteristics',
                        content: 'The cap is often the most visible part of a mushroom. Key features to observe:\n\n• **Shape** - Convex, flat, depressed, funnel-shaped\n• **Surface** - Smooth, scaly, hairy, sticky\n• **Color** - Note any color changes with age or bruising\n• **Size** - Measure diameter when fully expanded\n• **Margin** - Straight, curved, wavy, or split',
                        image: '🎩'
                    },
                    {
                        type: 'quiz',
                        title: 'Quick Check: Cap Features',
                        question: 'Which cap feature is most important for identification?',
                        options: [
                            'All features together provide the complete picture',
                            'Only the color matters',
                            'Only the size matters',
                            'Only the shape matters'
                        ],
                        correct: 0,
                        explanation: 'Correct! No single feature alone is enough - you need to observe all cap characteristics together for accurate identification.'
                    },
                    {
                        type: 'content',
                        title: 'Gill Attachment',
                        content: 'How the gills attach to the stem is crucial for identification:\n\n• **Free** - Gills don\'t touch the stem\n• **Attached** - Gills connect directly to the stem\n• **Decurrent** - Gills run down the stem\n• **Notched** - Gills have a small notch near the stem',
                        image: '📏',
                        note: 'Gill attachment is one of the most reliable identification features'
                    },
                    {
                        type: 'quiz',
                        title: 'Gill Attachment Quiz',
                        question: 'What does "decurrent" gill attachment mean?',
                        options: [
                            'Gills run down the stem',
                            'Gills don\'t touch the stem',
                            'Gills are notched near the stem',
                            'Gills are curved upward'
                        ],
                        correct: 0,
                        explanation: 'Exactly! Decurrent gills extend down the stem, often creating a funnel-like appearance.'
                    },
                    {
                        type: 'content',
                        title: 'Stem Features',
                        content: 'The stem provides important identification clues:\n\n• **Shape** - Equal, bulbous, tapered\n• **Surface** - Smooth, scaly, hairy, ringed\n• **Interior** - Solid, hollow, stuffed with pith\n• **Base** - Bulbous, pointed, with cup (volva)\n• **Ring** - Present or absent, moveable or fixed',
                        image: '🏗️'
                    },
                    {
                        type: 'content',
                        title: 'Spore Prints',
                        content: 'Spore color is one of the most reliable identification features:\n\n• **White** - Most common, includes many Agaricus species\n• **Brown** - Various shades from light to dark chocolate\n• **Black** - Often indicates Coprinus or similar genera\n• **Pink** - Characteristic of Entoloma and some others\n• **Purple-brown** - Common in Agaricus species\n• **Yellow** - Less common but diagnostic when present',
                        image: '🎨',
                        note: 'Always take a spore print when identifying unknown mushrooms'
                    },
                    {
                        type: 'quiz',
                        title: 'Final Assessment',
                        question: 'What are the four main diagnostic parts of a mushroom?',
                        options: [
                            'Cap, Stem, Gills/Pores, Spore Print',
                            'Top, Bottom, Middle, Side',
                            'Head, Body, Arms, Legs',
                            'Color, Size, Shape, Smell'
                        ],
                        correct: 0,
                        explanation: 'Perfect! Cap, Stem, Gills/Pores, and Spore Print are the four fundamental parts that provide the most important identification information.'
                    },
                    {
                        type: 'completion',
                        title: 'Module Complete!',
                        content: 'Congratulations! You\'ve learned the basic diagnostic features that form the foundation of mushroom identification. You\'re now ready to start identifying mushrooms with confidence.\n\nKey takeaways:\n• Always examine all four main parts\n• Take detailed notes on each feature\n• Spore prints are essential for accurate ID\n• Practice observing these features in the field',
                        image: '🎓',
                        achievement: 'Basic Diagnostic Features Master'
                    }
                ]
            },
            'foundation-2': {
                slides: [
                    {
                        type: 'intro',
                        title: 'Spore Print Basics',
                        content: 'Spore prints are one of the most reliable identification tools in mycology. Learn how to collect and interpret them properly.',
                        image: '🎨',
                        subtitle: 'Foundation Module 2'
                    },
                    {
                        type: 'content',
                        title: 'Why Spore Prints Matter',
                        content: 'Spore color is often the decisive factor in mushroom identification:\n\n• **Consistent** - Unlike caps, spore color rarely varies\n• **Diagnostic** - Many genera have characteristic spore colors\n• **Safety** - Essential for distinguishing safe from dangerous species\n• **Scientific** - Used in all professional identification guides',
                        image: '🔬'
                    },
                    {
                        type: 'content',
                        title: 'Collection Method',
                        content: 'Follow these steps for perfect spore prints:\n\n1. **Fresh specimen** - Use recently collected mushrooms\n2. **Remove stem** - Cut close to the gills/pores\n3. **Paper choice** - Use both white and black paper\n4. **Cover** - Place a glass or bowl over the cap\n5. **Wait** - Leave undisturbed for 6-12 hours\n6. **Document** - Photograph and note the color',
                        image: '📋'
                    },
                    {
                        type: 'quiz',
                        title: 'Collection Quiz',
                        question: 'Why should you use both white and black paper for spore prints?',
                        options: [
                            'To see spore color clearly regardless of whether spores are light or dark',
                            'Black paper is better for all mushrooms',
                            'White paper is better for all mushrooms',
                            'It doesn\'t matter which color you use'
                        ],
                        correct: 0,
                        explanation: 'Correct! Light-colored spores show better on black paper, while dark spores show better on white paper.'
                    },
                    {
                        type: 'completion',
                        title: 'Spore Print Expert!',
                        content: 'You now understand the critical importance of spore prints in mushroom identification. This skill will serve you well in all your future mycological endeavors.',
                        image: '🏆',
                        achievement: 'Spore Print Specialist'
                    }
                ]
            },
            'foundation-3': {
                slides: [
                    {
                        type: 'intro',
                        title: 'Safety First: Deadly Species',
                        content: 'Learn about the most dangerous mushrooms found in Arizona and how to avoid them. This knowledge could save your life.',
                        image: '⚠️',
                        subtitle: 'Foundation Module 3 - Critical Safety Information'
                    },
                    {
                        type: 'content',
                        title: 'Arizona\'s Dangerous Species',
                        content: 'While Arizona has fewer deadly mushrooms than other regions, several dangerous species occur here:\n\n• **Amanita species** - Death caps and destroying angels\n• **Galerina species** - Small brown mushrooms with deadly toxins\n• **Some Cortinarius** - Kidney-damaging compounds\n• **False morels** - Can cause serious illness',
                        image: '💀',
                        note: 'NEVER eat any wild mushroom without 100% positive identification'
                    },
                    {
                        type: 'content',
                        title: 'The Golden Rules of Safety',
                        content: 'Follow these rules without exception:\n\n1. **Never guess** - 99% sure = 0% sure\n2. **Spore prints required** - Always take spore prints\n3. **Expert confirmation** - Have experts verify edible species\n4. **No mixed collections** - Keep species separate\n5. **Start small** - Try tiny amounts of new species first\n6. **Know your allergies** - Even safe species can cause reactions',
                        image: '🛡️'
                    },
                    {
                        type: 'quiz',
                        title: 'Safety Assessment',
                        question: 'What percentage certainty do you need before eating a wild mushroom?',
                        options: [
                            '100% - anything less is too dangerous',
                            '95% is probably safe enough',
                            '90% is acceptable for experienced foragers',
                            '80% if you start with a small amount'
                        ],
                        correct: 0,
                        explanation: 'Absolutely correct! There is no room for uncertainty when it comes to mushroom safety. 100% identification is the only acceptable standard.'
                    },
                    {
                        type: 'completion',
                        title: 'Safety Certified',
                        content: 'You now understand the critical safety principles for mushroom identification. Remember: when in doubt, don\'t risk it. Your safety is worth more than any meal.',
                        image: '🛡️',
                        achievement: 'Mushroom Safety Expert'
                    }
                ]
            },
            'foundation-4': {
                slides: [
                    {
                        type: 'intro',
                        title: 'Mycological Terminology',
                        content: 'Master the essential vocabulary that mycologists use to describe mushrooms precisely and scientifically.',
                        image: '📚',
                        subtitle: 'Foundation Module 4'
                    },
                    {
                        type: 'content',
                        title: 'Morphological Terms',
                        content: 'Key terms for describing mushroom shapes and features:\n\n• **Pileus** - The cap of the mushroom\n• **Stipe** - The stem or stalk\n• **Lamellae** - The gills under the cap\n• **Annulus** - A ring around the stem\n• **Volva** - A cup at the base of the stem\n• **Hymenium** - The spore-bearing surface',
                        image: '🔤'
                    },
                    {
                        type: 'quiz',
                        title: 'Terminology Quiz',
                        question: 'What is the scientific term for mushroom gills?',
                        options: [
                            'Lamellae',
                            'Pileus',
                            'Stipe',
                            'Hymenium'
                        ],
                        correct: 0,
                        explanation: 'Correct! Lamellae is the proper scientific term for the gill structures under the mushroom cap.'
                    },
                    {
                        type: 'completion',
                        title: 'Terminology Master',
                        content: 'You now have the vocabulary foundation needed to understand field guides and communicate with other mycologists effectively.',
                        image: '📖',
                        achievement: 'Mycological Vocabulary Expert'
                    }
                ]
            },
            'foundation-5': {
                slides: [
                    {
                        type: 'intro',
                        title: 'Arizona Fungal Families',
                        content: 'Explore the major mushroom families found in Arizona\'s diverse ecosystems, from desert floors to mountain peaks.',
                        image: '🌵',
                        subtitle: 'Foundation Module 5'
                    },
                    {
                        type: 'content',
                        title: 'Desert Specialists',
                        content: 'Arizona\'s unique climate supports specialized fungi:\n\n• **Agaricus** - Button mushrooms and relatives\n• **Pleurotus** - Oyster mushrooms on wood\n• **Schizophyllum** - Split-gill fungi\n• **Desert truffles** - Underground specialists\n• **Coprinus** - Ink cap mushrooms',
                        image: '🏜️'
                    },
                    {
                        type: 'content',
                        title: 'Mountain Diversity',
                        content: 'Higher elevations support more diverse fungal communities:\n\n• **Boletus** - Porcini and relatives\n• **Cantharellus** - Chanterelles\n• **Armillaria** - Honey mushrooms\n• **Hypomyces** - Parasitic fungi\n• **Morchella** - True morels (seasonal)',
                        image: '⛰️'
                    },
                    {
                        type: 'quiz',
                        title: 'Arizona Families Quiz',
                        question: 'Which family is most commonly found in Arizona deserts?',
                        options: [
                            'Agaricus - they tolerate dry conditions well',
                            'Cantharellus - they need desert moisture',
                            'Boletus - they prefer desert soil',
                            'Morchella - they fruit in desert heat'
                        ],
                        correct: 0,
                        explanation: 'Correct! Agaricus species are well-adapted to Arizona\'s dry climate and are commonly found throughout the state.'
                    },
                    {
                        type: 'completion',
                        title: 'Arizona Fungi Expert',
                        content: 'Congratulations! You now understand the fungal diversity of Arizona and are ready to explore the field with confidence.',
                        image: '🏆',
                        achievement: 'Arizona Mycologist'
                    }
                ]
            }
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

        const handlePrevious = () => {
            if (currentSlide > 0) {
                setCurrentSlide(prev => prev - 1);
            }
        };

        const handleQuizAnswer = (slideIndex, answerIndex) => {
            setQuizAnswers(prev => ({
                ...prev,
                [slideIndex]: answerIndex
            }));
        };

        const handleQuizSubmit = (slideIndex) => {
            setQuizSubmitted(prev => ({
                ...prev,
                [slideIndex]: true
            }));
        };

        const handleComplete = async () => {
            setCompleted(true);
            
            // Calculate quiz performance
            const quizSlides = content.slides.filter(slide => slide.type === 'quiz');
            const correctAnswers = quizSlides.filter((slide, idx) => {
                const slideIndex = content.slides.indexOf(slide);
                return quizAnswers[slideIndex] === slide.correct;
            }).length;
            
            const quizScore = quizSlides.length > 0 ? Math.round((correctAnswers / quizSlides.length) * 100) : 100;
            
            // Save progress
            if (saveProgress) {
                await saveProgress({
                    moduleId: module.id,
                    progressType: 'training_module',
                    score: quizScore,
                    completed: true,
                    quizPerformance: {
                        correct: correctAnswers,
                        total: quizSlides.length,
                        percentage: quizScore
                    }
                });
            }
            
            setTimeout(() => {
                onComplete(module);
            }, 2000);
        };

        const currentSlideData = content.slides[currentSlide];
        const isQuizSlide = currentSlideData?.type === 'quiz';
        const userAnswer = quizAnswers[currentSlide];
        const isQuizSubmitted = quizSubmitted[currentSlide];

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
            // Header
            React.createElement('div', { style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' } },
                React.createElement('div', { style: { maxWidth: '72rem', margin: '0 auto' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                            React.createElement('button', { 
                                onClick: onBack, 
                                style: { 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    fontSize: '1rem',
                                    color: '#6b7280'
                                } 
                            }, '← Back to Modules'),
                            React.createElement('div', null,
                                React.createElement('h1', { style: { fontSize: '1.25rem', fontWeight: 'bold' } }, module.title),
                                React.createElement('p', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                                    `${module.icon} ${module.duration} • ${module.difficulty}`
                                )
                            )
                        ),
                        React.createElement('div', { style: { fontSize: '0.875rem', color: '#6b7280' } },
                            `${currentSlide + 1} / ${content.slides.length}`
                        )
                    ),
                    // Progress bar
                    React.createElement('div', { style: { marginTop: '0.5rem', backgroundColor: '#e5e7eb', height: '0.25rem', borderRadius: '9999px' } },
                        React.createElement('div', {
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
            React.createElement('div', { style: { maxWidth: '48rem', margin: '0 auto', padding: '2rem' } },
                React.createElement('div', {
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '3rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        minHeight: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }
                },
                    // Slide content based on type
                    currentSlideData.type === 'intro' && React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, currentSlideData.image),
                        currentSlideData.subtitle && React.createElement('p', { 
                            style: { 
                                fontSize: '0.875rem', 
                                color: '#6b7280', 
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            } 
                        }, currentSlideData.subtitle),
                        React.createElement('h2', { style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                        React.createElement('p', { style: { fontSize: '1.125rem', color: '#6b7280', lineHeight: '1.6', maxWidth: '32rem', margin: '0 auto' } }, currentSlideData.content)
                    ),

                    currentSlideData.type === 'content' && React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, currentSlideData.image),
                        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '1rem', 
                                color: '#374151', 
                                lineHeight: '1.6', 
                                textAlign: 'left', 
                                maxWidth: '32rem', 
                                margin: '0 auto',
                                whiteSpace: 'pre-line'
                            } 
                        }, currentSlideData.content),
                        currentSlideData.note && React.createElement('div', {
                            style: {
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#0369a1',
                                fontStyle: 'italic'
                            }
                        }, `💡 ${currentSlideData.note}`)
                    ),

                    currentSlideData.type === 'quiz' && React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: '2.5rem', marginBottom: '1rem' } }, '🤔'),
                        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                        React.createElement('p', { style: { fontSize: '1.125rem', color: '#374151', marginBottom: '2rem' } }, currentSlideData.question),
                        
                        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' } },
                            currentSlideData.options.map((option, idx) =>
                                React.createElement('button', {
                                    key: idx,
                                    onClick: () => handleQuizAnswer(currentSlide, idx),
                                    disabled: isQuizSubmitted,
                                    style: {
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        border: `2px solid ${
                                            isQuizSubmitted 
                                                ? (idx === currentSlideData.correct ? '#10b981' : idx === userAnswer ? '#ef4444' : '#e5e7eb')
                                                : (userAnswer === idx ? '#3b82f6' : '#e5e7eb')
                                        }`,
                                        backgroundColor: isQuizSubmitted 
                                            ? (idx === currentSlideData.correct ? '#f0fdf4' : idx === userAnswer ? '#fef2f2' : 'white')
                                            : (userAnswer === idx ? '#dbeafe' : 'white'),
                                        cursor: isQuizSubmitted ? 'default' : 'pointer',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s'
                                    }
                                }, `${String.fromCharCode(65 + idx)}. ${option}`)
                            )
                        ),
                        
                        !isQuizSubmitted && userAnswer !== undefined && React.createElement('button', {
                            onClick: () => handleQuizSubmit(currentSlide),
                            style: {
                                padding: '0.75rem 2rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                                marginBottom: '1rem'
                            }
                        }, 'Submit Answer'),
                        
                        isQuizSubmitted && React.createElement('div', {
                            style: {
                                padding: '1rem',
                                backgroundColor: userAnswer === currentSlideData.correct ? '#f0fdf4' : '#fef2f2',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: userAnswer === currentSlideData.correct ? '#059669' : '#dc2626',
                                textAlign: 'left'
                            }
                        },
                            React.createElement('p', { style: { fontWeight: 'bold', marginBottom: '0.5rem' } },
                                userAnswer === currentSlideData.correct ? '✅ Correct!' : '❌ Not quite right.'
                            ),
                            React.createElement('p', null, currentSlideData.explanation)
                        )
                    ),

                    currentSlideData.type === 'completion' && React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, completed ? '🎉' : currentSlideData.image),
                        React.createElement('h2', { style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#059669' } }, 
                            completed ? 'Module Completed!' : currentSlideData.title
                        ),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '1rem', 
                                color: '#6b7280', 
                                lineHeight: '1.6',
                                whiteSpace: 'pre-line',
                                marginBottom: '1.5rem'
                            } 
                        }, completed ? `Great job! You've completed the ${module.title} module.` : currentSlideData.content),
                        
                        currentSlideData.achievement && React.createElement('div', {
                            style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#f3e8ff',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#7c3aed'
                            }
                        },
                            React.createElement('span', null, '🏆'),
                            React.createElement('span', null, `Achievement Unlocked: ${currentSlideData.achievement}`)
                        )
                    ),

                    currentSlideData.type === 'placeholder' && React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, currentSlideData.image),
                        React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, currentSlideData.title),
                        React.createElement('p', { style: { fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' } }, currentSlideData.content)
                    )
                ),

                // Navigation
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '2rem' } },
                    React.createElement('button', {
                        onClick: handlePrevious,
                        disabled: currentSlide === 0,
                        style: {
                            padding: '0.75rem 1.5rem',
                            backgroundColor: currentSlide === 0 ? '#e5e7eb' : '#6b7280',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                        }
                    }, '← Previous'),
                    
                    React.createElement('button', {
                        onClick: handleNext,
                        disabled: completed || (isQuizSlide && !isQuizSubmitted),
                        style: {
                            padding: '0.75rem 1.5rem',
                            backgroundColor: completed ? '#10b981' : (isQuizSlide && !isQuizSubmitted) ? '#e5e7eb' : '#3b82f6',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: completed ? 'default' : (isQuizSlide && !isQuizSubmitted) ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                        }
                    }, 
                        completed ? 'Returning to modules...' :
                        currentSlide < content.slides.length - 1 ? 'Next →' : 'Complete Module'
                    )
                )
            )
        );
    };
    
    console.log('✅ Complete ModulePlayer component loaded');
    
})();