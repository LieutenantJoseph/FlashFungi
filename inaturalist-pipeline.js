// iNaturalist Data Pipeline for Arizona Mushroom Study
// This script fetches DNA-verified mushroom observations from iNaturalist
// and generates AI hints for the admin review queue

import OpenAI from 'openai';

// Configuration
const INATURALIST_API_BASE = 'https://api.inaturalist.org/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set this in your environment
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service role key needed for admin operations

// Initialize OpenAI (will be set later)
let openai = null;

// Function to initialize OpenAI with environment variables
function initializeOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

// Supabase admin client for data insertion
class SupabaseAdmin {
  constructor(url, serviceKey) {
    this.url = url;
    this.key = serviceKey;
  }

  async insert(table, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Supabase insert failed: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  async update(table, id, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Supabase update failed: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }
}

// iNaturalist API client
class INaturalistClient {
  constructor() {
    this.baseUrl = INATURALIST_API_BASE;
    this.rateLimitDelay = 1000; // 1 second between requests to be respectful
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchObservations(params) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.baseUrl}/observations?${queryParams}`;
    
    console.log(`🔍 Searching iNaturalist: ${url}`);
    
    await this.delay(this.rateLimitDelay);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`iNaturalist API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  }

  async getObservationDetails(id) {
    const url = `${this.baseUrl}/observations/${id}`;
    
    console.log(`📋 Fetching observation details: ${id}`);
    
    await this.delay(this.rateLimitDelay);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`iNaturalist API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results[0];
  }

  // Check if observation has DNA sequence mentioned in comments or observation fields
  hasDNASequence(observation) {
    // Updated DNA keywords to match actual sequencing language from iNaturalist
    const sequenceKeywords = [
      // ITS sequence matching
      'ITS sequence',
      'ITS match',
      'ITS sequenced',
      'ITS positive',
      'ITS confirmed',
      'ITS identification',
      'ITS analysis',
      
      // Other sequence types
      'LSU sequence',
      'COI sequence',
      'rbcL sequence',
      'trnH-psbA sequence',
      
      // Sequencing results language
      'sequence match',
      'sequenced as',
      'sequence confirmed',
      'sequence identification',
      'sequence analysis',
      'molecular identification',
      'molecular confirmed',
      'DNA confirmed',
      'DNA identification',
      'genetically confirmed',
      
      // Database references
      'GenBank',
      'BOLD match',
      'NCBI match',
      'sequence database',
      
      // Academic/lab language
      'sequencing results',
      'sequence data',
      'molecular data',
      'phylogenetic analysis',
      'DNA barcoding',
      'barcode match',
      
      // Specific result language
      '% match',
      'percent match',
      'identity match',
      'sequence similarity',
      'BLAST results',
      'positive identification'
    ];
    
    const textToSearch = [];
    
    // Collect all text to search
    if (observation.description) {
      textToSearch.push(observation.description);
    }
    
    // Check observation fields
    if (observation.ofvs) {
      observation.ofvs.forEach(field => {
        textToSearch.push(`${field.name}: ${field.value}`);
      });
    }
    
    // Check comments - this is where most DNA results are posted
    if (observation.comments) {
      observation.comments.forEach(comment => {
        textToSearch.push(comment.body);
      });
    }
    
    // Search all collected text
    const allText = textToSearch.join(' ').toLowerCase();
    
    // Look for any of the sequence keywords
    const hasSequenceKeyword = sequenceKeywords.some(keyword => 
      allText.includes(keyword.toLowerCase())
    );
    
    // Additional pattern matching for common formats
    const hasSequencePattern = 
      // Pattern like "ITS: 99% match to Species name"
      /its[\s:]+\d+%/.test(allText) ||
      // Pattern like "sequenced as Species name"
      /sequenced\s+as\s+[A-Z][a-z]+\s+[a-z]+/.test(allText) ||
      // Pattern like "molecular ID: Species name"
      /molecular\s+id[\s:]+[A-Z][a-z]+/.test(allText) ||
      // Pattern like "DNA confirms Species name"
      /dna\s+(confirms?|identifies?)\s+[A-Z][a-z]+/.test(allText) ||
      // Pattern like "GenBank accession"
      /genbank\s+(accession|number)/.test(allText) ||
      // Pattern like "BOLD:XXX" format
      /bold[\s:]+[A-Z0-9]+/.test(allText);
    
    return hasSequenceKeyword || hasSequencePattern;
  }

  // Get best photos showing different angles
  selectBestPhotos(photos) {
    if (!photos || photos.length === 0) return [];
    
    // Sort by quality (larger photos first)
    const sortedPhotos = photos
      .filter(photo => photo.url) // Only photos with URLs
      .sort((a, b) => (b.original_dimensions?.width || 0) - (a.original_dimensions?.width || 0));
    
    // Try to get diverse angles - this is a simplified heuristic
    const selectedPhotos = [];
    const maxPhotos = Math.min(3, sortedPhotos.length);
    
    for (let i = 0; i < maxPhotos; i++) {
      const photo = sortedPhotos[i];
      selectedPhotos.push({
        inaturalist_photo_id: photo.id.toString(),
        photo_url: photo.url.replace('square', 'medium'), // Get medium size
        angle_type: i === 0 ? 'top' : i === 1 ? 'side' : 'bottom', // Simple assignment
        description: `Photo ${i + 1} from iNaturalist observation`,
        quality_score: 0.8, // Default quality score
        is_primary: i === 0,
        width: photo.original_dimensions?.width,
        height: photo.original_dimensions?.height
      });
    }
    
    return selectedPhotos;
  }
}

// AI Hint Generator
constructor(openaiClient = null) {
  this.openai = openaiClient || initializeOpenAI();
  if (!this.openai) {
    throw new Error('OpenAI client not initialized. Make sure OPENAI_API_KEY is set.');
  }
}

  async generateHints(specimen) {
    const prompt = `
You are an expert mycologist creating educational hints for mushroom identification. 
Generate 4 progressive hints for identifying this mushroom:

Species: ${specimen.species_name}
Common Name: ${specimen.common_name || 'Unknown'}
Family: ${specimen.family}
Location: ${specimen.location}
Habitat: ${specimen.habitat}

Create hints in this order:
1. Level 3 (Morphological): Focus on physical features like cap, stem, gills/pores, spores
2. Level 4 (Ecological): Focus on habitat, substrate, seasonality, symbiotic relationships
3. Level 1 (Taxonomic): Focus on family characteristics
4. Level 2 (Taxonomic): Focus on genus characteristics

Each hint should be:
- Educational and informative
- 1-2 sentences long
- Helpful for identification
- Appropriate for intermediate mycologists
- Specific to the species when possible

Rely on sources such as mushroomexpert.com or preferably scientific taxonomy journal publications.

Format as JSON array with objects containing: level, type, text
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      
      // Try to parse JSON from the response
      let hints;
      try {
        hints = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, create hints from text
        console.warn('Failed to parse JSON, creating hints from text');
        hints = this.parseHintsFromText(content, specimen);
      }

      // Validate and format hints
      return this.validateHints(hints);
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to template hints
      return this.generateTemplateHints(specimen);
    }
  }

  parseHintsFromText(text, specimen) {
    // Fallback parser for non-JSON responses
    const lines = text.split('\n').filter(line => line.trim());
    const hints = [];

    const hintData = [
      { level: 3, type: 'morphological' },
      { level: 4, type: 'ecological' },
      { level: 1, type: 'taxonomic' },
      { level: 2, type: 'taxonomic' }
    ];

    lines.forEach((line, index) => {
      if (index < 4 && line.trim()) {
        hints.push({
          ...hintData[index],
          text: line.replace(/^\d+\.?\s*/, '').trim()
        });
      }
    });

    return hints;
  }

  validateHints(hints) {
    const validatedHints = [];
    const requiredHints = [
      { level: 3, type: 'morphological' },
      { level: 4, type: 'ecological' },
      { level: 1, type: 'taxonomic' },
      { level: 2, type: 'taxonomic' }
    ];

    requiredHints.forEach(required => {
      const hint = hints.find(h => h.level === required.level && h.type === required.type);
      if (hint && hint.text && hint.text.length > 10) {
        validatedHints.push({
          hint_level: hint.level,
          hint_type: hint.type,
          hint_text: hint.text.trim(),
          status: 'draft',
          ai_generated: true,
          admin_edited: false
        });
      }
    });

    return validatedHints;
  }

  generateTemplateHints(specimen) {
    // Fallback template hints when AI fails
    return [
      {
        hint_level: 3,
        hint_type: 'morphological',
        hint_text: `Examine the cap shape, gill/pore structure, and stem characteristics of this ${specimen.species_name}.`,
        status: 'draft',
        ai_generated: true,
        admin_edited: false
      },
      {
        hint_level: 4,
        hint_type: 'ecological',
        hint_text: `This species is found in ${specimen.habitat} and has specific substrate preferences.`,
        status: 'draft',
        ai_generated: true,
        admin_edited: false
      },
      {
        hint_level: 1,
        hint_type: 'taxonomic',
        hint_text: `This mushroom belongs to the family ${specimen.family}.`,
        status: 'draft',
        ai_generated: true,
        admin_edited: false
      },
      {
        hint_level: 2,
        hint_type: 'taxonomic',
        hint_text: `The genus ${specimen.genus} has distinctive characteristics that help with identification.`,
        status: 'draft',
        ai_generated: true,
        admin_edited: false
      }
    ];
  }
}

// Main Data Pipeline
class DataPipeline {
  constructor() {
    this.inat = new INaturalistClient();
    this.supabase = new SupabaseAdmin(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    this.aiHintGenerator = new AIHintGenerator();
  }

  async fetchArizonaMushroomObservations(limit = 50) {
    console.log('🍄 Starting Arizona mushroom data fetch...');
    
    const searchParams = {
      // Geographic constraints
      place_id: 6, // Arizona place ID in iNaturalist
      
      // Taxonomic constraints
      taxon_id: 47170, // Fungi kingdom
      
      // Quality constraints
      quality_grade: 'research',
      identifications: 'most_agree',
      
      // Photo requirements
      photos: 'true',
      
      // Sorting and pagination
      order_by: 'created_at',
      order: 'desc',
      per_page: limit,
      
      // Additional filters
      captive: 'false',
      geo: 'true', // Must have coordinates
      
      // Date range (last 2 years for freshness)
      d1: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const observations = await this.inat.searchObservations(searchParams);
    console.log(`📊 Found ${observations.length} research-grade observations`);

    return observations;
  }

  async processObservation(observation) {
    console.log(`🔬 Processing observation ${observation.id}...`);

    // Get detailed observation data
    const detailed = await this.inat.getObservationDetails(observation.id);
    
    // Check for DNA sequence
    if (!this.inat.hasDNASequence(detailed)) {
      console.log(`⏭️  Skipping ${observation.id} - no DNA sequence found`);
      return null;
    }

    // Extract specimen data
    const specimen = this.extractSpecimenData(detailed);
    
    // Get best photos
    const photos = this.inat.selectBestPhotos(detailed.photos);
    
    if (photos.length < 2) {
      console.log(`⏭️  Skipping ${observation.id} - insufficient photos`);
      return null;
    }

    console.log(`✅ Processing ${specimen.species_name} with ${photos.length} photos`);

    // Generate AI hints
    const hints = await this.aiHintGenerator.generateHints(specimen);
    
    return {
      specimen,
      photos,
      hints
    };
  }

  extractSpecimenData(observation) {
    const taxon = observation.taxon;
    
    return {
      species_name: taxon.name,
      genus: this.extractTaxonRank(taxon, 'genus'),
      family: this.extractTaxonRank(taxon, 'family'),
      common_name: taxon.preferred_common_name,
      inaturalist_id: observation.id.toString(),
      location: this.formatLocation(observation),
      county: this.extractCounty(observation),
      habitat: this.extractHabitat(observation),
      substrate: this.extractSubstrate(observation),
      elevation: observation.location ? Math.round(observation.location[2]) : null,
      observation_date: observation.observed_on,
      observer_username: observation.user.login,
      dna_sequenced: true,
      status: 'pending',
      quality_score: this.calculateQualityScore(observation)
    };
  }

  extractTaxonRank(taxon, rank) {
    if (taxon.rank === rank) return taxon.name;
    
    if (taxon.ancestors) {
      const ancestor = taxon.ancestors.find(a => a.rank === rank);
      return ancestor ? ancestor.name : 'Unknown';
    }
    
    return 'Unknown';
  }

  formatLocation(observation) {
    if (observation.place_guess) {
      return observation.place_guess;
    }
    
    if (observation.location) {
      return `${observation.location[0].toFixed(4)}, ${observation.location[1].toFixed(4)}`;
    }
    
    return 'Arizona, USA';
  }

  extractCounty(observation) {
    // Try to extract county from place_guess or other location data
    if (observation.place_guess) {
      const parts = observation.place_guess.split(',');
      // Look for "County" in the parts
      const countyPart = parts.find(part => part.trim().includes('County'));
      if (countyPart) {
        return countyPart.trim();
      }
    }
    
    return null;
  }

  extractHabitat(observation) {
    // Look for habitat info in description or observation fields
    let habitat = '';
    
    if (observation.description) {
      habitat += observation.description + ' ';
    }
    
    if (observation.ofvs) {
      const habitatFields = observation.ofvs
        .filter(field => 
          field.name.toLowerCase().includes('habitat') ||
          field.name.toLowerCase().includes('substrate') ||
          field.name.toLowerCase().includes('host')
        )
        .map(field => field.value)
        .join(', ');
      
      habitat += habitatFields;
    }
    
    return habitat.trim() || 'Not specified';
  }

  extractSubstrate(observation) {
    if (observation.ofvs) {
      const substrateField = observation.ofvs.find(field => 
        field.name.toLowerCase().includes('substrate')
      );
      
      if (substrateField) {
        return substrateField.value;
      }
    }
    
    return null;
  }

  calculateQualityScore(observation) {
    let score = 0.5; // Base score
    
    // Research grade bonus
    if (observation.quality_grade === 'research') score += 0.2;
    
    // Multiple photos bonus
    if (observation.photos && observation.photos.length >= 3) score += 0.1;
    
    // Community IDs agreement bonus
    if (observation.num_identification_agreements >= 2) score += 0.1;
    
    // Recent observation bonus
    const daysSinceObservation = (Date.now() - new Date(observation.observed_on)) / (1000 * 60 * 60 * 24);
    if (daysSinceObservation <= 365) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  async saveToDatabase(processedData) {
    try {
      console.log(`💾 Saving ${processedData.specimen.species_name} to database...`);

      // Insert specimen
      const [specimenResult] = await this.supabase.insert('specimens', processedData.specimen);
      const specimenId = specimenResult.id;

      // Insert photos
      const photosWithSpecimenId = processedData.photos.map(photo => ({
        ...photo,
        specimen_id: specimenId
      }));
      
      await this.supabase.insert('photos', photosWithSpecimenId);

      // Insert hints
      const hintsWithSpecimenId = processedData.hints.map(hint => ({
        ...hint,
        specimen_id: specimenId
      }));
      
      await this.supabase.insert('hints', hintsWithSpecimenId);

      console.log(`✅ Saved specimen ${specimenId} successfully`);
      return specimenId;

    } catch (error) {
      console.error('❌ Database save error:', error);
      throw error;
    }
  }

  async run() {
    console.log('🚀 Starting iNaturalist data pipeline...');
    
    try {
      // Fetch observations from iNaturalist
      const observations = await this.fetchArizonaMushroomObservations(20); // Start small
      
      let processed = 0;
      let saved = 0;
      
      for (const observation of observations) {
        try {
          const processedData = await this.processObservation(observation);
          
          if (processedData) {
            await this.saveToDatabase(processedData);
            saved++;
          }
          
          processed++;
          
          // Progress update
          if (processed % 5 === 0) {
            console.log(`📊 Progress: ${processed}/${observations.length} processed, ${saved} saved`);
          }
          
        } catch (error) {
          console.error(`❌ Error processing observation ${observation.id}:`, error);
          continue; // Skip this observation and continue
        }
      }
      
      console.log(`🎉 Pipeline complete! Processed ${processed} observations, saved ${saved} specimens`);
      
    } catch (error) {
      console.error('❌ Pipeline error:', error);
      throw error;
    }
  }
}

// Export functions for different environments
export { DataPipeline, INaturalistClient, AIHintGenerator };

// CLI usage (if running directly)
if (typeof require !== 'undefined' && require.main === module) {
  const pipeline = new DataPipeline();
  pipeline.run().catch(console.error);
}

// Usage example:
/*
// Set environment variables:
// OPENAI_API_KEY=your-openai-key
// SUPABASE_SERVICE_KEY=your-supabase-service-role-key

// Run the pipeline:
const pipeline = new DataPipeline();
await pipeline.run();
*/
