// Achievements API - User Achievement Management
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    const { method } = req;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        switch (method) {
            case 'GET':
                return await getUserAchievements(req, res);
            case 'POST':
                return await awardAchievement(req, res);
            case 'PUT':
                return await updateAchievementProgress(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Achievements API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// Get user achievements
async function getUserAchievements(req, res) {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's achievements
    const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);
    
    if (userError) {
        console.error('Error fetching user achievements:', userError);
        return res.status(500).json({ error: 'Failed to fetch achievements' });
    }
    
    // Get all available achievements
    const { data: allAchievements, error: allError } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });
    
    if (allError) {
        console.error('Error fetching all achievements:', allError);
        return res.status(500).json({ error: 'Failed to fetch achievement definitions' });
    }
    
    // Merge user progress with achievement definitions
    const mergedAchievements = allAchievements.map(achievement => {
        const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
        return {
            ...achievement,
            earned: userAchievement?.earned || false,
            earned_at: userAchievement?.earned_at || null,
            progress: userAchievement?.progress || 0
        };
    });
    
    return res.status(200).json(mergedAchievements);
}

// Award achievement to user
async function awardAchievement(req, res) {
    const { userId, achievementId, progress = 100 } = req.body;
    
    if (!userId || !achievementId) {
        return res.status(400).json({ 
            error: 'Missing required fields: userId, achievementId' 
        });
    }
    
    // Check if achievement exists
    const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
    
    if (achievementError || !achievement) {
        return res.status(404).json({ error: 'Achievement not found' });
    }
    
    // Check if user already has this achievement
    const { data: existing, error: existingError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();
    
    const isEarned = progress >= 100;
    const now = new Date().toISOString();
    
    if (existing) {
        // Update existing record
        const updateData = {
            progress: progress,
            updated_at: now
        };
        
        if (isEarned && !existing.earned) {
            updateData.earned = true;
            updateData.earned_at = now;
        }
        
        const { data, error } = await supabase
            .from('user_achievements')
            .update(updateData)
            .eq('id', existing.id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating achievement:', error);
            return res.status(500).json({ error: 'Failed to update achievement' });
        }
        
        // Award points if newly earned
        if (isEarned && !existing.earned && achievement.points) {
            await awardPoints(userId, achievement.points);
        }
        
        return res.status(200).json({ 
            success: true,
            achievement: data,
            pointsAwarded: (isEarned && !existing.earned) ? achievement.points : 0,
            message: isEarned ? 'Achievement earned!' : 'Progress updated'
        });
    } else {
        // Create new record
        const newRecord = {
            user_id: userId,
            achievement_id: achievementId,
            earned: isEarned,
            earned_at: isEarned ? now : null,
            progress: progress,
            created_at: now,
            updated_at: now
        };
        
        const { data, error } = await supabase
            .from('user_achievements')
            .insert([newRecord])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating achievement:', error);
            return res.status(500).json({ error: 'Failed to create achievement' });
        }
        
        // Award points if earned
        if (isEarned && achievement.points) {
            await awardPoints(userId, achievement.points);
        }
        
        return res.status(201).json({ 
            success: true,
            achievement: data,
            pointsAwarded: isEarned ? achievement.points : 0,
            message: isEarned ? 'Achievement earned!' : 'Progress tracked'
        });
    }
}

// Update achievement progress
async function updateAchievementProgress(req, res) {
    const { userId, achievementId, progress } = req.body;
    
    if (!userId || !achievementId || progress === undefined) {
        return res.status(400).json({ 
            error: 'Missing required fields: userId, achievementId, progress' 
        });
    }
    
    const { data, error } = await supabase
        .from('user_achievements')
        .update({ 
            progress: Math.min(progress, 100),
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating progress:', error);
        return res.status(500).json({ error: 'Failed to update progress' });
    }
    
    return res.status(200).json({ 
        success: true,
        achievement: data,
        message: 'Progress updated successfully' 
    });
}

// Helper function to award points to user
async function awardPoints(userId, points) {
    try {
        // Update user profile points
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('total_points')
            .eq('user_id', userId)
            .single();
        
        if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return;
        }
        
        const newTotal = (profile?.total_points || 0) + points;
        
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ 
                total_points: newTotal,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        
        if (updateError) {
            console.error('Error updating user points:', updateError);
        }
    } catch (error) {
        console.error('Error awarding points:', error);
    }
}