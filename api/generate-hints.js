export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { species_name, reference_url } = req.body;

  if (!species_name) {
    return res.status(400).json({ error: 'Species name is required' });
  }

  try {
    console.log(`Generating hints for: ${species_name}`);

    // Template hints generation (replace with OpenAI when ready)
    const genus = species_name.split(' ')[0];
    const specificEpithet = species_name.split(' ')[1] || '';

    const hints = [
      {
        type: 'morphological',
        level: 1,
        text: `Examine the cap, stem, and gill characteristics of this ${genus} species. Look for distinctive physical features such as cap shape, surface texture, gill attachment, and spore print color.`,
        educational_value: 'high'
      },
      {
        type: 'comparative',
        level: 2,
        text: `Compare this ${species_name} to other ${genus} species. Key distinguishing features often include size, color variations, habitat preferences, and microscopic characteristics.`,
        educational_value: 'high'
      },
      {
        type: 'ecological',
        level: 3,
        text: `Consider the ecological niche of ${species_name}. This includes substrate preferences, seasonal occurrence, geographic distribution, and any mycorrhizal or saprotrophic relationships.`,
        educational_value: 'medium'
      },
      {
        type: 'taxonomic',
        level: 4,
        text: `${species_name} belongs to the genus ${genus}. Use family-level characteristics and molecular data when available to confirm identification. Consult current taxonomic keys for verification.`,
        educational_value: 'low'
      }
    ];

    if (reference_url) {
      hints[0].text += ` Reference additional morphological details from the provided source.`;
    }

    res.status(200).json({
      success: true,
      hints: hints,
      confidence: reference_url ? 0.85 : 0.75,
      source_quality: reference_url ? 'web-reference' : 'template',
      reference_url: reference_url,
      ai_model: 'template-based',
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate hints',
      details: error.message 
    });
  }
}