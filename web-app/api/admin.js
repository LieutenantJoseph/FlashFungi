// Enhanced Vercel serverless function for admin operations with photo integration
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

  // Configuration
  const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const INATURALIST_API = 'https://api.inaturalist.org/v1';

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Service key not configured' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'PATCH':
      return await handleSpecimenUpdate(req, res);
    case 'GET':
      return await handleSpecimenPhotoAnalysis(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }

  // Update specimen status (existing functionality)
  async function handleSpecimenUpdate(req, res) {
    const { specimenId, status, notes } = req.body;

    if (!specimenId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status,
          admin_notes: notes || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase error: ${error}`);
      }

      const data = await response.json();
      
      res.status(200).json({ 
        success: true, 
        message: `Specimen ${status} successfully`,
        data 
      });

    } catch (error) {
      console.error('Admin API error:', error);
      res.status(500).json({ 
        error: 'Failed to update specimen',
        details: error.message 
      });
    }
  }

  // Analyze specimen photos and update quality scores
  async function handleSpecimenPhotoAnalysis(req, res) {
    const { specimenId } = req.query;

    if (!specimenId) {
      return res.status(400).json({ error: 'Specimen ID required' });
    }

    try {
      // Get specimen from database
      const specimenResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}&select=*`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });

      if (!specimenResponse.ok) {
        throw new Error('Failed to fetch specimen');
      }

      const specimens = await specimenResponse.json();
      if (specimens.length === 0) {
        return res.status(404).json({ error: 'Specimen not found' });
      }

      const specimen = specimens[0];

      // Fetch photos from iNaturalist
      const photoResponse = await fetch(`${INATURALIST_API}/observations/${specimen.inaturalist_id}`);
      const photoData = await photoResponse.json();

      if (!photoData.results || !photoData.results[0] || !photoData.results[0].photos) {
        return res.status(404).json({ error: 'No photos found for this specimen' });
      }

      const photos = photoData.results[0].photos;
      
      // Analyze photo quality
      const photoAnalysis = analyzePhotoQuality(photos);
      
      // Update specimen with photo metadata and quality score
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens?id=eq.${specimenId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photo_count: photos.length,
          photo_quality_score: photoAnalysis.qualityScore,
          has_multiple_angles: photoAnalysis.hasMultipleAngles,
          quality_score: calculateOverallQuality(specimen, photoAnalysis)
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update specimen with photo analysis');
      }

      res.status(200).json({
        success: true,
        analysis: photoAnalysis,
        photoCount: photos.length,
        message: 'Photo analysis completed'
      });

    } catch (error) {
      console.error('Photo analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze photos',
        details: error.message
      });
    }
  }

  // Analyze photo quality based on various factors
  function analyzePhotoQuality(photos) {
    let qualityScore = 0.5; // Base score
    let hasMultipleAngles = photos.length >= 3;
    
    // Photo count bonus
    if (photos.length >= 5) {
      qualityScore += 0.2;
    } else if (photos.length >= 3) {
      qualityScore += 0.1;
    } else if (photos.length < 2) {
      qualityScore -= 0.2; // Penalty for too few photos
    }

    // Check for photo diversity (basic heuristic based on URLs)
    const photoSizes = photos.map(photo => {
      const url = photo.url || '';
      if (url.includes('large')) return 'large';
      if (url.includes('medium')) return 'medium';
      return 'small';
    });

    // Bonus for having larger photos available
    if (photoSizes.includes('large')) {
      qualityScore += 0.1;
    }

    // Multiple angles bonus (assumes more photos = better coverage)
    if (hasMultipleAngles) {
      qualityScore += 0.1;
    }

    // Cap the score at 1.0
    qualityScore = Math.min(qualityScore, 1.0);

    return {
      qualityScore: Math.round(qualityScore * 100) / 100, // Round to 2 decimal places
      hasMultipleAngles,
      photoCount: photos.length,
      hasClearImages: qualityScore > 0.6,
      analysis: {
        photoCountScore: photos.length >= 3 ? 'Good' : 'Needs more photos',
        diversityScore: hasMultipleAngles ? 'Good coverage' : 'Limited angles',
        overallRating: qualityScore > 0.7 ? 'Excellent' : qualityScore > 0.5 ? 'Good' : 'Poor'
      }
    };
  }

  // Calculate overall specimen quality including photo analysis
  function calculateOverallQuality(specimen, photoAnalysis) {
    let score = 0.3; // Base score

    // Research grade bonus
    if (specimen.quality_grade === 'research') score += 0.2;

    // DNA sequence major bonus
    if (specimen.dna_sequenced) score += 0.3;

    // Photo quality contribution
    score += photoAnalysis.qualityScore * 0.2;

    // Community agreement bonus (if available)
    if (specimen.num_identification_agreements >= 3) score += 0.1;
    else if (specimen.num_identification_agreements >= 2) score += 0.05;

    // Recent observation bonus
    if (specimen.created_at) {
      const daysSince = (Date.now() - new Date(specimen.created_at)) / (1000 * 60 * 60 * 24);
      if (daysSince <= 365) score += 0.05;
    }

    return Math.min(score, 1.0);
  }
}