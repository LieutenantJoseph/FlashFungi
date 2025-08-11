// /api/generate-hints.js - Vercel serverless function for AI hint generation
import OpenAI from 'openai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { species_name, reference_url } = req.body;

  if (!species_name) {
    return res.status(400).json({ error: 'Species name is required' });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Step 1: Gather taxonomic information
    let taxonomicInfo = '';
    let sourceQuality = 'manual';
    let confidence = 0.7; // Default confidence

    if (reference_url) {
      try {
        // Fetch content from reference URL
        const response = await fetch(reference_url);
        const content = await response.text();
        
        // Extract relevant text (simple approach - could be enhanced with web scraping)
        taxonomicInfo = extractRelevantContent(content, species_name);
        sourceQuality = 'web-reference';
        confidence = 0.85;
      } catch (error) {
        console.log('Failed to fetch reference URL, proceeding with general knowledge');
      }
    }

    // Step 2: Generate hints using AI with taxonomic context
    const prompt = createHintGenerationPrompt(species_name, taxonomicInfo, reference_url);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a mycological expert specializing in mushroom identification education. Create precise, educational hints that help students learn to identify mushrooms through observation and comparison rather than memorization.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Low temperature for consistent, factual responses
      max_tokens: 1000
    });

    const response_text = completion.choices[0].message.content;
    
    // Step 3: Parse and structure the response
    const hints = parseHintsFromResponse(response_text);
    
    // Step 4: Validate hint quality
    const qualityScore = validateHintQuality(hints, species_name);
    
    if (qualityScore < 0.6) {
      confidence *= 0.8; // Reduce confidence if quality is low
    }

    res.status(200).json({
      success: true,
      hints: hints,
      confidence: Math.min(confidence, 1.0),
      source_quality: sourceQuality,
      reference_url: reference_url,
      ai_model: 'gpt-4',
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI hint generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate hints',
      details: error.message 
    });
  }
}

function extractRelevantContent(htmlContent, speciesName) {
  // Simple content extraction - could be enhanced with proper web scraping
  // Remove HTML tags and extract text
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // Look for species-specific content
  const speciesRegex = new RegExp(speciesName.replace(' ', '\\s+'), 'gi');
  const sentences = textContent.split(/[.!?]+/);
  
  // Find sentences mentioning the species
  const relevantSentences = sentences.filter(sentence => 
    speciesRegex.test(sentence) && sentence.length > 20
  ).slice(0, 10); // Limit to 10 sentences
  
  return relevantSentences.join('. ').substring(0, 2000); // Limit length
}

function createHintGenerationPrompt(speciesName, taxonomicInfo, referenceUrl) {
  const genus = speciesName.split(' ')[0];
  const species = speciesName.split(' ')[1] || '';
  
  let prompt = `Generate educational identification hints for the mushroom species: ${speciesName}

REQUIREMENTS:
1. Create exactly 4 hints in this specific order:
   - Morphological hint (physical features: cap, stem, gills/pores, spores)
   - Comparative hint (how to distinguish from similar species)
   - Ecological hint (habitat, substrate, seasonal patterns, geography)
   - Taxonomic hint (family/genus characteristics - use as last resort)

2. Each hint should:
   - Be educational and teach identification skills
   - Encourage observation over memorization
   - Be 1-3 sentences long
   - Use precise mycological terminology
   - Focus on distinguishing characteristics

3. Prioritize hints that help with field identification
4. Avoid giving away the answer directly in early hints

FORMAT YOUR RESPONSE EXACTLY AS:
MORPHOLOGICAL: [Physical features description]
COMPARATIVE: [How to distinguish from similar species]
ECOLOGICAL: [Habitat and ecological information]
TAXONOMIC: [Family/genus level characteristics]`;

  if (taxonomicInfo) {
    prompt += `\n\nREFERENCE INFORMATION:\n${taxonomicInfo}`;
  }

  if (referenceUrl) {
    prompt += `\n\nSOURCE: ${referenceUrl}`;
  }

  prompt += `\n\nIMPORTANT: Base your hints on scientifically accurate information. If you're unsure about specific details, focus on general characteristics of the genus ${genus}.`;

  return prompt;
}

function parseHintsFromResponse(responseText) {
  const hints = [];
  const lines = responseText.split('\n');
  
  const hintTypes = [
    { key: 'MORPHOLOGICAL', type: 'morphological', level: 1 },
    { key: 'COMPARATIVE', type: 'comparative', level: 2 },
    { key: 'ECOLOGICAL', type: 'ecological', level: 3 },
    { key: 'TAXONOMIC', type: 'taxonomic', level: 4 }
  ];

  for (const hintType of hintTypes) {
    const line = lines.find(line => line.trim().startsWith(hintType.key + ':'));
    if (line) {
      const text = line.replace(hintType.key + ':', '').trim();
      if (text) {
        hints.push({
          type: hintType.type,
          level: hintType.level,
          text: text,
          educational_value: hintType.level <= 2 ? 'high' : 'medium'
        });
      }
    }
  }

  // Fallback parsing if structured format not found
  if (hints.length === 0) {
    const paragraphs = responseText.split('\n\n').filter(p => p.trim().length > 20);
    paragraphs.slice(0, 4).forEach((paragraph, index) => {
      const types = ['morphological', 'comparative', 'ecological', 'taxonomic'];
      hints.push({
        type: types[index] || 'general',
        level: index + 1,
        text: paragraph.trim(),
        educational_value: index < 2 ? 'high' : 'medium'
      });
    });
  }

  return hints;
}

function validateHintQuality(hints, speciesName) {
  let qualityScore = 0.5; // Base score
  
  // Check if we have the expected number of hints
  if (hints.length >= 4) qualityScore += 0.2;
  
  // Check for diverse hint types
  const hintTypes = new Set(hints.map(h => h.type));
  if (hintTypes.size >= 3) qualityScore += 0.1;
  
  // Check hint length (not too short or too long)
  const avgLength = hints.reduce((sum, h) => sum + h.text.length, 0) / hints.length;
  if (avgLength >= 50 && avgLength <= 200) qualityScore += 0.1;
  
  // Check if species name appears in hints (should be minimal)
  const speciesReferences = hints.filter(h => 
    h.text.toLowerCase().includes(speciesName.toLowerCase())
  ).length;
  if (speciesReferences <= 1) qualityScore += 0.1;
  
  return Math.min(qualityScore, 1.0);
}