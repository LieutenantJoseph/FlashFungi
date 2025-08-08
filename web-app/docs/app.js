const { useState, useEffect } = React;

function App() {
    const [specimens, setSpecimens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        console.log('Loading specimens...');
        
        fetch('https://oxgedcncrettasrbmwsl.supabase.co/rest/v1/specimens?select=*&limit=10', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            setSpecimens(data || []);
            setLoading(false);
        })
        .catch(err => {
            console.error('Error:', err);
            setError(err.message);
            setLoading(false);
        });
    }, []);
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🍄</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Arizona Mushroom Study</h1>
                    <p className="text-gray-600">Loading specimens...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-6 text-center">
                    <div className="text-4xl mb-2">🍄</div>
                    <h1 className="text-3xl font-bold text-gray-800">Arizona Mushroom Study</h1>
                    <p className="text-gray-600">DNA-Verified Mushroom Specimens</p>
                </div>
            </header>
            
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        Database Status: {specimens.length} Specimens Found
                    </h2>
                    
                    {specimens.length === 0 ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                            <div className="text-4xl mb-4">🔬</div>
                            <h3 className="text-xl font-semibold mb-2">Data Pipeline Active</h3>
                            <p className="text-gray-600">
                                The automated pipeline is processing new specimens.<br/>
                                DNA-verified mushrooms will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {specimens.map(specimen => (
                                <div key={specimen.id} className="bg-white rounded-lg shadow-sm p-6 text-left">
                                    <h3 className="font-semibold text-lg mb-2">{specimen.species_name}</h3>
                                    <p className="text-gray-600 text-sm mb-1">
                                        <strong>Family:</strong> {specimen.family}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-1">
                                        <strong>Location:</strong> {specimen.location}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-3">
                                        <strong>Status:</strong> {specimen.status}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${specimen.dna_sequenced ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                        <span className="text-sm font-medium">
                                            {specimen.dna_sequenced ? 'DNA Verified' : 'Research Grade'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
