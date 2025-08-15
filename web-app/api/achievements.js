// /api/achievements.js - Achievement management API
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
      case 'GET':
        return await handleGetAchievements(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'POST':
        return await handleAwardAchievement(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Achievements API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetAchievements(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, category } = req.query;

  // Build query
  let url = `${SUPABASE_URL}/rest/v1/achievements?select=*`;
  if (category) {
    url += `&category=eq.${category}`;
  }

  const achievementsResponse = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (!achievementsResponse.ok) {
    return res.status(500).json({ error: 'Failed to fetch achievements' });
  }

  const achievements = await achievementsResponse.json();

  // If userId provided, also get user's earned achievements
  if (userId) {
    const userAchievementsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (userAchievementsResponse.ok) {
      const userAchievements = await userAchievementsResponse.json();
      
      // Merge achievement data with user progress
      const achievementsWithProgress = achievements.map(achievement => {
        const userProgress = userAchievements.find(ua => ua.achievement_id === achievement.id);
        return {
          ...achievement,
          earned: userProgress?.earned_at ? true : false,
          earned_at: userProgress?.earned_at,
          progress: userProgress?.progress || 0
        };
      });

      return res.status(200).json(achievementsWithProgress);
    }
  }

  res.status(200).json(achievements);
}

async function handleAwardAchievement(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { userId, achievementId, progress } = req.body;

  if (!userId || !achievementId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if already earned
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.${userId}&achievement_id=eq.${achievementId}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (checkResponse.ok) {
    const existing = await checkResponse.json();
    
    if (existing.length > 0) {
      // Update progress if not yet earned
      if (!existing[0].earned_at && progress !== undefined) {
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/user_achievements?id=eq.${existing[0].id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              progress: progress,
              earned_at: progress >= 100 ? new Date().toISOString() : null
            })
          }
        );

        if (updateResponse.ok) {
          return res.status(200).json({ 
            success: true, 
            message: 'Progress updated',
            earned: progress >= 100 
          });
        }
      } else {
        return res.status(200).json({ 
          success: false, 
          message: 'Achievement already earned' 
        });
      }
    }
  }

  // Create new achievement record
  const createResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/user_achievements`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        achievement_id: achievementId,
        earned_at: progress >= 100 ? new Date().toISOString() : null,
        progress: progress || 100
      })
    }
  );

  if (createResponse.ok) {
    res.status(201).json({ 
      success: true, 
      message: 'Achievement awarded',
      earned: progress >= 100 
    });
  } else {
    res.status(500).json({ error: 'Failed to award achievement' });
  }
}