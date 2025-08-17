// Flash Fungi - Loading Screen Component
// Common loading screen used throughout the application

window.LoadingScreen = function LoadingScreen({ message = 'Loading educational content...' }) {
    console.log('🔍 LoadingScreen rendering with message:', message);
    
    const h = React.createElement;
    
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
            h('h1', { 
                style: { 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    marginBottom: '0.5rem' 
                } 
            }, 'Flash Fungi'),
            h('p', { 
                style: { 
                    color: '#6b7280',
                    marginBottom: '1rem'
                } 
            }, message),
            // Loading animation
            h('div', {
                style: {
                    display: 'inline-block',
                    width: '2rem',
                    height: '2rem',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            })
        )
    );
};

// Add CSS animation for loading spinner
if (!document.getElementById('loading-spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-spinner-styles';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ LoadingScreen component loaded');