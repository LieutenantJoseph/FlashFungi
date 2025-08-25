// ModulePlayer.js - Updated with Living Mycology Dark Theme
(function() {
    'use strict';
    
    // Design constants matching the established dark theme
    const COLORS = {
        // Dark theme backgrounds
        BG_PRIMARY: '#1A1A19',
        BG_CARD: '#2A2826',
        BG_HOVER: '#323230',
        
        // Text colors
        TEXT_PRIMARY: '#E8E2D5',
        TEXT_SECONDARY: '#B8B2A5',
        TEXT_MUTED: '#888478',
        
        // Accent colors
        ACCENT_PRIMARY: '#8B7355',
        ACCENT_SUCCESS: '#7C8650',
        ACCENT_WARNING: '#D4A574',
        ACCENT_ERROR: '#B85C5C',
        ACCENT_INFO: '#6B8CAE',
        ACCENT_PURPLE: '#9B7AA8',
        
        // Borders
        BORDER_DEFAULT: 'rgba(139, 115, 85, 0.2)',
        BORDER_HOVER: 'rgba(139, 115, 85, 0.4)',
        BORDER_ACTIVE: 'rgba(139, 115, 85, 0.6)'
    };
    
    // Gradient definitions
    const GRADIENTS = {
        EARTH: 'linear-gradient(135deg, #8B7355 0%, #6B5745 100%)',
        FOREST: 'linear-gradient(135deg, #7C8650 0%, #5C6640 100%)',
        SUNSET: 'linear-gradient(135deg, #D4A574 0%, #B48554 100%)',
        MUSHROOM: 'linear-gradient(135deg, #8B7355 0%, #A0826D 50%, #6B5745 100%)',
        PURPLE: 'linear-gradient(135deg, #9B7AA8 0%, #7B5A88 100%)'
    };
    
    window.ModulePlayer = function ModulePlayer({ module, onComplete, onBack, saveProgress, user }) {
        const [currentSlide, setCurrentSlide] = React.useState(0);
        const [completed, setCompleted] = React.useState(false);
        const [quizAnswers, setQuizAnswers] = React.useState({});
        const [quizSubmitted, setQuizSubmitted] = React.useState({});

        // Helper function to convert database module content to slides format
        const convertDatabaseModuleToSlides = (dbModule) => {
            const slides = [];
            
            // Add intro slide
            slides.push({
                type: 'intro',
                title: dbModule.title || 'Module',
                content: dbModule.description || 'Learn essential mushroom identification skills in this interactive module.',
                image: dbModule.icon || '🍄',
                subtitle: `${dbModule.category || 'Training'} Module`
            });

            // Parse content if it exists and has structure
            if (dbModule.content) {
                // Handle string content (from database)
                if (typeof dbModule.content === 'string') {
                    try {
                        const parsedContent = JSON.parse(dbModule.content);
                        if (parsedContent.slides) {
                            slides.push(...parsedContent.slides);
                        } else if (parsedContent.introduction) {
                            // Handle module structure with sections (introduction, morphology, etc.)
                            
                            // Add introduction pages
                            if (parsedContent.introduction?.pages) {
                                parsedContent.introduction.pages.forEach(page => {
                                    slides.push({
                                        type: 'content',
                                        title: page.title || 'Content',
                                        content: page.content || '',
                                        image: page.image || '📖',
                                        note: page.key_points ? page.key_points.join('\n') : null
                                    });
                                });
                            }
                            
                            // Add quiz/assessment questions
                            if (parsedContent.assessment?.questions) {
                                parsedContent.assessment.questions.forEach((q, idx) => {
                                    slides.push({
                                        type: 'quiz',
                                        title: `Question ${idx + 1}`,
                                        question: q.question,
                                        options: q.options || [],
                                        correct: q.correct || 0,
                                        explanation: q.explanation || 'Review the module content and try again.'
                                    });
                                });
                            }
                            
                            // Add comparison questions
                            if (parsedContent.comparison?.questions) {
                                parsedContent.comparison.questions.forEach((q, idx) => {
                                    slides.push({
                                        type: 'quiz',
                                        title: 'Comparison Quiz',
                                        question: q.question,
                                        options: q.options || [],
                                        correct: q.correct || 0,
                                        explanation: q.explanation || 'Think about the distinguishing features.'
                                    });
                                });
                            }
                        } else {
                            // Add a single content slide if no recognized structure
                            slides.push({
                                type: 'content',
                                title: 'Module Content',
                                content: JSON.stringify(parsedContent, null, 2),
                                image: '📚'
                            });
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to parse module content as JSON:', e);
                        // If not JSON, treat as plain text content
                        slides.push({
                            type: 'content',
                            title: 'Module Content',
                            content: dbModule.content,
                            image: '📚'
                        });
                    }
                } else if (dbModule.content.slides) {
                    // Already has slides structure
                    slides.push(...dbModule.content.slides);
                } else if (Array.isArray(dbModule.content)) {
                    // Content is an array of slides
                    slides.push(...dbModule.content);
                } else if (typeof dbModule.content === 'object') {
                    // Handle object content with sections
                    if (dbModule.content.introduction?.pages) {
                        dbModule.content.introduction.pages.forEach(page => {
                            slides.push({
                                type: 'content',
                                title: page.title || 'Content',
                                content: page.content || '',
                                image: page.image || '📖',
                                note: page.key_points ? page.key_points.join('\n') : null
                            });
                        });
                    }
                    
                    if (dbModule.content.assessment?.questions) {
                        dbModule.content.assessment.questions.forEach((q, idx) => {
                            slides.push({
                                type: 'quiz',
                                title: `Question ${idx + 1}`,
                                question: q.question,
                                options: q.options || [],
                                correct: q.correct || 0,
                                explanation: q.explanation || 'Review the module content and try again.'
                            });
                        });
                    }
                } else {
                    // Content is in an unexpected format
                    slides.push({
                        type: 'content',
                        title: 'Module Content',
                        content: 'This module is being prepared. Check back soon for updated content.',
                        image: '🚧'
                    });
                }
            }

            // Add completion slide if not already present
            if (!slides.some(s => s.type === 'complete')) {
                slides.push({
                    type: 'complete',
                    title: 'Module Complete!',
                    content: `Congratulations! You've completed the ${dbModule.title} module.`,
                    achievement: dbModule.achievement || 'Module Complete'
                });
            }

            return { slides };
        };

        // Complete module content structure (fallback for demo)
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
                        type: 'complete',
                        title: 'Module Complete!',
                        content: 'Congratulations! You\'ve completed the Basic Diagnostic Features module.',
                        achievement: 'Foundation Learner'
                    }
                ]
            }
        };

        // Get content - handle database modules
        const content = React.useMemo(() => {
            console.log('📖 ModulePlayer - Processing module:', module?.id, module);
            
            // Check if module has slides directly
            if (module?.content?.slides) {
                console.log('📖 Module has slides directly');
                return module.content;
            }
            // Check if it's a hardcoded module
            if (moduleContent[module?.id]) {
                console.log('📖 Using hardcoded module content');
                return moduleContent[module.id];
            }
            // Convert database module format
            if (module) {
                console.log('📖 Converting database module to slides format');
                const converted = convertDatabaseModuleToSlides(module);
                console.log('📖 Converted to', converted.slides?.length, 'slides');
                return converted;
            }
            // Fallback to demo content
            console.log('📖 Using fallback demo content');
            return moduleContent['foundation-1'];
        }, [module]);

        // Ensure we have valid content structure
        const slides = content?.slides || [];
        const currentSlideData = slides[currentSlide] || { 
            type: 'placeholder', 
            title: 'Module Loading...', 
            content: 'Please wait while the module content loads.',
            image: '⏳'
        };

        // Handle case where module has no valid content
        if (!module || slides.length === 0) {
            return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: COLORS.BG_PRIMARY } },
                React.createElement('div', { 
                    style: { 
                        maxWidth: '48rem', 
                        margin: '0 auto', 
                        padding: '2rem' 
                    } 
                },
                    React.createElement('div', {
                        style: {
                            backgroundColor: COLORS.BG_CARD,
                            borderRadius: '0.75rem',
                            padding: '3rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                            textAlign: 'center'
                        }
                    },
                        React.createElement('div', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '🚧'),
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                marginBottom: '1rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, 'Module Content Unavailable'),
                        React.createElement('p', { 
                            style: { 
                                color: COLORS.TEXT_SECONDARY,
                                marginBottom: '2rem'
                            } 
                        }, 'This module is currently being prepared. Please check back later or contact support if this issue persists.'),
                        React.createElement('button', {
                            onClick: onBack,
                            style: {
                                padding: '0.75rem 1.5rem',
                                background: GRADIENTS.EARTH,
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            },
                            onMouseEnter: (e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                            },
                            onMouseLeave: (e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                            }
                        }, 'Back to Modules')
                    )
                )
            );
        }

        const handleNext = () => {
            if (currentSlide < slides.length - 1) {
                setCurrentSlide(currentSlide + 1);
            } else if (!completed) {
                setCompleted(true);
                
                // Save progress to database
                if (saveProgress && user && module) {
                    console.log('💾 Saving module completion:', module.id);
                    
                    // Calculate quiz performance
                    const quizSlides = slides.filter(s => s.type === 'quiz');
                    const correctAnswers = quizSlides.filter((s, idx) => {
                        const slideIndex = slides.indexOf(s);
                        return quizAnswers[slideIndex] === s.correct;
                    }).length;
                    
                    const progressData = {
                        moduleId: module.id,
                        progressType: 'module_completion',
                        completed: true,
                        score: quizSlides.length > 0 ? Math.round((correctAnswers / quizSlides.length) * 100) : 100,
                        attempts: 1,
                        metadata: {
                            title: module.title,
                            category: module.category,
                            difficulty: module.difficulty_level,
                            duration_minutes: module.duration_minutes,
                            completedAt: new Date().toISOString()
                        },
                        quizPerformance: {
                            totalQuestions: quizSlides.length,
                            correctAnswers: correctAnswers,
                            answers: quizAnswers
                        }
                    };
                    
                    saveProgress(progressData)
                        .then(result => {
                            if (result) {
                                console.log('✅ Module progress saved successfully');
                            } else {
                                console.warn('⚠️ Failed to save module progress');
                            }
                        })
                        .catch(err => {
                            console.error('❌ Error saving module progress:', err);
                        });
                }
                
                setTimeout(() => onComplete(module), 2000);
            }
        };

        const handlePrevious = () => {
            if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
            }
        };

        const handleQuizAnswer = (questionIndex, answerIndex) => {
            setQuizAnswers({ ...quizAnswers, [questionIndex]: answerIndex });
        };

        const handleQuizSubmit = (questionIndex) => {
            setQuizSubmitted({ ...quizSubmitted, [questionIndex]: true });
        };

        const isQuizSlide = currentSlideData.type === 'quiz';
        const isQuizAnswered = isQuizSlide && quizAnswers[currentSlide] !== undefined;
        const isQuizSubmitted = isQuizSlide && quizSubmitted[currentSlide];
        const isAnswerCorrect = isQuizSlide && quizAnswers[currentSlide] === currentSlideData.correct;

        return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: COLORS.BG_PRIMARY } },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: COLORS.BG_CARD, 
                    borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}`, 
                    padding: '1rem' 
                } 
            },
                React.createElement('div', { style: { maxWidth: '48rem', margin: '0 auto' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                            React.createElement('button', {
                                onClick: onBack,
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    color: COLORS.TEXT_SECONDARY,
                                    transition: 'color 0.2s'
                                },
                                onMouseEnter: (e) => e.target.style.color = COLORS.TEXT_PRIMARY,
                                onMouseLeave: (e) => e.target.style.color = COLORS.TEXT_SECONDARY
                            }, '← Back to Modules'),
                            React.createElement('div', null,
                                React.createElement('h1', { 
                                    style: { 
                                        fontSize: '1.25rem', 
                                        fontWeight: 'bold',
                                        color: COLORS.TEXT_PRIMARY
                                    } 
                                }, module.title),
                                React.createElement('p', { 
                                    style: { 
                                        fontSize: '0.875rem', 
                                        color: COLORS.TEXT_SECONDARY 
                                    } 
                                },
                                    `${module.icon || '📖'} ${module.duration || '20 min'} • ${module.difficulty || 'beginner'}`
                                )
                            )
                        ),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '0.875rem', 
                                color: COLORS.TEXT_SECONDARY 
                            } 
                        },
                            `${currentSlide + 1} / ${slides.length}`
                        )
                    ),
                    // Progress bar
                    React.createElement('div', { 
                        style: { 
                            marginTop: '0.5rem', 
                            backgroundColor: COLORS.BG_PRIMARY, 
                            height: '0.25rem', 
                            borderRadius: '9999px' 
                        } 
                    },
                        React.createElement('div', {
                            style: {
                                width: `${((currentSlide + 1) / slides.length) * 100}%`,
                                height: '100%',
                                background: GRADIENTS.FOREST,
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
                        backgroundColor: COLORS.BG_CARD,
                        borderRadius: '0.75rem',
                        padding: '3rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                        textAlign: 'center',
                        minHeight: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }
                },
                    // Content types
                    (currentSlideData.type === 'intro' || currentSlideData.type === 'content' || currentSlideData.type === 'complete') && 
                    React.createElement('div', null,
                        React.createElement('div', { 
                            style: { 
                                fontSize: '4rem', 
                                marginBottom: '1rem' 
                            } 
                        }, currentSlideData.image || '📚'),
                        currentSlideData.subtitle && React.createElement('p', { 
                            style: { 
                                fontSize: '0.875rem', 
                                color: COLORS.ACCENT_INFO,
                                marginBottom: '0.5rem',
                                fontWeight: '600'
                            } 
                        }, currentSlideData.subtitle),
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.75rem', 
                                fontWeight: 'bold', 
                                marginBottom: '1rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, completed ? 'Module Completed!' : currentSlideData.title),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '1rem', 
                                color: COLORS.TEXT_SECONDARY,
                                lineHeight: '1.6',
                                whiteSpace: 'pre-line',
                                marginBottom: '1.5rem',
                                textAlign: 'left',
                                maxWidth: '600px',
                                margin: '0 auto'
                            },
                            dangerouslySetInnerHTML: { 
                                __html: currentSlideData.content.replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${COLORS.TEXT_PRIMARY}">$1</strong>`)
                            }
                        }),
                        currentSlideData.note && React.createElement('div', {
                            style: {
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: COLORS.ACCENT_INFO + '20',
                                borderLeft: `3px solid ${COLORS.ACCENT_INFO}`,
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: COLORS.TEXT_PRIMARY,
                                textAlign: 'left',
                                maxWidth: '500px',
                                margin: '1rem auto 0'
                            }
                        }, currentSlideData.note),
                        currentSlideData.achievement && React.createElement('div', {
                            style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: GRADIENTS.PURPLE,
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'white',
                                marginTop: '1rem',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }
                        },
                            React.createElement('span', null, '🏆'),
                            React.createElement('span', null, `Achievement Unlocked: ${currentSlideData.achievement}`)
                        )
                    ),

                    // Quiz slide
                    isQuizSlide && React.createElement('div', null,
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.75rem', 
                                fontWeight: 'bold', 
                                marginBottom: '1rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, currentSlideData.title),
                        React.createElement('p', { 
                            style: { 
                                fontSize: '1.125rem', 
                                marginBottom: '2rem',
                                color: COLORS.TEXT_SECONDARY
                            } 
                        }, currentSlideData.question),
                        React.createElement('div', { 
                            style: { 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '0.75rem',
                                maxWidth: '500px',
                                margin: '0 auto'
                            } 
                        },
                            currentSlideData.options.map((option, idx) => {
                                const isSelected = quizAnswers[currentSlide] === idx;
                                const showResult = isQuizSubmitted;
                                const isCorrect = idx === currentSlideData.correct;
                                
                                return React.createElement('button', {
                                    key: idx,
                                    onClick: () => !isQuizSubmitted && handleQuizAnswer(currentSlide, idx),
                                    disabled: isQuizSubmitted,
                                    style: {
                                        padding: '1rem',
                                        textAlign: 'left',
                                        backgroundColor: showResult ? 
                                            (isCorrect ? COLORS.ACCENT_SUCCESS + '20' : 
                                             isSelected ? COLORS.ACCENT_ERROR + '20' : COLORS.BG_PRIMARY) :
                                            (isSelected ? COLORS.ACCENT_PRIMARY : COLORS.BG_PRIMARY),
                                        color: showResult ?
                                            (isCorrect ? COLORS.ACCENT_SUCCESS :
                                             isSelected ? COLORS.ACCENT_ERROR : COLORS.TEXT_SECONDARY) :
                                            (isSelected ? 'white' : COLORS.TEXT_SECONDARY),
                                        border: `2px solid ${
                                            showResult ? 
                                            (isCorrect ? COLORS.ACCENT_SUCCESS : 
                                             isSelected ? COLORS.ACCENT_ERROR : COLORS.BORDER_DEFAULT) :
                                            (isSelected ? COLORS.ACCENT_PRIMARY : COLORS.BORDER_DEFAULT)
                                        }`,
                                        borderRadius: '0.5rem',
                                        cursor: isQuizSubmitted ? 'default' : 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        if (!isQuizSubmitted && !isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_HOVER;
                                        }
                                    },
                                    onMouseLeave: (e) => {
                                        if (!isQuizSubmitted && !isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_PRIMARY;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_DEFAULT;
                                        }
                                    }
                                },
                                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
                                        React.createElement('span', { 
                                            style: { 
                                                fontWeight: '600' 
                                            } 
                                        }, String.fromCharCode(65 + idx) + '.'),
                                        React.createElement('span', null, option),
                                        showResult && isCorrect && React.createElement('span', null, '✓')
                                    )
                                );
                            })
                        ),
                        !isQuizSubmitted && isQuizAnswered && React.createElement('button', {
                            onClick: () => handleQuizSubmit(currentSlide),
                            style: {
                                marginTop: '1.5rem',
                                padding: '0.75rem 2rem',
                                background: GRADIENTS.EARTH,
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            },
                            onMouseEnter: (e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                            },
                            onMouseLeave: (e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                            }
                        }, 'Submit Answer'),
                        isQuizSubmitted && React.createElement('div', {
                            style: {
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: isAnswerCorrect ? COLORS.ACCENT_SUCCESS + '20' : COLORS.ACCENT_WARNING + '20',
                                borderLeft: `3px solid ${isAnswerCorrect ? COLORS.ACCENT_SUCCESS : COLORS.ACCENT_WARNING}`,
                                borderRadius: '0.5rem',
                                textAlign: 'left',
                                maxWidth: '500px',
                                margin: '1.5rem auto 0'
                            }
                        },
                            React.createElement('p', { 
                                style: { 
                                    fontWeight: '600', 
                                    marginBottom: '0.5rem',
                                    color: isAnswerCorrect ? COLORS.ACCENT_SUCCESS : COLORS.ACCENT_WARNING
                                } 
                            }, isAnswerCorrect ? '✓ Correct!' : '⚠ Not quite right'),
                            React.createElement('p', { 
                                style: { 
                                    fontSize: '0.875rem',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, currentSlideData.explanation)
                        )
                    )
                ),

                // Navigation
                React.createElement('div', { 
                    style: { 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: '2rem' 
                    } 
                },
                    React.createElement('button', {
                        onClick: handlePrevious,
                        disabled: currentSlide === 0,
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: currentSlide === 0 ? COLORS.BG_HOVER : GRADIENTS.FOREST,
                            color: currentSlide === 0 ? COLORS.TEXT_MUTED : 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: currentSlide === 0 ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'
                        },
                        onMouseEnter: (e) => {
                            if (currentSlide !== 0) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                            }
                        },
                        onMouseLeave: (e) => {
                            if (currentSlide !== 0) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                            }
                        }
                    }, '← Previous'),
                    
                    React.createElement('button', {
                        onClick: handleNext,
                        disabled: completed || (isQuizSlide && !isQuizSubmitted),
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: completed ? GRADIENTS.FOREST : 
                                       (isQuizSlide && !isQuizSubmitted) ? COLORS.BG_HOVER : 
                                       GRADIENTS.EARTH,
                            color: completed || (isQuizSlide && !isQuizSubmitted) ? COLORS.TEXT_MUTED : 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: completed ? 'default' : 
                                   (isQuizSlide && !isQuizSubmitted) ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: (completed || (isQuizSlide && !isQuizSubmitted)) ? 
                                      'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'
                        },
                        onMouseEnter: (e) => {
                            if (!completed && !(isQuizSlide && !isQuizSubmitted)) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                            }
                        },
                        onMouseLeave: (e) => {
                            if (!completed && !(isQuizSlide && !isQuizSubmitted)) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                            }
                        }
                    }, 
                        completed ? 'Returning to modules...' :
                        currentSlide < slides.length - 1 ? 'Next →' : 'Complete Module'
                    )
                )
            )
        );
    };
    
    console.log('✅ ModulePlayer component loaded with dark theme');
    
})();