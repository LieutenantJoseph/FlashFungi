// Enhanced Arizona Mushroom Pipeline with Copyright Checking and Taxon Filtering
// Fixed family extraction and added section rank support
// Temporarily includes NC licenses for testing

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

// Acceptable licenses for app (including NC for testing phase)
const ACCEPTABLE_LICENSES = [
  'cc0',           // Public Domain - No rights reserved
  'cc-by',         // Attribution only
  'cc-by-sa',      // Attribution + Share-alike
  'cc-by-nc',      // Attribution + Non-commercial (TESTING ONLY)
  'cc-by-nc-sa',   // Attribution + Non-commercial + Share-alike (TESTING ONLY)
];

// Taxa to exclude (iNaturalist taxon IDs)
const EXCLUDED_TAXA = {
  'Arthoniomycetes': 54743,
  'Lecanoromycetes': 54744,
  'Lichinomycetes': 130003,
  'Verrucariales': 175541,
  'Phyllostictaceae': 970391,
  'Erysiphaceae': 53182
};

class EnhancedPipelineWithCopyright {
  constructor() {
    this.processedCount = 0;
    this.savedCount = 0;
    this.dnaCount = 0;
    this.hintsCreatedCount = 0;
    this.hintsExistingCount = 0;
    this.skippedNoFamily = 0;
    this.skippedCopyright = 0;
    this.manualOverrides = [];
    this.specificTaxonId = null;
    this.taxonInfo = null;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async loadManualOverrides() {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/manual_copyright_overrides?select=observation_id`,
        {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        this.manualOverrides = data.map(item => item.observation_id);
        console.log(`📋 Loaded ${this.manualOverrides.length} manual copyright overrides`);
      }
    } catch (error) {
      console.log('⚠️  Could not load manual overrides:', error.message);
    }
  }

  async getTaxonInfo(taxonId) {
    try {
      const response = await fetch(`${INATURALIST_API}/taxa/${taxonId}`);
      if (response.ok) {
        const data = await response.json();
        return data.results[0];
      }
    } catch (error) {
      console.log(`⚠️  Could not fetch taxon info: ${error.message}`);
    }
    return null;
  }

  checkPhotoLicenses(photos) {
    const results = {
      isAcceptable: true,
      requiresAttribution: false,
      licenses: [],
      rejectedPhotos: []
    };

    if (!photos || photos.length === 0) {
      results.isAcceptable = false;
      return results;
    }

    for (const photo of photos) {
      const license = photo.license_code ? photo.license_code.toLowerCase() : null;
      
      if (!license) {
        results.isAcceptable = false;
        results.rejectedPhotos.push({
          id: photo.id,
          reason: 'No license specified'
        });
        continue;
      }

      results.licenses.push(license);

      if (!ACCEPTABLE_LICENSES.includes(license)) {
        results.isAcceptable = false;
        results.rejectedPhotos.push({
          id: photo.id,
          license: license,
          reason: `License '${license}' not acceptable`
        });
      }

      // Check if attribution is required
      if (license.includes('by')) {
        results.requiresAttribution = true;
      }
    }

    return results;
  }

  async fetchObservations(limit = 50, skip = 0, specificTaxonId = null) {
    console.log('🔍 Fetching Arizona mushroom observations with copyright filtering...');
    
    const excludedTaxonIds = Object.values(EXCLUDED_TAXA).join(',');
    
    // Use specific taxon ID if provided, otherwise use general Fungi
    const targetTaxonId = specificTaxonId || 47170; // Default to Fungi
    
    const params = new URLSearchParams({
      place_id: 40, // Arizona
      taxon_id: targetTaxonId,
      quality_grade: 'research',
      photos: 'true',
      per_page: limit,
      order_by: 'created_at',
      order: 'desc',
      offset: skip
    });

    // Only exclude taxa if we're doing a broad fungi search
    if (!specificTaxonId) {
      params.append('without_taxon_id', excludedTaxonIds);
      console.log(`📊 Excluding taxa: ${Object.keys(EXCLUDED_TAXA).join(', ')}`);
    }

    if (specificTaxonId) {
      console.log(`🎯 Filtering for specific taxon ID: ${specificTaxonId}`);
      if (this.taxonInfo) {
        console.log(`   Species: ${this.taxonInfo.name}`);
        console.log(`   Common name: ${this.taxonInfo.preferred_common_name || 'N/A'}`);
        console.log(`   Rank: ${this.taxonInfo.rank}`);
      }
    } else {
      console.log(`📊 Fetching all Fungi observations`);
    }

    const response = await fetch(`${INATURALIST_API}/observations?${params}`);
    const data = await response.json();
    
    console.log(`📊 Found ${data.results.length} observations (after filtering)`);
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
    // Debug logging
    console.log(`   🔍 Extracting family for ${taxon.name} (rank: ${taxon.rank})`);
    
    // Check if the taxon itself is at family rank
    if (taxon.rank === 'family') {
      console.log(`   ✓ Taxon itself is family: ${taxon.name}`);
      return taxon.name;
    }
    
    // For subspecies and varieties, we need the full ancestor chain
    // iNaturalist API sometimes doesn't include all ancestors in the basic response
    // Let's check if ancestors array exists and has content
    if (taxon.ancestors && Array.isArray(taxon.ancestors) && taxon.ancestors.length > 0) {
      console.log(`   🔍 Checking ${taxon.ancestors.length} ancestors...`);
      
      // Log all ancestors for debugging
      taxon.ancestors.forEach(ancestor => {
        console.log(`      - ${ancestor.rank}: ${ancestor.name}`);
      });
      
      // Look for family in ancestors
      const family = taxon.ancestors.find(ancestor => ancestor.rank === 'family');
      if (family) {
        console.log(`   ✓ Found family in ancestors: ${family.name}`);
        return family.name;
      }
    } else {
      console.log(`   ⚠️  No ancestors array or empty ancestors for ${taxon.name}`);
    }
    
    // Try to fetch complete taxon data if we don't have family yet
    // This is needed for subspecies which might not have complete ancestor chain
    console.log(`   ⚠️  No family found in initial data for ${taxon.name}`);
    return null;
  }

  async fetchCompleteAncestors(taxonId) {
    try {
      console.log(`   🔄 Fetching complete ancestor data for taxon ID: ${taxonId}`);
      await this.delay(500); // Rate limiting
      
      const response = await fetch(`${INATURALIST_API}/taxa/${taxonId}`);
      if (response.ok) {
        const data = await response.json();
        const fullTaxon = data.results[0];
        
        if (fullTaxon && fullTaxon.ancestors) {
          console.log(`   📊 Retrieved ${fullTaxon.ancestors.length} ancestors`);
          const family = fullTaxon.ancestors.find(a => a.rank === 'family');
          if (family) {
            console.log(`   ✓ Found family via API call: ${family.name}`);
            return family.name;
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Error fetching complete ancestors: ${error.message}`);
    }
    return null;
  }

  extractSection(taxon) {
    // Extract section information if available
    if (taxon.ancestors && Array.isArray(taxon.ancestors)) {
      const section = taxon.ancestors.find(ancestor => ancestor.rank === 'section');
      if (section) {
        console.log(`   📑 Found section: ${section.name}`);
        return section.name;
      }
    }
    
    // Check if the taxon itself is a section
    if (taxon.rank === 'section') {
      return taxon.name;
    }
    
    return null;
  }

  extractDescription(observation) {
    let description = '';
    
    if (observation.description) {
      description = observation.description.trim();
    }
    
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
    
    if (observation.quality_grade === 'research') score += 0.2;
    if (hasDNA) score += 0.3;
    
    if (observation.photos) {
      if (observation.photos.length >= 5) score += 0.1;
      else if (observation.photos.length >= 3) score += 0.05;
    }
    
    if (observation.num_identification_agreements >= 3) score += 0.1;
    else if (observation.num_identification_agreements >= 2) score += 0.05;
    
    const daysSince = (Date.now() - new Date(observation.observed_on)) / (1000 * 60 * 60 * 24);
    if (daysSince <= 365) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  async checkSpeciesHints(speciesName) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/species_hints?species_name=eq.${encodeURIComponent(speciesName)}`,
        {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
          }
        }
      );

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
      
      // Include section information if available
      const sectionInfo = specimen.section ? `\nSection: ${specimen.section}` : '';
      
      const prompt = `Create 4 educational identification hints for the mushroom species: ${specimen.species_name}

The hints should help students learn to identify this species through observation and comparison. Create hints in this order:

1. MORPHOLOGICAL: Physical features (cap, stem, gills/pores, spores, size)
2. COMPARATIVE: How to distinguish from similar species or potential look-alikes
3. ECOLOGICAL: Habitat, substrate, seasonal patterns, geographic range
4. TAXONOMIC: Family and genus characteristics (use as last resort)

Each hint should be 1-3 sentences and focus on distinguishing characteristics that aid field identification.

Species: ${specimen.species_name}
Family: ${specimen.family}${sectionInfo}
Observer Description: ${specimen.description}

Format your response exactly as:
MORPHOLOGICAL: [description]
COMPARATIVE: [description]
ECOLOGICAL: [description]
TAXONOMIC: [description]`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponse = completion.choices[0].message.content;
      const hints = this.parseHintsFromAI(aiResponse);
      
      if (hints.length > 0) {
        const hintsData = {
          species_name: specimen.species_name,
          hints: hints,
          section: specimen.section // Store section with hints
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
          console.log(`   ✅ Species hints created successfully`);
          this.hintsCreatedCount++;
          return true;
        }
      }
    } catch (error) {
      console.log(`   ❌ Error creating hints: ${error.message}`);
    }
    return false;
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

    return hints;
  }

  async saveToDatabase(specimen, photos, licenseInfo) {
    console.log('💾 Saving to database...');
    
    try {
      specimen.photo_licenses = licenseInfo.licenses;
      specimen.requires_attribution = licenseInfo.requiresAttribution;
      
      // Add taxon filter info if applicable
      if (this.specificTaxonId) {
        specimen.pipeline_taxon_filter = this.specificTaxonId;
      }
      
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
      if (specimen.section) {
        console.log(`   📑 Section: ${specimen.section}`);
      }

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
      
      const hasManualOverride = this.manualOverrides.includes(obs.id.toString());
      const licenseCheck = this.checkPhotoLicenses(detailed.photos);
      
      if (!licenseCheck.isAcceptable && !hasManualOverride) {
        console.log(`   ⛔ COPYRIGHT: Photos not usable`);
        console.log(`      Rejected: ${licenseCheck.rejectedPhotos.map(p => p.reason).join(', ')}`);
        console.log(`      To override: Add observation ID ${obs.id} to manual overrides`);
        this.skippedCopyright++;
        return null;
      }
      
      if (hasManualOverride) {
        console.log(`   ✅ COPYRIGHT: Manual override applied for observation ${obs.id}`);
      } else {
        console.log(`   ✅ COPYRIGHT: Photos have acceptable licenses`);
        if (licenseCheck.requiresAttribution) {
          console.log(`      Note: Attribution required`);
        }
        // Note if using NC licenses
        if (licenseCheck.licenses.some(l => l.includes('nc'))) {
          console.log(`      ⚠️  Using NC license (testing phase only)`);
        }
      }
      
      if (!detailed.photos || detailed.photos.length < 3) {
        console.log('   ⏭️  Insufficient photos (need at least 3)');
        return null;
      }

      console.log(`   📸 Good photos available (${detailed.photos.length} photos)`);

      // Try to extract family
      let family = this.extractFamily(detailed.taxon);
      
      // If no family found, try fetching complete ancestor data
      if (!family && detailed.taxon.id) {
        family = await this.fetchCompleteAncestors(detailed.taxon.id);
      }
      
      if (!family) {
        console.log('   ⏭️  No family information found - skipping');
        console.log('   💡 Tip: This might be a subspecies or variety without complete ancestor data');
        this.skippedNoFamily++;
        return null;
      }

      // Extract section information
      const section = this.extractSection(detailed.taxon);

      const hasDNA = this.hasDNASequence(detailed);
      
      if (hasDNA) {
        console.log('   🧬 DNA sequence found! (High priority)');
        this.dnaCount++;
      } else {
        console.log('   📋 Research grade - no DNA sequence (Standard priority)');
      }

      const specimen = {
        species_name: detailed.taxon.name,
        genus: detailed.taxon.name.split(' ')[0],
        family: family,
        section: section, // Add section field
        common_name: detailed.taxon.preferred_common_name,
        inaturalist_id: detailed.id.toString(),
        location: detailed.place_guess || 'Arizona, USA',
        description: this.extractDescription(detailed),
        dna_sequenced: hasDNA,
        status: 'pending',
        quality_score: this.calculateQualityScore(detailed, hasDNA),
        selected_photos: detailed.photos.map(p => p.id),
        manual_copyright_override: hasManualOverride
      };

      console.log('   💾 Saving to database and managing species hints...');
      await this.saveToDatabase(specimen, detailed.photos, licenseCheck);
      
      const priority = hasDNA ? 'HIGH PRIORITY (DNA)' : 'STANDARD (Research Grade)';
      console.log(`   ✅ SUCCESS: Saved ${specimen.species_name} - ${priority}`);
      
      return specimen;

    } catch (error) {
      console.log(`   ❌ Error processing: ${error.message}`);
      return null;
    }
  }

  async run() {
    console.log('🚀 Starting enhanced pipeline with copyright checking...');
    console.log('📅 Current date:', new Date().toISOString());
    
    // Check for taxon ID filter
    if (process.env.TAXON_ID) {
      this.specificTaxonId = process.env.TAXON_ID;
      console.log(`\n🎯 TAXON FILTER ACTIVE: ${this.specificTaxonId}`);
      
      // Get taxon info for better logging
      this.taxonInfo = await this.getTaxonInfo(this.specificTaxonId);
      if (this.taxonInfo) {
        console.log(`   Processing only: ${this.taxonInfo.name}`);
        if (this.taxonInfo.preferred_common_name) {
          console.log(`   Common name: ${this.taxonInfo.preferred_common_name}`);
        }
        console.log(`   Rank: ${this.taxonInfo.rank}`);
      }
    }
    
    console.log('\n📜 Acceptable licenses (including NC for testing):');
    ACCEPTABLE_LICENSES.forEach(license => {
      const isTestOnly = license.includes('nc') ? ' ⚠️ (TESTING ONLY)' : '';
      console.log(`   ✅ ${license.toUpperCase()}${isTestOnly}`);
    });
    
    if (!this.specificTaxonId) {
      console.log('\n🚫 Excluded taxa:');
      Object.entries(EXCLUDED_TAXA).forEach(([name, id]) => {
        console.log(`   - ${name} (ID: ${id})`);
      });
    }
    
    try {
      await this.loadManualOverrides();
      
      const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : 50;
      const skip = process.env.SKIP ? parseInt(process.env.SKIP) : 0;
      
      console.log(`\n📊 Processing limit: ${limit} observations`);
      if (skip > 0) {
        console.log(`⏭️  Skipping first ${skip} observations`);
      }
      
      const observations = await this.fetchObservations(limit, skip, this.specificTaxonId);
      
      if (observations.length === 0) {
        console.log('\n⚠️  No observations found matching criteria');
        if (this.specificTaxonId) {
          console.log('   Try checking if the taxon ID is correct or if there are observations in Arizona');
        }
        return;
      }
      
      for (const obs of observations) {
        const result = await this.processObservation(obs);
        this.processedCount++;
        
        if (result) {
          this.savedCount++;
        }
      }
      
      console.log(`\n🎉 Enhanced Pipeline complete!`);
      if (this.specificTaxonId && this.taxonInfo) {
        console.log(`🎯 Filtered for: ${this.taxonInfo.name} (ID: ${this.specificTaxonId})`);
      }
      console.log(`📊 Processed: ${this.processedCount} observations`);
      console.log(`⛔ Copyright filtered: ${this.skippedCopyright} observations`);
      console.log(`⏭️  No family data: ${this.skippedNoFamily} observations`);
      console.log(`💾 Saved: ${this.savedCount} specimens total`);
      console.log(`   🧬 DNA-verified: ${this.dnaCount} specimens`);
      console.log(`   📋 Research-grade: ${this.savedCount - this.dnaCount} specimens`);
      console.log(`   📝 Manual overrides used: ${this.manualOverrides.length}`);
      console.log(`\n🧠 Species Hints Management:`);
      console.log(`   📚 Existing hints found: ${this.hintsExistingCount} species`);
      console.log(`   🆕 New hints created: ${this.hintsCreatedCount} species`);
      console.log(`\n💡 All specimens are in the admin review queue with status 'pending'`);
      console.log(`🔧 Admin can review and edit species hints in the enhanced admin portal`);
      
      if (ACCEPTABLE_LICENSES.some(l => l.includes('nc'))) {
        console.log('\n⚠️  WARNING: NC licenses are enabled for testing. Remove for production!');
      }
      
    } catch (error) {
      console.log(`❌ Pipeline failed: ${error.message}`);
    }
  }
}

// Run the enhanced pipeline
const pipeline = new EnhancedPipelineWithCopyright();
pipeline.run().catch(console.error);