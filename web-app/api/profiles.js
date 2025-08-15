// /api/profiles.js - Public profile management API
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
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
        return await handleGetProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'PUT':
        return await handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profiles API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { username, userId } = req.query;

  let url = `${SUPABASE_URL}/rest/v1/user_profiles?`;
  
  if (username) {
    url += `username=eq.${username}`;
  } else if (userId) {
    url += `id=eq.${userId}`;
  } else {
    return res.status(400).json({ error: 'Username or User ID required' });
  }

  const profileResponse = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (!profileResponse.ok) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const profiles = await profileResponse.json();
  const profile = profiles[0];

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Get user statistics
  const statsPromises = [
    // Get progress data
    fetch(
      `${SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${profile.id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    ),
    // Get achievements
    fetch(
      `${SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.${profile.id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    )
  ];

  const [progressResponse, achievementsResponse] = await Promise.all(statsPromises);
  
  const progress = progressResponse.ok ? await progressResponse.json() : [];
  const achievements = achievementsResponse.ok ? await achievementsResponse.json() : [];

  // Calculate statistics
  const stats = {
    specimens_identified: progress.filter(p => p.progress_type === 'flashcard').length,
    accuracy_rate: calculateAccuracy(progress),
    modules_completed: progress.filter(p => p.progress_type === 'training_module' && p.completed).length,
    achievements_earned: achievements.filter(a => a.earned_at).length,
    join_date: profile.created_at
  };

  // Build public profile
  const publicProfile = {
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    stats: stats,
    achievements: achievements.filter(a => a.earned_at).slice(0, 10), // Top 10 achievements
    privacy_settings: profile.privacy_settings || {
      show_stats: true,
      show_achievements: true
    }
  };

  res.status(200).json(publicProfile);
}

async function handleUpdateProfile(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, updates } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // Validate allowed updates
  const allowedFields = ['display_name', 'bio', 'avatar_url', 'privacy_settings'];
  const filteredUpdates = {};
  
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  filteredUpdates.updated_at = new Date().toISOString();

  const response = await fetch(
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

  if (response.ok) {
    res.status(200).json({ success: true, message: 'Profile updated' });
  } else {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

function calculateAccuracy(progress) {
  const flashcardProgress = progress.filter(p => p.progress_type === 'flashcard');
  if (flashcardProgress.length === 0) return 0;
  
  const totalScore = flashcardProgress.reduce((sum, p) => sum + (p.score || 0), 0);
  const avgScore = totalScore / flashcardProgress.length;
  
  return Math.round(avgScore);
}