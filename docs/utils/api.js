// api.js - Enhanced API Utilities for Flash Fungi
// Comprehensive data management and API communication

(function() {
    'use strict';
    
    // Enhanced API utilities with error handling and caching
    window.FlashFungiAPI = {
        // Cache for reducing API calls
        cache: new Map(),
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        
        // Get cached data or fetch new
        async getCached(key, fetchFn, timeout = this.cacheTimeout) {
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < timeout) {
                console.log(`📋 Using cached data for: ${key}`);
                return cached.data;
            }
            
            console.log(`🔄 Fetching fresh data for: ${key}`);
            const data = await fetchFn();
            this.cache.set(key, {
                data: data,
                timestamp: Date.now()
            });
            return data;
        },
        
        // Clear cache for specific key or all
        clearCache(key = null) {
            if (key) {
                this.cache.delete(key);
                console.log(`🗑️ Cleared cache for: ${key}`);
            } else {
                this.cache.clear();
                console.log('🗑️ Cleared all cache');
            }
        },

        // Load specimens with enhanced filtering and sorting
        async loadSpecimens(filters = {}) {
            const cacheKey = `specimens_${JSON.stringify(filters)}`;
            
            return this.getCached(cacheKey, async () => {
                try {
                    const { status = 'approved', limit = 10000, sortBy = 'created_at', sortOrder = 'desc' } = filters;
                    
                    let query = `select=*&order=${sortBy}.${sortOrder}`;
                    if (limit) query += `&limit=${limit}`;
                    if (status) query += `&status=eq.${status}`;
                    
                    const response = await fetch(
                        `${window.SUPABASE_URL}/rest/v1/specimens?${query}`,
                        {
                            headers: {
                                'apikey': window.SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                            }
                        }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Specimens loaded:', data.length);
                        return data;
                    } else {
                        throw new Error(`Failed to load specimens: ${response.status}`);
                    }
                } catch (error) {
                    console.error('❌ Error loading specimens:', error);
                    throw error;
                }
            });
        },

        // Load species hints with caching
        async loadSpeciesHints() {
            return this.getCached('species_hints', async () => {
                try {
                    // Load from field_guides table instead of species_hints
                    const response = await fetch(
                        `${window.SUPABASE_URL}/rest/v1/field_guides?select=*`,
                        {
                            headers: {
                                'apikey': window.SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                            }
                        }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Field guides with hints loaded:', data.length);
                        
                        // Convert field_guides to the expected hints format
                        const hintsMap = {};
                        data.forEach(guide => {
                            if (guide.species_name && guide.hints) {
                                hintsMap[guide.species_name] = {
                                    species_name: guide.species_name,
                                    hints: guide.hints,
                                    description: guide.description,
                                    ecology: guide.ecology
                                };
                            }
                        });
                        
                        console.log('📚 Species with hints:', Object.keys(hintsMap).length);
                        return hintsMap;
                    } else {
                        // Return empty object if fetch fails (non-blocking)
                        console.warn('⚠️ Could not load field guides, using empty hints');
                        return {};
                    }
                } catch (error) {
                    console.error('❌ Error loading field guides for hints:', error);
                    // Return empty object instead of throwing to prevent app crash
                    return {};
                }
            });
        },

        // Load field guides for reference photos
        async loadFieldGuides() {
            return this.getCached('field_guides', async () => {
                try {
                    const response = await fetch(
                        `${window.SUPABASE_URL}/rest/v1/field_guides?select=*`,
                        {
                            headers: {
                                'apikey': window.SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                            }
                        }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Field guides loaded:', data.length);
                        
                        // Convert to reference photos map
                        const photosMap = {};
                        data.forEach(guide => {
                            if (guide.reference_photos && guide.reference_photos.length > 0) {
                                photosMap[guide.species_name] = guide.reference_photos;
                            }
                        });
                        return photosMap;
                    } else {
                        throw new Error(`Failed to load field guides: ${response.status}`);
                    }
                } catch (error) {
                    console.error('❌ Error loading field guides:', error);
                    throw error;
                }
            });
        },

        // Load user progress with enhanced error handling
        async loadUserProgress(userId, getAuthToken) {
            if (!userId) {
                console.log('🔍 No user ID, skipping user progress load');
                return {};
            }
            
            const cacheKey = `user_progress_${userId}`;
            
            return this.getCached(cacheKey, async () => {
                const token = getAuthToken();
                console.log('🔍 Loading user progress for user:', userId);
                
                try {
                    const response = await fetch(`/api/user-progress-api?userId=${userId}`, {
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const progressMap = {};
                        data.forEach(p => {
                            if (p.module_id) {
                                progressMap[p.module_id] = p;
                            }
                        });
                        console.log('✅ User progress loaded:', Object.keys(progressMap).length, 'entries');
                        return progressMap;
                    } else {
                        throw new Error(`Failed to load user progress: ${response.status}`);
                    }
                } catch (error) {
                    console.error('❌ Error loading user progress:', error);
                    return {};
                }
            }, 30 * 1000); // Cache for 30 seconds only
        },

        // Save user progress with optimistic updates
        async saveUserProgress(userId, progressData, getAuthToken) {
            if (!userId) return false;
            
            const token = getAuthToken();
            
            try {
                console.log('💾 Saving user progress:', progressData);
                
                const response = await fetch(`/api/user-progress-api`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        userId: userId,
                        ...progressData
                    })
                });
                
                if (response.ok) {
                    console.log('✅ User progress saved successfully');
                    // Clear cache to force refresh on next load
                    this.clearCache(`user_progress_${userId}`);
                    return true;
                } else {
                    throw new Error(`Failed to save user progress: ${response.status}`);
                }
            } catch (error) {
                console.error('❌ Error saving user progress:', error);
                return false;
            }
        },

        // Load specimen photos from iNaturalist with caching
        async loadSpecimenPhotos(inaturalistId) {
            const cacheKey = `specimen_photos_${inaturalistId}`;
            
            return this.getCached(cacheKey, async () => {
                try {
                    console.log('📸 Loading photos for specimen:', inaturalistId);
                    
                    const response = await fetch(`https://api.inaturalist.org/v1/observations/${inaturalistId}`);
                    const data = await response.json();
                    
                    if (data.results && data.results[0] && data.results[0].photos) {
                        const photos = data.results[0].photos.map(photo => ({
                            id: photo.id,
                            url: photo.url,
                            medium_url: photo.url.replace('square', 'medium'),
                            large_url: photo.url.replace('square', 'large'),
                            attribution: photo.attribution
                        }));
                        
                        console.log('✅ Photos loaded for specimen:', inaturalistId, photos.length, 'photos');
                        return photos;
                    }
                    
                    return [];
                } catch (error) {
                    console.error(`❌ Error loading photos for ${inaturalistId}:`, error);
                    return [];
                }
            }, 60 * 60 * 1000); // Cache photos for 1 hour
        },

        // Batch load multiple specimen photos
        async loadMultipleSpecimenPhotos(inaturalistIds) {
            console.log('📸 Batch loading photos for', inaturalistIds.length, 'specimens');
            
            const promises = inaturalistIds.map(id => this.loadSpecimenPhotos(id));
            const results = await Promise.allSettled(promises);
            
            const photosMap = {};
            results.forEach((result, index) => {
                const id = inaturalistIds[index];
                if (result.status === 'fulfilled') {
                    photosMap[id] = result.value;
                } else {
                    console.error(`Failed to load photos for ${id}:`, result.reason);
                    photosMap[id] = [];
                }
            });
            
            return photosMap;
        },

        // Get database statistics
        async getStatistics() {
            return this.getCached('statistics', async () => {
                try {
                    console.log('📊 Loading database statistics...');
                    
                    const [specimens, speciesHints, fieldGuides] = await Promise.all([
                        this.loadSpecimens(),
                        this.loadSpeciesHints(),
                        this.loadFieldGuides()
                    ]);
                    
                    const stats = {
                        totalSpecimens: specimens.length,
                        approvedSpecimens: specimens.filter(s => s.status === 'approved').length,
                        dnaVerified: specimens.filter(s => s.dna_sequenced).length,
                        uniqueSpecies: new Set(specimens.map(s => s.species_name)).size,
                        uniqueGenera: new Set(specimens.map(s => s.genus)).size,
                        uniqueFamilies: new Set(specimens.map(s => s.family)).size,
                        speciesWithHints: Object.keys(speciesHints).length,
                        speciesWithReferencePhotos: Object.keys(fieldGuides).length
                    };
                    
                    console.log('✅ Statistics loaded:', stats);
                    return stats;
                } catch (error) {
                    console.error('❌ Error loading statistics:', error);
                    return {
                        totalSpecimens: 0,
                        approvedSpecimens: 0,
                        dnaVerified: 0,
                        uniqueSpecies: 0,
                        uniqueGenera: 0,
                        uniqueFamilies: 0,
                        speciesWithHints: 0,
                        speciesWithReferencePhotos: 0
                    };
                }
            });
        },

        // Preload critical data for faster app startup
        async preloadCriticalData() {
            console.log('🚀 Preloading critical application data...');
            
            try {
                const startTime = performance.now();
                
                // Load in parallel for faster startup
                await Promise.all([
                    this.loadSpecimens({ limit: 100 }), // Load first 100 specimens
                    this.loadSpeciesHints(),
                    this.loadFieldGuides()
                ]);
                
                const endTime = performance.now();
                console.log(`✅ Critical data preloaded in ${Math.round(endTime - startTime)}ms`);
            } catch (error) {
                console.error('❌ Error preloading critical data:', error);
            }
        },

        // Health check for API connectivity
        async healthCheck() {
            try {
                const response = await fetch(`${window.SUPABASE_URL}/rest/v1/`, {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                    }
                });
                
                const isHealthy = response.ok;
                console.log('🏥 API Health Check:', isHealthy ? 'HEALTHY' : 'UNHEALTHY');
                return isHealthy;
            } catch (error) {
                console.error('❌ API Health Check failed:', error);
                return false;
            }
        }
    };
    
    // Initialize API utilities
    console.log('✅ Enhanced FlashFungiAPI utilities loaded');
    
    // Perform health check on load
    window.FlashFungiAPI.healthCheck();
    
})();