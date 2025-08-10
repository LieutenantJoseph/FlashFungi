// Vercel serverless function for admin operations
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

  // Only allow PATCH method for updating specimens
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { specimenId, status, notes } = req.body;

  if (!specimenId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Use service role key for admin operations
    const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_SERVICE_KEY) {
      throw new Error('Service key not configured');
    }

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
