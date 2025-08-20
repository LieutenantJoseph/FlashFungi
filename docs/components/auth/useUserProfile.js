// useUserProfile.js - User Profile Management Hook (Fixed)
// Flash Fungi - Custom React hook for managing user progress and profile data

(function() {
    'use strict';
    
    window.useUserProfile = function useUserProfile(authUser, getAuthToken) {
        const [userProgress, setUserProgress] = React.useState({});
        const [loading, setLoading] = React.useState(false);
        const [lastSaveError, setLastSaveError] = React.useState(null);
        
        console.log('🔍 useUserProfile called with user:', authUser ? authUser.id : 'no user');

        // Load user progress with better error handling
        const loadUserProgress = React.useCallback(async () => {
            if (!authUser?.id) {
                console.log('🔍 No user ID, skipping user progress load');
                setUserProgress({});
                return;
            }
            
            setLoading(true);
            try {
                const token = getAuthToken();
                console.log('🔍 Loading user progress for user:', authUser.id);
                
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

        // Enhanced save progress function with better error handling and validation
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
            
            setLastSaveError(null);
            
            try {
                const token = getAuthToken();
                console.log('🔍 Saving progress for user:', authUser.id, progressData);

                // Prepare the payload - remove userId as API will use authenticated user
                const payload = {
                    ...progressData
                };
                delete payload.userId; // Remove if it exists to avoid confusion

                const response = await fetch(`/api/user-progress-api`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    console.log('✅ Progress saved successfully');
                    
                    // Refresh progress to get updated data
                    await loadUserProgress();
                    return true;
                } else {
                    const errorText = await response.text();
                    console.warn('⚠️ Failed to save progress:', response.status, errorText);
                    setLastSaveError(`Save failed: ${response.status} - ${errorText}`);
                    return false;
                }
            } catch (error) {
                console.error('❌ Error saving progress:', error);
                setLastSaveError(`Network error: ${error.message}`);
                return false;
            }
        }, [authUser?.id, getAuthToken, loadUserProgress]);

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
            console.log('🔍 useEffect triggered for loadUserProgress');
            loadUserProgress();
        }, [loadUserProgress]);

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
    
    console.log('✅ Fixed useUserProfile hook loaded');
    
})();