// Enhanced Arizona Mushroom Pipeline with Fixed Taxonomic Filtering
// Correctly excludes lichens and handles family extraction properly
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
if (!process.env.SUPABASE_SERVICE_KEY) {
  console.log('❌ SUPABASE_SERVICE_KEY not found in environment');
  process.exit(1);
}

console.log('✅ Environment loaded successfully');

// Configuration
const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';
const INATURALIST_API = 'https://api.inaturalist.org/v1';

// Taxa to exclude (CORRECTED iNaturalist taxon IDs)
const EXCLUDED_TAXA = {
  // Lichen classes
  'Arthoniomycetes': 152028,        // Class Arthoniomycetes
  'Lecanoromycetes': 54743,         // Class Lecanoromycetes (Common Lichens)
  'Lichinomycetes': 152030,         // Class Lichinomycetes
  
  // Other excluded groups
  'Verrucariales': 117869,          // Order Verrucariales
  'Phyllostictaceae': 791584,       // Family Phyllostictaceae
  'Erysiphaceae': 55525              // Family Erysiphaceae (Powdery Mildews)
};

class EnhancedPipeline {
  constructor() {
    this.processedCount = 0;
    this.savedCount = 0;
    this.duplicateCount = 0;
    this.dnaCount = 0;
    this.guidesNeeded = new Set(); // Track unique species needing guides
    this.skippedNoFamily = 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchObservations(limit = 50, skip = 0) {
    console.log('🔍 Fetching Arizona mushroom observations (with taxonomic filtering)...');
    
    // Get the excluded taxon IDs as a comma-separated string
    const excludedTaxonIds = Object.values(EXCLUDED_TAXA).join(',');
    
    console.log(`📊 Excluding taxa: ${Object.keys(EXCLUDED_TAXA).join(', ')}`);
    console.log(`📊 Request: Limit=${limit}, Skip=${skip}`);
    
    // iNaturalist API has a max per_page of 200
    const MAX_PER_PAGE = 200;
    const allObservations = [];
    
    // Calculate starting page and offset
    const startPage = Math.floor(skip / MAX_PER_PAGE) + 1;
    const skipWithinFirstPage = skip % MAX_PER_PAGE;
    
    console.log(`📄 Starting from page ${startPage} (skipping ${skipWithinFirstPage} within that page)`);
    
    let currentPage = startPage;
    let observationsNeeded = limit;
    let isFirstPage = true;
    
    while (observationsNeeded > 0) {
      // Calculate how many to fetch this page
      let perPage = MAX_PER_PAGE;
      
      // On the first page, we might need extra to account for skip
      if (isFirstPage && skipWithinFirstPage > 0) {
        perPage = Math.min(MAX_PER_PAGE, skipWithinFirstPage + observationsNeeded);
      } else {
        perPage = Math.min(MAX_PER_PAGE, observationsNeeded);
      }
      
      const params = new URLSearchParams({
        place_id: 40, // Arizona
        taxon_id: 47170, // Fungi
        without_taxon_id: excludedTaxonIds,
        quality_grade: 'research',
        photos: 'true',
        per_page: perPage,
        page: currentPage,
        order_by: 'created_at',
        order: 'desc'
      });
      
      console.log(`   📄 Fetching page ${currentPage} (requesting ${perPage} observations)...`);
      
      try {
        const response = await fetch(`${INATURALIST_API}/observations?${params}`);
        
        if (!response.ok) {
          console.log(`   ❌ API error: ${response.status} ${response.statusText}`);
          break;
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
          console.log(`   ⚠️  No more observations available`);
          break;
        }
        
        // On first page, skip the observations we need to skip
        let pageResults = data.results;
        if (isFirstPage && skipWithinFirstPage > 0) {
          pageResults = data.results.slice(skipWithinFirstPage);
          isFirstPage = false;
        }
        
        // Add only what we need
        const toAdd = Math.min(pageResults.length, observationsNeeded);
        allObservations.push(...pageResults.slice(0, toAdd));
        observationsNeeded -= toAdd;
        
        console.log(`   ✅ Got ${toAdd} observations from page ${currentPage} (total so far: ${allObservations.length})`);
        
        // Check if we got less than requested (end of results)
        if (data.results.length < perPage) {
          console.log(`   ⚠️  Reached end of available observations`);
          break;
        }
        
        currentPage++;
        isFirstPage = false;
        
        // Be nice to the API between pages
        if (observationsNeeded > 0) {
          await this.delay(1000);
        }
        
      } catch (error) {
        console.log(`   ❌ Fetch error: ${error.message}`);
        break;
      }
    }
    
    console.log(`📊 Retrieved ${allObservations.length} observations total`);
    return allObservations;
  }

  async getObservationDetails(id) {
    await this.delay(1000); // Be respectful to API
    const response = await fetch(`${INATURALIST_API}/observations/${id}`);
    const data = await response.json();
    return data.results[0];
  }

  async getTaxonDetails(taxonId) {
    // Fetch complete taxon information including full ancestry
    await this.delay(1000); // Respect 1 request per second limit
    const response = await fetch(`${INATURALIST_API}/taxa/${taxonId}`);
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

  async extractFamily(taxon) {
    // Check if the taxon itself is at family rank
    if (taxon.rank === 'family') return taxon.name;
    
    // First, try to find family in ancestors if they exist
    if (taxon.ancestors && taxon.ancestors.length > 0) {
      const family = taxon.ancestors.find(ancestor => ancestor.rank === 'family');
      if (family) return family.name;
    }
    
    // If ancestors are incomplete or missing, fetch full taxon details
    console.log(`   🔍 Fetching complete taxonomy for ${taxon.name}...`);
    try {
      const fullTaxon = await this.getTaxonDetails(taxon.id);
      
      if (fullTaxon && fullTaxon.ancestors) {
        const family = fullTaxon.ancestors.find(ancestor => ancestor.rank === 'family');
        if (family) {
          console.log(`   ✅ Found family: ${family.name}`);
          return family.name;
        }
      }
      
      // Last resort: check if any ancestor contains "aceae" (typical family ending)
      if (fullTaxon && fullTaxon.ancestors) {
        const likelyFamily = fullTaxon.ancestors.find(ancestor => 
          ancestor.name.endsWith('aceae') || ancestor.name.endsWith('idae')
        );
        if (likelyFamily) {
          console.log(`   ✅ Found likely family: ${likelyFamily.name}`);
          return likelyFamily.name;
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error fetching full taxonomy: ${error.message}`);
    }
    
    // If we still can't find family, return a fallback
    // This should rarely happen for fungi on iNaturalist
    console.log(`   ⚠️  No family found for ${taxon.name}, using order or class as fallback`);
    
    // Try to find order as fallback
    if (taxon.ancestors) {
      const order = taxon.ancestors.find(ancestor => ancestor.rank === 'order');
      if (order) return `${order.name} (Order)`;
      
      const classRank = taxon.ancestors.find(ancestor => ancestor.rank === 'class');
      if (classRank) return `${classRank.name} (Class)`;
    }
    
    return 'Fungi (Kingdom)'; // Ultimate fallback
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

  async checkExistingSpecimen(inaturalistId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/specimens?inaturalist_id=eq.${inaturalistId}&select=id`,
        {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
          }
        }
      );

      if (response.ok) {
        const specimens = await response.json();
        return specimens.length > 0;
      }
      
      // Log the error for debugging
      const errorText = await response.text();
      console.log(`   ⚠️  Error checking for duplicate: ${errorText}`);
      return false;
      
    } catch (error) {
      console.log(`   ⚠️  Error checking existing specimen: ${error.message}`);
      // Return false so we don't skip observations due to API errors
      return false;
    }
  }

  async checkFieldGuide(speciesName) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/field_guides?species_name=eq.${encodeURIComponent(speciesName)}`, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      });

      if (response.ok) {
        const guides = await response.json();
        return guides.length > 0;
      }
    } catch (error) {
      console.log(`⚠️  Error checking field guide: ${error.message}`);
    }
    return false;
  }

  async saveToDatabase(specimen, photos) {
    console.log('💾 Saving to database...');
    
    try {
        // Insert specimen to database
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
        
        return specimenId;

    } catch (error) {
        console.log(`❌ Database save error: ${error.message}`);
        throw error;
    }
}

  async processObservation(obs) {
    console.log(`\n🔬 Processing: ${obs.taxon.name} (${obs.id})`);
    
    try {
      // Check if specimen already exists in database FIRST (before API calls)
      const exists = await this.checkExistingSpecimen(obs.id.toString());
      if (exists) {
        console.log('   ⏭️  Already in database - skipping');
        this.duplicateCount++;
        return null;
      }

      // Only fetch details if not a duplicate
      const detailed = await this.getObservationDetails(obs.id);
      
      // Check photo requirements first
      if (!detailed.photos || detailed.photos.length < 3) {
        console.log('   ⏭️  Insufficient photos (need at least 3)');
        return null;
      }

      console.log(`   📸 Good photos available (${detailed.photos.length} photos)`);

      // Extract family from taxonomy tree (with improved logic)
      const family = await this.extractFamily(detailed.taxon);
      if (!family) {
        console.log('   ⚠️  Warning: Using fallback family classification');
        this.skippedNoFamily++;
      }

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
        family: family,
        common_name: detailed.taxon.preferred_common_name,
        inaturalist_id: detailed.id.toString(),
        location: detailed.place_guess || 'Arizona, USA',
        description: this.extractDescription(detailed),
        dna_sequenced: hasDNA,
        status: 'pending',
        quality_score: this.calculateQualityScore(detailed, hasDNA),
        selected_photos: detailed.photos.map(p => p.id) // Default select all photos
      };

      console.log('   💾 Saving to database...');
      console.log(`   📝 Family: ${specimen.family}`);
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
      console.log('🚀 Starting pipeline...');
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
          
          console.log(`\n🎉 Pipeline complete!`);
          console.log(`📊 Processed: ${this.processedCount} observations`);
          console.log(`💾 Saved: ${this.savedCount} specimens total`);
          console.log(`   🧬 DNA-verified: ${this.dnaCount} specimens`);
          console.log(`   📋 Research-grade: ${this.savedCount - this.dnaCount} specimens`);
          console.log(`\n💡 All specimens are in the admin review queue with status 'pending'`);
          console.log(`📝 Admins can create field guides manually in the admin portal`);
          
      } catch (error) {
          console.log(`❌ Pipeline failed: ${error.message}`);
      }
  }
}

// Run the enhanced pipeline
const pipeline = new EnhancedPipeline();
pipeline.run().catch(console.error);