// File: web-app/api/user-progress.js
// API endpoint for managing user progress and profile data

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Service key not configured' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'POST':
        return await handleSaveProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'PATCH':
        return await handleUpdateProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User progress API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, moduleId, progressType } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // First check if user exists, create if not
  const userCheckResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (userCheckResponse.ok) {
    const users = await userCheckResponse.json();
    if (users.length === 0) {
      // Create user profile if it doesn't exist
      console.log(`Creating new user profile for ${userId}`);
      const createUserResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/user_profiles`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: userId,
            email: `user-${userId}@flashfungi.com`,
            username: `user_${userId.slice(0, 8)}`,
            display_name: 'Flash Fungi User'
          })
        }
      );

      if (!createUserResponse.ok) {
        console.error('Failed to create user profile');
      }
    }
  }

  // Build query for progress
  let url = `${SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${userId}`;
  if (moduleId) {
    url += `&module_id=eq.${moduleId}`;
  }
  if (progressType) {
    url += `&progress_type=eq.${progressType}`;
  }

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    res.status(200).json(data);
  } else {
    const errorText = await response.text();
    console.error('Failed to fetch progress:', errorText);
    res.status(response.status).json({ error: 'Failed to fetch progress' });
  }
}

async function handleSaveProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, moduleId, specimenId, progressType, score, hintsUsed, completed, attempts } = req.body;

  if (!userId || !progressType) {
    return res.status(400).json({ error: 'Missing required fields: userId and progressType' });
  }

  // Check if progress entry already exists
  let checkUrl = `${SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${userId}`;
  if (moduleId) checkUrl += `&module_id=eq.${moduleId}`;
  if (specimenId) checkUrl += `&specimen_id=eq.${specimenId}`;
  checkUrl += `&progress_type=eq.${progressType}`;

  const checkResponse = await fetch(checkUrl, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  let method = 'POST';
  let url = `${SUPABASE_URL}/rest/v1/user_progress`;
  let progressData = {
    user_id: userId,
    module_id: moduleId || null,
    specimen_id: specimenId || null,
    progress_type: progressType,
    score: score || 0,
    hints_used: hintsUsed || 0,
    attempts: attempts || 1,
    completed: completed || false,
    last_attempted: new Date().toISOString()
  };

  if (completed) {
    progressData.completed_at = new Date().toISOString();
  }

  if (checkResponse.ok) {
    const existing = await checkResponse.json();
    if (existing.length > 0) {
      // Update existing progress
      method = 'PATCH';
      url = `${SUPABASE_URL}/rest/v1/user_progress?id=eq.${existing[0].id}`;
      
      // Increment attempts if updating
      progressData.attempts = (existing[0].attempts || 0) + 1;
      
      // Update score if better
      if (score && existing[0].score) {
        progressData.score = Math.max(score, existing[0].score);
      }
      
      // Update completed status
      progressData.completed = completed || existing[0].completed;
      
      // Keep earliest completion date
      if (completed && !existing[0].completed_at) {
        progressData.completed_at = new Date().toISOString();
      } else if (existing[0].completed_at) {
        delete progressData.completed_at; // Don't overwrite existing completion date
      }

      // Don't send unchanged fields in PATCH
      delete progressData.user_id;
      delete progressData.module_id;
      delete progressData.specimen_id;
      delete progressData.progress_type;
    }
  }

  const response = await fetch(url, {
    method: method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(progressData)
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`Progress ${method === 'POST' ? 'saved' : 'updated'} for user ${userId}`);
    res.status(method === 'POST' ? 201 : 200).json(data);
  } else {
    const errorText = await response.text();
    console.error(`Failed to save progress:`, errorText);
    res.status(response.status).json({ 
      error: `Failed to save progress`, 
      details: errorText 
    });
  }
}

async function handleUpdateProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { progressId, updates } = req.body;

  if (!progressId) {
    return res.status(400).json({ error: 'Progress ID is required' });
  }

  // Ensure updated_at is set
  updates.last_attempted = new Date().toISOString();

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/user_progress?id=eq.${progressId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  );

  if (response.ok) {
    res.status(200).json({ success: true, message: 'Progress updated' });
  } else {
    const errorText = await response.text();
    console.error('Failed to update progress:', errorText);
    res.status(response.status).json({ error: 'Failed to update progress' });
  }
}

// Additional endpoints for user profile management
async function handleGetUserProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (response.ok) {
    const data = await response.json();
    if (data.length > 0) {
      res.status(200).json(data[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } else {
    res.status(response.status).json({ error: 'Failed to fetch user profile' });
  }
}

async function handleUpdateUserProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, updates } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Update the updated_at timestamp
  updates.updated_at = new Date().toISOString();
  
  // Update last_login if this is a login
  if (updates.login) {
    updates.last_login = new Date().toISOString();
    delete updates.login;
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  );

  if (response.ok) {
    res.status(200).json({ success: true, message: 'Profile updated' });
  } else {
    const errorText = await response.text();
    console.error('Failed to update profile:', errorText);
    res.status(response.status).json({ error: 'Failed to update profile' });
  }
}