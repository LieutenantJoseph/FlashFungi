// API endpoint for processing field guide sources with AI
// /api/admin/process-sources-batch.js

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { species_name, sourceIds } = req.body;

  if (!species_name || !sourceIds || sourceIds.length === 0) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Fetch sources from database
    const { data: sources, error: fetchError } = await supabase
      .from('field_guide_sources')
      .select('*')
      .in('id', sourceIds)
      .eq('status', 'pending');

    if (fetchError) {
      throw fetchError;
    }

    if (sources.length === 0) {
      return res.status(404).json({ error: 'No pending sources found' });
    }

    // Update status to processing
    await supabase
      .from('field_guide_sources')
      .update({ status: 'processing' })
      .in('id', sourceIds);

    // Process each source
    const extractedContents = [];
    
    for (const source of sources) {
      try {
        const content = await extractContentFromUrl(source.source_url);
        extractedContents.push(content);
        
        // Save extracted content
        await supabase
          .from('field_guide_sources')
          .update({
            extracted_content: content,
            status: 'completed',
            processed_date: new Date().toISOString()
          })
          .eq('id', source.id);
          
      } catch (error) {
        console.error(`Error processing source ${source.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('field_guide_sources')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', source.id);
      }
    }

    // Combine all extracted content
    const combinedContent = extractedContents.join('\n\n---\n\n');

    // Use AI to extract structured field guide information
    const extractedData = await extractFieldGuideData(species_name, combinedContent);

    // Save extracted data to field guide
    await updateFieldGuide(species_name, extractedData);

    return res.status(200).json({
      success: true,
      processedCount: sources.length,
      extractedData: extractedData
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    
    // Reset status to pending on error
    await supabase
      .from('field_guide_sources')
      .update({ status: 'pending' })
      .in('id', sourceIds);
    
    return res.status(500).json({
      error: 'Failed to process sources',
      details: error.message
    });
  }
}

async function extractContentFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FlashFungiBot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove scripts and styles
    $('script').remove();
    $('style').remove();
    
    // Extract main content
    let content = '';
    
    // Try common content selectors
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '#content',
      '.post-content',
      '.entry-content'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }
    
    // Fallback to body if no specific content found
    if (!content) {
      content = $('body').text();
    }
    
    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .substring(0, 8000); // Limit to 8000 characters
    
    return content;
    
  } catch (error) {
    console.error('Error extracting content from URL:', error);
    throw error;
  }
}

async function extractFieldGuideData(species_name, content) {
  const prompt = `You are an expert mycologist creating a field guide for ${species_name}.
  
Based on the following reference material, extract and structure information for a comprehensive field guide entry. Focus on factual, educational content suitable for mushroom identification training.

Reference Material:
${content}

Extract and provide the following information in JSON format:

{
  "description": "A comprehensive 2-3 paragraph description of the species including its general appearance, key identifying features, and any notable characteristics",
  "ecology": "Detailed ecological information including habitat preferences, substrate, mycorrhizal associations, fruiting season, geographic distribution, and ecological role",
  "diagnostic_features": {
    "cap": {
      "shape": "Description of cap shape(s)",
      "color": "Color range and variations",
      "texture": "Surface texture details",
      "size_range": "Typical size range"
    },
    "gills_pores": {
      "type": "gills, pores, teeth, or smooth",
      "attachment": "How they attach to stem",
      "spacing": "Spacing description",
      "color": "Color and changes"
    },
    "stem": {
      "ring_presence": "Present/absent and description",
      "base_structure": "Base shape and features",
      "texture": "Surface texture"
    },
    "spore_print": {
      "color": "Spore print color",
      "collection_method": "How to obtain print"
    },
    "chemical_reactions": {
      "tests": ["List of chemical tests and reactions if mentioned"]
    }
  },
  "comparison_species": [
    {
      "species": "Similar species name",
      "differences": "Key differences to distinguish them"
    }
  ],
  "hints": [
    {
      "type": "morphological",
      "level": 1,
      "text": "Physical identification features"
    },
    {
      "type": "comparative",
      "level": 2,
      "text": "How to distinguish from similar species"
    },
    {
      "type": "ecological",
      "level": 3,
      "text": "Habitat and ecological context"
    },
    {
      "type": "taxonomic",
      "level": 4,
      "text": "Family and genus characteristics"
    }
  ]
}

Only include fields where you found relevant information. Leave fields empty if the information is not available in the source material. Ensure all content is factual and based on the provided text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert mycologist creating educational field guide content. Extract only factual information from the provided sources.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000
    });

    const extractedData = JSON.parse(completion.choices[0].message.content);
    
    // Validate and clean the extracted data
    return validateExtractedData(extractedData);
    
  } catch (error) {
    console.error('Error extracting field guide data with AI:', error);
    throw error;
  }
}

function validateExtractedData(data) {
  // Ensure required structure exists
  const validated = {
    description: data.description || '',
    ecology: data.ecology || '',
    diagnostic_features: data.diagnostic_features || {},
    comparison_species: data.comparison_species || [],
    hints: data.hints || []
  };
  
  // Validate hints structure
  if (validated.hints.length > 0) {
    validated.hints = validated.hints.map((hint, index) => ({
      type: hint.type || 'general',
      level: hint.level || index + 1,
      text: hint.text || '',
      educational_value: index < 2 ? 'high' : 'medium'
    }));
  }
  
  // Remove empty fields
  Object.keys(validated).forEach(key => {
    if (validated[key] === '' || 
        (Array.isArray(validated[key]) && validated[key].length === 0) ||
        (typeof validated[key] === 'object' && Object.keys(validated[key]).length === 0)) {
      delete validated[key];
    }
  });
  
  return validated;
}

async function updateFieldGuide(species_name, extractedData) {
  try {
    // Check if field guide exists
    const { data: existing } = await supabase
      .from('field_guides')
      .select('*')
      .eq('species_name', species_name)
      .single();
    
    if (existing) {
      // Update existing field guide (only fill empty fields)
      const updates = {};
      
      Object.keys(extractedData).forEach(key => {
        if (!existing[key] || 
            (Array.isArray(existing[key]) && existing[key].length === 0) ||
            (typeof existing[key] === 'object' && Object.keys(existing[key]).length === 0)) {
          updates[key] = extractedData[key];
        }
      });
      
      if (Object.keys(updates).length > 0) {
        updates.last_ai_update = new Date().toISOString();
        
        await supabase
          .from('field_guides')
          .update(updates)
          .eq('species_name', species_name);
      }
    } else {
      // Create new field guide
      const newGuide = {
        species_name: species_name,
        ...extractedData,
        created_date: new Date().toISOString(),
        last_ai_update: new Date().toISOString(),
        status: 'draft'
      };
      
      await supabase
        .from('field_guides')
        .insert([newGuide]);
    }
  } catch (error) {
    console.error('Error updating field guide:', error);
    throw error;
  }
}
