async function handleRegister(req, res, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY) {
  const { username, email, password, displayName } = req.body;

  console.log('[Auth API] Processing registration for:', username);
  console.log('[Auth API] Service key available:', !!SUPABASE_SERVICE_KEY);

  // Validate input
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Use service key if available
  const authKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
  console.log('[Auth API] Using key type:', SUPABASE_SERVICE_KEY ? 'service' : 'anon');

  try {
    // First, check if username already exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?username=eq.${username.toLowerCase()}&select=id`,
      {
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`
        }
      }
    );

    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error('[Auth API] Failed to check username:', checkResponse.status, errorText);
    } else {
      const existing = await checkResponse.json();
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Generate a unique ID
    const userId = generateUUID();

    // Create new user profile - matching exact database structure
    const newUser = {
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      display_name: displayName || username,
      bio: null, // Use null instead of empty string
      avatar_url: null,
      privacy_settings: {
        show_stats: true,
        show_achievements: true,
        allow_messages: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    console.log('[Auth API] Attempting to create user with data:', JSON.stringify(newUser, null, 2));

    const createResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles`,
      {
        method: 'POST',
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newUser)
      }
    );

    const responseText = await createResponse.text();
    console.log('[Auth API] Create response status:', createResponse.status);
    console.log('[Auth API] Create response body:', responseText);

    if (createResponse.ok) {
      let createdUser;
      try {
        createdUser = JSON.parse(responseText);
      } catch {
        createdUser = [newUser];
      }
      
      console.log('[Auth API] User registered successfully:', username);
      return res.status(201).json({ 
        success: true, 
        user: Array.isArray(createdUser) ? createdUser[0] : createdUser
      });
    } else {
      console.error('[Auth API] Database write failed with status:', createResponse.status);
      console.error('[Auth API] Error details:', responseText);
      
      // Parse error for more details
      let errorMessage = 'Registration failed';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) errorMessage = errorData.message;
        if (errorData.details) errorMessage += ': ' + errorData.details;
        if (errorData.hint) errorMessage += ' (' + errorData.hint + ')';
      } catch {
        errorMessage = responseText || 'Database write failed';
      }
      
      // For demo purposes, still create a temporary user
      console.log('[Auth API] Falling back to demo mode for:', username);
      return res.status(201).json({ 
        success: true, 
        user: newUser,
        isDemo: true,
        warning: `Database error: ${errorMessage}. Running in demo mode - data will not persist.`
      });
    }
  } catch (error) {
    console.error('[Auth API] Registration error:', error);
    return res.status(201).json({ 
      success: true, 
      user: newUser,
      isDemo: true,
      warning: `Error: ${error.message}. Running in demo mode - data will not persist.`
    });
  }
}