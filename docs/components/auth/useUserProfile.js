// useUserProfile.js - User Profile Management Hook (Fixed)
// Flash Fungi - Custom React hook for managing user progress and profile data

(function() {
    'use strict';
    
    window.useUserProfile = function useUserProfile(authUser, getAuthToken) {
        const [userProgress, setUserProgress] = React.useState({});
        
        console.log('🔍 useUserProfile called with user:', authUser ? authUser.id : 'no user');

        // Fixed: Only depend on authUser.id to prevent infinite loop
        const loadUserProgress = React.useCallback(async () => {
            if (!authUser?.id) {
                console.log('🔍 No user ID, skipping user progress load');
                setUserProgress({});
                return;
            }
            
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
                    data.forEach(p => {
                        if (p.module_id) {
                            progressMap[p.module_id] = p;
                        }
                    });
                    setUserProgress(progressMap);
                    console.log('✅ User progress loaded:', Object.keys(progressMap).length, 'items');
                } else {
                    console.warn('⚠️ Failed to load user progress:', response.status);
                    setUserProgress({});
                }
            } catch (error) {
                console.error('❌ Error loading user progress:', error);
                setUserProgress({});
            }
        }, [authUser?.id]); // Only depend on user ID, not the getAuthToken function

        const saveProgress = React.useCallback(async (progressData) => {
            if (!authUser?.id) {
                console.log('🔍 No user ID, cannot save progress');
                return false;
            }
            
            try {
                const token = getAuthToken();
                console.log('🔍 Saving progress for user:', authUser.id, progressData);

                const response = await fetch(`/api/user-progress-api`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        userId: authUser.id,
                        ...progressData
                    })
                });
                
                if (response.ok) {
                    console.log('✅ Progress saved successfully');
                    await loadUserProgress(); // Refresh progress
                    return true;
                } else {
                    console.warn('⚠️ Failed to save progress:', response.status);
                    return false;
                }
            } catch (error) {
                console.error('❌ Error saving progress:', error);
                return false;
            }
        }, [authUser?.id, loadUserProgress]); // Safe to include loadUserProgress since it only depends on user ID

        // Load progress when user changes
        React.useEffect(() => {
            console.log('🔍 useEffect triggered for loadUserProgress');
            loadUserProgress();
        }, [loadUserProgress]);

        return { 
            userProgress, 
            saveProgress, 
            loadUserProgress 
        };
    };
    
    console.log('✅ Fixed useUserProfile hook loaded');
    
})();