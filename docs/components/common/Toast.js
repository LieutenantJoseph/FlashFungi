(function() {
    'use strict';
    
    // Toast Context for managing multiple toasts
    const ToastContext = React.createContext();
    
    // Individual Toast Component
    window.Toast = function Toast({ 
        id,
        message, 
        type = 'info', 
        duration = 4000, 
        onClose,
        action = null 
    }) {
        const [isVisible, setIsVisible] = React.useState(false);
        const [isExiting, setIsExiting] = React.useState(false);
        
        React.useEffect(() => {
            // Trigger entrance animation
            setTimeout(() => setIsVisible(true), 10);
            
            // Auto dismiss
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                
                return () => clearTimeout(timer);
            }
        }, []);
        
        const handleClose = () => {
            setIsExiting(true);
            setTimeout(() => {
                onClose(id);
            }, 300);
        };
        
        const typeStyles = {
            success: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                icon: '✓'
            },
            error: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                icon: '✕'
            },
            warning: {
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                icon: '⚠'
            },
            info: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                icon: 'ⓘ'
            },
            achievement: {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                icon: '🏆'
            }
        };
        
        const style = typeStyles[type] || typeStyles.info;
        
        return React.createElement('div', {
            style: {
                background: style.background,
                color: 'white',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: isExiting ? 0 : (isVisible ? 1 : 0),
                transform: isExiting 
                    ? 'translateX(400px)' 
                    : (isVisible ? 'translateX(0)' : 'translateX(400px)'),
                transition: 'all 0.3s ease-out',
                position: 'relative',
                marginBottom: '0.75rem'
            }
        },
            // Icon
            React.createElement('div', {
                style: {
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                }
            }, style.icon),
            
            // Message
            React.createElement('div', {
                style: {
                    flex: 1,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    lineHeight: '1.4'
                }
            }, message),
            
            // Action button (optional)
            action && React.createElement('button', {
                onClick: action.onClick,
                style: {
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                },
                onMouseEnter: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)',
                onMouseLeave: (e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'
            }, action.label),
            
            // Close button
            React.createElement('button', {
                onClick: handleClose,
                style: {
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                },
                onMouseEnter: (e) => e.target.style.opacity = 1,
                onMouseLeave: (e) => e.target.style.opacity = 0.8
            }, '×')
        );
    };
    
    // Toast Container Component
    window.ToastContainer = function ToastContainer({ children }) {
        const [toasts, setToasts] = React.useState([]);
        
        const addToast = React.useCallback((toast) => {
            const id = Date.now() + Math.random();
            setToasts(prev => [...prev, { ...toast, id }]);
            return id;
        }, []);
        
        const removeToast = React.useCallback((id) => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, []);
        
        // Create toast helper functions
        const toast = React.useMemo(() => ({
            success: (message, options = {}) => 
                addToast({ message, type: 'success', ...options }),
            error: (message, options = {}) => 
                addToast({ message, type: 'error', ...options }),
            warning: (message, options = {}) => 
                addToast({ message, type: 'warning', ...options }),
            info: (message, options = {}) => 
                addToast({ message, type: 'info', ...options }),
            achievement: (message, options = {}) => 
                addToast({ message, type: 'achievement', duration: 5000, ...options })
        }), [addToast]);
        
        // Make toast available globally
        React.useEffect(() => {
            window.toast = toast;
        }, [toast]);
        
        return React.createElement(React.Fragment, null,
            React.createElement(ToastContext.Provider, { value: { addToast, removeToast } },
                children
            ),
            
            // Toast container
            React.createElement('div', {
                style: {
                    position: 'fixed',
                    top: '1.5rem',
                    right: '1.5rem',
                    zIndex: 10000,
                    pointerEvents: 'none'
                }
            },
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        pointerEvents: 'auto'
                    }
                },
                    toasts.map(toast =>
                        React.createElement(window.Toast, {
                            key: toast.id,
                            ...toast,
                            onClose: removeToast
                        })
                    )
                )
            )
        );
    };
    
    // Hook to use toast
    window.useToast = function useToast() {
        const context = React.useContext(ToastContext);
        if (!context) {
            console.warn('useToast must be used within ToastContainer');
            return {
                addToast: () => {},
                removeToast: () => {}
            };
        }
        return context;
    };
    
    console.log('✅ Toast component loaded - Living Mycology Style');
})();