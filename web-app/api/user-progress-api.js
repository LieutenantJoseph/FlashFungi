// /api/user-progress-api.js - User progress management with Supabase Auth
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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
      case 'GET':
        return await handleGetProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, user.id);
      case 'POST':
        return await handleSaveProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, user.id);
      case 'PATCH':
        return await handleUpdateProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User progress API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, authenticatedUserId) {
  const { moduleId, progressType } = req.query;
  // Use authenticated user ID
  const userId = authenticatedUserId;

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

async function handleSaveProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, authenticatedUserId) {
  const { moduleId, specimenId, progressType, score, hintsUsed, completed, attempts } = req.body;
  // Use authenticated user ID
  const userId = authenticatedUserId;

  if (!progressType) {
    return res.status(400).json({ error: 'Missing required field: progressType' });
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
      
      progressData.attempts = (existing[0].attempts || 0) + 1;
      
      if (score && existing[0].score) {
        progressData.score = Math.max(score, existing[0].score);
      }
      
      progressData.completed = completed || existing[0].completed;
      
      if (completed && !existing[0].completed_at) {
        progressData.completed_at = new Date().toISOString();
      } else if (existing[0].completed_at) {
        delete progressData.completed_at;
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

async function handleUpdateProgress(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY, authenticatedUserId) {
  const { progressId, updates } = req.body;

  if (!progressId) {
    return res.status(400).json({ error: 'Progress ID is required' });
  }

  // Verify progress belongs to authenticated user
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/user_progress?id=eq.${progressId}&user_id=eq.${authenticatedUserId}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  const progress = await checkResponse.json();
  if (progress.length === 0) {
    return res.status(403).json({ error: 'Progress not found or access denied' });
  }

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