// components/common/LoadingScreen.js
// Shared loading screen component used across the application

const h = React.createElement;

function LoadingScreen() {
    console.log('🔍 LoadingScreen rendering');
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

// Export to window for global access
window.LoadingScreen = LoadingScreen;