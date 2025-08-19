// components/study/utils/fuzzyMatching.js
// Utility functions for fuzzy string matching in species identification

// Calculate Levenshtein distance between two strings
const calculateLevenshteinDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
        Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + substitutionCost
            );
        }
    }
    
    return matrix[str2.length][str1.length];
};

// Calculate similarity percentage between two strings
const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = calculateLevenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
};

// Normalize species name for comparison
const normalizeSpeciesName = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' '); // Normalize whitespace
};

// Check if two species names are similar enough to be considered a match
const areSpeciesSimilar = (name1, name2, threshold = 0.85) => {
    const normalized1 = normalizeSpeciesName(name1);
    const normalized2 = normalizeSpeciesName(name2);
    
    // Exact match
    if (normalized1 === normalized2) return true;
    
    // Fuzzy match with threshold
    return calculateSimilarity(normalized1, normalized2) >= threshold;
};

// Extract genus from full species name
const extractGenus = (speciesName) => {
    const parts = speciesName.trim().split(' ');
    return parts[0]; // First part is typically the genus
};

// Check if a user answer matches any part of the taxonomic hierarchy
const validateTaxonomicAnswer = (userAnswer, specimen) => {
    const cleaned = userAnswer.toLowerCase().trim();
    const species = specimen.species_name.toLowerCase();
    const genus = specimen.genus.toLowerCase();
    const family = specimen.family.toLowerCase();
    const common = (specimen.common_name || '').toLowerCase();
    
    const results = {
        matchType: 'none',
        score: 0,
        feedback: '',
        isCorrect: false
    };
    
    // Perfect species match
    if (cleaned === species) {
        results.matchType = 'species_exact';
        results.score = 100;
        results.feedback = 'Perfect! Complete species identification!';
        results.isCorrect = true;
    }
    // Fuzzy species match (typos)
    else if (areSpeciesSimilar(cleaned, species)) {
        results.matchType = 'species_fuzzy';
        results.score = 95;
        results.feedback = 'Correct! (Minor spelling variation accepted)';
        results.isCorrect = true;
    }
    // Common name match
    else if (common && cleaned === common) {
        results.matchType = 'common_name';
        results.score = 90;
        results.feedback = 'Correct! You identified it by common name!';
        results.isCorrect = true;
    }
    // Genus + species attempt (but wrong species)
    else if (cleaned.includes(genus) && cleaned.split(' ').length > 1) {
        results.matchType = 'genus_partial';
        results.score = 60;
        results.feedback = `Good! Genus "${specimen.genus}" is correct, but wrong species epithet.`;
        results.isCorrect = false;
    }
    // Genus only
    else if (cleaned === genus) {
        results.matchType = 'genus_only';
        results.score = 50;
        results.feedback = `Partial credit: Genus "${specimen.genus}" is correct. Need full species name.`;
        results.isCorrect = false;
    }
    // Family only
    else if (cleaned === family || cleaned.includes(family)) {
        results.matchType = 'family_only';
        results.score = 30;
        results.feedback = `You identified the family "${specimen.family}". Try to get more specific.`;
        results.isCorrect = false;
    }
    // Fuzzy genus match
    else if (areSpeciesSimilar(cleaned, genus, 0.8)) {
        results.matchType = 'genus_fuzzy';
        results.score = 45;
        results.feedback = `Close! You're thinking of genus "${specimen.genus}". Try the full species name.`;
        results.isCorrect = false;
    }
    // No match
    else {
        results.matchType = 'none';
        results.score = 0;
        results.feedback = 'Not quite. Try using the hints!';
        results.isCorrect = false;
    }
    
    return results;
};

// Calculate final score with hint penalties
const calculateFinalScore = (baseScore, hintsUsed, maxHints = 4) => {
    const hintPenalty = Math.min(hintsUsed * 5, 40); // 5% penalty per hint, max 40%
    return Math.max(baseScore - hintPenalty, 0);
};

// Generate alternative spellings or common variants
const generateVariants = (speciesName) => {
    const variants = [speciesName];
    
    // Add variant with different capitalization
    variants.push(speciesName.toLowerCase());
    variants.push(speciesName.charAt(0).toUpperCase() + speciesName.slice(1).toLowerCase());
    
    // Add variant without special characters
    variants.push(speciesName.replace(/[^\w\s]/g, ''));
    
    // Add variant with normalized spacing
    variants.push(speciesName.replace(/\s+/g, ' ').trim());
    
    return [...new Set(variants)]; // Remove duplicates
};

// Smart species name suggestions
const suggestCorrections = (userAnswer, availableSpecies, maxSuggestions = 3) => {
    const suggestions = availableSpecies
        .map(species => ({
            name: species,
            similarity: calculateSimilarity(userAnswer.toLowerCase(), species.toLowerCase())
        }))
        .filter(item => item.similarity > 0.3) // Only suggest if reasonably similar
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxSuggestions)
        .map(item => item.name);
    
    return suggestions;
};

// Export functions to window for global access
window.FuzzyMatching = {
    calculateLevenshteinDistance,
    calculateSimilarity,
    normalizeSpeciesName,
    areSpeciesSimilar,
    extractGenus,
    validateTaxonomicAnswer,
    calculateFinalScore,
    generateVariants,
    suggestCorrections
};