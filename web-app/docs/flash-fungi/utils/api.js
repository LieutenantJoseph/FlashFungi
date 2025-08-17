// Flash Fungi - API Utilities
// Centralized API functions for data fetching

window.FlashFungiAPI = {
    // Load specimens from Supabase
    async loadSpecimens() {
        console.log('🔍 Fetching specimens...');
        try {
            const response = await fetch(`${window.FLASH_FUNGI_CONFIG.SUPABASE.URL}/rest/v1/specimens?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY,
                    'Authorization': `Bearer ${window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY}`
                }
            });
            
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
    },

    // Load species hints from Supabase
    async loadSpeciesHints() {
        console.log('🔍 Fetching species hints...');
        try {
            const response = await fetch(`${window.FLASH_FUNGI_CONFIG.SUPABASE.URL}/rest/v1/species_hints?select=*`, {
                headers: {
                    'apikey': window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY,
                    'Authorization': `Bearer ${window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Species hints loaded:', data.length);
                
                // Convert to map for easier lookup
                const hintsMap = {};
                data.forEach(hint => {
                    hintsMap[hint.species_name] = hint;
                });
                return hintsMap;
            } else {
                throw new Error(`Failed to load species hints: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading species hints:', error);
            throw error;
        }
    },

    // Load field guides (for reference photos)
    async loadFieldGuides() {
        console.log('🔍 Fetching field guides...');
        try {
            const response = await fetch(`${window.FLASH_FUNGI_CONFIG.SUPABASE.URL}/rest/v1/field_guides?select=*`, {
                headers: {
                    'apikey': window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY,
                    'Authorization': `Bearer ${window.FLASH_FUNGI_CONFIG.SUPABASE.ANON_KEY}`
                }
            });
            
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
    },

    // Load user progress
    async loadUserProgress(userId, getAuthToken) {
        if (!userId) {
            console.log('🔍 No user ID, skipping user progress load');
            return {};
        }
        
        const token = getAuthToken();
        console.log('🔍 Loading user progress for user:', userId);
        
        try {
            const response = await fetch(`${window.FLASH_FUNGI_CONFIG.API.BASE}/user-progress-api?userId=${userId}`, {
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
                return progressMap;
            } else {
                throw new Error(`Failed to load user progress: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading user progress:', error);
            return {};
        }
    },

    // Save user progress
    async saveUserProgress(userId, progressData, getAuthToken) {
        if (!userId) return false;
        
        const token = getAuthToken();
        
        try {
            const response = await fetch(`${window.FLASH_FUNGI_CONFIG.API.BASE}/user-progress-api`, {
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
            
            return response.ok;
        } catch (error) {
            console.error('❌ Error saving progress:', error);
            return false;
        }
    },

    // Load specimen photos from iNaturalist
    async loadSpecimenPhotos(inaturalistId) {
        try {
            const response = await fetch(`${window.FLASH_FUNGI_CONFIG.INATURALIST.BASE_URL}/observations/${inaturalistId}`);
            const data = await response.json();
            
            if (data.results && data.results[0] && data.results[0].photos) {
                const photos = data.results[0].photos.map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    medium_url: photo.url.replace('square', 'medium'),
                    large_url: photo.url.replace('square', 'large')
                }));
                
                return photos;
            }
            return [];
        } catch (error) {
            console.error(`❌ Error loading photos for ${inaturalistId}:`, error);
            return [];
        }
    }
};

console.log('✅ Flash Fungi API utilities loaded');