const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { checkJwt } = require('./auth.middleware');
require('dotenv').config();

const app = express();

// Valid microservices
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
  'Platform-Config-Service'
];

const serviceMap = {
  'Customer-Management-Service': 'http://customer-management-service:3001',
  //'Customer-Management-Service': 'http://fmcg-template-service:3000',
  'Order-Management-Service': 'http://order-management-service:3002',
  'Production-Tracking-Service': 'http://production-tracking-service:3003',
  'Production-Management-Service': 'http://production-management-service:3004',
  'Inventory-Management-Service': 'http://inventory-management-service:3005',
  'Platform-Insights-Service': 'http://platform-insights-service:3006',
  'Platform-Payment-Service': 'http://platform-payment-service:3007',
  'Platform-Masterdata-Service': 'http://platform-masterdata-service:3008',
  'Platform-Gateway-Service': 'http://platform-gateway-service:3009',
  'Platform-Esuite-Service (CDC)': 'http://platform-esuite-service:3010',
  'Platform-Config-Service': 'http://platform-config-service:3011',
  'Web-App' : 'http://localhost:3012',
};

app.use((req, res, next) => {
  const targetService = req.headers['x-service-target'];

  if (!targetService) {
    return res.status(400).send('Missing x-service-target header');
  }

  if (!validMicroservices.includes(targetService)) {
    return res.status(400).send({
      error: `Invalid service target: ${targetService}`,
      validServices: validMicroservices
    });
  }

  const target = serviceMap[targetService];
  if (!target) {
    return res.status(500).send(`Service mapping not found for: ${targetService}`);
  }

  // 👇 Apply JWT auth ONLY if request is coming from external client (not service-to-service)
  if (!req.headers['x-internal-request']) {
    return checkJwt(req, res, () => {
      createProxyMiddleware({ target, changeOrigin: true })(req, res, next);
    });
  } else {
    // Internal request → no auth needed
    return createProxyMiddleware({ target, changeOrigin: true })(req, res, next);
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API Gateway Proxy listening on port ${PORT}`);
});
