// Flash Fungi - Fuzzy Matching Utilities
// Utilities for fuzzy string matching and answer validation

window.FuzzyMatching = {
    // Calculate Levenshtein distance between two strings
    calculateLevenshteinDistance(str1, str2) {
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
    },

    // Calculate similarity score between two strings
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.calculateLevenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    },

    // Enhanced answer validation with fuzzy matching and scoring
    validateAnswer(answer, specimen) {
        if (!answer || !specimen) return { isCorrect: false, score: 0, feedback: '' };
        
        const cleaned = answer.toLowerCase().trim();
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
        else if (this.calculateSimilarity(cleaned, species) > 0.85) {
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
        // Family only
        else if (cleaned === family || cleaned.includes(family)) {
            baseScore = 30;
            feedback = `You identified the family "${specimen.family}". Try to get more specific.`;
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
    },

    // Apply hint penalty to score
    applyHintPenalty(baseScore, totalHintsUsed) {
        // Apply hint penalty (-5% per hint used)
        const hintPenalty = Math.min(totalHintsUsed * 5, 40); // Max 40% penalty
        const finalScore = Math.max(baseScore - hintPenalty, 0);
        
        return {
            finalScore: finalScore,
            hintPenalty: hintPenalty
        };
    }
};

console.log('✅ Fuzzy matching utilities loaded');