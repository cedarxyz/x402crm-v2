/**
 * x402 CRM v2 - Main Worker Entry Point
 *
 * Hono-based Cloudflare Worker with D1 persistence.
 * Serves both the CRM API (for sbtc-appleseed) and the web UI.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { crmRoutes } from './routes/crm';
import { renderUI } from './ui';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// CORS for API access
app.use('/crm/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

// Mount CRM API routes (sbtc-appleseed compatible)
app.route('/crm', crmRoutes);

// Legacy /api routes for UI compatibility
app.route('/api', crmRoutes);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', version: '2.0.0' });
});

// Serve UI at root
app.get('/', (c) => {
  return c.html(renderUI());
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;
