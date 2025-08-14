#!/usr/bin/env node

// Phase 3 Integration Script
// Updates app.js and index.html to include Phase 3 features

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Flash Fungi Phase 3 Integration Script');
console.log('=========================================\n');

// Configuration
const WEB_APP_DIR = join(__dirname, 'web-app', 'docs');
const APP_JS_PATH = join(WEB_APP_DIR, 'app.js');
const INDEX_HTML_PATH = join(WEB_APP_DIR, 'index.html');
const BACKUP_SUFFIX = '.backup-' + new Date().toISOString().replace(/:/g, '-');

// Files to deploy
const PHASE_3_FILES = [
    'focused-study.js',
    'marathon-mode.js',
    'service-worker.js',
    'manifest.json'
];

// Step 1: Create backups
function createBackups() {
    console.log('📦 Creating backups...');
    
    if (existsSync(APP_JS_PATH)) {
        const backupPath = APP_JS_PATH + BACKUP_SUFFIX;
        copyFileSync(APP_JS_PATH, backupPath);
        console.log(`   ✅ Backed up app.js to ${backupPath}`);
    }
    
    if (existsSync(INDEX_HTML_PATH)) {
        const backupPath = INDEX_HTML_PATH + BACKUP_SUFFIX;
        copyFileSync(INDEX_HTML_PATH, backupPath);
        console.log(`   ✅ Backed up index.html to ${backupPath}`);
    }
}

// Step 2: Update index.html
function updateIndexHTML() {
    console.log('\n📝 Updating index.html...');
    
    if (!existsSync(INDEX_HTML_PATH)) {
        console.error('   ❌ index.html not found!');
        return false;
    }
    
    let html = readFileSync(INDEX_HTML_PATH, 'utf8');
    const updates = [];
    
    // Add manifest link if not present
    if (!html.includes('manifest.json')) {
        const manifestLink = '    <link rel="manifest" href="/manifest.json">';
        html = html.replace('</head>', `${manifestLink}\n</head>`);
        updates.push('Added manifest.json link');
    }
    
    // Add PWA meta tags if not present
    if (!html.includes('apple-touch-icon')) {
        const pwaMeta = `    <!-- PWA Meta Tags -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Flash Fungi">
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">`;
        html = html.replace('</head>', `${pwaMeta}\n</head>`);
        updates.push('Added PWA meta tags');
    }
    
    // Add service worker registration if not present
    if (!html.includes('service-worker.js')) {
        const swScript = `
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('✅ Service Worker registered:', reg.scope))
                    .catch(err => console.error('❌ Service Worker registration failed:', err));
            });
        }
    </script>`;
        html = html.replace('</body>', `${swScript}\n</body>`);
        updates.push('Added service worker registration');
    }
    
    // Add Phase 3 component scripts before app.js
    const componentsToAdd = ['focused-study.js', 'marathon-mode.js'];
    componentsToAdd.forEach(component => {
        if (!html.includes(component)) {
            const scriptTag = `    <script src="./${component}"></script>`;
            // Insert before app.js
            if (html.includes('<script src="./app.js"></script>')) {
                html = html.replace(
                    '<script src="./app.js"></script>',
                    `${scriptTag}\n    <script src="./app.js"></script>`
                );
            } else {
                // If app.js isn't found in expected format, add before </body>
                html = html.replace('</body>', `${scriptTag}\n</body>`);
            }
            updates.push(`Added ${component} script`);
        }
    });
    
    if (updates.length > 0) {
        writeFileSync(INDEX_HTML_PATH, html);
        updates.forEach(update => console.log(`   ✅ ${update}`));
        return true;
    } else {
        console.log('   ℹ️  index.html already up to date');
        return true;
    }
}

// Step 3: Update app.js
function updateAppJS() {
    console.log('\n📝 Updating app.js...');
    
    if (!existsSync(APP_JS_PATH)) {
        console.error('   ❌ app.js not found!');
        return false;
    }
    
    let appContent = readFileSync(APP_JS_PATH, 'utf8');
    const updates = [];
    
    // Add window references for Supabase config (for use by components)
    if (!appContent.includes('window.SUPABASE_URL')) {
        const configExport = `
// Export configuration for use by Phase 3 components
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
`;
        // Add after configuration constants
        appContent = appContent.replace(
            "const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            `const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9${configExport}`
        );
        updates.push('Exported configuration for Phase 3 components');
    }
    
    // Update HomePage to include Focused Study and Marathon Mode options
    const focusedStudyPattern = /\/\/ Focused Study \(Coming Soon\)\s*h\('div',\s*\{[^}]+opacity:\s*0\.7[^}]*\}/;
    if (focusedStudyPattern.test(appContent)) {
        // Replace the "Coming Soon" focused study with active version
        const focusedStudyReplacement = `// Focused Study
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => onStudyModeSelect('focused'),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#8b5cf6',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'`;
        
        appContent = appContent.replace(focusedStudyPattern, focusedStudyReplacement);
        updates.push('Activated Focused Study mode');
    }
    
    const marathonPattern = /\/\/ Marathon Mode \(Coming Soon\)\s*h\('div',\s*\{[^}]+opacity:\s*0\.7[^}]*\}/;
    if (marathonPattern.test(appContent)) {
        // Replace the "Coming Soon" marathon mode with active version
        const marathonReplacement = `// Marathon Mode
                    h('div', {
                        style: {
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.2s'
                        },
                        onClick: () => onStudyModeSelect('marathon'),
                        onMouseEnter: (e) => e.currentTarget.style.borderColor = '#f59e0b',
                        onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'`;
        
        appContent = appContent.replace(marathonPattern, marathonReplacement);
        updates.push('Activated Marathon Mode');
    }
    
    // Update the switch statement in App component to handle new modes
    const switchPattern = /case 'study-quick':\s*return h\(QuickStudy/;
    if (switchPattern.test(appContent) && !appContent.includes("case 'study-focused':")) {
        const newCases = `case 'study-quick':
            return h(QuickStudy, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            });

        case 'study-focused':
            return h(window.FocusedStudy, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            });

        case 'study-marathon':
            return h(window.MarathonMode, {
                specimens,
                speciesHints,
                referencePhotos,
                specimenPhotos,
                user,
                saveProgress,
                loadSpecimenPhotos,
                onBack: handleBackToHome
            });

        `;
        
        appContent = appContent.replace(switchPattern, newCases);
        updates.push('Added routing for Focused Study and Marathon Mode');
    }
    
    if (updates.length > 0) {
        writeFileSync(APP_JS_PATH, appContent);
        updates.forEach(update => console.log(`   ✅ ${update}`));
        return true;
    } else {
        console.log('   ℹ️  app.js already includes Phase 3 updates');
        return true;
    }
}

// Step 4: Verify files exist
function verifyPhase3Files() {
    console.log('\n🔍 Verifying Phase 3 files...');
    
    let allPresent = true;
    
    PHASE_3_FILES.forEach(file => {
        const filePath = join(WEB_APP_DIR, file);
        if (existsSync(filePath)) {
            console.log(`   ✅ ${file} exists`);
        } else {
            console.log(`   ⚠️  ${file} not found - please ensure it's in ${WEB_APP_DIR}`);
            allPresent = false;
        }
    });
    
    return allPresent;
}

// Step 5: Create placeholder icons directory
function createIconsDirectory() {
    console.log('\n📁 Creating icons directory structure...');
    
    const iconsDir = join(WEB_APP_DIR, 'icons');
    const screenshotsDir = join(WEB_APP_DIR, 'screenshots');
    
    // Note: In a real implementation, you'd create actual icon files
    // For now, we'll just note that they need to be created
    
    console.log('   ℹ️  Note: You need to create icon files in /icons/ directory');
    console.log('   ℹ️  Sizes needed: 72, 96, 128, 144, 152, 192, 384, 512');
    console.log('   ℹ️  You can use online tools to generate PWA icons from a base image');
}

// Main execution
function main() {
    try {
        // Step 1: Create backups
        createBackups();
        
        // Step 2: Update HTML
        const htmlUpdated = updateIndexHTML();
        if (!htmlUpdated) {
            throw new Error('Failed to update index.html');
        }
        
        // Step 3: Update app.js
        const appUpdated = updateAppJS();
        if (!appUpdated) {
            throw new Error('Failed to update app.js');
        }
        
        // Step 4: Verify files
        const filesPresent = verifyPhase3Files();
        if (!filesPresent) {
            console.log('\n⚠️  Warning: Some Phase 3 files are missing');
            console.log('Please ensure all files are in place before deployment');
        }
        
        // Step 5: Icons reminder
        createIconsDirectory();
        
        console.log('\n✨ Phase 3 Integration Complete!');
        console.log('=====================================');
        console.log('\n📋 Next Steps:');
        console.log('1. Copy Phase 3 files to web-app/docs/:');
        PHASE_3_FILES.forEach(file => {
            console.log(`   - ${file}`);
        });
        console.log('2. Create PWA icons in /icons/ directory');
        console.log('3. Test locally with: cd web-app && npm start');
        console.log('4. Deploy to Vercel: vercel --prod');
        console.log('\n🎉 Phase 3 Week 1 features are ready!');
        
    } catch (error) {
        console.error('\n❌ Integration failed:', error.message);
        console.error('Please check the error and try again');
        process.exit(1);
    }
}

// Run the integration
main();