// /api/admin.js - Updated to delete instead of reject specimens
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
    console.error('Service key not configured');
    return res.status(500).json({ error: 'Service key not configured' });
  }

  try {
    if (req.method === 'PATCH') {
      return await handleSpecimenUpdate(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } else if (req.method === 'DELETE') {
      return await handleSpecimenDelete(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleSpecimenUpdate(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { specimenId, status, notes, selectedPhotoIds } = req.body;

  if (!specimenId) {
    return res.status(400).json({ error: 'Specimen ID is required' });
  }

  console.log(`Updating specimen ${specimenId}${status ? ` to ${status}` : ''}`);

  // Prepare update data - NO updated_at field!
  const updateData = {};
  
  if (status) {
    updateData.status = status;
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }
  }
  
  if (notes !== undefined) {
    updateData.admin_notes = notes;
  }
  
  if (selectedPhotoIds && selectedPhotoIds.length > 0) {
    updateData.selected_photos = selectedPhotoIds;
  }

  // Update specimen - WITHOUT updated_at
  const specimenResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(updateData)
  });

  if (!specimenResponse.ok) {
    const errorText = await specimenResponse.text();
    console.error('Supabase specimen update error:', errorText);
    throw new Error(`Specimen update failed: ${specimenResponse.status}`);
  }

  const message = status ? 
    `Specimen ${status} successfully` : 'Specimen updated successfully';
  res.status(200).json({ 
    success: true, 
    message: message
  });
}

async function handleSpecimenDelete(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { specimenId } = req.body;

  if (!specimenId) {
    return res.status(400).json({ error: 'Specimen ID is required' });
  }

  console.log(`Deleting specimen ${specimenId}`);

  // Delete specimen from database
  const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (!deleteResponse.ok) {
    const errorText = await deleteResponse.text();
    console.error('Supabase specimen delete error:', errorText);
    throw new Error(`Specimen deletion failed: ${deleteResponse.status}`);
  }

  res.status(200).json({ 
    success: true, 
    message: 'Specimen deleted successfully'
  });
}