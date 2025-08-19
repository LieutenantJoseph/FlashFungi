// components/common/Toast.js
// Toast notification component for showing success/error messages

const h = React.createElement;

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose && onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    icon: '✅'
                };
            case 'error':
                return {
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    icon: '❌'
                };
            case 'warning':
                return {
                    backgroundColor: '#f59e0b',
                    borderColor: '#d97706',
                    icon: '⚠️'
                };
            default:
                return {
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    icon: 'ℹ️'
                };
        }
    };

    const styles = getTypeStyles();

    return h('div', {
        style: {
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1000,
            backgroundColor: styles.backgroundColor,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            border: `2px solid ${styles.borderColor}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out'
        }
    },
        h('span', { style: { fontSize: '1rem' } }, styles.icon),
        h('span', { style: { flex: 1, fontSize: '0.875rem' } }, message),
        onClose && h('button', {
            onClick: onClose,
            style: {
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0',
                marginLeft: '0.5rem'
            }
        }, '×')
    );
}

// Toast Manager Hook
function useToast() {
    const [toasts, setToasts] = React.useState([]);

    const showToast = React.useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };
        
        setToasts(prev => [...prev, toast]);
        
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
        
        return id;
    }, []);

    const hideToast = React.useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const ToastContainer = React.useMemo(() => 
        () => h('div', { style: { position: 'fixed', top: 0, right: 0, zIndex: 1000 } },
            ...toasts.map((toast, index) =>
                h(Toast, {
                    key: toast.id,
                    message: toast.message,
                    type: toast.type,
                    duration: 0, // Managed by the hook
                    onClose: () => hideToast(toast.id),
                    style: {
                        marginTop: `${index * 70}px` // Stack toasts
                    }
                })
            )
        ), [toasts, hideToast]
    );

    return {
        showToast,
        hideToast,
        ToastContainer
    };
}

// Add CSS animation for slide in effect
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export to window for global access
window.Toast = Toast;
window.useToast = useToast;