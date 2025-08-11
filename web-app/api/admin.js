// /api/admin.js - Enhanced admin API with species hints and photo management
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
    } else if (req.method === 'POST') {
      return await handleSpeciesHintsOperation(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } else if (req.method === 'GET') {
      return await handleDataRetrieval(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
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

  if (!specimenId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`Updating specimen ${specimenId} to ${status}`);

  // Update specimen status
  const specimenResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      status: status,
      admin_notes: notes || null,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      selected_photos: selectedPhotoIds || []
    })
  });

  if (!specimenResponse.ok) {
    const errorText = await specimenResponse.text();
    console.error('Supabase specimen update error:', errorText);
    throw new Error(`Specimen update failed: ${specimenResponse.status}`);
  }

  // If approved, ensure species hints exist
  if (status === 'approved') {
    const specimenData = await getSpecimenById(specimenId, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    if (specimenData) {
      await ensureSpeciesHints(specimenData, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    }
  }

  res.status(200).json({ 
    success: true, 
    message: `Specimen ${status} successfully`
  });
}

async function handleSpeciesHintsOperation(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { operation, ...data } = req.body;

  switch (operation) {
    case 'create_hints':
      return await createSpeciesHints(data, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    case 'update_hints':
      return await updateSpeciesHints(data, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    case 'delete_hints':
      return await deleteSpeciesHints(data, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    default:
      return res.status(400).json({ error: 'Invalid operation' });
  }
}

async function handleDataRetrieval(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { type } = req.query;

  switch (type) {
    case 'study_specimens':
      return await getStudySpecimens(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    case 'species_stats':
      return await getSpeciesStats(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY);
    default:
      return res.status(400).json({ error: 'Invalid data type requested' });
  }
}

async function getSpecimenById(specimenId, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}&select=*`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data[0];
  }
  return null;
}

async function ensureSpeciesHints(specimen, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  // Check if hints already exist for this species
  const hintsResponse = await fetch(`${SUPABASE_URL}/rest/v1/species_hints?species_name=eq.${encodeURIComponent(specimen.species_name)}`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (hintsResponse.ok) {
    const existingHints = await hintsResponse.json();
    
    // If no hints exist, create a placeholder entry
    if (existingHints.length === 0) {
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/species_hints`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          species_name: specimen.species_name,
          genus: specimen.genus,
          family: specimen.family,
          common_name: specimen.common_name,
          hints: [],
          admin_reviewed: false,
          source_quality: 'manual'
        })
      });

      if (createResponse.ok) {
        console.log(`Created placeholder hints for ${specimen.species_name}`);
      }
    }
  }
}

async function createSpeciesHints(data, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { species_name, genus, family, hints, reference_url, ai_confidence, source_quality } = data;

  if (!species_name || !genus || !family) {
    return res.status(400).json({ error: 'Missing required species information' });
  }

  const hintsData = {
    species_name,
    genus,
    family,
    hints: hints || [],
    reference_url: reference_url || null,
    ai_confidence: ai_confidence || null,
    source_quality: source_quality || 'manual',
    admin_reviewed: false
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/species_hints`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(hintsData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create hints error:', errorText);
    return res.status(500).json({ error: 'Failed to create species hints' });
  }

  const savedHints = await response.json();
  res.status(200).json({ 
    success: true, 
    message: 'Species hints created successfully',
    data: savedHints[0]
  });
}

async function updateSpeciesHints(data, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { species_name, hints, reference_url, admin_reviewed } = data;

  if (!species_name) {
    return res.status(400).json({ error: 'Species name is required' });
  }

  const updateData = {
    hints: hints || [],
    reference_url: reference_url || null,
    admin_reviewed: admin_reviewed !== undefined ? admin_reviewed : true,
    updated_at: new Date().toISOString()
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/species_hints?species_name=eq.${encodeURIComponent(species_name)}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update hints error:', errorText);
    return res.status(500).json({ error: 'Failed to update species hints' });
  }

  res.status(200).json({ 
    success: true, 
    message: 'Species hints updated successfully'
  });
}

async function deleteSpeciesHints(data, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { species_name } = data;

  if (!species_name) {
    return res.status(400).json({ error: 'Species name is required' });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/species_hints?species_name=eq.${encodeURIComponent(species_name)}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete hints error:', errorText);
    return res.status(500).json({ error: 'Failed to delete species hints' });
  }

  res.status(200).json({ 
    success: true, 
    message: 'Species hints deleted successfully'
  });
}

async function getStudySpecimens(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  const { limit = 50 } = req.query;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_study_specimens`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_limit: parseInt(limit) })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get study specimens error:', errorText);
    return res.status(500).json({ error: 'Failed to retrieve study specimens' });
  }

  const specimens = await response.json();
  res.status(200).json({ 
    success: true, 
    data: specimens
  });
}

async function getSpeciesStats(req, res, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  // Get species statistics
  const speciesResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?select=species_name,status&status=eq.approved`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  const hintsResponse = await fetch(`${SUPABASE_URL}/rest/v1/species_hints?select=species_name,admin_reviewed`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  if (!speciesResponse.ok || !hintsResponse.ok) {
    return res.status(500).json({ error: 'Failed to retrieve species statistics' });
  }

  const specimens = await speciesResponse.json();
  const hints = await hintsResponse.json();

  const uniqueSpecies = new Set(specimens.map(s => s.species_name));
  const speciesWithHints = new Set(hints.map(h => h.species_name));
  const reviewedHints = hints.filter(h => h.admin_reviewed).length;

  const stats = {
    total_unique_species: uniqueSpecies.size,
    species_with_hints: speciesWithHints.size,
    species_missing_hints: uniqueSpecies.size - speciesWithHints.size,
    hints_reviewed: reviewedHints,
    hints_pending_review: hints.length - reviewedHints,
    coverage_percentage: uniqueSpecies.size > 0 ? Math.round((speciesWithHints.size / uniqueSpecies.size) * 100) : 0
  };

  res.status(200).json({ 
    success: true, 
    data: stats
  });
}