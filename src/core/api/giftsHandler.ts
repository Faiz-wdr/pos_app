import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as crypto from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env dynamically to ensure latest values are loaded
try {
  const pathsToCheck = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '..', '.env'),
    path.resolve(__dirname, '..', '..', '..', '.env'),
    path.resolve(__dirname, '..', '..', '..', '..', '.env')
  ];

  let found = false;
  for (const envPath of pathsToCheck) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          if (key) {
            process.env[key] = value;
          }
        }
      });
      console.log(`[Gifts API] Successfully loaded env from: ${envPath}`);
      found = true;
      break;
    }
  }
  if (!found) {
    console.warn('[Gifts API] No .env file found in search paths.');
  }
} catch (e) {
  console.warn('[Gifts API] Could not dynamically read .env file:', e);
}

// Safe initialization of Firebase Admin SDK
if (getApps().length === 0) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountEnv) {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('[Gifts API] Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var.');
    } catch (e) {
      console.error('[Gifts API] Failed to parse FIREBASE_SERVICE_ACCOUNT. Falling back to default...', e);
      initializeApp();
    }
  } else if (serviceAccountPath) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf-8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log(`[Gifts API] Firebase Admin initialized from file: ${serviceAccountPath}`);
    } catch (e) {
      console.error(`[Gifts API] Failed to read service account at ${serviceAccountPath}. Falling back to default...`, e);
      initializeApp({ projectId: 'personal-os-4e81b' });
    }
  } else {
    try {
      initializeApp({ projectId: 'personal-os-4e81b' });
      console.log('[Gifts API] Firebase Admin initialized with default project ID personal-os-4e81b.');
    } catch (e) {
      console.warn('[Gifts API] Firebase Admin fallback initialization failed.', e);
    }
  }
}

function getDbAdmin() {
  try {
    return getFirestore();
  } catch (err: any) {
    console.error('[Gifts API] Firestore Admin failed to initialize. Make sure FIREBASE_SERVICE_ACCOUNT is configured in .env.', err);
    throw new Error('Database service is not configured. Please ensure your PersonalOS server has configured its FIREBASE_SERVICE_ACCOUNT credentials in environment variables.');
  }
}

// Helper to set CORS headers
function setCorsHeaders(res: ServerResponse, origin: string | undefined) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// Helper to parse JSON body from request stream
function getRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

// Helper to send JSON responses
function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Main connect-compatible API middleware handler
export async function giftsApiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const parsedUrl = parseUrl(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  console.log(`[Gifts API Debug] ${req.method} ${req.url} (pathname: ${pathname})`);

  // Only handle routes starting with /api/gifts
  if (!pathname.startsWith('/api/gifts')) {
    return next();
  }

  const origin = req.headers.origin as string | undefined;

  // Handle CORS OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    res.statusCode = 204;
    res.end();
    return;
  }

  // Always apply CORS for GET and POST requests
  setCorsHeaders(res, origin);

  try {
    // -------------------------------------------------------------
    // POST /api/gifts/create-token
    // -------------------------------------------------------------
    if (pathname === '/api/gifts/create-token' && req.method === 'POST') {
      // 1. Authenticate using secret API key in Authorization header
      const authHeader = req.headers.authorization || '';
      const apiKey = authHeader.replace(/^Bearer\s+/i, '').trim();
      const expectedKey = (process.env.GIFTS_API_KEY || '').trim();

      if (!expectedKey) {
        console.error('[Gifts API] GIFTS_API_KEY is not configured in the environment.');
        return sendJson(res, 500, { error: 'Internal server error: API key not configured' });
      }

      if (!apiKey || apiKey !== expectedKey) {
        return sendJson(res, 401, { error: 'Unauthorized: Invalid API Key' });
      }

      // 2. Parse request body
      const body = await getRequestBody(req);
      const { gift, campaign } = body;

      if (!gift || !campaign) {
        return sendJson(res, 400, { error: 'Bad Request: gift and campaign are required' });
      }

      // 3. Generate secure random token
      const token = crypto.randomBytes(16).toString('hex');

      // 4. Save to firestore db
      const docRef = getDbAdmin().collection('gift_tokens').doc(token);
      await docRef.set({
        token,
        gift,
        campaign,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      // 5. Construct URL dynamically or default to production app url
      const host = req.headers.host || 'personalos.app';
      const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
      const redeemUrl = `${protocol}://${host}/redeem?token=${token}`;

      return sendJson(res, 200, { token, redeemUrl });
    }

    // -------------------------------------------------------------
    // GET /api/gifts/validate-token
    // -------------------------------------------------------------
    if (pathname === '/api/gifts/validate-token' && req.method === 'GET') {
      const token = parsedUrl.query.token as string | undefined;

      if (!token) {
        return sendJson(res, 400, { error: 'Bad Request: token is required' });
      }

      const docRef = getDbAdmin().collection('gift_tokens').doc(token);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return sendJson(res, 404, { status: 'invalid', error: 'Token not found' });
      }

      const data = docSnap.data();
      if (!data) {
        return sendJson(res, 500, { error: 'Internal server error: Document corrupt' });
      }

      return sendJson(res, 200, {
        status: data.status,
        gift: data.gift,
        campaign: data.campaign
      });
    }

    // -------------------------------------------------------------
    // POST /api/gifts/redeem
    // -------------------------------------------------------------
    if (pathname === '/api/gifts/redeem' && req.method === 'POST') {
      // 1. Authenticate using Firebase ID token
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (!idToken) {
        return sendJson(res, 401, { error: 'Unauthorized: Missing ID token' });
      }

      let decodedToken: any;
      try {
        decodedToken = await getAuth().verifyIdToken(idToken);
      } catch (authErr: any) {
        console.error('[Gifts API] Firebase ID Token verification failed:', authErr);
        return sendJson(res, 401, { error: `Unauthorized: Invalid Firebase ID token. ${authErr.message}` });
      }

      const uid = decodedToken.uid;
      const email = decodedToken.email || '';

      // 2. Parse request body
      const body = await getRequestBody(req);
      const { token } = body;

      if (!token) {
        return sendJson(res, 400, { error: 'Bad Request: token is required' });
      }

      const tokenRef = getDbAdmin().collection('gift_tokens').doc(token);
      const userRef = getDbAdmin().collection('users').doc(uid);

      // 3. Run Transaction to ensure atomic validate-and-update
      try {
        const result = await getDbAdmin().runTransaction(async (transaction) => {
          const tokenSnap = await transaction.get(tokenRef);
          if (!tokenSnap.exists) {
            throw new Error('Token does not exist');
          }

          const tokenData = tokenSnap.data();
          if (!tokenData) {
            throw new Error('Token data corrupt');
          }

          if (tokenData.status === 'Redeemed') {
            throw new Error('Token already redeemed');
          }

          if (tokenData.status !== 'Pending') {
            throw new Error(`Token invalid status: ${tokenData.status}`);
          }

          // Mark token as Redeemed
          transaction.update(tokenRef, {
            status: 'Redeemed',
            redeemedAt: new Date().toISOString(),
            redeemedByUserId: uid,
            redeemedEmail: email
          });

          // Upgrade user to pro lifetime
          transaction.update(userRef, {
            plan: 'pro',
            planSource: 'gift',
            planActivatedAt: new Date().toISOString(),
            isPremium: true,
            premium: true
          });

          return { gift: tokenData.gift, campaign: tokenData.campaign };
        });

        console.log(`[Gifts API] Token ${token} successfully redeemed by user ${uid} (${email})`);
        return sendJson(res, 200, {
          success: true,
          message: '🎉 PersonalOS Pro has been activated successfully.',
          gift: result.gift,
          campaign: result.campaign
        });

      } catch (transErr: any) {
        console.error('[Gifts API] Redemption transaction failed:', transErr);
        return sendJson(res, 400, { error: transErr.message || 'Transaction failed' });
      }
    }

    // 404 for unknown endpoints under /api/gifts
    return sendJson(res, 404, { error: 'Not Found' });

  } catch (err: any) {
    console.error('[Gifts API] Unhandled exception in middleware:', err);
    return sendJson(res, 500, { error: 'Internal server error', details: err.message });
  }
}
