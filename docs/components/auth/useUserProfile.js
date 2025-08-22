// useUserProfile.js - User Profile Management Hook with Auth Token Fix
// Flash Fungi - Ensures auth token is available before API calls

(function() {
    'use strict';
    
    window.useUserProfile = function useUserProfile(authUser, getAuthToken) {
        const [userProgress, setUserProgress] = React.useState({});
        const [loading, setLoading] = React.useState(false);
        const [lastSaveError, setLastSaveError] = React.useState(null);
        
        console.log('🔍 useUserProfile called with user:', authUser ? authUser.id : 'no user');

        // Load user progress with token validation
        const loadUserProgress = React.useCallback(async () => {
            if (!authUser?.id) {
                console.log('🔍 No user ID, skipping user progress load');
                setUserProgress({});
                return;
            }
            
            // Wait for token to be available
            let token = getAuthToken ? getAuthToken() : '';
            let retries = 0;
            const maxRetries = 5;
            
            while (!token && retries < maxRetries) {
                console.log(`⏳ Waiting for auth token (attempt ${retries + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                token = getAuthToken ? getAuthToken() : '';
                retries++;
            }
            
            if (!token) {
                console.warn('⚠️ No auth token available after retries, using anon access');
            }
            
            setLoading(true);
            try {
                console.log('🔍 Loading user progress for user:', authUser.id, 'token exists:', !!token);
                
                const response = await fetch(`/api/user-progress-api?userId=${authUser.id}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const progressMap = {};
                    
                    // Create progress maps for both module_id and specimen_id
                    data.forEach(p => {
                        if (p.module_id) {
                            progressMap[p.module_id] = p;
                        }
                        if (p.specimen_id) {
                            progressMap[`specimen_${p.specimen_id}`] = p;
                        }
                        // Also map by progress type for specific lookups
                        if (p.progress_type) {
                            const key = p.module_id ? `${p.progress_type}_${p.module_id}` : 
                                       p.specimen_id ? `${p.progress_type}_specimen_${p.specimen_id}` :
                                       p.progress_type;
                            progressMap[key] = p;
                        }
                    });
                    
                    setUserProgress(progressMap);
                    console.log('✅ User progress loaded:', Object.keys(progressMap).length, 'items');
                } else {
                    console.warn('⚠️ Failed to load user progress:', response.status);
                    const errorText = await response.text();
                    console.warn('Error details:', errorText);
                    setUserProgress({});
                }
            } catch (error) {
                console.error('❌ Error loading user progress:', error);
                setUserProgress({});
            } finally {
                setLoading(false);
            }
        }, [authUser?.id, getAuthToken]);

        // Enhanced save progress with token validation and retry logic
        const saveProgress = React.useCallback(async (progressData) => {
            if (!authUser?.id) {
                console.log('🔍 No user ID, cannot save progress');
                setLastSaveError('User not authenticated');
                return false;
            }

            // Validate required fields
            if (!progressData.progressType) {
                console.error('❌ Missing progressType in save data');
                setLastSaveError('Missing progress type');
                return false;
            }
            
            // Get auth token with retry logic
            let token = getAuthToken ? getAuthToken() : '';
            let retries = 0;
            const maxRetries = 3;
            
            while (!token && retries < maxRetries) {
                console.log(`⏳ Waiting for auth token before save (attempt ${retries + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                token = getAuthToken ? getAuthToken() : '';
                retries++;
            }
            
            if (!token) {
                console.error('❌ Cannot save progress without auth token');
                setLastSaveError('Authentication required to save progress');
                return false;
            }
            
            setLastSaveError(null);
            
            // Try to save with retry on auth failure
            let saveAttempts = 0;
            const maxSaveAttempts = 2;
            
            while (saveAttempts < maxSaveAttempts) {
                try {
                    console.log(`🔍 Saving progress (attempt ${saveAttempts + 1}/${maxSaveAttempts})...`, progressData);

                    // Prepare the payload - remove userId as API will use authenticated user
                    const payload = {
                        ...progressData
                    };
                    delete payload.userId; // Remove if it exists to avoid confusion

                    const response = await fetch(`/api/user-progress-api`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (response.ok) {
                        console.log('✅ Progress saved successfully');
                        
                        // Update local state optimistically
                        const key = progressData.moduleId || 
                                   (progressData.specimenId ? `specimen_${progressData.specimenId}` : null) ||
                                   progressData.progressType;
                        
                        if (key) {
                            setUserProgress(prev => ({
                                ...prev,
                                [key]: {
                                    ...prev[key],
                                    ...progressData,
                                    last_attempted: new Date().toISOString()
                                }
                            }));
                        }
                        
                        return true;
                    } else if (response.status === 401) {
                        // Auth token might be expired, try to refresh
                        console.warn('⚠️ Auth error, attempting to refresh token...');
                        token = getAuthToken ? getAuthToken() : '';
                        
                        if (!token) {
                            throw new Error('Unable to refresh auth token');
                        }
                        
                        saveAttempts++;
                        continue; // Retry with new token
                    } else {
                        const errorText = await response.text();
                        throw new Error(`Save failed: ${response.status} - ${errorText}`);
                    }
                } catch (error) {
                    console.error(`❌ Save attempt ${saveAttempts + 1} failed:`, error);
                    
                    if (saveAttempts === maxSaveAttempts - 1) {
                        // Final attempt failed
                        setLastSaveError(error.message);
                        return false;
                    }
                    
                    saveAttempts++;
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            return false;
        }, [authUser?.id, getAuthToken]);

        // Helper function to get progress for a specific item
        const getProgress = React.useCallback((key) => {
            return userProgress[key] || null;
        }, [userProgress]);

        // Helper function to check if a module/specimen is completed
        const isCompleted = React.useCallback((key) => {
            const progress = getProgress(key);
            return progress?.completed === true;
        }, [getProgress]);

        // Helper function to get score for a specific item
        const getScore = React.useCallback((key) => {
            const progress = getProgress(key);
            return progress?.score || 0;
        }, [getProgress]);

        // Load progress when user changes
        React.useEffect(() => {
            if (authUser?.id) {
                console.log('🔍 User changed, loading progress...');
                loadUserProgress();
            }
        }, [authUser?.id, loadUserProgress]);

        return { 
            userProgress, 
            saveProgress, 
            loadUserProgress,
            getProgress,
            isCompleted,
            getScore,
            loading,
            lastSaveError
        };
    };
    
    console.log('✅ Fixed useUserProfile hook loaded with auth token validation');
    
})();