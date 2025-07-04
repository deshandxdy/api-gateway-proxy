const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { checkJwt } = require('./auth.middleware'); // keep your actual auth logic here
require('dotenv').config();

const app = express();

// 🔐 Global CORS Middleware
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

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// 💡 Valid Service List
const validMicroservices = [
  'Customer-Management-Service',
  'Order-Management-Service',
  'Production-Tracking-Service',
  'Production-Management-Service',
  'Inventory-Management-Service',
  'Platform-Insights-Service',
  'Platform-Payment-Service',
  'Platform-Masterdata-Service',
  'Platform-Gateway-Service',
  'Platform-Esuite-Service (CDC)',
  'Platform-Config-Service',
  'Web-App',
];

// 📍 Correct Docker Compose Service Hostnames
const serviceMap = {
  'Customer-Management-Service': 'http://fmcg-template-service:3000',
  'Order-Management-Service': 'http://order-management-service:3002',
  'Production-Tracking-Service': 'http://production-tracking-service:3003',
  'Production-Management-Service': 'http://production-management-service:3004',
  'Inventory-Management-Service': 'http://inventory-management-service:3005',
  'Platform-Insights-Service': 'http://platform-insights-service:3006',
  'Platform-Payment-Service': 'http://platform-payment-service:3007',
  'Platform-Masterdata-Service': 'http://platform-masterdata-service:3008',
  'Platform-Gateway-Service': 'http://platform-gateway-service:3009',
  'Platform-Esuite-Service (CDC)': 'http://platform-esuite-service:3010',
  'Platform-Config-Service': 'http://fmcg-config-service:3011',
  'Web-App': 'http://fmcg-web-app:3012',
};

// 🔁 Proxy Routing Logic
app.use((req, res, next) => {
  const targetService = req.headers['x-service-target'];
  const target = serviceMap[targetService];

  if (!targetService) {
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

  // External requests → validate token
  if (!req.headers['x-internal-request']) {
    checkJwt(req, res, () => proxy(req, res, next));
  } else {
    proxy(req, res, next); // Internal → direct proxy
  }
});

// 🔊 Start Server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway Proxy listening on port ${PORT}`);
});
