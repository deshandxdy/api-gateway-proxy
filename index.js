const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { checkJwt } = require('./auth.middleware'); // This now imports our updated function
require('dotenv').config();

const app = express();

// Global CORS Middleware (no changes)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-service-target, x-internal-request, x-id-token'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Service Lists and Maps (no changes)
const validMicroservices = [
  'Production-Management-Service',
  'Order-Management-Service',
  // ... all your other services
  'Platform-Masterdata-Service',
  'Web-App',
];

const serviceMap = {
  'Production-Management-Service': 'http://fmcg-production-management-service:3004',
  'Order-Management-Service': 'http://fmcg-order-management-service:3002',
  // ... all your other mappings
  'Platform-Masterdata-Service': 'http://fmcg-platform-masterdata-service:3008',
  'Web-App': 'http://fmcg-web-app:3012',
};

// Proxy Routing Logic (no changes)
app.use((req, res, next) => {
  let targetService = req.headers['x-service-target'];

  console.log(`[Proxy Request] ${req.method} ${req.url} | Header target: ${targetService}`);

  // Fallback: route notifications to Order-Management-Service if header is missing (e.g., SSE)
  const isNotificationPath = req.url.startsWith('/api/v1/notifications') || (req.path && req.path.startsWith('/api/v1/notifications'));
  if (!targetService && isNotificationPath) {
    targetService = 'Order-Management-Service';
    console.log(`[Proxy Fallback] Missing x-service-target header, routing notification request to: ${targetService}`);
  }

  const target = serviceMap[targetService];

  if (!targetService) {
    console.warn(`[Proxy Warning] Missing x-service-target header for URL: ${req.url}`);
    return res.status(400).send('Missing x-service-target header');
  }

  if (!validMicroservices.includes(targetService)) {
    return res.status(400).send({
      error: `Invalid service target: ${targetService}`,
      validServices: validMicroservices
    });
  }

  if (!target) {
    return res.status(500).send(`Service mapping not found for: ${targetService}`);
  }

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
  });

  const publicRoutes = [
    '/auth/login',
    '/auth/refresh-token',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-otp',
    '/auth/resend-otp'
  ];

  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  // This logic is still correct. It calls our now-updated checkJwt function.
  if (!req.headers['x-internal-request'] && !isPublicRoute) {
    checkJwt(req, res, () => proxy(req, res, next));
  } else {
    proxy(req, res, next);
  }
});

// Start Server (no changes)
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway Proxy listening on port ${PORT}`);
});