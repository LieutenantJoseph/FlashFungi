// ModulePlayer.js - Interactive Module Learning System
// Flash Fungi - Updated to use database content directly

(function() {
    'use strict';
    
    window.ModulePlayer = function ModulePlayer({ module, onComplete, onBack, saveProgress, user }) {
        const [currentSlide, setCurrentSlide] = React.useState(0);
        const [completed, setCompleted] = React.useState(false);
        const [quizAnswers, setQuizAnswers] = React.useState({});
        const [quizSubmitted, setQuizSubmitted] = React.useState({});

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
            
            const quizScore = quizSlides.length > 0 ? 
                Math.round((correctAnswers / quizSlides.length) * 100) : 100;
            
            // Save progress
            if (saveProgress && user) {
                await saveProgress({
                    moduleId: module.id,
                    progressType: 'training_module',
                    completed: true,
                    score: quizScore,
                    quizPerformance: {
                        totalQuestions: quizSlides.length,
                        correctAnswers: correctAnswers,
                        score: quizScore
                    }
                });
            }
            
            // Call completion callback
            if (onComplete) {
                onComplete(module.id, quizScore);
            }
        };

        const currentSlideData = content.slides[currentSlide];
        const progress = Math.round(((currentSlide + 1) / content.slides.length) * 100);

        return React.createElement('div', { 
            style: { 
                minHeight: '100vh', 
                backgroundColor: '#f9fafb',
                padding: '2rem'
            } 
        },
            // Header
            React.createElement('div', { 
                style: { 
                    maxWidth: '48rem',
                    margin: '0 auto',
                    marginBottom: '2rem'
                } 
            },
                React.createElement('div', { 
                    style: { 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    } 
                },
                    React.createElement('button', {
                        onClick: onBack,
                        style: {
                            padding: '0.5rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                        }
                    }, '← Back to Modules'),
                    React.createElement('div', { 
                        style: { 
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        } 
                    }, `${currentSlide + 1} / ${content.slides.length}`)
                ),
                
                // Progress bar
                React.createElement('div', { 
                    style: { 
                        width: '100%',
                        height: '0.5rem',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '0.25rem',
                        overflow: 'hidden'
                    } 
                },
                    React.createElement('div', { 
                        style: { 
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: '#10b981',
                            transition: 'width 0.3s ease'
                        } 
                    })
                )
            ),

            // Content Card
            React.createElement('div', { 
                style: { 
                    maxWidth: '48rem',
                    margin: '0 auto',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
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
                                marginBottom: '1rem'
                            } 
                        }, currentSlideData.title),
                        React.createElement('div', { 
                            style: { 
                                fontSize: '1.125rem',
                                lineHeight: '1.75',
                                color: '#374151',
                                whiteSpace: 'pre-wrap'
                            } 
                        }, currentSlideData.content),
                        currentSlideData.note && React.createElement('div', { 
                            style: { 
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: '#fef3c7',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#92400e'
                            } 
                        }, currentSlideData.note)
                    ) :
                
                currentSlideData.type === 'quiz' ?
                    React.createElement('div', null,
                        React.createElement('h2', { 
                            style: { 
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            } 
                        }, currentSlideData.title),
                        React.createElement('p', { 
                            style: { 
                                fontSize: '1.125rem',
                                marginBottom: '1.5rem'
                            } 
                        }, currentSlideData.question),
                        React.createElement('div', { 
                            style: { 
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            } 
                        },
                            currentSlideData.options.map((option, idx) => 
                                React.createElement('button', {
                                    key: idx,
                                    onClick: () => handleQuizAnswer(currentSlide, idx),
                                    disabled: quizSubmitted[currentSlide],
                                    style: {
                                        padding: '1rem',
                                        textAlign: 'left',
                                        backgroundColor: 
                                            quizSubmitted[currentSlide] && idx === currentSlideData.correct ? '#d1fae5' :
                                            quizSubmitted[currentSlide] && idx === quizAnswers[currentSlide] && idx !== currentSlideData.correct ? '#fee2e2' :
                                            quizAnswers[currentSlide] === idx ? '#dbeafe' : '#f3f4f6',
                                        border: quizAnswers[currentSlide] === idx ? '2px solid #3b82f6' : '2px solid transparent',
                                        borderRadius: '0.5rem',
                                        cursor: quizSubmitted[currentSlide] ? 'default' : 'pointer',
                                        transition: 'all 0.2s'
                                    }
                                }, option)
                            )
                        ),
                        !quizSubmitted[currentSlide] && quizAnswers[currentSlide] !== undefined &&
                            React.createElement('button', {
                                onClick: () => handleQuizSubmit(currentSlide),
                                style: {
                                    marginTop: '1rem',
                                    padding: '0.75rem 2rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }
                            }, 'Submit Answer'),
                        quizSubmitted[currentSlide] && currentSlideData.explanation &&
                            React.createElement('div', { 
                                style: { 
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '0.5rem',
                                    borderLeft: '4px solid #3b82f6'
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
                                color: '#10b981'
                            } 
                        }, currentSlideData.title),
                        React.createElement('p', { 
                            style: { 
                                fontSize: '1.125rem',
                                color: '#374151',
                                marginBottom: '2rem'
                            } 
                        }, currentSlideData.content),
                        completed && React.createElement('button', {
                            onClick: onBack,
                            style: {
                                padding: '0.75rem 2rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '1.125rem'
                            }
                        }, 'Return to Modules')
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
                            marginBottom: '1rem'
                        } 
                    }, currentSlideData.title || 'Error'),
                    React.createElement('p', { 
                        style: { 
                            fontSize: '1.125rem',
                            color: '#374151'
                        } 
                    }, currentSlideData.content || 'An error occurred loading this content.')
                )
            ),

            // Navigation buttons
            React.createElement('div', { 
                style: { 
                    maxWidth: '48rem',
                    margin: '2rem auto 0',
                    display: 'flex',
                    justifyContent: 'space-between'
                } 
            },
                React.createElement('button', {
                    onClick: handlePrevious,
                    disabled: currentSlide === 0,
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: currentSlide === 0 ? '#e5e7eb' : 'white',
                        color: currentSlide === 0 ? '#9ca3af' : '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        cursor: currentSlide === 0 ? 'default' : 'pointer',
                        fontWeight: '500'
                    }
                }, '← Previous'),
                
                React.createElement('button', {
                    onClick: handleNext,
                    disabled: currentSlideData.type === 'quiz' && !quizSubmitted[currentSlide],
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 
                            currentSlideData.type === 'quiz' && !quizSubmitted[currentSlide] ? '#e5e7eb' :
                            currentSlide === content.slides.length - 1 ? '#10b981' : '#3b82f6',
                        color: 
                            currentSlideData.type === 'quiz' && !quizSubmitted[currentSlide] ? '#9ca3af' : 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 
                            currentSlideData.type === 'quiz' && !quizSubmitted[currentSlide] ? 'default' : 'pointer',
                        fontWeight: '500'
                    }
                }, currentSlide === content.slides.length - 1 ? 'Complete Module ✓' : 'Next →')
            )
        );
    };
    
    console.log('✅ ModulePlayer component loaded - using database content');
})();