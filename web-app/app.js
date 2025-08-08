import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Trophy, Target, Zap, Clock, Award, Settings, LogOut, Play, BookOpen, Infinity, Shield } from 'lucide-react';

// Supabase configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';

// Real Supabase Client Implementation
class SupabaseAuthClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.user = null;
    this.session = null;
  }

  async signInWithOAuth(provider, options = {}) {
    try {
      console.log('🔐 Initiating OAuth with:', provider);
      
      // Create a more robust OAuth URL
      const baseUrl = this.url.replace(/\/$/, ''); // Remove trailing slash
      const redirectTo = options.redirectTo || window.location.origin;
      
      // Construct OAuth URL with proper encoding
      const params = new URLSearchParams({
        provider: provider,
        redirect_to: redirectTo
      });
      
      const authUrl = `${baseUrl}/auth/v1/authorize?${params.toString()}`;
      
      console.log('🌐 OAuth URL:', authUrl);
      console.log('📍 Redirect URL:', redirectTo);
      
      // Test if we can reach the Supabase Auth endpoint first
      try {
        const testUrl = `${baseUrl}/auth/v1/health`;
        const healthCheck = await fetch(testUrl, {
          method: 'GET',
          mode: 'cors'
        });
        
        console.log('🏥 Health check status:', healthCheck.status);
        
        if (healthCheck.status === 404 || healthCheck.status === 200) {
          // Auth service is reachable, proceed with OAuth
          console.log('✅ Auth service reachable, proceeding with OAuth');
          window.location.href = authUrl;
          return { user: null, error: null };
        } else {
          throw new Error(`Auth service returned status ${healthCheck.status}`);
        }
        
      } catch (healthError) {
        console.warn('⚠️ Health check failed, trying OAuth anyway:', healthError.message);
        // Try OAuth anyway - sometimes health checks fail but OAuth works
        window.location.href = authUrl;
        return { user: null, error: null };
      }
      
    } catch (error) {
      console.error('OAuth Error:', error);
      return { 
        user: null, 
        error: { 
          message: `OAuth failed: ${error.message}. This might be a CORS issue or network restriction.`
        }
      };
    }
  }

  async signOut() {
    try {
      const response = await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.session?.access_token || this.key}`
        }
      });

      if (response.ok) {
        this.user = null;
        this.session = null;
        return { error: null };
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout Error:', error);
      return { error };
    }
  }

  async getSession() {
    try {
      // Check for existing session in URL (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      
      if (accessToken) {
        console.log('🔑 Found session in URL parameters');
        // Store tokens
        this.session = {
          access_token: accessToken,
          refresh_token: refreshToken
        };
        
        // Get user info
        const userResponse = await fetch(`${this.url}/auth/v1/user`, {
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (userResponse.ok) {
          this.user = await userResponse.json();
          console.log('✅ User authenticated:', this.user);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      
      return { session: this.session, error: null };
    } catch (error) {
      console.error('Session Error:', error);
      return { session: null, error };
    }
  }

  getUser() {
    return this.user;
  }

  // Database operations
  from(table) {
    return new SupabaseTable(table, this);
  }
}

class SupabaseTable {
  constructor(table, client) {
    this.table = table;
    this.client = client;
    this.filters = [];
    this.selectFields = '*';
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  order(column, options = {}) {
    this.orderBy = { column, ...options };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  async execute() {
    try {
      // Build query URL
      let url = `${this.client.url}/rest/v1/${this.table}?select=${this.selectFields}`;
      
      // Add filters
      this.filters.forEach(filter => {
        url += `&${filter.column}=${filter.operator}.${filter.value}`;
      });
      
      // Add ordering
      if (this.orderBy) {
        url += `&order=${this.orderBy.column}${this.orderBy.ascending === false ? '.desc' : '.asc'}`;
      }
      
      // Add limit
      if (this.limitCount) {
        url += `&limit=${this.limitCount}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': this.client.key,
          'Authorization': `Bearer ${this.client.session?.access_token || this.client.key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { data, error: null };
      } else {
        const error = await response.json();
        return { data: null, error };
      }
    } catch (error) {
      console.error('Database Error:', error);
      return { data: null, error };
    }
  }
}

// Initialize Supabase client
const supabase = new SupabaseAuthClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Context
const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log('🚀 Initializing authentication...');
    
    // Check for existing session
    const { session, error } = await supabase.getSession();
    
    if (error) {
      console.error('Session error:', error);
      setAuthError(error.message);
    } else if (session) {
      setUser(supabase.getUser());
      console.log('✅ Existing session found');
    } else {
      console.log('ℹ️ No existing session');
    }
    
    setLoading(false);
  };

  const signIn = async (provider) => {
    setAuthError(null);
    console.log(`🔐 Attempting to sign in with ${provider}...`);
    
    const { user, error } = await supabase.signInWithOAuth(provider, {
      redirectTo: `${window.location.origin}${window.location.pathname}`
    });
    
    if (error) {
      console.error('Sign in error:', error);
      setAuthError(error.message);
      return { user: null, error };
    }
    
    // OAuth will redirect, so we don't set user here
    return { user, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.signOut();
    if (!error) {
      setUser(null);
      setAuthError(null);
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Main App Component
export default function MushroomStudyApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, signIn, signOut, authError } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍄</div>
          <div className="text-lg text-gray-600">Loading authentication...</div>
          <div className="text-sm text-gray-500 mt-2">Checking Google OAuth configuration</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signIn} authError={authError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={user} 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onSignOut={signOut}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && <Dashboard user={user} />}
        {currentView === 'profile' && <Profile user={user} />}
        {currentView === 'leaderboard' && <Leaderboard />}
        {currentView === 'admin' && <AdminPortalButton />}
      </main>
    </div>
  );
}

// Login Component with OAuth Testing
function LoginPage({ onSignIn, authError }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSignIn = async (provider) => {
    setIsConnecting(true);
    await onSignIn(provider);
    // OAuth will redirect, so component will unmount
  };

  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 Testing Supabase connection...');
      console.log('📍 URL:', SUPABASE_URL);
      
      // Test multiple endpoints to find what works
      const endpoints = [
        { name: 'REST API', url: `${SUPABASE_URL}/rest/v1/` },
        { name: 'Auth Health', url: `${SUPABASE_URL}/auth/v1/health` },
        { name: 'Auth Settings', url: `${SUPABASE_URL}/auth/v1/settings` }
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          });
          
          results.push(`${endpoint.name}: ✅ ${response.status}`);
          console.log(`✅ ${endpoint.name}:`, response.status);
          
        } catch (error) {
          results.push(`${endpoint.name}: ❌ ${error.message}`);
          console.log(`❌ ${endpoint.name}:`, error.message);
        }
      }
      
      alert('🧪 Connection Test Results:\n\n' + results.join('\n') + 
            '\n\nAt least one endpoint should work for OAuth to function.');
            
    } catch (error) {
      console.error('Connection test error:', error);
      alert('❌ Connection test failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍄</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Arizona Mushroom Study</h1>
          <p className="text-gray-600">Master mushroom identification with DNA-verified specimens</p>
        </div>
        
        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Authentication Error:</strong> {authError}
            </p>
            <div className="mt-3 text-red-700 text-xs">
              <p><strong>Common Solutions:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Content Blocked:</strong> Try the "Test OAuth in New Tab" button below</li>
                <li><strong>CORS Issues:</strong> Use "Copy OAuth URL" and paste in new tab</li>
                <li><strong>Network Restrictions:</strong> Check if your firewall/antivirus blocks Supabase</li>
                <li><strong>Browser Extensions:</strong> Try disabling ad blockers temporarily</li>
                <li><strong>OAuth Not Configured:</strong> Enable Google in Supabase Dashboard → Auth → Providers</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button 
            onClick={() => handleSignIn('google')}
            disabled={isConnecting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <span className="text-blue-500 text-xs font-bold">G</span>
            </div>
            {isConnecting ? 'Connecting...' : 'Continue with Google'}
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">iNaturalist OAuth coming soon</p>
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <button 
              onClick={testSupabaseConnection}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
            >
              🔧 Test Supabase Connection
            </button>
            
            <button 
              onClick={() => {
                const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`;
                
                // Create a test by opening in new tab
                const newTab = window.open(authUrl, '_blank');
                
                if (!newTab) {
                  alert('❌ Popup blocked!\n\nPlease allow popups or copy this URL and open manually:\n\n' + authUrl);
                } else {
                  alert('✅ OAuth URL opened in new tab!\n\nIf you see a Google login page, OAuth is working.\nIf you see an error, OAuth needs configuration in Supabase.');
                }
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
            >
              🌐 Test OAuth in New Tab
            </button>
            
            <button 
              onClick={() => {
                const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`;
                navigator.clipboard.writeText(authUrl).then(() => {
                  alert('📋 OAuth URL copied to clipboard!\n\nPaste it in a new browser tab to test OAuth manually:\n\n' + authUrl);
                }).catch(() => {
                  alert('📋 OAuth URL:\n\n' + authUrl + '\n\nCopy this URL and paste it in a new tab to test OAuth.');
                });
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
            >
              📋 Copy OAuth URL
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800 font-medium">🔍 OAuth Debug Info:</p>
          <p className="text-xs text-blue-700 mt-1">
            Supabase URL: {SUPABASE_URL}
          </p>
          <p className="text-xs text-blue-700">
            Current URL: {window.location.href}
          </p>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

// Navigation Component
function Navigation({ user, currentView, setCurrentView, onSignOut }) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍄</span>
            <span className="text-xl font-bold">Arizona Mushroom Study</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'profile' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setCurrentView('leaderboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'leaderboard' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-1" />
              Leaderboard
            </button>
            
            {/* Admin Portal Access */}
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'admin' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1" />
              Admin
            </button>
            
            <div className="flex items-center gap-2 ml-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-gray-700">
                {user?.user_metadata?.name || user?.email || 'User'}
              </span>
              <button
                onClick={onSignOut}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Dashboard Component
function Dashboard({ user }) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user?.user_metadata?.name || user?.email || 'Mycologist'}! 🍄
        </h1>
        <p className="opacity-90">Your Google OAuth integration is working perfectly!</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="text-sm">✅ Authentication: Active</span>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="text-sm">🔗 Provider: {user?.app_metadata?.provider || 'Google'}</span>
          </div>
        </div>
      </div>

      {/* Study Modes */}
      <div className="grid md:grid-cols-3 gap-4">
        <StudyModeCard
          icon={<Zap className="w-8 h-8" />}
          title="Quick Study"
          description="10 questions, fast-paced review"
          color="bg-blue-500"
          onClick={() => alert('Study modes coming soon!')}
        />
        <StudyModeCard
          icon={<Target className="w-8 h-8" />}
          title="Focused Study"
          description="Customize topics and difficulty"
          color="bg-purple-500"
          onClick={() => alert('Study modes coming soon!')}
        />
        <StudyModeCard
          icon={<Infinity className="w-8 h-8" />}
          title="Marathon Mode"
          description="Unlimited questions, test your endurance"
          color="bg-red-500"
          onClick={() => alert('Study modes coming soon!')}
        />
      </div>

      {/* OAuth Debug Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">🔧 OAuth Debug Information</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Provider:</strong> {user?.app_metadata?.provider}</p>
            <p><strong>Email Verified:</strong> {user?.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
          </div>
          <div>
            <p><strong>Name:</strong> {user?.user_metadata?.name}</p>
            <p><strong>Avatar:</strong> {user?.user_metadata?.avatar_url ? '✅ Available' : '❌ None'}</p>
            <p><strong>Last Sign In:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Component
function Profile({ user }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">User Profile</h2>
        
        <div className="flex items-center gap-4 mb-6">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold">{user?.user_metadata?.name || 'Mycologist'}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-green-600">Authenticated via {user?.app_metadata?.provider || 'Google'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Account Information</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Email Verified:</strong> {user?.email_confirmed_at ? '✅ Verified' : '❌ Unverified'}</p>
            </div>
            <div className="space-y-2">
              <p><strong>Created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
              <p><strong>Last Sign In:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}</p>
              <p><strong>Provider:</strong> {user?.app_metadata?.provider || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Component
function Leaderboard() {
  return (
    <div className="text-center py-20">
      <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
      <p className="text-gray-600">Coming soon! Compete with other mycologists.</p>
    </div>
  );
}

// Admin Portal Button
function AdminPortalButton() {
  const openAdminPortal = () => {
    // In a real app, this would check admin permissions
    window.open('/admin', '_blank');
  };

  return (
    <div className="text-center py-20">
      <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Admin Portal</h2>
      <p className="text-gray-600 mb-6">Review specimens and manage the study content.</p>
      <button 
        onClick={openAdminPortal}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Open Admin Portal
      </button>
    </div>
  );
}

// Helper Components
const StudyModeCard = ({ icon, title, description, color, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-green-200"
  >
    <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);
