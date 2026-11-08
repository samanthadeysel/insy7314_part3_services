require('dotenv').config(); 

const express = require('express'); 
const cors = require('cors'); 
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit');
const https = require('https'); 
const fs = require('fs'); 
const path = require('path'); 

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes'); 
const transactionRoutes = require('./routes/transactionRoutes');
const taxRoutes = require('./routes/taxRoutes'); 

// Security & Logging Middlewares
const sanitizeInput = require('./middleware/sanitizeMiddleware'); // Additional Feature 0: XSS Sanitizer
const preventNoSQLInjection = require('./middleware/mongoSanitizeMiddleware'); // Additional Feature 1: NoSQL Injection Guard
const preventHpp = require('./middleware/hppMiddleware'); // Additional Feature 2: HTTP Parameter Pollution Guard
const { requestLogger } = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express(); 

const PORT = process.env.PORT || 5000; 
const USE_HTTPS = process.env.USE_HTTPS === 'true'; 
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'; 

app.disable('x-powered-by'); 

// 1. Core Security Headers Setup (Helmet + CSP)
app.use( 
  helmet({ 
    contentSecurityPolicy: { 
      directives: { 
        defaultSrc: ["'self'"], 
        scriptSrc: ["'self'"], 
        styleSrc: ["'self'"], 
        imgSrc: ["'self'", 'data:'], 
        connectSrc: ["'self'", CLIENT_ORIGIN], 
        objectSrc: ["'none'"], 
        baseUri: ["'self'"], 
        frameAncestors: ["'none'"] 
      } 
    }, 
    crossOriginResourcePolicy: { policy: 'same-site' } 
  }) 
); 

// 2. CORS Configuration
app.use( 
  cors({ 
    origin: CLIENT_ORIGIN, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
  }) 
);

// 3. Body Parsing & Security Sanitization Pipeline
app.use(express.json({ limit: '10kb' }));
app.use(sanitizeInput);           // XSS Prevention
app.use(preventNoSQLInjection);   // Additional Security Feature 1: NoSQL Injection Prevention
app.use(preventHpp);              // Additional Security Feature 2: HPP Guard

// 4. Global HTTP Event Logging
app.use(requestLogger);

// 5. Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, 
  message: { error: 'Too many booking attempts, please try again later.' }
});

// Base Routes
app.get('/', (req, res) => { 
  res.status(200).json({ 
    app: process.env.APP_NAME || 'HustleHub+ API',
    message: 'API is running securely' 
  });
});

app.get('/health', (req, res) => { 
  res.status(200).json({ 
    status: 'OK', 
    protocol: USE_HTTPS ? 'HTTPS' : 'HTTP' 
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/gigs', gigRoutes); 
app.use('/api/bookings', bookingLimiter, bookingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tax', taxRoutes);

// 404 Handler
app.use((req, res) => { 
  res.status(404).json({ error: 'Route not found' }); 
});

// Global Error Handler
app.use(errorHandler);

// Server Setup (HTTPS / HTTP)
if (USE_HTTPS) { 
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'localhost-key.pem');
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'localhost-cert.pem');

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS server running on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
  });
}