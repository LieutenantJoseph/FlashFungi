// /api/auth.js - Fixed Authentication API endpoint for Flash Fungi
// This file should be placed at: web-app/api/auth.js

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Configuration
  const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';
  
  // For operations that require service key, check if it exists
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  // Log request details for debugging
  console.log(`[Auth API] ${req.method} request received`);
  console.log('[Auth API] Body:', req.body);
  console.log('[Auth API] Service Key Available:', !!SUPABASE_SERVICE_KEY);

  // Only allow POST requests for auth operations
  if (req.method !== 'POST') {
    console.log(`[Auth API] Method not allowed: ${req.method}`);
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method,
      allowed: ['POST', 'OPTIONS']
    });
  }

  const { action } = req.body;
  
  if (!action) {
    return res.status(400).json({ 
      error: 'Missing action in request body',
      required: 'action',
      validActions: ['register', 'login', 'update_login', 'update_profile']
    });
  }

  console.log(`[Auth API] Action: ${action}`);

  try {
    switch (action) {
      case 'register':
        return await handleRegister(req, res, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
      case 'login':
        return await handleLogin(req, res, SUPABASE_URL, SUPABASE_ANON_KEY);
      case 'update_login':
        return await handleUpdateLogin(req, res, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
      case 'update_profile':
        return await handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          provided: action,
          validActions: ['register', 'login', 'update_login', 'update_profile']
        });
    }
  } catch (error) {
    console.error('[Auth API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function handleRegister(req, res, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY) {
  const { username, email, password, displayName } = req.body;

  console.log('[Auth API] Processing registration for:', username);

  // Validate input
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Use service key if available, otherwise use anon key
  const authKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

  try {
    // Check if username already exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?username=eq.${username.toLowerCase()}&select=id`,
      {
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`
        }
      }
    );

    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error('[Auth API] Failed to check username:', errorText);
      return res.status(500).json({ 
        error: 'Failed to check username availability',
        details: errorText
      });
    }

    const existing = await checkResponse.json();
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Check if email already exists
    const emailCheckResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${email.toLowerCase()}&select=id`,
      {
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`
        }
      }
    );

    if (emailCheckResponse.ok) {
      const existingEmail = await emailCheckResponse.json();
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // Generate a unique ID
    const userId = generateUUID();

    // Create new user profile
    const newUser = {
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      display_name: displayName || username,
      bio: '',
      avatar_url: null,
      privacy_settings: {
        show_stats: true,
        show_achievements: true,
        allow_messages: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    // Note: In production, you should hash the password and store it securely
    // For this demo, we're not storing passwords at all

    const createResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles`,
      {
        method: 'POST',
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newUser)
      }
    );

    if (createResponse.ok) {
      const createdUser = await createResponse.json();
      console.log('[Auth API] User registered successfully:', username);
      return res.status(201).json({ 
        success: true, 
        user: createdUser[0] || newUser
      });
    } else {
      const errorText = await createResponse.text();
      console.error('[Auth API] Failed to create user:', errorText);
      
      // Check if it's a permission issue
      if (errorText.includes('permission') || errorText.includes('denied')) {
        return res.status(500).json({ 
          error: 'Database permission error. Please contact support.',
          details: 'The database may require additional configuration for user registration.'
        });
      }
      
      return res.status(500).json({ 
        error: 'Registration failed',
        details: errorText 
      });
    }
  } catch (error) {
    console.error('[Auth API] Registration error:', error);
    return res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
}

async function handleLogin(req, res, SUPABASE_URL, SUPABASE_ANON_KEY) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // For demo purposes, check if user exists and accept any password
    // In production, implement proper password verification
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?username=eq.${username.toLowerCase()}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const users = await response.json();
      if (users.length > 0) {
        const user = users[0];
        
        // Simple password check (in production, use proper hashing)
        if (password) {
          console.log('[Auth API] User logged in successfully:', username);
          return res.status(200).json({ 
            success: true, 
            user: user 
          });
        }
      }
    }
    
    return res.status(401).json({ 
      error: 'Invalid username or password' 
    });
  } catch (error) {
    console.error('[Auth API] Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
}

async function handleUpdateLogin(req, res, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const authKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

  try {
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          last_login: new Date().toISOString()
        })
      }
    );

    if (updateResponse.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await updateResponse.text();
      console.error('[Auth API] Failed to update last login:', errorText);
      return res.status(500).json({ 
        error: 'Failed to update last login',
        details: errorText 
      });
    }
  } catch (error) {
    console.error('[Auth API] Update login error:', error);
    return res.status(500).json({ 
      error: 'Failed to update last login',
      message: error.message 
    });
  }
}

async function handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY) {
  const { userId, updates } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const authKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

  try {
    // Whitelist allowed fields
    const allowedFields = ['display_name', 'bio', 'avatar_url', 'privacy_settings'];
    const filteredUpdates = {};
    
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filteredUpdates)
      }
    );

    if (updateResponse.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await updateResponse.text();
      console.error('[Auth API] Failed to update profile:', errorText);
      return res.status(500).json({ 
        error: 'Failed to update profile',
        details: errorText 
      });
    }
  } catch (error) {
    console.error('[Auth API] Update profile error:', error);
    return res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message 
    });
  }
}

// Helper function to generate UUID
function generateUUID() {
  // Use crypto.randomUUID if available (Node.js 16.7+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}