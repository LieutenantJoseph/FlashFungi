// Simplified Arizona Mushroom Pipeline - Working Version
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

class SimplePipeline {
  constructor() {
    this.processedCount = 0;
    this.savedCount = 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchObservations(limit = 500) {
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

  async generateHints(specimen) {
    const prompt = `Create 4 educational hints for identifying this mushroom:

Species: ${specimen.species_name}
Family: ${specimen.family}
Location: ${specimen.location}
Habitat: ${specimen.habitat}

Return exactly 4 hints in this format:
1. Morphological: [describe physical features]
2. Ecological: [describe habitat and relationships]  
3. Family: [describe family characteristics]
4. Genus: [describe genus characteristics]`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600
      });

      const content = response.choices[0].message.content;
      const lines = content.split('\n').filter(line => line.trim());
      
      const hints = [
        { level: 3, type: 'morphological', text: lines[0]?.replace(/^\d+\.\s*\w+:\s*/, '') || 'Physical features help identify this species.' },
        { level: 4, type: 'ecological', text: lines[1]?.replace(/^\d+\.\s*\w+:\s*/, '') || 'Habitat and ecology provide identification clues.' },
        { level: 1, type: 'taxonomic', text: lines[2]?.replace(/^\d+\.\s*\w+:\s*/, '') || `This belongs to the family ${specimen.family}.` },
        { level: 2, type: 'taxonomic', text: lines[3]?.replace(/^\d+\.\s*\w+:\s*/, '') || `The genus characteristics help with identification.` }
      ];

      return hints;
    } catch (error) {
      console.log('⚠️  AI hint generation failed, using templates');
      return [
        { level: 3, type: 'morphological', text: `Examine the physical features of this ${specimen.species_name}.` },
        { level: 4, type: 'ecological', text: `Found in ${specimen.habitat}.` },
        { level: 1, type: 'taxonomic', text: `Belongs to family ${specimen.family}.` },
        { level: 2, type: 'taxonomic', text: `Genus characteristics aid identification.` }
      ];
    }
  }

  async saveToDatabase(specimen, photos, hints) {
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
        throw new Error(`Specimen save failed: ${specimenResponse.status}`);
      }

      const savedSpecimen = await specimenResponse.json();
      const specimenId = savedSpecimen[0].id;

      // Save photos and hints (simplified for this test)
      console.log(`✅ Saved specimen ${specimenId}: ${specimen.species_name}`);
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
      
      if (!this.hasDNASequence(detailed)) {
        console.log('   ⏭️  No DNA sequence found');
        return null;
      }

      if (!detailed.photos || detailed.photos.length < 2) {
        console.log('   ⏭️  Insufficient photos');
        return null;
      }

      console.log('   🧬 DNA sequence found!');
      console.log('   📸 Good photos available');

      const specimen = {
        species_name: detailed.taxon.name,
        genus: detailed.taxon.name.split(' ')[0],
        family: 'Fungi', // Simplified
        common_name: detailed.taxon.preferred_common_name,
        inaturalist_id: detailed.id.toString(),
        location: detailed.place_guess || 'Arizona, USA',
        habitat: detailed.description || 'Not specified',
        dna_sequenced: true,
        status: 'pending'
      };

      console.log('   🤖 Generating AI hints...');
      const hints = await this.generateHints(specimen);

      console.log('   💾 Saving to database...');
      await this.saveToDatabase(specimen, [], hints);
      
      return specimen;

    } catch (error) {
      console.log(`   ❌ Error processing: ${error.message}`);
      return null;
    }
  }

  async run() {
    console.log('🚀 Starting simplified pipeline...');
    
    try {
      const observations = await this.fetchObservations(15);
      
      for (const obs of observations) {
        const result = await this.processObservation(obs);
        this.processedCount++;
        
        if (result) {
          this.savedCount++;
          console.log(`   ✅ SUCCESS: Saved ${result.species_name}`);
        }
      }
      
      console.log(`\n🎉 Pipeline complete!`);
      console.log(`📊 Processed: ${this.processedCount} observations`);
      console.log(`💾 Saved: ${this.savedCount} DNA-verified specimens`);
      
    } catch (error) {
      console.log(`❌ Pipeline failed: ${error.message}`);
    }
  }
}

// Run the pipeline
const pipeline = new SimplePipeline();
pipeline.run().catch(console.error);
