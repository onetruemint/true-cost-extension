/**
 * True Cost Calculator - Backend Proxy Server
 * Securely proxies requests between the Chrome extension and Supabase
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// Middleware
app.use(express.json());

// CORS configuration - allow extension origins
const allowedOrigins = [
  /^chrome-extension:\/\//,
  /^moz-extension:\/\//,
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check against allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Helper: Extract and verify JWT from Authorization header
async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
    if (error) throw error;
    return { user, token };
  } catch (e) {
    return null;
  }
}

// Helper: Create authenticated Supabase client for user
function getSupabaseForUser(token) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// ============ Auth Routes ============

// Sign up with email/password
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in with email/password
app.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh session
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const { data, error } = await supabaseAnon.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out
app.post('/auth/signout', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (auth) {
      const supabase = getSupabaseForUser(auth.token);
      await supabase.auth.signOut();
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/auth/user', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: auth.user });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Google OAuth URL
app.get('/auth/google/url', (req, res) => {
  const { redirect_to } = req.query;

  if (!redirect_to) {
    return res.status(400).json({ error: 'redirect_to required' });
  }

  // Build the OAuth URL - the extension will open this
  const params = new URLSearchParams({
    provider: 'google',
    redirect_to: redirect_to
  });

  const authUrl = `${SUPABASE_URL}/auth/v1/authorize?${params.toString()}`;
  res.json({ url: authUrl });
});

// Exchange OAuth tokens (called after OAuth redirect)
app.post('/auth/google/callback', async (req, res) => {
  try {
    const { access_token, refresh_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token required' });
    }

    // Verify the token and get user
    const { data: { user }, error } = await supabaseAnon.auth.getUser(access_token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      user,
      session: {
        access_token,
        refresh_token
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ Settings Routes ============

// Get user settings
app.get('/settings', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const supabase = getSupabaseForUser(auth.token);
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      return res.status(400).json({ error: error.message });
    }

    res.json({ settings: data || null });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user settings
app.post('/settings', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { enabled, confirm_before_purchase, return_rate, years, min_price } = req.body;

    const supabase = getSupabaseForUser(auth.token);
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: auth.user.id,
        enabled,
        confirm_before_purchase,
        return_rate,
        years,
        min_price
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ settings: data });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ Question Variants Routes ============

// Get active question variants
app.get('/variants', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const supabase = getSupabaseForUser(auth.token);
    const { data, error } = await supabase
      .from('question_variants')
      .select('*')
      .eq('is_active', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ variants: data });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get effectiveness stats for user
app.get('/variants/effectiveness', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const supabase = getSupabaseForUser(auth.token);
    const { data, error } = await supabase
      .from('question_effectiveness')
      .select('*, question_variants(question_text, subtext)')
      .eq('user_id', auth.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ effectiveness: data });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ Savings Routes ============

// Record a saving/purchase decision
app.post('/savings', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      price,
      currency,
      url,
      product_title,
      question_variant_id,
      user_response,
      final_decision
    } = req.body;

    if (!price || !final_decision) {
      return res.status(400).json({ error: 'Price and final_decision required' });
    }

    const supabase = getSupabaseForUser(auth.token);

    // Insert saving record
    const { data: saving, error: savingError } = await supabase
      .from('savings')
      .insert({
        user_id: auth.user.id,
        price,
        currency: currency || 'USD',
        url,
        product_title,
        question_variant_id,
        user_response,
        final_decision
      })
      .select()
      .single();

    if (savingError) {
      return res.status(400).json({ error: savingError.message });
    }

    // Update effectiveness stats if variant was shown
    if (question_variant_id) {
      const wasSkipped = final_decision === 'skipped';
      const savedAmount = wasSkipped ? price : 0;

      // Get existing stats
      const { data: existing } = await supabase
        .from('question_effectiveness')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('question_variant_id', question_variant_id)
        .single();

      if (existing) {
        await supabase
          .from('question_effectiveness')
          .update({
            times_shown: existing.times_shown + 1,
            times_skipped: existing.times_skipped + (wasSkipped ? 1 : 0),
            total_saved: parseFloat(existing.total_saved) + savedAmount
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('question_effectiveness')
          .insert({
            user_id: auth.user.id,
            question_variant_id,
            times_shown: 1,
            times_skipped: wasSkipped ? 1 : 0,
            total_saved: savedAmount
          });
      }
    }

    res.json({ saving });
  } catch (e) {
    console.error('Error recording saving:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get savings with optional time filters
app.get('/savings', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { period, start_date, end_date } = req.query;

    const supabase = getSupabaseForUser(auth.token);
    let query = supabase
      .from('savings')
      .select('price, created_at')
      .eq('user_id', auth.user.id)
      .eq('final_decision', 'skipped');

    // Apply time filters
    const now = new Date();
    let startDate, endDate;

    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else if (period) {
      endDate = now;

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          const dayOfWeek = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'ytd':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'all':
        default:
          startDate = null;
      }
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate && period !== 'all') {
      query = query.lt('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const total = data.reduce((sum, row) => sum + parseFloat(row.price), 0);

    res.json({
      total,
      count: data.length,
      savings: data
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get best performing variant for user
app.get('/savings/best-variant', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const supabase = getSupabaseForUser(auth.token);
    const { data, error } = await supabase
      .from('question_effectiveness')
      .select('*, question_variants(question_text, subtext)')
      .eq('user_id', auth.user.id)
      .gte('times_shown', 3)
      .order('times_skipped', { ascending: false })
      .limit(1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.json({ best_variant: null });
    }

    const best = data[0];
    res.json({
      best_variant: {
        ...best,
        skip_rate: best.times_skipped / best.times_shown
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ Health Check ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`True Cost Calculator API running on port ${PORT}`);
});
