// /api/training-modules.js - Training Modules Management API
// Handles CRUD operations for training modules in the database

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
        return await handleGetModules(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'POST':
        return await handleCreateModule(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'PATCH':
        return await handleUpdateModule(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      case 'DELETE':
        return await handleDeleteModule(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Training modules API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Get modules - all or by ID/category
async function handleGetModules(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { id, category, published } = req.query;

  // Build query
  let query = '';
  const params = [];
  
  if (id) {
    params.push(`id=eq.${id}`);
  }
  if (category) {
    params.push(`category=eq.${category}`);
  }
  if (published !== undefined) {
    params.push(`published=eq.${published}`);
  }
  
  if (params.length > 0) {
    query = '?' + params.join('&');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/training_modules${query}&order=created_at.desc`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (response.ok) {
    const modules = await response.json();
    res.status(200).json(modules);
  } else {
    const errorText = await response.text();
    console.error('Failed to fetch modules:', errorText);
    res.status(response.status).json({ error: 'Failed to fetch modules' });
  }
}

// Create a new module
async function handleCreateModule(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { 
    id, 
    title, 
    category, 
    difficulty_level, 
    duration_minutes, 
    content,
    prerequisites,
    unlocks,
    published 
  } = req.body;

  // Enhanced validation with specific error messages
  const missingFields = [];
  if (!id) missingFields.push('id');
  if (!title) missingFields.push('title');
  if (!category) missingFields.push('category');
  if (!difficulty_level) missingFields.push('difficulty_level');
  
  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    console.error('Received body:', req.body);
    return res.status(400).json({ 
      error: `Missing required fields: ${missingFields.join(', ')}`,
      received: req.body // Include what was received for debugging
    });
  }

  // Check if module with this ID already exists
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/training_modules?id=eq.${id}`,
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
      return res.status(409).json({ error: 'Module with this ID already exists' });
    }
  }

  const moduleData = {
    id,
    title,
    category,
    difficulty_level,
    duration_minutes: duration_minutes || 20,
    content: content || {},
    prerequisites: prerequisites || [],
    unlocks: unlocks || [],
    published: published !== undefined ? published : false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Creating module with data:', moduleData);

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/training_modules`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(moduleData)
    }
  );

  if (response.ok) {
    const newModule = await response.json();
    console.log('Module created successfully:', newModule[0]?.id);
    res.status(201).json({ 
      success: true, 
      module: newModule[0],
      message: 'Module created successfully' 
    });
  } else {
    const errorText = await response.text();
    console.error('Failed to create module:', errorText);
    res.status(response.status).json({ 
      error: 'Failed to create module', 
      details: errorText 
    });
  }
}

// Update an existing module
async function handleUpdateModule(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Module ID is required' });
  }

  // Add updated timestamp
  updates.updated_at = new Date().toISOString();

  // Remove fields that shouldn't be updated
  delete updates.id;
  delete updates.created_at;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/training_modules?id=eq.${id}`,
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
    const updatedModule = await response.json();
    if (updatedModule.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.status(200).json({ 
      success: true, 
      module: updatedModule[0],
      message: 'Module updated successfully' 
    });
  } else {
    const errorText = await response.text();
    console.error('Failed to update module:', errorText);
    res.status(response.status).json({ error: 'Failed to update module' });
  }
}

// Delete a module
async function handleDeleteModule(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Module ID is required' });
  }

  // First check if module exists
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/training_modules?id=eq.${id}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (checkResponse.ok) {
    const existing = await checkResponse.json();
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
  }

  // Delete the module
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/training_modules?id=eq.${id}`,
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
      message: 'Module deleted successfully' 
    });
  } else {
    const errorText = await response.text();
    console.error('Failed to delete module:', errorText);
    res.status(response.status).json({ error: 'Failed to delete module' });
  }
}