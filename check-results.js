// Check Pipeline Results
import { readFileSync } from 'fs';

// Load environment
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

const SUPABASE_URL = 'https://oxgedcncrettasrbmwsl.supabase.co';

async function checkResults() {
  console.log('🔍 Checking pipeline results...\n');
  
  try {
    // Check specimens table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/specimens?select=*&order=created_at.desc`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (response.ok) {
      const specimens = await response.json();
      
      console.log(`📊 Total specimens in database: ${specimens.length}`);
      
      if (specimens.length > 0) {
        console.log('\n🍄 Recent specimens:');
        specimens.slice(0, 5).forEach((spec, i) => {
          console.log(`   ${i + 1}. ${spec.species_name} (${spec.status})`);
          console.log(`      📍 ${spec.location}`);
          console.log(`      🔬 iNaturalist ID: ${spec.inaturalist_id}`);
          console.log(`      📅 Added: ${new Date(spec.created_at).toLocaleDateString()}\n`);
        });
        
        const pendingCount = specimens.filter(s => s.status === 'pending').length;
        console.log(`⏳ Specimens pending your review: ${pendingCount}`);
        
        if (pendingCount > 0) {
          console.log('\n🎯 Next steps:');
          console.log('1. Open your admin portal to review specimens');
          console.log('2. Edit AI-generated hints if needed');
          console.log('3. Approve specimens for the study app');
        }
      } else {
        console.log('📭 No specimens found yet');
        console.log('\n💡 This could mean:');
        console.log('- No DNA-verified specimens in the recent sample');
        console.log('- Need to process more observations');
        console.log('- Could expand search criteria');
      }
    } else {
      console.log('❌ Failed to fetch specimens');
    }
  } catch (error) {
    console.log('❌ Error checking results:', error.message);
  }
}

checkResults();
