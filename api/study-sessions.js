// /api/study-sessions.js - Session Persistence API for Marathon Mode
// Handles saving, loading, and managing study sessions

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_KEY not configured');
    return res.status(500).json({ error: 'Service key not configured' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetSessions(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'POST':
        return await handleSaveSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'PATCH':
        return await handleUpdateSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'DELETE':
        return await handleDeleteSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Study sessions API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Get user's study sessions
async function handleGetSessions(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { user_id, mode, is_active } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  // Build query
  let query = `user_id=eq.${user_id}`;
  if (mode) {
    query += `&mode=eq.${mode}`;
  }
  if (is_active !== undefined) {
    query += `&is_active=eq.${is_active}`;
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?${query}&order=started_at.desc`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.ok) {
    const sessions = await response.json();
    res.status(200).json(sessions);
  } else {
    const errorText = await response.text();
    console.error('Failed to fetch sessions:', errorText);
    res.status(response.status).json({ error: 'Failed to fetch sessions' });
  }
}

// Save or update a study session
async function handleSaveSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { user_id, mode, queue, stats, filters, is_active, ended_at } = req.body;

  if (!user_id || !mode) {
    return res.status(400).json({ error: 'user_id and mode are required' });
  }

  // Check if an active session already exists for this user and mode
  const existingResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?user_id=eq.${user_id}&mode=eq.${mode}&is_active=eq.true`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  let sessionData = {
    user_id,
    mode,
    queue: queue || {},
    stats: stats || {},
    filters: filters || null,
    is_active: is_active !== undefined ? is_active : true,
    updated_at: new Date().toISOString()
  };

  if (ended_at) {
    sessionData.ended_at = ended_at;
    sessionData.is_active = false;
  }

  if (existingResponse.ok) {
    const existingSessions = await existingResponse.json();
    
    if (existingSessions.length > 0) {
      // Update existing session
      const sessionId = existingSessions[0].id;
      
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/study_sessions?id=eq.${sessionId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(sessionData)
        }
      );

      if (updateResponse.ok) {
        const updatedSession = await updateResponse.json();
        return res.status(200).json({ 
          success: true, 
          session: updatedSession[0],
          message: 'Session updated successfully' 
        });
      } else {
        const errorText = await updateResponse.text();
        console.error('Failed to update session:', errorText);
        return res.status(updateResponse.status).json({ error: 'Failed to update session' });
      }
    }
  }

  // Create new session
  sessionData.started_at = new Date().toISOString();

  const createResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(sessionData)
    }
  );

  if (createResponse.ok) {
    const newSession = await createResponse.json();
    res.status(201).json({ 
      success: true, 
      session: newSession[0],
      message: 'Session created successfully' 
    });
  } else {
    const errorText = await createResponse.text();
    console.error('Failed to create session:', errorText);
    res.status(createResponse.status).json({ error: 'Failed to create session' });
  }
}

// Update an existing session
async function handleUpdateSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { session_id } = req.query;
  const updates = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  // Add updated timestamp
  updates.updated_at = new Date().toISOString();

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?id=eq.${session_id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    }
  );

  if (response.ok) {
    const updatedSession = await response.json();
    res.status(200).json({ 
      success: true, 
      session: updatedSession[0],
      message: 'Session updated successfully' 
    });
  } else {
    const errorText = await response.text();
    console.error('Failed to update session:', errorText);
    res.status(response.status).json({ error: 'Failed to update session' });
  }
}

// Delete a study session
async function handleDeleteSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { session_id, user_id } = req.query;

  if (!session_id && !user_id) {
    return res.status(400).json({ error: 'session_id or user_id is required' });
  }

  let query = '';
  if (session_id) {
    query = `id=eq.${session_id}`;
  } else {
    query = `user_id=eq.${user_id}`;
    // Add additional filters if needed (e.g., only delete inactive sessions)
    query += '&is_active=eq.false';
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?${query}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (response.ok) {
    res.status(200).json({ 
      success: true, 
      message: 'Session(s) deleted successfully' 
    });
  } else {
    const errorText = await response.text();
    console.error('Failed to delete session:', errorText);
    res.status(response.status).json({ error: 'Failed to delete session' });
  }
}

// Helper function to validate session data
function validateSessionData(sessionData) {
  const errors = [];

  if (!sessionData.user_id) {
    errors.push('user_id is required');
  }

  if (!sessionData.mode) {
    errors.push('mode is required');
  }

  if (!['quick_study', 'focused_study', 'marathon', 'training'].includes(sessionData.mode)) {
    errors.push('Invalid mode. Must be one of: quick_study, focused_study, marathon, training');
  }

  if (sessionData.queue && typeof sessionData.queue !== 'object') {
    errors.push('queue must be an object');
  }

  if (sessionData.stats && typeof sessionData.stats !== 'object') {
    errors.push('stats must be an object');
  }

  return errors;
}

// Helper function to clean old sessions (could be called periodically)
async function cleanOldSessions(SUPABASE_URL, SUPABASE_SERVICE_KEY, daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?is_active=eq.false&ended_at=lt.${cutoffDate.toISOString()}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (response.ok) {
    console.log(`Cleaned old sessions older than ${daysOld} days`);
  } else {
    console.error('Failed to clean old sessions');
  }
}