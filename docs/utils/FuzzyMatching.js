// fuzzyMatching.js - Enhanced Fuzzy Matching Utilities
// Flash Fungi - Advanced text matching for answer validation

(function() {
    'use strict';
    
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

    // Enhanced answer validation with fuzzy matching and scoring
    const validateSpeciesAnswer = (userAnswer, specimen) => {
        if (!userAnswer || !specimen) return { isCorrect: false, score: 0, feedback: '' };
        
        const cleaned = userAnswer.toLowerCase().trim();
        const species = specimen.species_name.toLowerCase();
        const genus = specimen.genus.toLowerCase();
        const family = specimen.family.toLowerCase();
        const common = (specimen.common_name || '').toLowerCase();
        
        // Calculate base score based on match type
        let baseScore = 0;
        let feedback = '';
        let isCorrect = false;
        
        // Perfect species match
        if (cleaned === species) {
            baseScore = 100;
            feedback = 'Perfect! Complete species identification!';
            isCorrect = true;
        }
        // Fuzzy species match (typos)
        else if (calculateSimilarity(cleaned, species) > 0.85) {
            baseScore = 95;
            feedback = 'Correct! (Minor spelling variation accepted)';
            isCorrect = true;
        }
        // Common name match
        else if (common && cleaned === common) {
            baseScore = 90;
            feedback = 'Correct! You identified it by common name!';
            isCorrect = true;
        }
        // Fuzzy common name match
        else if (common && calculateSimilarity(cleaned, common) > 0.85) {
            baseScore = 85;
            feedback = 'Correct! Common name with minor spelling variation!';
            isCorrect = true;
        }
        // Genus + wrong species
        else if (cleaned.includes(genus) && cleaned.split(' ').length > 1) {
            baseScore = 60;
            feedback = `Good! Genus "${specimen.genus}" is correct, but wrong species epithet.`;
        }
        // Genus only
        else if (cleaned === genus) {
            baseScore = 50;
            feedback = `Partial credit: Genus "${specimen.genus}" is correct. Need full species name.`;
        }
        // Fuzzy genus match
        else if (calculateSimilarity(cleaned, genus) > 0.8) {
            baseScore = 45;
            feedback = `Close! You're near the genus "${specimen.genus}". Check spelling.`;
        }
        // Family only
        else if (cleaned === family || cleaned.includes(family)) {
            baseScore = 30;
            feedback = `You identified the family "${specimen.family}". Try to get more specific.`;
        }
        // Fuzzy family match
        else if (calculateSimilarity(cleaned, family) > 0.8) {
            baseScore = 25;
            feedback = `You're close to the family "${specimen.family}". Try to be more specific.`;
        }
        // No match
        else {
            baseScore = 0;
            feedback = 'Not quite. Try using the hints!';
        }
        
        return {
            isCorrect: isCorrect,
            baseScore: baseScore,
            feedback: feedback
        };
    };

    // Calculate final score with hint penalty
    const calculateFinalScore = (baseScore, hintsUsed) => {
        // Apply hint penalty (-5% per hint used)
        const hintPenalty = Math.min(hintsUsed * 5, 40); // Max 40% penalty
        const finalScore = Math.max(baseScore - hintPenalty, 0);
        
        return {
            finalScore: finalScore,
            hintPenalty: hintPenalty
        };
    };

    // Normalize text for comparison
    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' '); // Normalize whitespace
    };

    // Check if answer contains specific terms
    const containsTerms = (answer, terms) => {
        const normalizedAnswer = normalizeText(answer);
        return terms.some(term => 
            normalizedAnswer.includes(normalizeText(term))
        );
    };

    // Get similarity score between two normalized strings
    const getSimilarityScore = (str1, str2, threshold = 0.8) => {
        const similarity = calculateSimilarity(
            normalizeText(str1), 
            normalizeText(str2)
        );
        return {
            similarity: similarity,
            isMatch: similarity >= threshold
        };
    };

    // Advanced species name parsing
    const parseSpeciesName = (input) => {
        const cleaned = normalizeText(input);
        const parts = cleaned.split(' ');
        
        if (parts.length >= 2) {
            return {
                genus: parts[0],
                species: parts.slice(1).join(' '),
                fullName: cleaned,
                hasGenus: true,
                hasSpecies: true
            };
        } else if (parts.length === 1) {
            return {
                genus: parts[0],
                species: '',
                fullName: cleaned,
                hasGenus: true,
                hasSpecies: false
            };
        } else {
            return {
                genus: '',
                species: '',
                fullName: cleaned,
                hasGenus: false,
                hasSpecies: false
            };
        }
    };

    // Export functions to global scope
    window.FuzzyMatching = {
        calculateLevenshteinDistance,
        calculateSimilarity,
        validateSpeciesAnswer,
        calculateFinalScore,
        normalizeText,
        containsTerms,
        getSimilarityScore,
        parseSpeciesName
    };
    
    console.log('✅ Enhanced Fuzzy Matching utilities loaded');
    
})();