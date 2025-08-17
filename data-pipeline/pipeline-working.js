// Enhanced Arizona Mushroom Pipeline with Species-Level Hint Management
// Updated to use correct database field names
import OpenAI from 'openai';
import { readFileSync } from 'fs';

// Load environment variables
console.log('🔧 Loading environment...');
try {
  const envFile = readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      process.env[key] = value;
    }
  });
} catch (error) {
  console.log('⚠️  Could not load .env file');
}

// Check environment
if (!process.env.OPENAI_API_KEY) {
  console.log('❌ OPENAI_API_KEY not found in environment');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.log('❌ SUPABASE_SERVICE_KEY not found in environment');
  process.exit(1);
}

console.log('✅ Environment loaded successfully');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const INATURALIST_API = 'https://api.inaturalist.org/v1';

class EnhancedPipeline {
  constructor() {
    this.processedCount = 0;
    this.savedCount = 0;
    this.dnaCount = 0;
    this.hintsCreatedCount = 0;
    this.hintsExistingCount = 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchObservations(limit = 50) {
    console.log('🔍 Fetching Arizona mushroom observations...');
    
    const params = new URLSearchParams({
      place_id: 40, // Arizona
      taxon_id: 47170, // Fungi
      quality_grade: 'research',
      photos: 'true',
      per_page: limit,
      order_by: 'created_at',
      order: 'desc'
    });

    const response = await fetch(`${INATURALIST_API}/observations?${params}`);
    const data = await response.json();
    
    console.log(`📊 Found ${data.results.length} observations`);
    return data.results;
  }

  async getObservationDetails(id) {
    await this.delay(1000); // Be respectful to API
    const response = await fetch(`${INATURALIST_API}/observations/${id}`);
    const data = await response.json();
    return data.results[0];
  }

  hasDNASequence(observation) {
    const sequenceKeywords = [
      'ITS sequence', 'ITS match', 'ITS sequenced', 'ITS positive',
      'sequence match', 'sequenced as', 'molecular identification',
      'DNA confirmed', 'GenBank', 'BOLD match', 'DNA barcoding'
    ];

    const textToSearch = [];
    
    if (observation.description) {
      textToSearch.push(observation.description);
    }
    
    if (observation.ofvs) {
      observation.ofvs.forEach(field => {
        textToSearch.push(`${field.name}: ${field.value}`);
      });
    }
    
    if (observation.comments) {
      observation.comments.forEach(comment => {
        textToSearch.push(comment.body);
      });
    }

    const allText = textToSearch.join(' ').toLowerCase();
    
    return sequenceKeywords.some(keyword => 
      allText.includes(keyword.toLowerCase())
    ) || /its[\s:]+\d+%/.test(allText);
  }

  extractFamily(taxon) {
    if (taxon.rank === 'family') return taxon.name;
    
    if (taxon.ancestors) {
      const family = taxon.ancestors.find(ancestor => ancestor.rank === 'family');
      if (family) return family.name;
    }
    
    // Fallback to common fungal families based on genus
    const genus = taxon.name.split(' ')[0].toLowerCase();
    const familyMap = {
      'agaricus': 'Agaricaceae',
      'boletus': 'Boletaceae', 
      'cantharellus': 'Cantharellaceae',
      'amanita': 'Amanitaceae',
      'pleurotus': 'Pleurotaceae',
      'shiitake': 'Omphalotaceae',
      'oyster': 'Pleurotaceae'
    };
    
    return familyMap[genus] || 'Fungi';
  }

  extractDescription(observation) {
    let description = '';
    
    if (observation.description) {
      description = observation.description.trim();
    }
    
    // Also check observation fields for additional context
    if (observation.ofvs) {
      const contextFields = observation.ofvs
        .filter(field => 
          field.name.toLowerCase().includes('habitat') ||
          field.name.toLowerCase().includes('substrate') ||
          field.name.toLowerCase().includes('host') ||
          field.name.toLowerCase().includes('growing') ||
          field.name.toLowerCase().includes('notes')
        )
        .map(field => `${field.name}: ${field.value}`)
        .join('; ');
      
      if (contextFields) {
        description = description ? `${description}. ${contextFields}` : contextFields;
      }
    }
    
    return description || 'No description provided';
  }

  calculateQualityScore(observation, hasDNA) {
    let score = 0.5; // Base score
    
    // Research grade bonus
    if (observation.quality_grade === 'research') score += 0.2;
    
    // DNA sequence major bonus
    if (hasDNA) score += 0.3;
    
    // Photo quality bonus
    if (observation.photos) {
      if (observation.photos.length >= 5) score += 0.1;
      else if (observation.photos.length >= 3) score += 0.05;
    }
    
    // Community agreement bonus
    if (observation.num_identification_agreements >= 3) score += 0.1;
    else if (observation.num_identification_agreements >= 2) score += 0.05;
    
    // Recent observation bonus
    const daysSince = (Date.now() - new Date(observation.observed_on)) / (1000 * 60 * 60 * 24);
    if (daysSince <= 365) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  async checkSpeciesHints(speciesName) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/species_hints?species_name=eq.${encodeURIComponent(speciesName)}`, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      });

      if (response.ok) {
        const hints = await response.json();
        return hints.length > 0 ? hints[0] : null;
      }
    } catch (error) {
      console.log(`⚠️  Error checking species hints: ${error.message}`);
    }
    return null;
  }

  async createSpeciesHints(specimen) {
    try {
      console.log(`   🤖 Creating species hints for ${specimen.species_name}...`);
      
      // Generate basic hints using AI
      const prompt = `Create 4 educational identification hints for the mushroom species: ${specimen.species_name}

The hints should help students learn to identify this species through observation and comparison. Create hints in this order:

1. MORPHOLOGICAL: Physical features (cap, stem, gills/pores, spores, size)
2. COMPARATIVE: How to distinguish from similar species or potential look-alikes
3. ECOLOGICAL: Habitat, substrate, seasonal patterns, geographic range
4. TAXONOMIC: Family and genus characteristics (use as last resort)

Each hint should be 1-3 sentences and focus on distinguishing characteristics that aid field identification.

Species: ${specimen.species_name}
Family: ${specimen.family}
Observer Description: ${specimen.description}

Format your response exactly as:
MORPHOLOGICAL: [description]
COMPARATIVE: [description]
ECOLOGICAL: [description]
TAXONOMIC: [description]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a mycological expert. Create precise, educational hints for mushroom identification that encourage observation and comparison skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      const hints = this.parseHintsFromAI(content);

      // Save hints to database with correct field names
      const hintsData = {
        species_name: specimen.species_name,
        genus: specimen.genus,
        family: specimen.family,
        common_name: specimen.common_name,
        hints: hints,
        source_quality: 'ai-generated',
        ai_confidence: 0.75,
        admin_reviewed: false,
        reference_url: null  // Using singular field name
        // Note: created_at and updated_at are handled automatically by Supabase
      };

      const saveResponse = await fetch(`${SUPABASE_URL}/rest/v1/species_hints`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hintsData)
      });

      if (saveResponse.ok) {
        console.log(`   ✅ Species hints created for ${specimen.species_name}`);
        this.hintsCreatedCount++;
        return true;
      } else {
        const errorText = await saveResponse.text();
        console.log(`   ⚠️  Failed to save hints for ${specimen.species_name}: ${errorText}`);
        return false;
      }

    } catch (error) {
      console.log(`   ❌ Error creating hints: ${error.message}`);
      return false;
    }
  }

  parseHintsFromAI(content) {
    const hints = [];
    const lines = content.split('\n').filter(line => line.trim());
    
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

    // Fallback if structured parsing fails
    if (hints.length === 0) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      sentences.slice(0, 4).forEach((sentence, index) => {
        const types = ['morphological', 'comparative', 'ecological', 'taxonomic'];
        hints.push({
          type: types[index] || 'general',
          level: index + 1,
          text: sentence.trim(),
          educational_value: index < 2 ? 'high' : 'medium'
        });
      });
    }

    return hints;
  }

  async saveToDatabase(specimen, photos) {
    console.log('💾 Saving to database...');
    
    try {
      // Insert specimen
      const specimenResponse = await fetch(`${SUPABASE_URL}/rest/v1/specimens`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(specimen)
      });

      if (!specimenResponse.ok) {
        const errorText = await specimenResponse.text();
        throw new Error(`Specimen save failed: ${specimenResponse.status} - ${errorText}`);
      }

      const savedSpecimen = await specimenResponse.json();
      const specimenId = savedSpecimen[0].id;

      console.log(`✅ Saved specimen ${specimenId}: ${specimen.species_name}`);

      // Check if species hints already exist
      const existingHints = await this.checkSpeciesHints(specimen.species_name);
      
      if (existingHints) {
        console.log(`   📚 Species hints already exist for ${specimen.species_name}`);
        this.hintsExistingCount++;
      } else {
        console.log(`   🆕 No hints found for ${specimen.species_name}, creating new ones...`);
        await this.createSpeciesHints(specimen);
      }

      return specimenId;

    } catch (error) {
      console.log(`❌ Database save error: ${error.message}`);
      throw error;
    }
  }

  async processObservation(obs) {
    console.log(`\n🔬 Processing: ${obs.taxon.name} (${obs.id})`);
    
    try {
      const detailed = await this.getObservationDetails(obs.id);
      
      // Check photo requirements first
      if (!detailed.photos || detailed.photos.length < 3) {
        console.log('   ⏭️  Insufficient photos (need at least 3)');
        return null;
      }

      console.log(`   📸 Good photos available (${detailed.photos.length} photos)`);

      // Check for DNA sequence
      const hasDNA = this.hasDNASequence(detailed);
      
      if (hasDNA) {
        console.log('   🧬 DNA sequence found! (High priority)');
        this.dnaCount++;
      } else {
        console.log('   📋 Research grade - no DNA sequence (Standard priority)');
      }

      // Create specimen data
      const specimen = {
        species_name: detailed.taxon.name,
        genus: detailed.taxon.name.split(' ')[0],
        family: this.extractFamily(detailed.taxon) || 'Fungi',
        common_name: detailed.taxon.preferred_common_name,
        inaturalist_id: detailed.id.toString(),
        location: detailed.place_guess || 'Arizona, USA',
        description: this.extractDescription(detailed),  // Changed from habitat
        dna_sequenced: hasDNA,
        status: 'pending',
        quality_score: this.calculateQualityScore(detailed, hasDNA),
        selected_photos: detailed.photos.map(p => p.id) // Default select all photos
      };

      console.log('   💾 Saving to database and managing species hints...');
      await this.saveToDatabase(specimen, detailed.photos);
      
      const priority = hasDNA ? 'HIGH PRIORITY (DNA)' : 'STANDARD (Research Grade)';
      console.log(`   ✅ SUCCESS: Saved ${specimen.species_name} - ${priority}`);
      
      return specimen;

    } catch (error) {
      console.log(`   ❌ Error processing: ${error.message}`);
      return null;
    }
  }

  async run() {
    console.log('🚀 Starting enhanced pipeline with species-level hint management...');
    console.log('📅 Current date:', new Date().toISOString());
    
    try {
      const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : 50;
      console.log(`📊 Processing limit: ${limit} observations`);
      
      const observations = await this.fetchObservations(limit);
      
      for (const obs of observations) {
        const result = await this.processObservation(obs);
        this.processedCount++;
        
        if (result) {
          this.savedCount++;
        }
      }
      
      console.log(`\n🎉 Enhanced Pipeline complete!`);
      console.log(`📊 Processed: ${this.processedCount} observations`);
      console.log(`💾 Saved: ${this.savedCount} specimens total`);
      console.log(`   🧬 DNA-verified: ${this.dnaCount} specimens`);
      console.log(`   📋 Research-grade: ${this.savedCount - this.dnaCount} specimens`);
      console.log(`\n🧠 Species Hints Management:`);
      console.log(`   📚 Existing hints found: ${this.hintsExistingCount} species`);
      console.log(`   🆕 New hints created: ${this.hintsCreatedCount} species`);
      console.log(`\n💡 All specimens are in the admin review queue with status 'pending'`);
      console.log(`🔧 Admin can review and edit species hints in the enhanced admin portal`);
      
    } catch (error) {
      console.log(`❌ Pipeline failed: ${error.message}`);
    }
  }
}

// Run the enhanced pipeline
const pipeline = new EnhancedPipeline();
pipeline.run().catch(console.error);