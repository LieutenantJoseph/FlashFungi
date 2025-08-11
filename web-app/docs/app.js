const { useState, useEffect } = React;

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
const INATURALIST_API = 'https://api.inaturalist.org/v1';

// Main App Component
function App() {
    const [currentView, setCurrentView] = useState('home');
    const [specimens, setSpecimens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [specimenPhotos, setSpecimenPhotos] = useState({});

    useEffect(() => {
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
            console.log('📝 Raw response:', responseText.substring(0, 200) + '...');
            
            let data = [];
            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                    console.log(`✅ Loaded ${data.length} specimens`);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Response text:', responseText);
                    throw new Error('Invalid JSON response from server');
                }
            }
            
            setSpecimens(data || []);
        } catch (error) {
            console.error('❌ Error loading specimens:', error);
            setSpecimens([]); // Set empty array so app doesn't stay stuck
        } finally {
            setLoading(false);
        }
    };

    const loadSpecimenPhotos = async (inaturalistId) => {
        if (specimenPhotos[inaturalistId]) {
            return specimenPhotos[inaturalistId];
        }

        try {
            console.log(`📸 Loading photos for specimen: ${inaturalistId}`);
            const response = await fetch(`${INATURALIST_API}/observations/${inaturalistId}`);
            const data = await response.json();
            
            if (data.results && data.results[0] && data.results[0].photos) {
                const photos = data.results[0].photos.map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    medium_url: photo.url.replace('square', 'medium'),
                    large_url: photo.url.replace('square', 'large'),
                    attribution: photo.attribution || 'iNaturalist user'
                }));
                
                setSpecimenPhotos(prev => ({
                    ...prev,
                    [inaturalistId]: photos
                }));
                
                return photos;
            }
        } catch (error) {
            console.error('Error loading photos:', error);
        }
        
        return [];
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (currentView === 'quick-study') {
        return (
            <QuickStudy 
                specimens={specimens} 
                onBack={() => setCurrentView('home')} 
                loadSpecimenPhotos={loadSpecimenPhotos}
                specimenPhotos={specimenPhotos}
            />
        );
    }

    if (currentView === 'focused-study') {
        return <FocusedStudy specimens={specimens} onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'marathon-study') {
        return <MarathonStudy specimens={specimens} onBack={() => setCurrentView('home')} />;
    }

    return <HomePage specimens={specimens} user={user} onStudyModeSelect={setCurrentView} />;
}

// Loading Screen Component
function LoadingScreen() {
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

// Home Page Component
function HomePage({ specimens, user, onStudyModeSelect }) {
    const approvedCount = specimens.filter(s => s.status === 'approved').length;
    const dnaCount = specimens.filter(s => s.dna_sequenced).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="text-center">
                        <div className="text-4xl mb-2">🍄</div>
                        <h1 className="text-3xl font-bold text-gray-800">Arizona Mushroom Study</h1>
                        <p className="text-gray-600">Master mushroom identification with DNA-verified specimens</p>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name || 'Mycologist'}! 🍄</h2>
                    <p className="opacity-90 mb-4">Ready to improve your mushroom identification skills?</p>
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/20 rounded-lg px-3 py-2">
                            <span className="text-sm">📊 {specimens.length} Total Specimens</span>
                        </div>
                        <div className="bg-white/20 rounded-lg px-3 py-2">
                            <span className="text-sm">🧬 {dnaCount} DNA-Verified</span>
                        </div>
                        <div className="bg-white/20 rounded-lg px-3 py-2">
                            <span className="text-sm">✅ {approvedCount} Ready for Study</span>
                        </div>
                    </div>
                </div>

                {approvedCount === 0 ? (
                    <NoSpecimensMessage specimens={specimens} />
                ) : (
                    <StudyModeSelection onModeSelect={onStudyModeSelect} specimenCount={approvedCount} />
                )}
            </main>
        </div>
    );
}

// No Specimens Message
function NoSpecimensMessage({ specimens }) {
    const pendingCount = specimens.filter(s => s.status === 'pending').length;
    
    return (
        <div className="text-center py-12">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-2xl font-bold mb-4">Study Content Coming Soon</h3>
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
                <p className="text-gray-600 mb-4">
                    The data pipeline has found {specimens.length} specimens, with {pendingCount} awaiting admin review.
                </p>
                <div className="text-left space-y-2">
                    <p className="text-sm text-gray-500">📋 <strong>Pipeline Status:</strong> Active and processing</p>
                    <p className="text-sm text-gray-500">⏳ <strong>Pending Review:</strong> {pendingCount} specimens</p>
                    <p className="text-sm text-gray-500">🔄 <strong>Next Update:</strong> Monthly (1st of each month)</p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Admin:</strong> Visit the admin portal to review and approve specimens for study.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Study Mode Selection
function StudyModeSelection({ onModeSelect, specimenCount }) {
    const modes = [
        {
            id: 'quick-study',
            title: 'Quick Study',
            description: '10 questions, fast-paced review',
            icon: '⚡',
            color: 'bg-blue-500 hover:bg-blue-600',
            recommended: specimenCount >= 10
        },
        {
            id: 'focused-study', 
            title: 'Focused Study',
            description: 'Customize topics and difficulty',
            icon: '🎯',
            color: 'bg-purple-500 hover:bg-purple-600',
            recommended: specimenCount >= 5
        },
        {
            id: 'marathon-study',
            title: 'Marathon Mode',
            description: 'Unlimited questions, test endurance',
            icon: '♾️',
            color: 'bg-red-500 hover:bg-red-600',
            recommended: specimenCount >= 20
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Choose Your Study Mode</h2>
                <p className="text-gray-600">{specimenCount} specimens available for study</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {modes.map(mode => (
                    <StudyModeCard 
                        key={mode.id}
                        mode={mode}
                        onClick={() => onModeSelect(mode.id)}
                        disabled={!mode.recommended}
                    />
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-2xl mb-2">📸</div>
                        <h4 className="font-semibold mb-1">View Photos</h4>
                        <p className="text-gray-600">Study multiple angles of each specimen</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">🧠</div>
                        <h4 className="font-semibold mb-1">Identify Species</h4>
                        <p className="text-gray-600">Enter your identification guess</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">💡</div>
                        <h4 className="font-semibold mb-1">Get Hints</h4>
                        <p className="text-gray-600">Progressive clues if you need help</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Study Mode Card
function StudyModeCard({ mode, onClick, disabled }) {
    return (
        <div 
            onClick={disabled ? undefined : onClick}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-200 ${
                disabled 
                    ? 'border-gray-200 opacity-50 cursor-not-allowed' 
                    : 'border-transparent hover:border-green-200 hover:shadow-md cursor-pointer'
            }`}
        >
            <div className={`${mode.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl`}>
                {mode.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{mode.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
            
            {disabled && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    Need more approved specimens
                </div>
            )}
        </div>
    );
}

// Enhanced Quick Study Component with Photo Integration
function QuickStudy({ specimens, onBack, loadSpecimenPhotos, specimenPhotos }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHints, setShowHints] = useState(false);
    const [photosLoaded, setPhotosLoaded] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const studySpecimens = specimens.filter(s => s.status === 'approved').slice(0, 10);
    const currentSpecimen = studySpecimens[currentIndex];
    const currentPhotos = currentSpecimen ? specimenPhotos[currentSpecimen.inaturalist_id] || [] : [];

    useEffect(() => {
        if (currentSpecimen && !specimenPhotos[currentSpecimen.inaturalist_id]) {
            setPhotosLoaded(false);
            loadSpecimenPhotos(currentSpecimen.inaturalist_id).then(() => {
                setPhotosLoaded(true);
            });
        } else {
            setPhotosLoaded(true);
        }
    }, [currentSpecimen, loadSpecimenPhotos, specimenPhotos]);

    const hints = [
        { level: 1, text: `This mushroom belongs to the family ${currentSpecimen?.family}.` },
        { level: 2, text: `The genus is ${currentSpecimen?.genus}.` },
        { level: 3, text: `Found in: ${currentSpecimen?.habitat?.substring(0, 100)}...` },
        { level: 4, text: currentSpecimen?.dna_sequenced ? 'This specimen has been DNA verified.' : 'This is a research-grade community identification.' }
    ];

    const handleSubmit = () => {
        const isCorrect = userAnswer.toLowerCase().includes(currentSpecimen.species_name.toLowerCase());
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
        setShowAnswer(true);
    };

    const handleNext = () => {
        if (currentIndex < studySpecimens.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setShowAnswer(false);
            setHintsUsed(0);
            setShowHints(false);
            setSelectedPhoto(null);
        } else {
            alert(`Quick Study Complete!\nScore: ${score.correct}/${score.total} (${Math.round(score.correct/score.total*100)}%)`);
            onBack();
        }
    };

    const useHint = () => {
        if (hintsUsed < 4) {
            setHintsUsed(prev => prev + 1);
            setShowHints(true);
        }
    };

    if (!currentSpecimen) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h2 className="text-xl font-bold mb-2">No Specimens Available</h2>
                    <p className="text-gray-600 mb-4">No approved specimens found for study.</p>
                    <button 
                        onClick={onBack}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={onBack}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ← Back
                            </button>
                            <div>
                                <h1 className="text-xl font-bold">Quick Study</h1>
                                <p className="text-sm text-gray-600">
                                    Question {currentIndex + 1} of {studySpecimens.length}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                    {score.total > 0 ? Math.round(score.correct/score.total*100) : 0}%
                                </div>
                                <div className="text-xs text-gray-500">Accuracy</div>
                            </div>
                            {currentSpecimen.dna_sequenced && (
                                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                    🧬 DNA Verified
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / studySpecimens.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Study Interface */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Photo Gallery and Specimen Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Specimen Information</h3>
                            <div className="space-y-1 text-sm">
                                <p><strong>Location:</strong> {currentSpecimen.location}</p>
                                <p><strong>Habitat:</strong> {currentSpecimen.habitat?.substring(0, 100)}...</p>
                                <p><strong>Quality Score:</strong> {((currentSpecimen.quality_score || 0) * 100).toFixed(0)}%</p>
                            </div>
                        </div>

                        {/* Photo Gallery */}
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Photos</h4>
                            {!photosLoaded ? (
                                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <div className="text-4xl mb-2">⏳</div>
                                        <p className="text-sm">Loading photos...</p>
                                    </div>
                                </div>
                            ) : currentPhotos.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Main Photo Display */}
                                    <div className="relative">
                                        <img
                                            src={currentPhotos[0].medium_url}
                                            alt="Main specimen view"
                                            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                            onClick={() => setSelectedPhoto(currentPhotos[0])}
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            Click to enlarge
                                        </div>
                                    </div>
                                    
                                    {/* Thumbnail Gallery */}
                                    {currentPhotos.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {currentPhotos.slice(1, 5).map((photo, index) => (
                                                <img
                                                    key={photo.id}
                                                    src={photo.url}
                                                    alt={`View ${index + 2}`}
                                                    className="w-full h-16 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                                    onClick={() => setSelectedPhoto(photo)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    <p className="text-xs text-gray-500 text-center">
                                        📸 {currentPhotos.length} photos available
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <div className="text-4xl mb-2">📸</div>
                                        <p className="text-sm">No photos available</p>
                                        <a 
                                            href={`https://www.inaturalist.org/observations/${currentSpecimen.inaturalist_id}`}
                                            target="_blank"
                                            className="text-blue-500 hover:text-blue-700 text-xs"
                                        >
                                            View on iNaturalist ↗
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answer Interface */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Identify This Mushroom</h3>
                        
                        {!showAnswer ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        What species is this mushroom?
                                    </label>
                                    <input
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Enter genus and species (e.g., Agaricus campestris)"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        onKeyPress={(e) => e.key === 'Enter' && userAnswer.trim() && handleSubmit()}
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!userAnswer.trim()}
                                        className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Submit Answer
                                    </button>
                                    
                                    <button
                                        onClick={useHint}
                                        disabled={hintsUsed >= 4}
                                        className="bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        💡 Hint ({hintsUsed}/4)
                                    </button>
                                </div>

                                {/* Hints Display */}
                                {showHints && hintsUsed > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h4 className="font-medium text-yellow-800 mb-2">Hints Used:</h4>
                                        <div className="space-y-2">
                                            {hints.slice(0, hintsUsed).map((hint, index) => (
                                                <div key={index} className="text-sm text-yellow-700">
                                                    <strong>Level {hint.level}:</strong> {hint.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Answer Result */}
                                <div className={`p-4 rounded-lg border-2 ${
                                    userAnswer.toLowerCase().includes(currentSpecimen.species_name.toLowerCase())
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-red-200 bg-red-50'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {userAnswer.toLowerCase().includes(currentSpecimen.species_name.toLowerCase()) ? (
                                            <>
                                                <span className="text-green-600">✅</span>
                                                <span className="font-medium text-green-800">Correct!</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-red-600">❌</span>
                                                <span className="font-medium text-red-800">Incorrect</span>
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1 text-sm">
                                        <p><strong>Correct Answer:</strong> <em>{currentSpecimen.species_name}</em></p>
                                        <p><strong>Common Name:</strong> {currentSpecimen.common_name || 'Unknown'}</p>
                                        <p><strong>Family:</strong> {currentSpecimen.family}</p>
                                        <p><strong>Your Answer:</strong> {userAnswer}</p>
                                        {hintsUsed > 0 && (
                                            <p><strong>Hints Used:</strong> {hintsUsed}/4</p>
                                        )}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
                                >
                                    {currentIndex < studySpecimens.length - 1 ? 'Next Question →' : 'Finish Study'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="max-w-4xl max-h-full">
                        <img
                            src={selectedPhoto.large_url}
                            alt="Full size specimen view"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <div className="text-center mt-4">
                            <p className="text-white text-sm">{selectedPhoto.attribution}</p>
                            <p className="text-gray-300 text-xs mt-1">Click anywhere to close</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Focused Study Component (Enhanced placeholder)
function FocusedStudy({ specimens, onBack }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold mb-2">Focused Study</h2>
                <p className="text-gray-600 mb-6">Customizable study sessions coming soon!</p>
                <div className="bg-white rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold mb-2">Coming Features:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Filter by family or genus</li>
                        <li>• Adjust difficulty level</li>
                        <li>• Focus on DNA-verified specimens</li>
                        <li>• Custom session length</li>
                    </ul>
                </div>
                <button 
                    onClick={onBack}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

// Marathon Study Component (Enhanced placeholder)
function MarathonStudy({ specimens, onBack }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">♾️</div>
                <h2 className="text-2xl font-bold mb-2">Marathon Mode</h2>
                <p className="text-gray-600 mb-6">Unlimited study sessions coming soon!</p>
                <div className="bg-white rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold mb-2">Coming Features:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Unlimited questions</li>
                        <li>• Spaced repetition algorithm</li>
                        <li>• Performance tracking</li>
                        <li>• Leaderboards</li>
                    </ul>
                </div>
                <button 
                    onClick={onBack}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}