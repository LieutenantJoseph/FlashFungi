// /api/auth.js - Authentication API endpoint for Flash Fungi
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_KEY not configured');
    return res.status(500).json({ error: 'Service key not configured' });
  }

  const { action } = req.body;

  try {
    switch (action) {
      case 'register':
        return await handleRegister(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'update_login':
        return await handleUpdateLogin(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'update_profile':
        return await handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleRegister(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { username, email, password, displayName } = req.body;

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

  try {
    // Check if username already exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?username=eq.${username.toLowerCase()}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (!checkResponse.ok) {
      console.error('Failed to check username:', await checkResponse.text());
      return res.status(500).json({ error: 'Failed to check username availability' });
    }

    const existing = await checkResponse.json();
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Check if email already exists
    const emailCheckResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${email.toLowerCase()}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (emailCheckResponse.ok) {
      const existingEmail = await emailCheckResponse.json();
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // Generate a unique ID (you can use UUID or another method)
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
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newUser)
      }
    );

    if (createResponse.ok) {
      const createdUser = await createResponse.json();
      console.log('User registered successfully:', username);
      res.status(201).json({ 
        success: true, 
        user: createdUser[0] || newUser
      });
    } else {
      const errorText = await createResponse.text();
      console.error('Failed to create user:', errorText);
      res.status(500).json({ 
        error: 'Registration failed',
        details: errorText 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
}

async function handleUpdateLogin(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          last_login: new Date().toISOString()
        })
      }
    );

    if (updateResponse.ok) {
      res.status(200).json({ success: true });
    } else {
      console.error('Failed to update last login');
      res.status(500).json({ error: 'Failed to update last login' });
    }
  } catch (error) {
    console.error('Update login error:', error);
    res.status(500).json({ error: 'Failed to update last login' });
  }
}

async function handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, updates } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

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
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filteredUpdates)
      }
    );

    if (updateResponse.ok) {
      res.status(200).json({ success: true });
    } else {
      const errorText = await updateResponse.text();
      console.error('Failed to update profile:', errorText);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Helper function to generate UUID
function generateUUID() {
  // Simple UUID v4 generator
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older Node versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}