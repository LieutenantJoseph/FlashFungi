// LoadingScreen.js - Living Mycology Style Loading Animation
// Flash Fungi - Modern loading screen with mushroom theme

(function() {
    'use strict';
    
    window.LoadingScreen = function LoadingScreen({ message = 'Loading...', progress = null }) {
        const [dots, setDots] = React.useState('');
        
        // Animated dots
        React.useEffect(() => {
            const interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 500);
            
            return () => clearInterval(interval);
        }, []);
        
        return React.createElement('div', {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }
        },
            React.createElement('div', {
                style: {
                    textAlign: 'center',
                    padding: '2rem'
                }
            },
                // Animated Mushroom Icon
                React.createElement('div', {
                    style: {
                        fontSize: '4rem',
                        marginBottom: '2rem',
                        animation: 'mushroomBounce 1.5s ease-in-out infinite',
                        display: 'inline-block'
                    }
                }, '🍄'),
                
                // Loading Ring
                React.createElement('div', {
                    style: {
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 2rem',
                        position: 'relative'
                    }
                },
                    React.createElement('div', {
                        style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '100px',
                            height: '100px',
                            margin: '-50px 0 0 -50px',
                            borderRadius: '50%',
                            border: '4px solid rgba(5, 150, 105, 0.1)',
                            borderTop: '4px solid #059669',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    
                    // Inner ring
                    React.createElement('div', {
                        style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '70px',
                            height: '70px',
                            margin: '-35px 0 0 -35px',
                            borderRadius: '50%',
                            border: '3px solid rgba(4, 120, 87, 0.1)',
                            borderBottom: '3px solid #047857',
                            animation: 'spinReverse 0.8s linear infinite'
                        }
                    })
                ),
                
                // Message
                React.createElement('h2', {
                    style: {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: '0.5rem'
                    }
                }, 'Flash Fungi'),
                
                React.createElement('p', {
                    style: {
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: progress !== null ? '1rem' : 0
                    }
                }, message + dots),
                
                // Progress bar (optional)
                progress !== null && React.createElement('div', {
                    style: {
                        width: '200px',
                        height: '6px',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        borderRadius: '3px',
                        margin: '0 auto',
                        overflow: 'hidden'
                    }
                },
                    React.createElement('div', {
                        style: {
                            width: `${progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease-out'
                        }
                    })
                )
            )
        );
    };
    
    // Add animation styles
    if (!document.getElementById('loading-screen-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-screen-styles';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes spinReverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
            }
            
            @keyframes mushroomBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ LoadingScreen component loaded - Living Mycology Style');
})();