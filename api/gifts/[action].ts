import { giftsApiMiddleware } from '../../src/core/api/giftsHandler';
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: any, res: any) {
  // Let the gifts middleware handle the request routing and execution
  return new Promise<void>((resolve) => {
    giftsApiMiddleware(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      resolve();
    }).catch((err) => {
      console.error('[Vercel Serverless gifts] Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message || err }));
      resolve();
    });
  });
}
