// web-app/api/auth.js - Fixed version with actual Supabase integration
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    console.error('[Auth API] Service key not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { action, username, email, password, displayName, userId, updates } = req.body;

  try {
    switch (action) {
      case 'register':
        return await handleRegister(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'login':
        return await handleLogin(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'update_login':
        return await handleUpdateLogin(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'update_profile':
        return await handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('[Auth API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

async function handleRegister(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { username, email, password, displayName } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if username or email already exists
    const checkUserResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?or=(username.eq.${username.toLowerCase()},email.eq.${email.toLowerCase()})`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (checkUserResponse.ok) {
      const existingUsers = await checkUserResponse.json();
      if (existingUsers.length > 0) {
        return res.status(400).json({ 
          error: 'Username or email already exists' 
        });
      }
    }

    // Generate a unique user ID
    const userId = generateUUID();
    
    // Create password hash (in production, use bcrypt or similar)
    // For now, we'll store a simple hash - NOT SECURE FOR PRODUCTION
    const passwordHash = Buffer.from(password).toString('base64');

    // Create user profile in database
    const newUser = {
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      display_name: displayName || username,
      password_hash: passwordHash, // In production, use proper hashing
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

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
      const [createdUser] = await createResponse.json();
      
      // Remove password hash from response
      delete createdUser.password_hash;
      
      console.log('[Auth API] User registered successfully:', username);
      return res.status(201).json({ 
        success: true, 
        user: createdUser
      });
    } else {
      const errorText = await createResponse.text();
      console.error('[Auth API] Failed to create user:', errorText);
      return res.status(500).json({ 
        error: 'Failed to create user',
        details: errorText
      });
    }
  } catch (error) {
    console.error('[Auth API] Registration error:', error);
    return res.status(500).json({ 
      error: 'Registration failed',
      details: error.message
    });
  }
}

async function handleLogin(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    // Simple password hash for comparison (NOT SECURE FOR PRODUCTION)
    const passwordHash = Buffer.from(password).toString('base64');

    // Find user by username and password
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?username=eq.${username.toLowerCase()}&password_hash=eq.${passwordHash}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (response.ok) {
      const users = await response.json();
      
      if (users.length === 0) {
        return res.status(401).json({ 
          error: 'Invalid username or password' 
        });
      }

      const user = users[0];
      
      // Update last login
      await fetch(
        `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${user.id}`,
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

      // Remove password hash from response
      delete user.password_hash;

      console.log('[Auth API] User logged in successfully:', username);
      return res.status(200).json({
        success: true,
        user: user
      });
    } else {
      const errorText = await response.text();
      console.error('[Auth API] Login query failed:', errorText);
      return res.status(500).json({ 
        error: 'Login failed',
        details: errorText
      });
    }
  } catch (error) {
    console.error('[Auth API] Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed',
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
    const response = await fetch(
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

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Failed to update login time' });
    }
  } catch (error) {
    console.error('[Auth API] Update login error:', error);
    return res.status(500).json({ error: 'Failed to update login' });
  }
}

async function handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, updates } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    // Sanitize updates to only allow certain fields
    const allowedFields = ['display_name', 'bio', 'avatar_url'];
    const sanitizedUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    sanitizedUpdates.updated_at = new Date().toISOString();

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedUpdates)
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.error('[Auth API] Profile update failed:', errorText);
      return res.status(500).json({ 
        error: 'Failed to update profile',
        details: errorText
      });
    }
  } catch (error) {
    console.error('[Auth API] Profile update error:', error);
    return res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message
    });
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}