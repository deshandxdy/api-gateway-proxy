const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- UPDATED: Load all required variables from the environment ---
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

if (!JWT_SECRET || !JWT_ISSUER || !JWT_AUDIENCE) {
  console.error('❌ FATAL ERROR: JWT_SECRET, JWT_ISSUER, or JWT_AUDIENCE is not defined in the .env file!');
  // In a real scenario, you might want to exit if the configuration is incomplete
  // process.exit(1);
}

function checkJwt(req, res, next) {
  let token = (req.headers.authorization || '').split(' ')[1];

  // Fallback: Support token in query parameter (primarily for SSE connection handshake)
  if (!token) {
    if (req.query && typeof req.query.token === 'string') {
      token = req.query.token;
    } else {
      // Direct raw query string regex extraction
      const match = req.url.match(/[?&]token=([^&]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  if (!token) {
    console.warn(`[Proxy Auth] Token validation failed: missing token for URL: ${req.url}`);
    return res.status(401).send('Missing or invalid Authorization header or token query parameter');
  }

  try {
    // --- UPDATED: Create an options object for stricter verification ---
    // This now checks not only the signature and expiration, but also that
    // the token was created by the correct issuer for the correct audience.
    const verificationOptions = {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    };

    // Pass the options as the third argument to jwt.verify
    const decoded = jwt.verify(token, JWT_SECRET, verificationOptions);
    console.log("decoded. ", decoded)
    req.user = decoded;
    next();
  } catch (err) {
    // This error block will now catch more failure types, e.g., "jwt issuer invalid"
    console.error('JWT verification failed:', err.message);
    return res.status(401).send(`Invalid token: ${err.message}`);
  }
}

module.exports = { checkJwt };