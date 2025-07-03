const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');

const jwksUri = process.env.AUTH0_DOMAIN
  ? `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  : 'https://cdc-dev.eu.auth0.com/.well-known/jwks.json'; // fallback

const client = jwksRsa({
  jwksUri,
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  if (!header || !header.kid) {
    console.error('❌ No "kid" found in token header:', header);
    return callback(new Error('Missing "kid" in token header'));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('❌ Failed to get signing key:', err);
      return callback(err);
    }

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}


function checkJwt(req, res, next) {
  if(!process.env.AUTH0_DOMAIN) {
    console.error('❌ AUTH0_DOMAIN is missing!');
    process.exit(1);
  }
  const token = (req.headers.authorization || '').split(' ')[1];

  if (!token) {
    return res.status(401).send('Missing or invalid Authorization header');
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).send(`Invalid token: ${err.message}`);
      }

      req.user = decoded;
      next();
    }
  );
}

module.exports = { checkJwt };
