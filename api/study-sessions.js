// Study Sessions API - Marathon Mode Session Persistence
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
                return await getSession(req, res);
            case 'POST':
                return await saveSession(req, res);
            case 'PUT':
                return await updateSession(req, res);
            case 'DELETE':
                return await deleteSession(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Study sessions API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// Get active session for user
async function getSession(req, res) {
    const { userId, mode } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    const query = supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);
    
    if (mode) {
        query.eq('mode', mode);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false }).limit(1);
    
    if (error) {
        console.error('Error fetching session:', error);
        return res.status(500).json({ error: 'Failed to fetch session' });
    }
    
    const session = data.length > 0 ? data[0] : null;
    
    return res.status(200).json({ 
        session: session?.session_data || null,
        sessionId: session?.id || null
    });
}

// Save new session or update existing
async function saveSession(req, res) {
    const { userId, mode, sessionData } = req.body;
    
    if (!userId || !mode || !sessionData) {
        return res.status(400).json({ 
            error: 'Missing required fields: userId, mode, sessionData' 
        });
    }
    
    // First, deactivate any existing active sessions for this user and mode
    const { error: deactivateError } = await supabase
        .from('study_sessions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('mode', mode)
        .eq('is_active', true);
    
    if (deactivateError) {
        console.error('Error deactivating sessions:', deactivateError);
    }
    
    // Create new session
    const sessionRecord = {
        user_id: userId,
        mode: mode,
        session_data: sessionData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
        .from('study_sessions')
        .insert([sessionRecord])
        .select()
        .single();
    
    if (error) {
        console.error('Error saving session:', error);
        return res.status(500).json({ error: 'Failed to save session' });
    }
    
    return res.status(201).json({ 
        success: true,
        sessionId: data.id,
        message: 'Session saved successfully' 
    });
}

// Update existing session
async function updateSession(req, res) {
    const { sessionId, sessionData } = req.body;
    
    if (!sessionId || !sessionData) {
        return res.status(400).json({ 
            error: 'Missing required fields: sessionId, sessionData' 
        });
    }
    
    const { data, error } = await supabase
        .from('study_sessions')
        .update({ 
            session_data: sessionData,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating session:', error);
        return res.status(500).json({ error: 'Failed to update session' });
    }
    
    return res.status(200).json({ 
        success: true,
        message: 'Session updated successfully' 
    });
}

// Delete/end session
async function deleteSession(req, res) {
    const { sessionId } = req.query;
    
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const { error } = await supabase
        .from('study_sessions')
        .update({ 
            is_active: false,
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    
    if (error) {
        console.error('Error ending session:', error);
        return res.status(500).json({ error: 'Failed to end session' });
    }
    
    return res.status(200).json({ 
        success: true,
        message: 'Session ended successfully' 
    });
}