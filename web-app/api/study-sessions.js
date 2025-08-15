// /api/study-sessions.js - Study session management API
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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
      case 'POST':
        return await handleStartSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'PUT':
        return await handleUpdateSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'GET':
        return await handleGetSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Study sessions API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleStartSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, mode, filters } = req.body;

  if (!userId || !mode) {
    return res.status(400).json({ error: 'Missing required fields' });
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

async function handleUpdateSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { sessionId, queue, stats, isActive } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
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

async function handleGetSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, sessionId, active } = req.query;

  let url = `${SUPABASE_URL}/rest/v1/study_sessions?`;
  
  if (sessionId) {
    url += `id=eq.${sessionId}`;
  } else if (userId) {
    url += `user_id=eq.${userId}`;
    if (active === 'true') {
      url += `&is_active=eq.true`;
    }
    url += `&order=started_at.desc&limit=1`;
  } else {
    return res.status(400).json({ error: 'User ID or Session ID required' });
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