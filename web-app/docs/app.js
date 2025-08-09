const { useState, useEffect } = React;

// Main App Component
function App() {
    const [currentView, setCurrentView] = useState('home');
    const [specimens, setSpecimens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadSpecimens();
        // Simulate user login for now
        setUser({ id: 'demo-user', name: 'Demo User' });
    }, []);

    const loadSpecimens = async () => {
        try {
            const response = await fetch('https://oxgedcncrettasrbmwsl.supabase.co/rest/v1/specimens?status=eq.approved&select=*', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg'
                }
            });
            const data = await response.json();
            setSpecimens(data || []);
        } catch (error) {
            console.error('Error loading specimens:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (currentView === 'quick-study') {
        return <QuickStudy specimens={specimens} onBack={() => setCurrentView('home')} />;
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
                {/* Welcome Section */}
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

// Quick Study Component
function QuickStudy({ specimens, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [hintsUsed, setHintsUsed] = useState(0);

    const studySpecimens = specimens.filter(s => s.status === 'approved').slice(0, 10);
    const currentSpecimen = studySpecimens[currentIndex];

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
        } else {
            // Show final results
            alert(`Quick Study Complete!\nScore: ${score.correct}/${score.total} (${Math.round(score.correct/score.total*100)}%)`);
            onBack();
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
                <div className="max-w-4xl mx-auto px-4 py-4">
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
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Specimen Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Specimen Information</h3>
                            <div className="space-y-1 text-sm">
                                <p><strong>Location:</strong> {currentSpecimen.location}</p>
                                <p><strong>Habitat:</strong> {currentSpecimen.habitat}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-2 h-2 rounded-full ${currentSpecimen.dna_sequenced ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    <span className="text-xs font-medium">
                                        {currentSpecimen.dna_sequenced ? 'DNA Verified' : 'Research Grade'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Placeholder for Photos */}
                        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
                            <div className="text-center text-gray-500">
                                <div className="text-4xl mb-2">📸</div>
                                <p className="text-sm">Photos coming soon</p>
                                <p className="text-xs">Will show multiple angles</p>
                            </div>
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
                                
                                <button
                                    onClick={handleSubmit}
                                    disabled={!userAnswer.trim()}
                                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Submit Answer
                                </button>
                                
                                <div className="text-center text-sm text-gray-500">
                                    💡 Hints available after submitting
                                </div>
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
        </div>
    );
}

// Focused Study Component (Simplified for now)
function FocusedStudy({ specimens, onBack }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold mb-2">Focused Study</h2>
                <p className="text-gray-600 mb-6">Customizable study sessions coming soon!</p>
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

// Marathon Study Component (Simplified for now)
function MarathonStudy({ specimens, onBack }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">♾️</div>
                <h2 className="text-2xl font-bold mb-2">Marathon Mode</h2>
                <p className="text-gray-600 mb-6">Unlimited study sessions coming soon!</p>
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

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
