import { giftsApiMiddleware } from '../../src/core/api/giftsHandler.js';

export default async function handler(req: any, res: any) {
  try {
    // Await the Connect/Express middleware directly
    await giftsApiMiddleware(req, res, () => {});

    // If the middleware did not match any endpoint and did not send a response, send a 404
    if (!res.writableEnded && !res.finished) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } catch (err: any) {
    console.error('[Vercel Serverless gifts] Error:', err);
    if (!res.writableEnded && !res.finished) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        details: err.message || err,
        stack: err.stack || ''
      }));
    }
  }
}
