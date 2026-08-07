import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: any, res: any) {
  try {
    // Dynamically import the gifts handler so we can catch any top-level module initialization/import errors
    const { giftsApiMiddleware } = await import('../../src/core/api/giftsHandler');

    return new Promise<void>((resolve) => {
      giftsApiMiddleware(req, res, () => {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        resolve();
      }).catch((err) => {
        console.error('[Vercel Serverless gifts] Execution Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Execution Error', 
          details: err.message || err, 
          stack: err.stack || '' 
        }));
        resolve();
      });
    });
  } catch (importErr: any) {
    console.error('[Vercel Serverless gifts] Import/Initialization Error:', importErr);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Module Import/Initialization Failed', 
      details: importErr.message || importErr, 
      stack: importErr.stack || '' 
    }));
  }
}
