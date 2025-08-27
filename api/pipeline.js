// pipeline-api.js - Backend API for Pipeline Management
// This creates API endpoints that the admin GUI can call

import express from 'express';
import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Store running pipeline jobs
const runningJobs = new Map();
const jobHistory = new Map();

// Middleware to check admin authentication
async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw error;
    
    // Check if user is admin (you'd check your database)
    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Run pipeline endpoint
app.post('/api/pipeline/run', requireAdmin, async (req, res) => {
  try {
    const config = req.body;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if pipeline is already running
    if (runningJobs.size > 0) {
      return res.status(400).json({ 
        error: 'Pipeline is already running. Please wait for it to complete.' 
      });
    }
    
    // Prepare environment variables
    const env = {
      ...process.env,
      LIMIT: config.limit?.toString() || '50',
      MIN_PHOTOS: config.minPhotos?.toString() || '3',
      REQUIRE_DNA: config.requireDNA?.toString() || 'false',
      AUTO_APPROVE: config.autoApprove?.toString() || 'false'
    };
    
    // If excluded taxa are provided, add them
    if (config.excludedTaxa && config.excludedTaxa.length > 0) {
      env.EXCLUDED_TAXA = config.excludedTaxa.join(',');
    }
    
    // Create job record in database
    const { error: dbError } = await supabase
      .from('pipeline_runs')
      .insert({
        id: jobId,
        started_at: new Date().toISOString(),
        status: 'running',
        config: config,
        started_by: req.user.id
      });
    
    if (dbError) throw dbError;
    
    // Spawn the pipeline process
    const pipeline = spawn('node', ['pipeline-working.js'], { env });
    
    // Create job object
    const job = {
      id: jobId,
      process: pipeline,
      startedAt: new Date(),
      logs: [],
      stats: {
        processed: 0,
        saved: 0,
        filtered: 0,
        dnaVerified: 0,
        hintsCreated: 0
      }
    };
    
    runningJobs.set(jobId, job);
    
    // Capture stdout logs
    pipeline.stdout.on('data', (data) => {
      const log = data.toString();
      job.logs.push({
        timestamp: new Date().toISOString(),
        message: log,
        type: 'info'
      });
      
      // Parse stats from logs
      parseStatsFromLog(log, job.stats);
      
      // Store log in database (optional, for persistence)
      supabase
        .from('pipeline_logs')
        .insert({
          job_id: jobId,
          message: log,
          type: 'info'
        })
        .then(() => {});
    });
    
    // Capture stderr logs
    pipeline.stderr.on('data', (data) => {
      const log = data.toString();
      job.logs.push({
        timestamp: new Date().toISOString(),
        message: log,
        type: 'error'
      });
      
      supabase
        .from('pipeline_logs')
        .insert({
          job_id: jobId,
          message: log,
          type: 'error'
        })
        .then(() => {});
    });
    
    // Handle process completion
    pipeline.on('close', async (code) => {
      const endedAt = new Date();
      const duration = Math.floor((endedAt - job.startedAt) / 1000);
      
      // Update job status in database
      await supabase
        .from('pipeline_runs')
        .update({
          ended_at: endedAt.toISOString(),
          status: code === 0 ? 'completed' : 'failed',
          exit_code: code,
          duration_seconds: duration,
          stats: job.stats
        })
        .eq('id', jobId);
      
      // Move to history
      jobHistory.set(jobId, {
        ...job,
        endedAt,
        exitCode: code,
        status: code === 0 ? 'completed' : 'failed'
      });
      
      // Remove from running jobs
      runningJobs.delete(jobId);
    });
    
    res.json({ 
      success: true, 
      jobId,
      message: 'Pipeline started successfully'
    });
    
  } catch (error) {
    console.error('Pipeline start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pipeline status
app.get('/api/pipeline/status/:jobId', requireAdmin, async (req, res) => {
  const { jobId } = req.params;
  
  // Check running jobs first
  if (runningJobs.has(jobId)) {
    const job = runningJobs.get(jobId);
    return res.json({
      status: 'running',
      startedAt: job.startedAt,
      stats: job.stats,
      recentLogs: job.logs.slice(-50) // Last 50 logs
    });
  }
  
  // Check history
  if (jobHistory.has(jobId)) {
    const job = jobHistory.get(jobId);
    return res.json({
      status: job.status,
      startedAt: job.startedAt,
      endedAt: job.endedAt,
      stats: job.stats,
      exitCode: job.exitCode
    });
  }
  
  // Check database for older jobs
  const { data, error } = await supabase
    .from('pipeline_runs')
    .select('*')
    .eq('id', jobId)
    .single();
  
  if (error || !data) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(data);
});

// Get pipeline logs
app.get('/api/pipeline/logs/:jobId', requireAdmin, async (req, res) => {
  const { jobId } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  // If job is running, get from memory
  if (runningJobs.has(jobId)) {
    const job = runningJobs.get(jobId);
    return res.json({
      logs: job.logs.slice(offset, offset + limit),
      total: job.logs.length
    });
  }
  
  // Otherwise get from database
  const { data, error, count } = await supabase
    .from('pipeline_logs')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ logs: data, total: count });
});

// Stop pipeline
app.post('/api/pipeline/stop/:jobId', requireAdmin, async (req, res) => {
  const { jobId } = req.params;
  
  if (!runningJobs.has(jobId)) {
    return res.status(404).json({ error: 'Job not found or already stopped' });
  }
  
  const job = runningJobs.get(jobId);
  
  try {
    // Kill the process
    job.process.kill('SIGTERM');
    
    // Give it 5 seconds to terminate gracefully
    setTimeout(() => {
      if (runningJobs.has(jobId)) {
        job.process.kill('SIGKILL');
      }
    }, 5000);
    
    // Update database
    await supabase
      .from('pipeline_runs')
      .update({
        status: 'stopped',
        ended_at: new Date().toISOString(),
        stopped_by: req.user.id
      })
      .eq('id', jobId);
    
    res.json({ success: true, message: 'Pipeline stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pipeline history
app.get('/api/pipeline/history', requireAdmin, async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const { data, error, count } = await supabase
    .from('pipeline_runs')
    .select('*', { count: 'exact' })
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({
    runs: data,
    total: count,
    limit,
    offset
  });
});

// Helper function to parse stats from log messages
function parseStatsFromLog(log, stats) {
  // Parse different log patterns to extract statistics
  
  if (log.includes('📊 Processed:')) {
    const match = log.match(/Processed: (\d+)/);
    if (match) stats.processed = parseInt(match[1]);
  }
  
  if (log.includes('💾 Saved:')) {
    const match = log.match(/Saved: (\d+)/);
    if (match) stats.saved = parseInt(match[1]);
  }
  
  if (log.includes('🧬 DNA-verified:')) {
    const match = log.match(/DNA-verified: (\d+)/);
    if (match) stats.dnaVerified = parseInt(match[1]);
  }
  
  if (log.includes('🆕 New hints created:')) {
    const match = log.match(/New hints created: (\d+)/);
    if (match) stats.hintsCreated = parseInt(match[1]);
  }
  
  if (log.includes('⏭️  Skipped:')) {
    const match = log.match(/Skipped: (\d+)/);
    if (match) stats.filtered = parseInt(match[1]);
  }
}

// Health check endpoint
app.get('/api/pipeline/health', (req, res) => {
  res.json({
    status: 'healthy',
    runningJobs: runningJobs.size,
    historicalJobs: jobHistory.size
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Pipeline API server running on port ${PORT}`);
});