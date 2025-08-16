// /api/study-sessions.js - Study session management with Supabase Auth
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Service key not configured' });
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Verify authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handleStartSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, user.id);
      case 'PUT':
        return await handleUpdateSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, user.id);
      case 'GET':
        return await handleGetSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Study sessions API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleStartSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, authenticatedUserId) {
  const { mode, filters } = req.body;
  // Use authenticated user ID
  const userId = authenticatedUserId;

  if (!mode) {
    return res.status(400).json({ error: 'Mode is required' });
  }

  const sessionData = {
    user_id: userId,
    mode: mode,
    filters: filters || {},
    queue: [],
    stats: {
      totalAnswered: 0,
      correctAnswers: 0,
      currentStreak: 0,
      longestStreak: 0
    },
    started_at: new Date().toISOString(),
    is_active: true
  };

  const response = await fetch(
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

  if (response.ok) {
    const session = await response.json();
    res.status(201).json(session[0]);
  } else {
    const errorText = await response.text();
    res.status(500).json({ error: 'Failed to start session', details: errorText });
  }
}

async function handleUpdateSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, authenticatedUserId) {
  const { sessionId, queue, stats, isActive } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  // Verify session belongs to authenticated user
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?id=eq.${sessionId}&user_id=eq.${authenticatedUserId}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  const sessions = await checkResponse.json();
  if (sessions.length === 0) {
    return res.status(403).json({ error: 'Session not found or access denied' });
  }

  const updateData = {};
  if (queue !== undefined) updateData.queue = queue;
  if (stats !== undefined) updateData.stats = stats;
  if (isActive !== undefined) {
    updateData.is_active = isActive;
    if (!isActive) {
      updateData.ended_at = new Date().toISOString();
    }
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?id=eq.${sessionId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    }
  );

  if (response.ok) {
    res.status(200).json({ success: true, message: 'Session updated' });
  } else {
    res.status(500).json({ error: 'Failed to update session' });
  }
}

async function handleGetSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, authenticatedUserId) {
  const { sessionId, active } = req.query;
  // Use authenticated user ID
  const userId = authenticatedUserId;

  let url = `${SUPABASE_URL}/rest/v1/study_sessions?`;
  
  if (sessionId) {
    url += `id=eq.${sessionId}&user_id=eq.${userId}`;
  } else {
    url += `user_id=eq.${userId}`;
    if (active === 'true') {
      url += `&is_active=eq.true`;
    }
    url += `&order=started_at.desc&limit=1`;
  }

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (response.ok) {
    const sessions = await response.json();
    res.status(200).json(sessions[0] || null);
  } else {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}