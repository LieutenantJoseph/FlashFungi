// Flash Fungi - User Profile Management Hook
// Custom React hook for managing user progress and profile data

window.useUserProfile = function useUserProfile(authUser, getAuthToken) {
    const [userProgress, setUserProgress] = React.useState({});
    
    console.log('🔍 useUserProfile called with user:', authUser ? authUser.id : 'no user');

    const loadUserProgress = React.useCallback(async () => {
        try {
            const progress = await window.FlashFungiAPI.loadUserProgress(authUser?.id, getAuthToken);
            setUserProgress(progress);
        } catch (error) {
            console.error('❌ Error loading user progress:', error);
            setUserProgress({});
        }
    }, [authUser, getAuthToken]);

    const saveProgress = React.useCallback(async (progressData) => {
        if (!authUser?.id) return false;
        
        try {
            const success = await window.FlashFungiAPI.saveUserProgress(authUser.id, progressData, getAuthToken);
            
            if (success) {
                await loadUserProgress();
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error saving progress:', error);
            return false;
        }
    }, [authUser, loadUserProgress, getAuthToken]);

    React.useEffect(() => {
        loadUserProgress();
    }, [loadUserProgress]);

    return { userProgress, saveProgress, loadUserProgress };
};

console.log('✅ useUserProfile hook loaded');