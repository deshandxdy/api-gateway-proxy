# API Gateway Proxy for FMCG Microservices

## 📋 Project Overview

This API Gateway Proxy serves as a centralized entry point for a Fast-Moving Consumer Goods (FMCG) microservices architecture. It provides intelligent request routing, service discovery, and comprehensive logging capabilities for managing communication between client applications and backend microservices.

## 🏗️ Architecture & Scope

### **Core Functionality**
- **Service Routing**: Dynamic request routing based on HTTP headers
- **Service Discovery**: Centralized mapping of microservices to their endpoints
- **Request Validation**: Ensures only valid microservice targets are accessed
- **Comprehensive Logging**: Detailed request/response logging for monitoring and debugging
- **Docker Support**: Containerized deployment with Alpine Linux base image

### **Supported Microservices**
The gateway currently supports routing to the following FMCG platform microservices:

| Service | Purpose | Default Port |
|---------|---------|--------------|
| Customer-Management-Service | Customer data and relationship management | 3001 |
| Order-Management-Service | Order processing and fulfillment | 3002 |
| Production-Tracking-Service | Real-time production monitoring | 3003 |
| Production-Management-Service | Production planning and scheduling | 3004 |
| Inventory-Management-Service | Stock management and warehouse operations | 3005 |
| Platform-Insights-Service | Business intelligence and analytics | 3006 |
| Platform-Payment-Service | Payment processing and financial transactions | 3007 |
| Platform-Masterdata-Service | Master data management and reference data | 3008 |
| Platform-Gateway-Service | Gateway management and configuration | 3009 |
| Platform-Esuite-Service (CDC) | Change Data Capture and enterprise integration | 3010 |
| Platform-Config-Service | Configuration management | 3011 |
| Web-App | Frontend web application | 3012 |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Docker uses Node.js 24 Alpine)
- Docker (optional, for containerized deployment)
- Access to the microservices network

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api-gateway-proxy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your specific configuration:
   ```env
   AUTH0_DOMAIN=your-auth0-domain
   AUTH0_AUDIENCE=http://localhost:4000
   ```

4. **Start the gateway**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t api-gateway-proxy .
   ```

2. **Run the container**
   ```bash
   docker run -p 4000:4000 --name api-gateway-proxy api-gateway-proxy
   ```

## 📡 API Usage

### Request Routing

The gateway routes requests based on the `x-service-target` header:

```bash
# Example: Route to Customer Management Service
curl -X GET http://localhost:4000/api/customers \
  -H "x-service-target: Customer-Management-Service" \
  -H "Content-Type: application/json"
```

```bash
# Example: Route to Order Management Service
curl -X POST http://localhost:4000/api/orders \
  -H "x-service-target: Order-Management-Service" \
  -H "Content-Type: application/json" \
  -d '{"customerId": "123", "products": [...]}'
```

### Error Responses

**Missing Service Target Header (400)**
```json
{
  "error": "Missing x-service-target header"
}
```

**Invalid Service Target (400)**
```json
{
  "error": "Invalid service target: Invalid-Service",
  "validServices": ["Customer-Management-Service", "Order-Management-Service", ...]
}
```

**Service Mapping Error (500)**
```json
{
  "error": "Service mapping not found for: Service-Name"
}
```

## 🔧 Configuration

### Service Mapping
Services are mapped in the `serviceMap` object in `index.js`:

```javascript
const serviceMap = {
  'Customer-Management-Service': 'http://customer-management-service:3001',
  'Order-Management-Service': 'http://order-management-service:3002',
  // ... other services
};
```

### Environment Variables
- `AUTH0_DOMAIN`: Auth0 domain for authentication
- `AUTH0_AUDIENCE`: Expected audience for JWT tokens
- `PORT`: Server port (default: 4000)

## 📊 Logging & Monitoring

The gateway provides comprehensive logging for:

### Request Logging
- Incoming request method and URL
- Target service identification
- Client IP address
- Timestamp for each request

### Proxy Logging
- Successful routing confirmations
- Proxy request forwarding
- Response status from target services
- Detailed error logging for connection issues

### Startup Logging
- Service mapping overview
- Server startup confirmation
- Available services list

Example log output:
```
[2025-07-03T10:30:45.123Z] Incoming request: GET /api/customers
[2025-07-03T10:30:45.123Z] Target service: Customer-Management-Service
[2025-07-03T10:30:45.123Z] Client IP: 172.17.0.1
[2025-07-03T10:30:45.124Z] SUCCESS: Routing to http://customer-management-service:3001
[2025-07-03T10:30:45.124Z] Proxying request to: http://customer-management-service:3001/api/customers
[2025-07-03T10:30:45.456Z] Received response from http://customer-management-service:3001: 200 OK
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 24 (Alpine Linux)
- **Framework**: Express.js
- **Proxy**: http-proxy-middleware
- **Authentication**: JWT + Auth0 (configured but not implemented)
- **Containerization**: Docker
- **Logging**: Built-in console logging

## 🔒 Security Considerations

### Current Security Features
- Service target validation
- Request header validation
- Error message sanitization

### Planned Security Enhancements
- JWT token validation (Auth0 integration ready)
- Rate limiting
- IP whitelisting
- Request/response body validation
- CORS configuration

## 🚧 Development & Extension

### Adding New Services
1. Add the service name to the `validMicroservices` array
2. Add the service mapping to the `serviceMap` object
3. Update this README with the new service information

### Customizing Proxy Behavior
The `createProxyMiddleware` function accepts various options:
- `pathRewrite`: Modify request paths
- `router`: Dynamic target selection
- `onProxyReq`: Request modification
- `onProxyRes`: Response modification

## 📈 Performance Characteristics

- **Lightweight**: Alpine Linux base image (~5MB)
- **Fast Startup**: Minimal dependencies and simple configuration
- **Memory Efficient**: Event-driven architecture
- **Scalable**: Stateless design suitable for horizontal scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add appropriate tests
5. Update documentation
6. Submit a pull request

## 📄 License

This project is part of the FMCG platform microservices architecture. Please refer to the main platform documentation for licensing information.

## 🔗 Related Services

This gateway is designed to work with the complete FMCG platform ecosystem:
- Customer management and CRM
- Order processing and fulfillment
- Production planning and tracking
- Inventory and warehouse management
- Business intelligence and analytics
- Payment processing
- Master data management
- Enterprise integration (CDC)

---

**Note**: This API Gateway Proxy is a critical infrastructure component that requires proper monitoring, security hardening, and regular updates to maintain the reliability and security of the entire FMCG platform.
