// /api/admin.js - Admin API with auto field guide creation
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
      // Handle specimen update/approval
      const { specimenId, status, notes, selectedPhotoIds } = req.body;

      if (!specimenId) {
        return res.status(400).json({ error: 'Specimen ID is required' });
      }

      console.log(`Updating specimen ${specimenId}${status ? ` to ${status}` : ''}`);

      // First, get the specimen details if we're approving
      let specimen = null;
      if (status === 'approved') {
        const specimenFetch = await fetch(
          `${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
          }
        );
        
        if (specimenFetch.ok) {
          const specimenData = await specimenFetch.json();
          specimen = specimenData[0];
        }
      }

      // Prepare update data
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

      // Update specimen
      const specimenResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}`, 
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!specimenResponse.ok) {
        const errorText = await specimenResponse.text();
        console.error('Supabase specimen update error:', errorText);
        return res.status(500).json({ error: `Specimen update failed: ${specimenResponse.status}` });
      }

      // If we approved the specimen, create field guide if needed
      if (status === 'approved' && specimen) {
        await createFieldGuideIfNeeded(specimen, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      }

      const message = status ? 
        `Specimen ${status} successfully${status === 'approved' ? ' and field guide initialized' : ''}` : 
        'Specimen updated successfully';
        
      res.status(200).json({ 
        success: true, 
        message: message
      });

    } else if (req.method === 'DELETE') {
      // Handle specimen deletion
      const { specimenId } = req.body;

      if (!specimenId) {
        return res.status(400).json({ error: 'Specimen ID is required' });
      }

      console.log(`Deleting specimen ${specimenId}`);

      const deleteResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}`, 
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error('Supabase specimen delete error:', errorText);
        return res.status(500).json({ error: `Specimen deletion failed: ${deleteResponse.status}` });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Specimen deleted successfully'
      });

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

// Helper function to create field guide if it doesn't exist
async function createFieldGuideIfNeeded(specimen, SUPABASE_URL, SUPABASE_SERVICE_KEY) {
  try {
    // Check if field guide already exists for this species
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/field_guides?species_name=eq.${encodeURIComponent(specimen.species_name)}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      
      // If field guide already exists, don't create a new one
      if (existing && existing.length > 0) {
        console.log(`✅ Field guide already exists for ${specimen.species_name}`);
        return;
      }
    }

    // Create basic field guide structure
    console.log(`📚 Creating field guide for ${specimen.species_name}`);
    
    const fieldGuide = {
      species_name: specimen.species_name,
      genus: specimen.genus || specimen.species_name.split(' ')[0],
      family: specimen.family || 'Unknown',
      common_name: specimen.common_name || '',
      description: specimen.description || `${specimen.species_name} is a member of the ${specimen.family || 'fungal'} family.`,
      ecology: specimen.location ? `Found in ${specimen.location}` : 'Ecology information to be added.',
      
      // Initialize with empty hints that admin can fill in
      hints: [
        {
          type: 'morphological',
          level: 1,
          text: '',
          educational_value: 'high'
        },
        {
          type: 'comparative',
          level: 2,
          text: '',
          educational_value: 'high'
        },
        {
          type: 'ecological',
          level: 3,
          text: '',
          educational_value: 'medium'
        },
        {
          type: 'taxonomic',
          level: 4,
          text: '',
          educational_value: 'low'
        }
      ],
      
      // Initialize diagnostic features structure
      diagnostic_features: {
        cap: {
          shape: '',
          color: '',
          texture: '',
          size_range: ''
        },
        gills_pores: {
          type: '',
          attachment: '',
          spacing: '',
          color: ''
        },
        stem: {
          ring_presence: '',
          base_structure: '',
          texture: ''
        },
        spore_print: {
          color: '',
          collection_method: ''
        },
        chemical_reactions: {
          tests: []
        }
      },
      
      // If specimen has selected photos, add them as reference photos
      reference_photos: specimen.selected_photos ? specimen.selected_photos.slice(0, 6) : [],
      
      // Empty arrays for future expansion
      comparison_species: [],
      safety_warnings: [],
      
      // Metadata
      admin_reviewed: false,
      source_quality: 'admin-created',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create the field guide
    const createResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/field_guides`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fieldGuide)
      }
    );

    if (createResponse.ok) {
      console.log(`✅ Field guide created for ${specimen.species_name}`);
    } else {
      const errorText = await createResponse.text();
      console.error(`❌ Failed to create field guide: ${errorText}`);
    }

  } catch (error) {
    console.error(`❌ Error ensuring field guide exists: ${error.message}`);
    // Don't throw - this shouldn't block the approval process
  }
}