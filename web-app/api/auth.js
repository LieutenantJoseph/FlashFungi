// /api/auth.js - Updated to use Supabase Auth
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oxgedcncrettasrbmwsl.supabase.co';
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
    console.error('[Auth API] Supabase keys not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { action, email, password, username, displayName } = req.body;

  // Use anon key for auth operations
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Use service key for database operations
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    switch (action) {
      case 'register':
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password required' });
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
              display_name: displayName || username || email.split('@')[0]
            }
          }
        });

        if (signUpError) {
          return res.status(400).json({ 
            error: signUpError.message,
            success: false 
          });
        }

        // Create user profile in database
        if (signUpData.user) {
          await supabaseAdmin.from('user_profiles').insert({
            id: signUpData.user.id,
            email: signUpData.user.email,
            username: username || email.split('@')[0],
            display_name: displayName || username || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        return res.status(201).json({ 
          success: true, 
          user: signUpData.user,
          session: signUpData.session
        });

      case 'login':
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password required' });
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          return res.status(401).json({ 
            error: signInError.message,
            success: false 
          });
        }

        // Update last login
        if (signInData.user) {
          await supabaseAdmin
            .from('user_profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', signInData.user.id);
        }

        return res.status(200).json({
          success: true,
          user: signInData.user,
          session: signInData.session
        });

      case 'logout':
        // Client-side handles this
        return res.status(200).json({ success: true });

      case 'refresh':
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
          return res.status(400).json({ error: 'Refresh token required' });
        }

        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken
        });

        if (refreshError) {
          return res.status(401).json({ 
            error: refreshError.message,
            success: false 
          });
        }

        return res.status(200).json({
          success: true,
          session: refreshData.session
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('[Auth API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}