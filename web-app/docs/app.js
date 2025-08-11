// Plain JavaScript React App - No JSX/Babel required
console.log('🔥 app.js executing - plain JavaScript version');

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';

// Helper function to create elements easily
const h = React.createElement;

// Main App Component
function App() {
    console.log('🏁 App component rendering');
    
    const [specimens, setSpecimens] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        console.log('🚀 useEffect triggered - loading specimens');
        loadSpecimens();
        setUser({ id: 'demo-user', name: 'Demo User' });
    }, []);

    const loadSpecimens = async () => {
        try {
            console.log('🔍 Loading specimens from Supabase...');
            const response = await fetch(`${SUPABASE_URL}/rest/v1/specimens?status=eq.approved&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`📊 Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Supabase error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const responseText = await response.text();
            console.log('📝 Raw response length:', responseText.length);
            
            let data = [];
            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                    console.log(`✅ Loaded ${data.length} specimens`);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Invalid JSON response from server');
                }
            }
            
            setSpecimens(data || []);
        } catch (error) {
            console.error('❌ Error loading specimens:', error);
            setSpecimens([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return h('div', {
            style: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        },
            h('div', { style: { textAlign: 'center' } },
                h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🍄'),
                h('h1', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' } }, 'Arizona Mushroom Study'),
                h('p', { style: { color: '#6b7280' } }, 'Loading specimens...')
            )
        );
    }

    const approvedCount = specimens.filter(s => s.status === 'approved').length;
    const dnaCount = specimens.filter(s => s.dna_sequenced).length;

    return h('div', { style: { minHeight: '100vh', backgroundColor: '#f9fafb' } },
        // Header
        h('header', { style: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' } },
            h('div', { style: { maxWidth: '72rem', margin: '0 auto', padding: '1.5rem 1rem' } },
                h('div', { style: { textAlign: 'center' } },
                    h('div', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, '🍄'),
                    h('h1', { style: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' } }, 'Arizona Mushroom Study'),
                    h('p', { style: { color: '#6b7280' } }, 'Master mushroom identification with DNA-verified specimens')
                )
            )
        ),

        // Main content
        h('main', { style: { maxWidth: '72rem', margin: '0 auto', padding: '2rem 1rem' } },
            // Welcome section
            h('div', { 
                style: { 
                    background: 'linear-gradient(to right, #10b981, #059669)', 
                    borderRadius: '0.75rem', 
                    color: 'white', 
                    padding: '1.5rem', 
                    marginBottom: '2rem' 
                } 
            },
                h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, `Welcome, ${user?.name || 'Mycologist'}! 🍄`),
                h('p', { style: { opacity: 0.9, marginBottom: '1rem' } }, 'Ready to improve your mushroom identification skills?'),
                h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '1rem' } },
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' } },
                        h('span', { style: { fontSize: '0.875rem' } }, `📊 ${specimens.length} Total Specimens`)
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' } },
                        h('span', { style: { fontSize: '0.875rem' } }, `🧬 ${dnaCount} DNA-Verified`)
                    ),
                    h('div', { style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' } },
                        h('span', { style: { fontSize: '0.875rem' } }, `✅ ${approvedCount} Ready for Study`)
                    )
                )
            ),

            // Content based on specimens
            approvedCount === 0 ? 
                // No specimens message
                h('div', { style: { textAlign: 'center', padding: '3rem 0' } },
                    h('div', { style: { fontSize: '4rem', marginBottom: '1rem' } }, '🔬'),
                    h('h3', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' } }, 'Study Content Coming Soon'),
                    h('div', { 
                        style: { 
                            backgroundColor: 'white', 
                            borderRadius: '0.75rem', 
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                            padding: '1.5rem', 
                            maxWidth: '32rem', 
                            margin: '0 auto' 
                        } 
                    },
                        h('p', { style: { color: '#6b7280', marginBottom: '1rem' } }, 
                            `The data pipeline has found ${specimens.length} specimens, with specimens awaiting admin review.`
                        ),
                        h('div', { style: { textAlign: 'left', marginBottom: '1rem' } },
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' } }, 
                                h('strong', null, '📋 Pipeline Status:'), ' Active and processing'
                            ),
                            h('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' } }, 
                                h('strong', null, '🔄 Next Update:'), ' Monthly (1st of each month)'
                            )
                        ),
                        h('div', { style: { padding: '0.75rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' } },
                            h('p', { style: { fontSize: '0.875rem', color: '#1e40af' } },
                                h('strong', null, 'Admin:'), ' Visit the admin portal to review and approve specimens for study.'
                            )
                        )
                    )
                ) :
                // Study mode selection
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2rem' } },
                    h('div', { style: { textAlign: 'center' } },
                        h('h2', { style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' } }, 'Choose Your Study Mode'),
                        h('p', { style: { color: '#6b7280' } }, `${approvedCount} specimens available for study`)
                    ),
                    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' } },
                        // Quick Study Card
                        h('div', { 
                            style: { 
                                backgroundColor: 'white', 
                                borderRadius: '0.75rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px solid transparent',
                                cursor: approvedCount >= 10 ? 'pointer' : 'not-allowed',
                                opacity: approvedCount >= 10 ? 1 : 0.5
                            },
                            onClick: approvedCount >= 10 ? () => alert('Quick Study mode coming soon!') : undefined
                        },
                            h('div', { 
                                style: { 
                                    backgroundColor: '#3b82f6', 
                                    color: 'white', 
                                    width: '3rem', 
                                    height: '3rem', 
                                    borderRadius: '0.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '1rem', 
                                    fontSize: '1.25rem' 
                                } 
                            }, '⚡'),
                            h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Quick Study'),
                            h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, '10 questions, fast-paced review'),
                            approvedCount < 10 && h('div', { style: { fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.25rem', padding: '0.5rem' } },
                                'Need more approved specimens'
                            )
                        ),
                        
                        // Focused Study Card  
                        h('div', { 
                            style: { 
                                backgroundColor: 'white', 
                                borderRadius: '0.75rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px solid transparent',
                                cursor: approvedCount >= 5 ? 'pointer' : 'not-allowed',
                                opacity: approvedCount >= 5 ? 1 : 0.5
                            },
                            onClick: approvedCount >= 5 ? () => alert('Focused Study mode coming soon!') : undefined
                        },
                            h('div', { 
                                style: { 
                                    backgroundColor: '#8b5cf6', 
                                    color: 'white', 
                                    width: '3rem', 
                                    height: '3rem', 
                                    borderRadius: '0.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '1rem', 
                                    fontSize: '1.25rem' 
                                } 
                            }, '🎯'),
                            h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Focused Study'),
                            h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 'Customize topics and difficulty'),
                            approvedCount < 5 && h('div', { style: { fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.25rem', padding: '0.5rem' } },
                                'Need more approved specimens'
                            )
                        ),

                        // Marathon Study Card
                        h('div', { 
                            style: { 
                                backgroundColor: 'white', 
                                borderRadius: '0.75rem', 
                                padding: '1.5rem', 
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '2px solid transparent',
                                cursor: approvedCount >= 20 ? 'pointer' : 'not-allowed',
                                opacity: approvedCount >= 20 ? 1 : 0.5
                            },
                            onClick: approvedCount >= 20 ? () => alert('Marathon Study mode coming soon!') : undefined
                        },
                            h('div', { 
                                style: { 
                                    backgroundColor: '#ef4444', 
                                    color: 'white', 
                                    width: '3rem', 
                                    height: '3rem', 
                                    borderRadius: '0.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '1rem', 
                                    fontSize: '1.25rem' 
                                } 
                            }, '♾️'),
                            h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, 'Marathon Mode'),
                            h('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' } }, 'Unlimited questions, test endurance'),
                            approvedCount < 20 && h('div', { style: { fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.25rem', padding: '0.5rem' } },
                                'Need more approved specimens'
                            )
                        )
                    )
                )
        )
    );
}

// Render the app
console.log('🎬 About to render React app');
ReactDOM.render(h(App), document.getElementById('root'));
console.log('✅ React app render called');