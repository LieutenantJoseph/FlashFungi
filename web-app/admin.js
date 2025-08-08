import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Database, MessageSquare, Settings, BarChart3, 
  Check, X, Eye, Edit, Trash2, Filter, Search, Calendar,
  AlertTriangle, CheckCircle, Clock, Star, Flag, Download
} from 'lucide-react';

// Mock admin data - will be replaced with real Supabase data
const mockPendingSpecimens = [
  {
    id: 'spec-pending-1',
    species_name: 'Agaricus campestris',
    genus: 'Agaricus',
    family: 'Agaricaceae',
    common_name: 'Field Mushroom',
    location: 'Phoenix, Arizona',
    habitat: 'Grassy field after rain',
    inaturalist_id: '98765432',
    observer_username: 'mycohunter',
    created_at: '2025-08-01T09:15:00Z',
    status: 'pending',
    photos: [
      { id: 'p1', angle_type: 'top', photo_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300' },
      { id: 'p2', angle_type: 'side', photo_url: 'https://images.unsplash.com/photo-1515477435312-de28cf5e8960?w=300' },
      { id: 'p3', angle_type: 'bottom', photo_url: 'https://images.unsplash.com/photo-1474757120019-6d05e8fa4511?w=300' }
    ],
    ai_hints: [
      { level: 1, type: 'taxonomic', text: 'This mushroom belongs to the family Agaricaceae.', status: 'draft' },
      { level: 2, type: 'taxonomic', text: 'The genus Agaricus is characterized by chocolate-brown spores.', status: 'draft' },
      { level: 3, type: 'morphological', text: 'Notice the white cap that may have scales and the ring on the stem.', status: 'draft' },
      { level: 4, type: 'ecological', text: 'Field mushrooms are saprophytic, growing in nutrient-rich soils.', status: 'draft' }
    ]
  },
  {
    id: 'spec-pending-2',
    species_name: 'Pleurotus ostreatus',
    genus: 'Pleurotus',
    family: 'Pleurotaceae',
    common_name: 'Oyster Mushroom',
    location: 'Flagstaff, Arizona',
    habitat: 'Dead cottonwood log',
    inaturalist_id: '87654321',
    observer_username: 'forestfinder',
    created_at: '2025-07-31T14:30:00Z',
    status: 'pending',
    photos: [
      { id: 'p4', angle_type: 'top', photo_url: 'https://images.unsplash.com/photo-1518641012482-31a05dc4d597?w=300' },
      { id: 'p5', angle_type: 'side', photo_url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=300' }
    ],
    ai_hints: [
      { level: 1, type: 'taxonomic', text: 'This belongs to the family Pleurotaceae.', status: 'draft' },
      { level: 2, type: 'taxonomic', text: 'Pleurotus species have decurrent gills and lateral stems.', status: 'draft' },
      { level: 3, type: 'morphological', text: 'The cap is fan or oyster-shaped with decurrent white gills.', status: 'draft' },
      { level: 4, type: 'ecological', text: 'Oyster mushrooms are wood decomposers, often on hardwoods.', status: 'draft' }
    ]
  }
];

const mockUserFeedback = [
  {
    id: 'fb-1',
    specimen_id: 'spec-1',
    user_id: 'user-123',
    username: 'MycoStudent',
    feedback_type: 'wrong_id',
    description: 'I think this might be Boletus reticulatus instead of B. edulis based on the cap texture.',
    severity: 'medium',
    status: 'open',
    created_at: '2025-07-30T16:45:00Z',
    specimen: { species_name: 'Boletus edulis', common_name: 'King Bolete' }
  },
  {
    id: 'fb-2',
    specimen_id: 'spec-2',
    user_id: 'user-456',  
    username: 'ForageExpert',
    feedback_type: 'poor_photo',
    description: 'The bottom photo is quite blurry and doesn\'t show the gill structure clearly.',
    severity: 'low',
    status: 'open',
    created_at: '2025-07-29T11:20:00Z',
    specimen: { species_name: 'Cantharellus cibarius', common_name: 'Golden Chanterelle' }
  }
];

const mockAnalytics = {
  totalUsers: 1247,
  totalSpecimens: 156,
  pendingReviews: 23,
  totalSessions: 8934,
  avgAccuracy: 78.3,
  topTopics: [
    { name: 'Boletes', accuracy: 82.1, sessions: 1234 },
    { name: 'Chanterelles', accuracy: 85.7, sessions: 987 },
    { name: 'Agarics', accuracy: 71.2, sessions: 2156 }
  ]
};

export default function AdminPortal() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const AdminHeader = () => (
    <div className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-slate-300 text-sm">Arizona Mushroom Study</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{mockAnalytics.pendingReviews}</div>
              <div className="text-xs text-slate-300">Pending Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{mockAnalytics.totalUsers}</div>
              <div className="text-xs text-slate-300">Total Users</div>
            </div>
            
            <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AdminNavigation = () => (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'specimens', label: 'Review Queue', icon: Database },
            { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  currentView === item.id 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.id === 'specimens' && mockAnalytics.pendingReviews > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {mockAnalytics.pendingReviews}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Users" 
          value={mockAnalytics.totalUsers} 
          icon={<Users className="w-6 h-6" />}
          color="text-blue-600"
        />
        <MetricCard 
          title="Approved Specimens" 
          value={mockAnalytics.totalSpecimens} 
          icon={<Database className="w-6 h-6" />}
          color="text-green-600"
        />
        <MetricCard 
          title="Pending Reviews" 
          value={mockAnalytics.pendingReviews} 
          icon={<Clock className="w-6 h-6" />}
          color="text-orange-600"
        />
        <MetricCard 
          title="Study Sessions" 
          value={mockAnalytics.totalSessions} 
          icon={<BarChart3 className="w-6 h-6" />}
          color="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button 
            onClick={() => setCurrentView('specimens')}
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-left transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-orange-900">Review Pending Specimens</h4>
            <p className="text-sm text-orange-700">{mockAnalytics.pendingReviews} items need your attention</p>
          </button>
          
          <button 
            onClick={() => setCurrentView('feedback')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-blue-900">Review User Feedback</h4>
            <p className="text-sm text-blue-700">Check user reports and suggestions</p>
          </button>
          
          <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors">
            <Download className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-green-900">Export Data</h4>
            <p className="text-sm text-green-700">Download usage reports and analytics</p>
          </button>
        </div>
      </div>

      {/* Topic Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Topic Performance</h3>
        <div className="space-y-4">
          {mockAnalytics.topTopics.map(topic => (
            <div key={topic.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{topic.name}</h4>
                <p className="text-sm text-gray-600">{topic.sessions} study sessions</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{topic.accuracy}%</div>
                <div className="text-sm text-gray-500">avg accuracy</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SpecimenReview = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search specimens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Specimen List */}
      <div className="grid gap-6">
        {mockPendingSpecimens.map(specimen => (
          <SpecimenCard 
            key={specimen.id} 
            specimen={specimen} 
            onSelect={() => setSelectedSpecimen(specimen)}
          />
        ))}
      </div>

      {/* Specimen Review Modal */}
      {selectedSpecimen && (
        <SpecimenReviewModal 
          specimen={selectedSpecimen} 
          onClose={() => setSelectedSpecimen(null)}
        />
      )}
    </div>
  );

  const UserFeedback = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">User Feedback & Reports</h3>
          <p className="text-gray-600 text-sm">Review user suggestions and quality reports</p>
        </div>
        
        <div className="divide-y">
          {mockUserFeedback.map(feedback => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      </div>
    </div>
  );

  const SpecimenCard = ({ specimen, onSelect }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{specimen.species_name}</h3>
            <p className="text-gray-600">{specimen.common_name}</p>
            <p className="text-sm text-gray-500">{specimen.location}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              specimen.status === 'pending' ? 'bg-orange-100 text-orange-800' :
              specimen.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {specimen.status}
            </span>
            
            <button
              onClick={onSelect}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Review
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {specimen.photos.slice(0, 3).map(photo => (
            <div key={photo.id} className="relative">
              <img
                src={photo.photo_url}
                alt={`${photo.angle_type} view`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {photo.angle_type}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📍 {specimen.habitat}</span>
          <span>🔬 iNat: {specimen.inaturalist_id}</span>
          <span>👤 {specimen.observer_username}</span>
          <span>📅 {new Date(specimen.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const SpecimenReviewModal = ({ specimen, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Review: {specimen.species_name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Photos */}
          <div>
            <h3 className="font-semibold mb-3">Photos</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {specimen.photos.map(photo => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.photo_url}
                    alt={`${photo.angle_type} view`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {photo.angle_type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Hints */}
          <div>
            <h3 className="font-semibold mb-3">AI-Generated Hints (Review Required)</h3>
            <div className="space-y-3">
              {specimen.ai_hints.map((hint, index) => (
                <HintEditor key={index} hint={hint} />
              ))}
            </div>
          </div>

          {/* Specimen Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Taxonomy</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Species:</strong> {specimen.species_name}</div>
                <div><strong>Genus:</strong> {specimen.genus}</div>
                <div><strong>Family:</strong> {specimen.family}</div>
                <div><strong>Common Name:</strong> {specimen.common_name}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Collection Info</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Location:</strong> {specimen.location}</div>
                <div><strong>Habitat:</strong> {specimen.habitat}</div>
                <div><strong>iNaturalist ID:</strong> {specimen.inaturalist_id}</div>
                <div><strong>Observer:</strong> {specimen.observer_username}</div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Check className="w-4 h-4" />
              Approve Specimen
            </button>
            
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
              <X className="w-4 h-4" />
              Reject Specimen
            </button>
            
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HintEditor = ({ hint }) => {
    const [text, setText] = useState(hint.text);
    const [isEditing, setIsEditing] = useState(false);

    return (
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              hint.type === 'taxonomic' ? 'bg-blue-100 text-blue-800' :
              hint.type === 'morphological' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              Level {hint.level} - {hint.type}
            </span>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setText(hint.text);
                  setIsEditing(false);
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700">{text}</p>
        )}
      </div>
    );
  };

  const FeedbackCard = ({ feedback }) => (
    <div className="p-6">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium">{feedback.specimen.species_name}</h4>
          <p className="text-sm text-gray-600">Reported by {feedback.username}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            feedback.severity === 'high' ? 'bg-red-100 text-red-800' :
            feedback.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {feedback.severity}
          </span>
          
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            feedback.feedback_type === 'wrong_id' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {feedback.feedback_type.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{feedback.description}</p>
      
      <div className="flex gap-3">
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors">
          Mark Resolved
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
          Investigate
        </button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors">
          Dismiss
        </button>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <AdminNavigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'specimens' && <SpecimenReview />}
        {currentView === 'feedback' && <UserFeedback />}
        {currentView === 'users' && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p className="text-gray-600">Coming soon! Manage user accounts and permissions.</p>
          </div>
        )}
        {currentView === 'settings' && (
          <div className="text-center py-20">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">System Settings</h2>
            <p className="text-gray-600">Coming soon! Configure application settings.</p>
          </div>
        )}
      </main>
    </div>
  );
}
