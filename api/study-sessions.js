// api/study-sessions.js - API endpoint for saving study session data
// Replaces individual flashcard saves with aggregated session data

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        return await handleSaveSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'GET':
        return await handleGetSessions(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Study sessions API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSaveSession(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { 
    userId,
    sessionType,
    mode,
    stats,
    metadata,
    filters,
    difficultyLevel = 'mixed',
    isComplete = false
  } = req.body;

  if (!userId || !sessionType || !stats) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Prepare session data for database
  const sessionData = {
    user_id: userId,
    session_type: sessionType || mode, // Support both field names
    questions_attempted: stats.totalQuestions || 0,
    questions_correct: stats.correctAnswers || 0,
    total_score: stats.totalScore || 0,
    total_hints_used: stats.hintsUsed || 0,
    longest_streak: stats.longestStreak || 0,
    unique_specimens: stats.uniqueSpecimens || stats.specimensStudied?.size || 0,
    perfect_scores: stats.perfectScores || 0,
    no_hint_correct: stats.noHintCorrect || 0,
    difficulty_level: difficultyLevel,
    completed: isComplete,
    is_active: !isComplete,
    filters: filters || null,
    metadata: {
      ...metadata,
      milestones: metadata?.milestones || [],
      topGenus: stats.topGenus || null,
      topFamily: stats.topFamily || null,
      genusCounts: stats.genusCounts || {},
      familyCounts: stats.familyCounts || {},
      timestamp: new Date().toISOString()
    }
  };

  // Calculate derived fields
  if (sessionData.questions_attempted > 0) {
    sessionData.session_score = Math.round(
      (sessionData.total_score / sessionData.questions_attempted)
    );
  }

  // Set end_time if session is complete
  if (isComplete) {
    sessionData.end_time = new Date().toISOString();
  }

  // Check if updating existing active session or creating new
  const existingSessionResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?user_id=eq.${userId}&is_active=eq.true&select=id`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  const existingSessions = await existingSessionResponse.json();
  
  let response;
  if (existingSessions.length > 0) {
    // Update existing active session
    const sessionId = existingSessions[0].id;
    response = await fetch(
      `${SUPABASE_URL}/rest/v1/study_sessions?id=eq.${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      }
    );
  } else {
    // Create new session
    sessionData.start_time = new Date().toISOString();
    response = await fetch(
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
  }

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Session saved successfully');
    res.status(200).json({ 
      success: true, 
      sessionId: data[0]?.id || existingSessions[0]?.id,
      stats: {
        questions: sessionData.questions_attempted,
        correct: sessionData.questions_correct,
        accuracy: sessionData.questions_attempted > 0 
          ? Math.round((sessionData.questions_correct / sessionData.questions_attempted) * 100)
          : 0,
        avgScore: sessionData.session_score || 0,
        longestStreak: sessionData.longest_streak
      }
    });
  } else {
    const error = await response.text();
    console.error('Failed to save session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
}

async function handleGetSessions(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, limit = 10, offset = 0 } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // Fetch user's study sessions
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/study_sessions?user_id=eq.${userId}&completed=eq.true&order=created_at.desc&limit=${limit}&offset=${offset}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (response.ok) {
    const sessions = await response.json();
    
    // Calculate aggregate stats
    const totalStats = sessions.reduce((acc, session) => ({
      totalQuestions: acc.totalQuestions + (session.questions_attempted || 0),
      totalCorrect: acc.totalCorrect + (session.questions_correct || 0),
      totalTime: acc.totalTime + (session.end_time && session.start_time 
        ? Math.round((new Date(session.end_time) - new Date(session.start_time)) / 60000)
        : 0),
      totalSessions: acc.totalSessions + 1,
      bestStreak: Math.max(acc.bestStreak, session.longest_streak || 0)
    }), {
      totalQuestions: 0,
      totalCorrect: 0,
      totalTime: 0,
      totalSessions: 0,
      bestStreak: 0
    });

    res.status(200).json({
      sessions: sessions,
      aggregateStats: {
        ...totalStats,
        avgAccuracy: totalStats.totalQuestions > 0
          ? Math.round((totalStats.totalCorrect / totalStats.totalQuestions) * 100)
          : 0
      }
    });
  } else {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}