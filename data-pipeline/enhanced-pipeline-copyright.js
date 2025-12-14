// Enhanced Arizona Mushroom Pipeline with Copyright Checking
// Includes license verification and observation whitelisting
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

// Acceptable licenses for monetized app usage
const ACCEPTABLE_LICENSES = [
  'cc0',           // Public Domain - No rights reserved
  'cc-by',         // Attribution only
  'cc-by-sa',      // Attribution ShareAlike
  'cc-by-nd',      // Attribution NoDerivatives
  'pd',            // Public Domain
];

// Unacceptable licenses (require permission)
const RESTRICTED_LICENSES = [
  'cc-by-nc',      // Non-commercial only
  'cc-by-nc-sa',   //