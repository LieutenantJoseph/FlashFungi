// ModulePlayer.js - Interactive Module Learning System with Dark Theme
// Flash Fungi - Using database content directly with proper progress saving

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
    
    window.ModulePlayer = function ModulePlayer({ module, onComplete, onBack, saveProgress, user, userProgress }) {
        const [currentSlide, setCurrentSlide] = React.useState(0);
        const [completed, setCompleted] = React.useState(false);
        const [quizAnswers, setQuizAnswers] = React.useState({});
        const [quizSubmitted, setQuizSubmitted] = React.useState({});
        
        // Check if module was previously completed
        const previouslyCompleted = React.useMemo(() => {
            const progressKey = `training_module_${module?.id}`;
            const moduleProgress = userProgress?.[progressKey] || userProgress?.[module?.id];
            return moduleProgress?.completed || false;
        }, [module, userProgress]);

        // Transform database content into slides format
        const transformDatabaseContent = (dbContent) => {
            const slides = [];
            
            // Add introduction pages as slides
            if (dbContent?.introduction?.pages) {
                dbContent.introduction.pages.forEach(page => {
                    slides.push({
                        type: 'content',
                        title: page.title || 'Untitled',
                        content: page.content || '',
                        image: page.image || '🍄'
                    });
                });
            }
            
            // Add quiz questions as slides
            if (dbContent?.quiz?.questions) {
                dbContent.quiz.questions.forEach((q, index) => {
                    slides.push({
                        type: 'quiz',
                        title: `Quiz Question ${index + 1}`,
                        question: q.question,
                        options: q.options || [],
                        correct: q.correct || 0,
                        explanation: q.explanation || 'Keep studying to understand this concept better!'
                    });
                });
            }
            
            // Add assessment questions if quiz not present
            if (!dbContent?.quiz?.questions && dbContent?.assessment?.questions) {
                dbContent.assessment.questions.forEach((q, index) => {
                    slides.push({
                        type: 'quiz',
                        title: `Assessment ${index + 1}`,
                        question: q.question,
                        options: q.options || [],
                        correct: q.correct || 0,
                        explanation: q.explanation || 'Review the module content and try again.'
                    });
                });
            }
            
            // Add a completion slide if we have content
            if (slides.length > 0) {
                slides.push({
                    type: 'completion',
                    title: 'Module Complete!',
                    content: `Congratulations! You've completed the ${module.title} module.`,
                    image: '🎉'
                });
            }
            
            return slides;
        };

        // Use database content or show error
        const content = React.useMemo(() => {
            console.log('📖 ModulePlayer - Processing module:', module?.id, module);
            
            if (module?.content && Object.keys(module.content).length > 0) {
                const slides = transformDatabaseContent(module.content);
                
                // If no slides were generated, show error
                if (slides.length === 0) {
                    return {
                        slides: [{
                            type: 'error',
                            title: 'No Content Available',
                            content: 'This module exists but has no content yet. Please check back later or contact an administrator.',
                            image: '⚠️'
                        }]
                    };
                }
                
                console.log('📖 Generated', slides.length, 'slides from database content');
                return { slides };
            } else {
                // Database content failed to load or is empty
                return {
                    slides: [{
                        type: 'error',
                        title: 'Content Loading Error',
                        content: 'Unable to load module content from the database. Please try again later or contact support.',
                        image: '❌'
                    }]
                };
            }
        }, [module]);

        const handleNext = () => {
            if (currentSlide < content.slides.length - 1) {
                setCurrentSlide(prev => prev + 1);
            } else if (!completed) {
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
            
            // Save quiz progress
            if (saveProgress && user) {
                const currentSlideData = content.slides[slideIndex];
                const isCorrect = quizAnswers[slideIndex] === currentSlideData.correct;
                
                const quizProgressData = {
                    moduleId: module.id,
                    progressType: 'quiz',
                    score: isCorrect ? 100 : 0,
                    completed: false,
                    attempts: 1,
                    metadata: {
                        moduleTitle: module.title,
                        questionIndex: slideIndex,
                        question: currentSlideData.question,
                        userAnswer: quizAnswers[slideIndex],
                        correctAnswer: currentSlideData.correct,
                        isCorrect: isCorrect
                    }
                };
                
                console.log('💾 Saving quiz answer:', quizProgressData);
                saveProgress(quizProgressData);
            }
        };

        const handleComplete = async () => {
            setCompleted(true);
            
            // Calculate quiz performance
            const quizSlides = content.slides.filter(slide => slide.type === 'quiz');
            const correctAnswers = quizSlides.filter((slide, idx) => {
                const slideIndex = content.slides.indexOf(slide);
                return quizAnswers[slideIndex] === slide.correct;
            }).length;
            
            const quizScore = quizSlides.length > 0 ? 
                Math.round((correctAnswers / quizSlides.length) * 100) : 100;
            
            // Save progress
            if (saveProgress && user) {
                const progressData = {
                    moduleId: module.id,
                    progressType: 'training_module',
                    completed: true,
                    score: quizScore,
                    attempts: 1,
                    metadata: {
                        title: module.title,
                        category: module.category,
                        difficulty: module.difficulty_level,
                        duration_minutes: module.duration_minutes,
                        completedAt: new Date().toISOString(),
                        quizPerformance: {
                            totalQuestions: quizSlides.length,
                            correctAnswers: correctAnswers,
                            score: quizScore
                        }
                    }
                };
                
                console.log('💾 Saving module completion:', progressData);
                await saveProgress(progressData);
            }
            
            // Wait before returning
            setTimeout(() => {
                if (onComplete) {
                    onComplete(module);
                }
            }, 2000);
        };

        const currentSlideData = content.slides[currentSlide] || {};
        const progress = Math.round(((currentSlide + 1) / content.slides.length) * 100);
        const isQuizSlide = currentSlideData.type === 'quiz';
        const isQuizAnswered = isQuizSlide && quizAnswers[currentSlide] !== undefined;
        const isQuizSubmittedForSlide = isQuizSlide && quizSubmitted[currentSlide];

        return React.createElement('div', { 
            style: { 
                minHeight: '100vh', 
                backgroundColor: COLORS.BG_PRIMARY
            } 
        },
            // Header
            React.createElement('div', { 
                style: { 
                    backgroundColor: COLORS.BG_CARD,
                    borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}`,
                    padding: '1rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        maxWidth: '48rem',
                        margin: '0 auto'
                    } 
                },
                    React.createElement('div', { 
                        style: { 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        } 
                    },
                        React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            } 
                        },
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
                                        color: COLORS.TEXT_PRIMARY,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    } 
                                }, 
                                    module.title,
                                    previouslyCompleted && React.createElement('span', {
                                        style: {
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: COLORS.ACCENT_SUCCESS,
                                            color: 'white',
                                            borderRadius: '9999px',
                                            fontWeight: '500'
                                        }
                                    }, '✓ Completed')
                                )
                            )
                        ),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '0.875rem',
                                color: COLORS.TEXT_SECONDARY
                            } 
                        }, `${currentSlide + 1} / ${content.slides.length}`)
                    ),
                    
                    // Progress bar
                    React.createElement('div', { 
                        style: { 
                            width: '100%',
                            height: '0.5rem',
                            backgroundColor: COLORS.BG_PRIMARY,
                            borderRadius: '0.25rem',
                            overflow: 'hidden'
                        } 
                    },
                        React.createElement('div', { 
                            style: { 
                                width: `${progress}%`,
                                height: '100%',
                                background: GRADIENTS.FOREST,
                                transition: 'width 0.3s ease'
                            } 
                        })
                    )
                )
            ),

            // Content Card
            React.createElement('div', { 
                style: { 
                    maxWidth: '48rem',
                    margin: '2rem auto',
                    backgroundColor: COLORS.BG_CARD,
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    padding: '2rem',
                    minHeight: '400px'
                } 
            },
                // Slide content based on type
                currentSlideData.type === 'content' || currentSlideData.type === 'intro' ?
                    React.createElement('div', { style: { textAlign: 'center' } },
                        currentSlideData.image && React.createElement('div', { 
                            style: { 
                                fontSize: '4rem',
                                marginBottom: '1rem'
                            } 
                        }, currentSlideData.image),
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.875rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, currentSlideData.title),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '1.125rem',
                                lineHeight: '1.75',
                                color: COLORS.TEXT_SECONDARY,
                                whiteSpace: 'pre-wrap',
                                textAlign: 'left',
                                maxWidth: '600px',
                                margin: '0 auto'
                            } 
                        }, currentSlideData.content),
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
                        }, currentSlideData.note)
                    ) :
                
                isQuizSlide ?
                    React.createElement('div', null,
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                color: COLORS.TEXT_PRIMARY
                            } 
                        }, currentSlideData.title),
                        React.createElement('p', { 
                            style: { 
                                fontSize: '1.125rem',
                                marginBottom: '1.5rem',
                                color: COLORS.TEXT_SECONDARY
                            } 
                        }, currentSlideData.question),
                        React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            } 
                        },
                            currentSlideData.options.map((option, idx) => {
                                const isSelected = quizAnswers[currentSlide] === idx;
                                const showResult = isQuizSubmittedForSlide;
                                const isCorrect = idx === currentSlideData.correct;
                                
                                return React.createElement('button', {
                                    key: idx,
                                    onClick: () => !isQuizSubmittedForSlide && handleQuizAnswer(currentSlide, idx),
                                    disabled: isQuizSubmittedForSlide,
                                    style: {
                                        padding: '1rem',
                                        textAlign: 'left',
                                        backgroundColor: showResult ? 
                                            (isCorrect ? COLORS.ACCENT_SUCCESS + '20' : 
                                             isSelected && !isCorrect ? COLORS.ACCENT_ERROR + '20' : COLORS.BG_PRIMARY) :
                                            (isSelected ? COLORS.ACCENT_PRIMARY : COLORS.BG_PRIMARY),
                                        color: showResult ?
                                            (isCorrect ? COLORS.ACCENT_SUCCESS :
                                             isSelected && !isCorrect ? COLORS.ACCENT_ERROR : COLORS.TEXT_SECONDARY) :
                                            (isSelected ? 'white' : COLORS.TEXT_SECONDARY),
                                        border: `2px solid ${
                                            showResult ? 
                                            (isCorrect ? COLORS.ACCENT_SUCCESS : 
                                             isSelected && !isCorrect ? COLORS.ACCENT_ERROR : COLORS.BORDER_DEFAULT) :
                                            (isSelected ? COLORS.ACCENT_PRIMARY : COLORS.BORDER_DEFAULT)
                                        }`,
                                        borderRadius: '0.5rem',
                                        cursor: isQuizSubmittedForSlide ? 'default' : 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        if (!isQuizSubmittedForSlide && !isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_HOVER;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_HOVER;
                                        }
                                    },
                                    onMouseLeave: (e) => {
                                        if (!isQuizSubmittedForSlide && !isSelected) {
                                            e.currentTarget.style.backgroundColor = COLORS.BG_PRIMARY;
                                            e.currentTarget.style.borderColor = COLORS.BORDER_DEFAULT;
                                        }
                                    }
                                },
                                    React.createElement('div', { 
                                        style: { 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.75rem' 
                                        } 
                                    },
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
                        !isQuizSubmittedForSlide && isQuizAnswered &&
                            React.createElement('button', {
                                onClick: () => handleQuizSubmit(currentSlide),
                                style: {
                                    marginTop: '1rem',
                                    padding: '0.75rem 2rem',
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
                            }, 'Submit Answer'),
                        isQuizSubmittedForSlide && currentSlideData.explanation &&
                            React.createElement('div', { 
                                style: { 
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    backgroundColor: COLORS.ACCENT_INFO + '20',
                                    borderLeft: `4px solid ${COLORS.ACCENT_INFO}`,
                                    borderRadius: '0.5rem',
                                    color: COLORS.TEXT_PRIMARY
                                } 
                            }, currentSlideData.explanation)
                    ) :
                
                currentSlideData.type === 'completion' ?
                    React.createElement('div', { style: { textAlign: 'center' } },
                        React.createElement('div', { 
                            style: { 
                                fontSize: '4rem',
                                marginBottom: '1rem'
                            } 
                        }, currentSlideData.image || '🏆'),
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                color: COLORS.ACCENT_SUCCESS
                            } 
                        }, currentSlideData.title),
                        React.createElement('p', { 
                            style: { 
                                fontSize: '1.125rem',
                                color: COLORS.TEXT_SECONDARY,
                                marginBottom: '2rem'
                            } 
                        }, currentSlideData.content),
                        completed && React.createElement('div', {
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
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }
                        },
                            React.createElement('span', null, '🏆'),
                            React.createElement('span', null, 'Achievement Unlocked: Module Complete')
                        )
                    ) :
                
                // Error or unknown type
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { 
                        style: { 
                            fontSize: '4rem',
                            marginBottom: '1rem'
                        } 
                    }, currentSlideData.image || '⚠️'),
                    React.createElement('h2', { 
                        style: { 
                            fontSize: '1.875rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            color: COLORS.TEXT_PRIMARY
                        } 
                    }, currentSlideData.title || 'Error'),
                    React.createElement('p', { 
                        style: { 
                            fontSize: '1.125rem',
                            color: COLORS.TEXT_SECONDARY
                        } 
                    }, currentSlideData.content || 'An error occurred loading this content.')
                )
            ),

            // Navigation buttons
            React.createElement('div', { 
                style: { 
                    maxWidth: '48rem',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 1rem'
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
                    disabled: isQuizSlide && !isQuizSubmittedForSlide,
                    style: {
                        padding: '0.75rem 1.5rem',
                        background: 
                            (isQuizSlide && !isQuizSubmittedForSlide) ? COLORS.BG_HOVER :
                            currentSlide === content.slides.length - 1 ? GRADIENTS.SUNSET : GRADIENTS.EARTH,
                        color: 
                            (isQuizSlide && !isQuizSubmittedForSlide) ? COLORS.TEXT_MUTED : 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 
                            (isQuizSlide && !isQuizSubmittedForSlide) ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: (isQuizSlide && !isQuizSubmittedForSlide) ? 
                                  'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'
                    },
                    onMouseEnter: (e) => {
                        if (!(isQuizSlide && !isQuizSubmittedForSlide)) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (!(isQuizSlide && !isQuizSubmittedForSlide)) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                        }
                    }
                }, currentSlide === content.slides.length - 1 ? 'Complete Module ✓' : 'Next →')
            )
        );
    };
    
    console.log('✅ ModulePlayer component loaded - using database content with dark theme');
})();