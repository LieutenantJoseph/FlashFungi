// web-app/api/auth.js
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

  const { action, username, email, password, displayName, userId, updates } = req.body;

  // For demo/testing - simplified auth that always works
  try {
    switch (action) {
      case 'register':
        // Create a demo user
        const newUser = {
          id: generateUUID(),
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          display_name: displayName || username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('[Auth API] Demo registration for:', username);
        return res.status(201).json({ 
          success: true, 
          user: newUser,
          isDemo: true 
        });

      case 'login':
        // Accept any login for demo
        const loginUser = {
          id: generateUUID(),
          username: username.toLowerCase(),
          email: `${username}@flashfungi.com`,
          display_name: username,
          created_at: new Date().toISOString()
        };
        
        console.log('[Auth API] Demo login for:', username);
        return res.status(200).json({
          success: true,
          user: loginUser,
          isDemo: true
        });

      case 'update_login':
        return res.status(200).json({ success: true });

      case 'update_profile':
        return res.status(200).json({ success: true });

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

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}